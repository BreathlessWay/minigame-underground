import { _decorator, Component, Sprite, UITransform } from "cc";

import { PlayerStateMachine } from "db://assets/scripts/player/PlayerStateMachine";

import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";
import {
	DIRECTION_ENUM,
	DIRECTION_ORDER_ENUM,
	ENTITY_STATE_ENUM,
	PARAMS_NAME_ENUM,
} from "db://assets/enums";
import { IEntity } from "db://assets/levels";

const { ccclass } = _decorator;

@ccclass("EntityManager")
export class EntityManager extends Component {
	x = 0;
	y = 0;
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
		this.node.setPosition(
			this.x * TILE_WIDTH - TILE_WIDTH * 1.5,
			-this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5
		);
	}

	init(params: IEntity) {
		const sprite = this.addComponent(Sprite);
		sprite.sizeMode = Sprite.SizeMode.CUSTOM;

		const transform = this.getComponent(UITransform);
		transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4);

		this.x = params.x;
		this.y = params.y;
		this.direction = params.direction;
		this.state = params.state;
	}
}
