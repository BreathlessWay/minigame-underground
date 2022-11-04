import { _decorator } from "cc";

import { EntityManager } from "db://assets/utils/EntityManager";

import { WoodenSkeletonStateMachine } from "db://assets/scripts/woodenskeleton/WoodenSkeletonStateMachine";
import {
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	EVENT_ENUM,
} from "db://assets/enums";
import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

const { ccclass } = _decorator;

@ccclass("WoodenSkeletonManager")
export class WoodenSkeletonManager extends EntityManager {
	async init() {
		this.fsm = this.addComponent(WoodenSkeletonStateMachine);
		await this.fsm.init();
		super.init({
			x: 7,
			y: 7,
			type: ENTITY_TYPE_ENUM.SKELETON_WOODEN,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});
		EventManager.Instance.on(
			EVENT_ENUM.PLAYER_MOVE_END,
			this.onChangeDirection,
			this
		);
		EventManager.Instance.on(
			EVENT_ENUM.PLAYER_BORN,
			this.onChangeDirection,
			this
		);

		EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this);

		this.onChangeDirection(true);
	}

	onChangeDirection(isInit) {
		if (!DataManager.Instance.player) return;

		const { x: playerX, y: playerY } = DataManager.Instance.player;

		const disX = Math.abs(this.x - playerX),
			disY = Math.abs(this.y - playerY);

		if (disX === disY && !isInit) return;

		if (playerX <= this.x && playerY <= this.y) {
			this.direction = disY > disX ? DIRECTION_ENUM.TOP : DIRECTION_ENUM.LEFT;
		}
		if (playerX <= this.x && playerY >= this.y) {
			this.direction =
				disY > disX ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.LEFT;
		}
		if (playerX >= this.x && playerY <= this.y) {
			this.direction = disY > disX ? DIRECTION_ENUM.TOP : DIRECTION_ENUM.RIGHT;
		}
		if (playerX >= this.x && playerY >= this.y) {
			this.direction =
				disY > disX ? DIRECTION_ENUM.BOTTOM : DIRECTION_ENUM.RIGHT;
		}
	}

	onAttack() {
		if (!DataManager.Instance.player) return;

		const { x: playerX, y: playerY } = DataManager.Instance.player;

		if (
			(this.x === playerX && Math.abs(this.y - playerY) <= 1) ||
			(this.y === playerY && Math.abs(this.x - playerX) <= 1)
		) {
			this.state = ENTITY_STATE_ENUM.ATTACK;
		} else {
			this.state = ENTITY_STATE_ENUM.IDLE;
		}
	}
}
