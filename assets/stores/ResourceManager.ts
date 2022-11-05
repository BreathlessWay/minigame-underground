import { resources, SpriteFrame, _decorator } from "cc";

import Singleton from "db://assets/utils/Singleton";

const { ccclass } = _decorator;

@ccclass("BattleManager")
export default class ResourceManager extends Singleton {
	static get Instance() {
		return super.GetInstance<ResourceManager>();
	}

	loadResource(path: string, type: typeof SpriteFrame = SpriteFrame) {
		return new Promise<SpriteFrame[]>((resolve, reject) => {
			resources.loadDir(path, type, (error, assets) => {
				if (error) {
					reject(error);
					return;
				}
				resolve(assets);
			});
		});
	}
}
