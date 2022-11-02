import { _decorator, Component, Node } from "cc";

import { TileMapManager } from "db://assets/scripts/tile/TileMapManager";

import { createUINode } from "db://assets/utils";

import levels, { ILevel } from "db://assets/levels";
import { DataManagerInstance } from "db://assets/stores/DataManager";
import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";

const { ccclass } = _decorator;

@ccclass("BattleManager")
export class BattleManager extends Component {
	level: ILevel;
	stage: Node;
	start() {
		this.generateStage();
		this.initLevel();
	}

	initLevel() {
		const level = levels[`level1`];
		if (level) {
			this.level = level;

			DataManagerInstance.mapInfo = this.level.mapInfo;
			DataManagerInstance.mapRowCount = this.level.mapInfo.length;
			DataManagerInstance.mapColumnCount = this.level.mapInfo[0].length;

			this.generateTileMap();
		}
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

		// this.adaptPosition();
	}

	adaptPosition() {
		const { mapRowCount, mapColumnCount } = DataManagerInstance,
			offsetX = (TILE_WIDTH * mapRowCount) / 2,
			offsetY = (TILE_HEIGHT * mapColumnCount) / 2 + 100;

		this.stage.setPosition(-offsetX, offsetY);
	}
}
