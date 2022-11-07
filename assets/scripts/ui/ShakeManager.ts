import { _decorator, Component, game } from "cc";

import EventManager from "db://assets/stores/EventManager";

import { EVENT_ENUM, SHAKE_TYPE_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("ShakeManager")
export class ShakeManager extends Component {
	private isShaking = false;
	private oldTime = 0;
	private oldPos = { x: 0, y: 0 };
	private shakeType: SHAKE_TYPE_ENUM;

	onLoad() {
		EventManager.Instance.on(EVENT_ENUM.SCREEN_SHAKE, this.onShake, this);
	}

	update() {
		if (this.isShaking) {
			const curSecond = (game.totalTime - this.oldTime) / 1000,
				duration = 200,
				amount = 1.6,
				frequency = 12,
				totalSecond = duration / 1000,
				offset = amount * Math.sin(frequency * Math.PI * curSecond);

			if (this.shakeType === SHAKE_TYPE_ENUM.TOP) {
				this.node.setPosition(this.oldPos.x, this.oldPos.y - offset);
			}
			if (this.shakeType === SHAKE_TYPE_ENUM.BOTTOM) {
				this.node.setPosition(this.oldPos.x, this.oldPos.y + offset);
			}
			if (this.shakeType === SHAKE_TYPE_ENUM.LEFT) {
				this.node.setPosition(this.oldPos.x - offset, this.oldPos.y);
			}
			if (this.shakeType === SHAKE_TYPE_ENUM.RIGHT) {
				this.node.setPosition(this.oldPos.x + offset, this.oldPos.y);
			}

			if (curSecond > totalSecond) {
				this.isShaking = false;
				this.node.setPosition(this.oldPos.x, this.oldPos.y);
			}
		}
	}

	onDestroy() {
		EventManager.Instance.off(EVENT_ENUM.SCREEN_SHAKE, this.onShake);
	}

	stop() {
		this.isShaking = false;
	}

	onShake(type: SHAKE_TYPE_ENUM) {
		if (this.isShaking) return;
		this.isShaking = true;
		this.shakeType = type;
		this.oldTime = game.totalTime;
		this.oldPos.x = this.node.position.x;
		this.oldPos.y = this.node.position.y;
	}
}
