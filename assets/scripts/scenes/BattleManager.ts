import { _decorator, Component, Node, director } from "cc";

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
import DataManager, { IRecord } from "db://assets/stores/DataManager";
import FadeManager from "db://assets/utils/FadeManager";

import { createUINode } from "db://assets/utils";

import levels, { ILevel } from "db://assets/levels";
import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";
import {
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	EVENT_ENUM,
	SCENE_ENUM,
} from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("BattleManager")
export class BattleManager extends Component {
	level: ILevel;
	stage: Node;
	smokeLayer: Node;
	private isInit = false;

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
		EventManager.Instance.on(EVENT_ENUM.RESTART_LEVEL, this.initLevel, this);
		EventManager.Instance.on(EVENT_ENUM.RECORD_STEP, this.record, this);
		EventManager.Instance.on(EVENT_ENUM.REVOKE_STEP, this.revoke, this);
		EventManager.Instance.on(EVENT_ENUM.QUIT_BATTLE, this.quitBattle, this);
	}

	onDestroy() {
		EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel);
		EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived);
		EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke);
		EventManager.Instance.off(EVENT_ENUM.RESTART_LEVEL, this.initLevel);
		EventManager.Instance.off(EVENT_ENUM.RECORD_STEP, this.record);
		EventManager.Instance.off(EVENT_ENUM.REVOKE_STEP, this.revoke);
		EventManager.Instance.off(EVENT_ENUM.QUIT_BATTLE, this.quitBattle);
	}

	async initLevel() {
		const levelIndex = DataManager.Instance.levelIndex,
			level = levels[`level${levelIndex}`];

		if (level) {
			if (this.isInit) {
				await FadeManager.Instance.fadeIn();
			} else {
				await FadeManager.Instance.mask();
			}
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
			this.isInit = true;
		} else {
			this.quitBattle();
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

	async quitBattle() {
		await FadeManager.Instance.fadeIn();
		director.loadScene(SCENE_ENUM.Start);
	}

	record() {
		const item: IRecord = {
			player: {
				x: DataManager.Instance.player.targetX,
				y: DataManager.Instance.player.targetY,
				// 除了这三种状态，其他状态在动画播放完都会回到 IDLE 状态
				state:
					DataManager.Instance.player.state === ENTITY_STATE_ENUM.IDLE ||
					DataManager.Instance.player.state === ENTITY_STATE_ENUM.DEATH ||
					DataManager.Instance.player.state === ENTITY_STATE_ENUM.AIRDEATH
						? DataManager.Instance.player.state
						: ENTITY_STATE_ENUM.IDLE,
				direction: DataManager.Instance.player.direction,
				type: DataManager.Instance.player.type,
			},
			door: {
				x: DataManager.Instance.door.x,
				y: DataManager.Instance.door.y,
				state: DataManager.Instance.door.state,
				direction: DataManager.Instance.door.direction,
				type: DataManager.Instance.door.type,
			},
			enemies: DataManager.Instance.enemies.map(
				({ x, y, state, direction, type }) => {
					return {
						x,
						y,
						state,
						direction,
						type,
					};
				}
			),
			spikes: DataManager.Instance.spikes.map(({ x, y, count, type }) => {
				return {
					x,
					y,
					count,
					type,
				};
			}),
			bursts: DataManager.Instance.bursts.map(
				({ x, y, state, direction, type }) => {
					return {
						x,
						y,
						state,
						direction,
						type,
					};
				}
			),
		};

		DataManager.Instance.records.push(item);
	}

	revoke() {
		const data = DataManager.Instance.records.pop();
		if (data) {
			DataManager.Instance.player.x = DataManager.Instance.player.targetX =
				data.player.x;
			DataManager.Instance.player.y = DataManager.Instance.player.targetY =
				data.player.y;
			DataManager.Instance.player.state = data.player.state;
			DataManager.Instance.player.direction = data.player.direction;

			for (let i = 0; i < data.enemies.length; i++) {
				const item = data.enemies[i];
				DataManager.Instance.enemies[i].x = item.x;
				DataManager.Instance.enemies[i].y = item.y;
				DataManager.Instance.enemies[i].state = item.state;
				DataManager.Instance.enemies[i].direction = item.direction;
			}

			for (let i = 0; i < data.spikes.length; i++) {
				const item = data.spikes[i];
				DataManager.Instance.spikes[i].x = item.x;
				DataManager.Instance.spikes[i].y = item.y;
				DataManager.Instance.spikes[i].count = item.count;
			}

			for (let i = 0; i < data.bursts.length; i++) {
				const item = data.bursts[i];
				DataManager.Instance.bursts[i].x = item.x;
				DataManager.Instance.bursts[i].y = item.y;
				DataManager.Instance.bursts[i].state = item.state;
			}

			DataManager.Instance.door.x = data.door.x;
			DataManager.Instance.door.y = data.door.y;
			DataManager.Instance.door.state = data.door.state;
			DataManager.Instance.door.direction = data.door.direction;
		}
	}
}
