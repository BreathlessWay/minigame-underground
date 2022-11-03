import { _decorator } from "cc";

import EventManager from "db://assets/stores/EventManager";
import { EntityManager } from "db://assets/utils/EntityManager";

import { PlayerStateMachine } from "db://assets/scripts/player/PlayerStateMachine";
import {
	CONTROLLER_ENUM,
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	EVENT_ENUM,
} from "db://assets/enums";
import DataManager from "db://assets/stores/DataManager";

const { ccclass } = _decorator;

@ccclass("PlayerManager")
export class PlayerManager extends EntityManager {
	targetX = 0;
	targetY = 0;
	private readonly speed = 1 / 10;

	update() {
		this.updatePosition();
		super.update();
	}

	async init() {
		this.fsm = this.addComponent(PlayerStateMachine);
		await this.fsm.init();
		super.init({
			x: 0,
			y: 0,
			type: ENTITY_TYPE_ENUM.PLAYER,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});

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
		console.log(DataManager.Instance.tileInfo);
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
			if (this.direction === DIRECTION_ENUM.TOP) {
				this.direction = DIRECTION_ENUM.LEFT;
			} else if (this.direction === DIRECTION_ENUM.LEFT) {
				this.direction = DIRECTION_ENUM.BOTTOM;
			} else if (this.direction === DIRECTION_ENUM.BOTTOM) {
				this.direction = DIRECTION_ENUM.RIGHT;
			} else if (this.direction === DIRECTION_ENUM.RIGHT) {
				this.direction = DIRECTION_ENUM.TOP;
			}
			this.state = ENTITY_STATE_ENUM.TURNLEFT;
		}
		// if (direction === CONTROLLER_ENUM.TURNRIGHT) {
		// 	if (this.direction === DIRECTION_ENUM.TOP) {
		// 		this.direction = DIRECTION_ENUM.RIGHT;
		// 	} else if (this.direction === DIRECTION_ENUM.BOTTOM) {
		// 		this.direction = DIRECTION_ENUM.LEFT;
		// 	} else if (this.direction === DIRECTION_ENUM.LEFT) {
		// 		this.direction = DIRECTION_ENUM.TOP;
		// 	} else if (this.direction === DIRECTION_ENUM.RIGHT) {
		// 		this.direction = DIRECTION_ENUM.BOTTOM;
		// 	}
		// 	this.state = ENTITY_STATE_ENUM.TURNRIGHT;
		// }
	}
}
