import { _decorator, Component, Node, director } from "cc";

import FadeManager from "db://assets/utils/FadeManager";

import { SCENE_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("StartManager")
export class StartManager extends Component {
	onLoad() {
		FadeManager.Instance.fadeOut(1000);
		this.node.once(Node.EventType.TOUCH_START, this.handleStart, this);
	}

	async handleStart() {
		await FadeManager.Instance.fadeIn(300);
		director.loadScene(SCENE_ENUM.Battle);
	}
}
