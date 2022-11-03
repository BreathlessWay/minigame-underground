import { _decorator, Component, SpriteFrame, resources } from "cc";

import { TileManager } from "db://assets/scripts/tile/TileManager";

import DataManager from "db://assets/stores/DataManager";

import { createUINode, randomByRange } from "db://assets/utils";
import ResourceManager from "db://assets/stores/ResourceManager";

const { ccclass, property } = _decorator;

@ccclass("TileMapManager")
export class TileMapManager extends Component {
	async init() {
		const { mapInfo } = DataManager.Instance,
			spriteFrameList = await ResourceManager.Instance.loadResource(
				"texture/tile/tile"
			);

		for (let i = 0, yLen = mapInfo.length; i < yLen; i++) {
			const column = mapInfo[i];
			for (let j = 0, xLen = column.length; j < xLen; j++) {
				const { src, type } = column[j];
				if (src && type) {
					let number = src;
					if (
						(number === 1 || number === 5 || number === 9) &&
						!(i % 2) &&
						!(j % 2)
					) {
						number += randomByRange(0, 4);
					}
					console.log(number);
					const node = createUINode(),
						imgSrc = `tile (${number})`,
						spriteFrame = spriteFrameList.find(_ => _.name === imgSrc),
						tileManager = node.addComponent(TileManager);

					tileManager.init(spriteFrame, i, j);

					node.setParent(this.node);
				}
			}
		}
	}
}
