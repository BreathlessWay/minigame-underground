import { _decorator, Component, game } from "cc";

import EventManager from "db://assets/stores/EventManager";

import { EVENT_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("SharkManager")
export class SharkManager extends Component {
	private isSharking = false;
	private oldTime = 0;
	private oldPos = { x: 0, y: 0 };

	onLoad() {
		EventManager.Instance.on(EVENT_ENUM.SCREEN_SHAKE, this.onShark, this);
	}

	update() {
		if (this.isSharking) {
			const curSecond = (game.totalTime - this.oldTime) / 1000,
				duration = 1000,
				amount = 1.6,
				frequency = 12,
				totalSecond = duration / 1000,
				offset = amount * Math.sin(frequency * Math.PI * curSecond);

			this.node.setPosition(this.oldPos.x, this.oldPos.y + offset);

			if (curSecond > totalSecond) {
				this.isSharking = false;
				this.node.setPosition(this.oldPos.x, this.oldPos.y);
			}
		}
	}

	onDestroy() {
		EventManager.Instance.off(EVENT_ENUM.SCREEN_SHAKE, this.onShark);
	}

	stop() {
		this.isSharking = false;
	}

	onShark() {
		if (this.isSharking) return;
		this.isSharking = true;
		this.oldTime = game.totalTime;
		this.oldPos.x = this.node.position.x;
		this.oldPos.y = this.node.position.y;
	}
}
