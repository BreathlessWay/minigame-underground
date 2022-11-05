import { _decorator, Component, Node } from "cc";

import { TileMapManager } from "db://assets/scripts/tile/TileMapManager";
import { PlayerManager } from "db://assets/scripts/player/PlayerManager";
import { WoodenSkeletonManager } from "db://assets/scripts/woodenskeleton/WoodenSkeletonManager";
import { DoorManager } from "db://assets/scripts/door/DoorManager";
import { IronSkeletonManager } from "db://assets/scripts/ironskeleton/IronSkeletonManager";
import { BurstManager } from "db://assets/scripts/burst/BurstManager";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

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
	start() {
		this.generateStage();
		this.initLevel();
	}

	onLoad() {
		EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this);
	}

	onDestroy() {
		EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel);
	}

	async initLevel() {
		const levelIndex = DataManager.Instance.levelIndex,
			level = levels[`level${levelIndex}`];

		if (level) {
			this.clearLevel();
			this.level = level;

			DataManager.Instance.mapInfo = this.level.mapInfo;
			DataManager.Instance.mapRowCount = this.level.mapInfo.length;
			DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length;

			await Promise.all([
				this.generateTileMap(),
				this.generateDoor(),
				this.generateBursts(),
				this.generateEnemies(),
			]);
			this.generatePlayer();
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
		await playerManager.init({
			x: 1,
			y: 7,
			type: ENTITY_TYPE_ENUM.PLAYER,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});
		DataManager.Instance.player = playerManager;
		EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true);
	}

	async generateEnemies() {
		const enemies = createUINode();
		enemies.setParent(this.stage);
		const woodenSkeletonManager = enemies.addComponent(WoodenSkeletonManager);
		await woodenSkeletonManager.init({
			x: 7,
			y: 3,
			type: ENTITY_TYPE_ENUM.SKELETON_WOODEN,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});
		DataManager.Instance.enemies.push(woodenSkeletonManager);

		const enemies1 = createUINode();
		enemies1.setParent(this.stage);
		const ironSkeletonManager = enemies1.addComponent(IronSkeletonManager);
		await ironSkeletonManager.init({
			x: 3,
			y: 2,
			type: ENTITY_TYPE_ENUM.SKELETON_IRON,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});
		DataManager.Instance.enemies.push(ironSkeletonManager);
	}

	async generateDoor() {
		const door = createUINode();
		door.setParent(this.stage);
		const doorManager = door.addComponent(DoorManager);
		await doorManager.init({
			x: 9.5,
			y: 1,
			type: ENTITY_TYPE_ENUM.DOOR,
			direction: DIRECTION_ENUM.LEFT,
			state: ENTITY_STATE_ENUM.IDLE,
		});
		DataManager.Instance.door = doorManager;
	}

	async generateBursts() {
		const bursts = createUINode();
		bursts.setParent(this.stage);
		const burstManager = bursts.addComponent(BurstManager);
		await burstManager.init({
			x: 1,
			y: 5,
			type: ENTITY_TYPE_ENUM.BURST,
			direction: DIRECTION_ENUM.BOTTOM,
			state: ENTITY_STATE_ENUM.IDLE,
		});
		DataManager.Instance.bursts.push(burstManager);

		const bursts1 = createUINode();
		bursts1.setParent(this.stage);
		const burstManager1 = bursts1.addComponent(BurstManager);
		await burstManager1.init({
			x: 1,
			y: 6,
			type: ENTITY_TYPE_ENUM.BURST,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});
		DataManager.Instance.bursts.push(burstManager1);
	}

	adaptPosition() {
		const { mapRowCount, mapColumnCount } = DataManager.Instance,
			offsetX = (TILE_WIDTH * mapRowCount) / 2,
			offsetY = (TILE_HEIGHT * mapColumnCount) / 2 + 100;

		this.stage.setPosition(-offsetX, offsetY);
	}
}
