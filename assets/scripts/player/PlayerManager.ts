import { _decorator, Component, Sprite, UITransform } from "cc";

import EventManager from "db://assets/stores/EventManager";

import { PlayerStateMachine } from "db://assets/scripts/player/PlayerStateMachine";

import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";
import {
	CONTROLLER_ENUM,
	DIRECTION_ENUM,
	DIRECTION_ORDER_ENUM,
	ENTITY_STATE_ENUM,
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

	private _direction: DIRECTION_ENUM;
	private _state: ENTITY_STATE_ENUM;

	get direction() {
		return this._direction;
	}

	set direction(value) {
		this._direction = value;
		this.fsm.setParams(PARAMS_NAME_ENUM.DIRECTION, DIRECTION_ORDER_ENUM[value]);
	}

	get state() {
		return this._state;
	}

	set state(value) {
		this._state = value;
		this.fsm.setParams(value, true);
	}

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
		this.state = ENTITY_STATE_ENUM.IDLE;

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
	}
}
