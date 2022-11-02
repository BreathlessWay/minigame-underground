import { _decorator, Component, SpriteFrame, resources } from "cc";

import { TileManager } from "db://assets/scripts/tile/TileManager";

import { DataManagerInstance } from "db://assets/stores/DataManager";

import { createUINode } from "db://assets/utils";

const { ccclass, property } = _decorator;

@ccclass("TileMapManager")
export class TileMapManager extends Component {
	async init() {
		const { mapInfo } = DataManagerInstance,
			spriteFrameList = await this.loadResource();

		for (let i = 0, yLen = mapInfo.length; i < yLen; i++) {
			const column = mapInfo[i];
			for (let j = 0, xLen = column.length; j < xLen; j++) {
				const { src, type } = column[j];
				if (src && type) {
					const node = createUINode(),
						imgSrc = `tile (${src})`,
						spriteFrame = spriteFrameList.find(_ => _.name === imgSrc),
						tileManager = node.addComponent(TileManager);

					tileManager.init(spriteFrame, i, j);

					node.setParent(this.node);
				}
			}
		}
	}

	loadResource() {
		return new Promise<SpriteFrame[]>((resolve, reject) => {
			resources.loadDir("texture/tile/tile", SpriteFrame, (error, assets) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(assets);
			});
		});
	}
}
