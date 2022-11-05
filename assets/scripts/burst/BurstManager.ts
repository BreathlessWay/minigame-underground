import { _decorator, UITransform } from "cc";

import { BurstStateMachine } from "db://assets/scripts/burst/BurstStateMachine";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import { EntityManager } from "db://assets/utils/EntityManager";

import { IEntity } from "db://assets/levels";
import { ENTITY_STATE_ENUM, EVENT_ENUM } from "db://assets/enums";
import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";

const { ccclass } = _decorator;

@ccclass("BurstManager")
export class BurstManager extends EntityManager {
	async init(params: IEntity) {
		this.fsm = this.addComponent(BurstStateMachine);
		await this.fsm.init();
		super.init(params);
		const transform = this.getComponent(UITransform);
		transform.setContentSize(TILE_WIDTH, TILE_HEIGHT);
		EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst, this);
	}

	onDestroy() {
		super.onDestroy();
		EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst);
	}

	update() {
		this.node.setPosition(this.x * TILE_WIDTH, -this.y * TILE_HEIGHT);
	}

	onBurst() {
		if (!DataManager.Instance.player || this.state === ENTITY_STATE_ENUM.DEATH)
			return;

		const { x: playerX, y: playerY } = DataManager.Instance.player,
			{ x, y, state } = this;

		if (playerX === x && playerY === y && state === ENTITY_STATE_ENUM.IDLE) {
			this.state = ENTITY_STATE_ENUM.ATTACK;
		}

		if (state === ENTITY_STATE_ENUM.ATTACK) {
			this.state = ENTITY_STATE_ENUM.DEATH;
			if (x === playerX && y === playerY) {
				EventManager.Instance.emit(
					EVENT_ENUM.ATTACK_PLAYER,
					ENTITY_STATE_ENUM.AIRDEATH
				);
			}
		}
	}
}
