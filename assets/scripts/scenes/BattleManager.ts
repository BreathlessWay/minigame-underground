import { _decorator, Component, Node } from "cc";

import { TileMapManager } from "db://assets/scripts/tile/TileMapManager";
import { PlayerManager } from "db://assets/scripts/player/PlayerManager";
import { WoodenSkeletonManager } from "db://assets/scripts/woodenskeleton/WoodenSkeletonManager";
import { DoorManager } from "db://assets/scripts/door/DoorManager";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import { createUINode } from "db://assets/utils";

import levels, { ILevel } from "db://assets/levels";
import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";
import { EVENT_ENUM } from "db://assets/enums";

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

			this.generateTileMap();
			this.generateDoor();
			this.generatePlayer();
			this.generateEnemies();
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
		await playerManager.init();
		DataManager.Instance.player = playerManager;
		EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN, true);
	}

	async generateEnemies() {
		const enemies = createUINode();
		enemies.setParent(this.stage);
		const woodenSkeletonManager = enemies.addComponent(WoodenSkeletonManager);
		await woodenSkeletonManager.init();
		DataManager.Instance.enemies.push(woodenSkeletonManager);
	}

	async generateDoor() {
		const door = createUINode();
		door.setParent(this.stage);
		const doorManager = door.addComponent(DoorManager);
		await doorManager.init();
		DataManager.Instance.door = doorManager;
	}

	adaptPosition() {
		const { mapRowCount, mapColumnCount } = DataManager.Instance,
			offsetX = (TILE_WIDTH * mapRowCount) / 2,
			offsetY = (TILE_HEIGHT * mapColumnCount) / 2 + 100;

		this.stage.setPosition(-offsetX, offsetY);
	}
}
