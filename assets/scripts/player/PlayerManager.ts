import { _decorator, Component, Sprite, UITransform } from "cc";

import EventManager from "db://assets/stores/EventManager";

import { PlayerStateMachine } from "db://assets/scripts/player/PlayerStateMachine";

import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";
import {
	CONTROLLER_ENUM,
	EVENT_ENUM,
	PARAMS_NAME_ENUM,
} from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("PlayerManager")
export class PlayerManager extends Component {
	x = 0;
	y = 0;
	targetX = 0;
	targetY = 0;
	private readonly speed = 1 / 10;
	fsm: PlayerStateMachine;

	update() {
		this.updatePosition();
		this.node.setPosition(
			this.x * TILE_WIDTH - TILE_WIDTH * 1.5,
			-this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5
		);
	}

	async init() {
		const sprite = this.addComponent(Sprite);
		sprite.sizeMode = Sprite.SizeMode.CUSTOM;

		const transform = this.getComponent(UITransform);
		transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4);

		this.fsm = this.addComponent(PlayerStateMachine);
		await this.fsm.init();
		this.fsm.setParams(PARAMS_NAME_ENUM.IDLE, true);

		EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this);
	}

	updatePosition() {
		if (this.x < this.targetX) {
			this.x += this.speed;
		}
		if (this.x > this.targetX) {
			this.x -= this.speed;
		}

		if (this.y < this.targetY) {
			this.y += this.speed;
		}
		if (this.y > this.targetY) {
			this.y -= this.speed;
		}

		if (
			Math.abs(this.targetX - this.x) <= 0.1 &&
			Math.abs(this.targetY - this.y) <= 0.1
		) {
			this.x = this.targetX;
			this.y = this.targetY;
		}
	}

	move(direction: CONTROLLER_ENUM) {
		if (direction === CONTROLLER_ENUM.TOP) {
			this.targetY -= 1;
		}
		if (direction === CONTROLLER_ENUM.BOTTOM) {
			this.targetY += 1;
		}
		if (direction === CONTROLLER_ENUM.LEFT) {
			this.targetX -= 1;
		}
		if (direction === CONTROLLER_ENUM.RIGHT) {
			this.targetX += 1;
		}
		if (direction === CONTROLLER_ENUM.TURNLEFT) {
			this.fsm.setParams(PARAMS_NAME_ENUM.TURNLEFT, true);
		}
	}
}
