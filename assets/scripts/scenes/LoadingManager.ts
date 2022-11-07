import { _decorator, Component, resources, ProgressBar, director } from "cc";

import { SCENE_ENUM } from "db://assets/enums";

const { ccclass, property } = _decorator;

@ccclass("LoadingManager")
export class LoadingManager extends Component {
	@property(ProgressBar)
	bar: ProgressBar = null;

	onLoad() {
		console.log(1);
		resources.preloadDir(
			"texture",
			(current, total) => {
				this.bar.progress = current / total;
			},
			() => {
				director.loadScene(SCENE_ENUM.Start);
			}
		);
	}
}
