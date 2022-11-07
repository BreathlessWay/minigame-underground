import { _decorator, Component, Node } from "cc";

import { TileMapManager } from "db://assets/scripts/tile/TileMapManager";
import { PlayerManager } from "db://assets/scripts/player/PlayerManager";
import { WoodenSkeletonManager } from "db://assets/scripts/woodenskeleton/WoodenSkeletonManager";
import { DoorManager } from "db://assets/scripts/door/DoorManager";
import { IronSkeletonManager } from "db://assets/scripts/ironskeleton/IronSkeletonManager";
import { BurstManager } from "db://assets/scripts/burst/BurstManager";
import { SpikesManager } from "db://assets/scripts/spikes/SpikesManager";
import { SmokeManager } from "db://assets/scripts/smoke/SmokeManager";
import { ShakeManager } from "db://assets/scripts/ui/ShakeManager";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";
import FadeManager from "db://assets/utils/FadeManager";

import { createUINode } from "db://assets/utils";

import levels, { ILevel } from "db://assets/levels";
import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";
import {
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	EVENT_ENUM,
} from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("BattleManager")
export class BattleManager extends Component {
	level: ILevel;
	stage: Node;
	smokeLayer: Node;

	start() {
		this.generateStage();
		this.initLevel();
	}

	onLoad() {
		EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this);
		EventManager.Instance.on(
			EVENT_ENUM.PLAYER_MOVE_END,
			this.checkArrived,
			this
		);
		EventManager.Instance.on(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke, this);
	}

	onDestroy() {
		EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel);
		EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived);
		EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke);
	}

	async initLevel() {
		const levelIndex = DataManager.Instance.levelIndex,
			level = levels[`level${levelIndex}`];

		if (level) {
			await FadeManager.Instance.fadeIn();
			this.clearLevel();
			this.level = level;

			DataManager.Instance.mapInfo = this.level.mapInfo;
			DataManager.Instance.mapRowCount = this.level.mapInfo.length;
			DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length;

			await Promise.all([
				this.generateTileMap(),
				this.generateDoor(),
				this.generateBursts(),
				this.generateSpikes(),
				this.generateEnemies(),
				this.generateSmokeLayer(), // 占位符，承载烟雾，否则烟雾后来渲染会遮住人物
			]);
			// 如果不先将其他元素渲染出来，人物元素可能会被其他元素遮挡
			await this.generatePlayer();

			await FadeManager.Instance.fadeOut();
		}
	}

	nextLevel() {
		DataManager.Instance.levelIndex++;
		this.initLevel();
	}

	clearLevel() {
		this.stage.destroyAllChildren();
		DataManager.Instance.reset();
	}

	generateStage() {
		this.stage = createUINode();
		this.stage.setParent(this.node);
		this.stage.addComponent(ShakeManager);
	}

	async generateTileMap() {
		const tileMap = createUINode();
		tileMap.setParent(this.stage);
		const tileMapManager = tileMap.addComponent(TileMapManager);
		await tileMapManager.init();

		this.adaptPosition();
	}

	async generatePlayer() {
		const player = createUINode();
		player.setParent(this.stage);
		const playerManager = player.addComponent(PlayerManager);
		await playerManager.init(this.level.player);
		DataManager.Instance.player = playerManager;
		EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true);
	}

	async generateEnemies() {
		DataManager.Instance.enemies = [];
		const promises = [];
		this.level.enemies.forEach(enemy => {
			const node = createUINode();
			node.setParent(this.stage);
			const Manager =
				enemy.type === ENTITY_TYPE_ENUM.SKELETON_WOODEN
					? WoodenSkeletonManager
					: IronSkeletonManager;
			const manager = node.addComponent(Manager);
			promises.push(manager.init(enemy));
			DataManager.Instance.enemies.push(manager);
		});

		await Promise.all(promises);
	}

	async generateDoor() {
		const door = createUINode();
		door.setParent(this.stage);
		const doorManager = door.addComponent(DoorManager);
		await doorManager.init(this.level.door);
		DataManager.Instance.door = doorManager;
	}

	async generateBursts() {
		DataManager.Instance.bursts = [];

		const promises = [];
		this.level.bursts.forEach(burst => {
			const node = createUINode();
			node.setParent(this.stage);
			const burstManager = node.addComponent(BurstManager);
			promises.push(burstManager.init(burst));
			DataManager.Instance.bursts.push(burstManager);
		});

		await Promise.all(promises);
	}

	async generateSpikes() {
		DataManager.Instance.spikes = [];

		const promises = [];
		this.level.spikes.forEach(spike => {
			const node = createUINode();
			node.setParent(this.stage);
			const spikesManager = node.addComponent(SpikesManager);
			promises.push(spikesManager.init(spike));
			DataManager.Instance.spikes.push(spikesManager);
		});

		await Promise.all(promises);
	}

	async generateSmokeLayer() {
		this.smokeLayer = createUINode();
		this.smokeLayer.setParent(this.stage);
	}

	async generateSmoke(x: number, y: number, direction: DIRECTION_ENUM) {
		const item = DataManager.Instance.smokes.find(
			(smoke: SmokeManager) => smoke.state === ENTITY_STATE_ENUM.DEATH
		);
		if (item) {
			item.x = x;
			item.y = y;
			item.node.setPosition(
				item.x * TILE_WIDTH - TILE_WIDTH * 1.5,
				-item.y * TILE_HEIGHT + TILE_HEIGHT * 1.5
			);
			item.direction = direction;
			item.state = ENTITY_STATE_ENUM.IDLE;
			return;
		}
		const door = createUINode();
		door.setParent(this.smokeLayer);
		const smokeManager = door.addComponent(SmokeManager);
		await smokeManager.init({
			x,
			y,
			direction,
			state: ENTITY_STATE_ENUM.IDLE,
			type: ENTITY_TYPE_ENUM.SMOKE,
		});
		DataManager.Instance.smokes.push(smokeManager);
	}

	adaptPosition() {
		const { mapRowCount, mapColumnCount } = DataManager.Instance,
			offsetX = (TILE_WIDTH * mapRowCount) / 2,
			offsetY = (TILE_HEIGHT * mapColumnCount) / 2 + 100;

		this.stage.getComponent(ShakeManager).stop();
		this.stage.setPosition(-offsetX, offsetY);
	}

	checkArrived() {
		if (!DataManager.Instance.door) return;
		const { x: doorX, y: doorY, state: doorState } = DataManager.Instance.door;
		const { x: playerX, y: playerY } = DataManager.Instance.player;
		if (
			doorX === playerX &&
			doorY === playerY &&
			doorState === ENTITY_STATE_ENUM.DEATH
		) {
			EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL);
		}
	}
}
