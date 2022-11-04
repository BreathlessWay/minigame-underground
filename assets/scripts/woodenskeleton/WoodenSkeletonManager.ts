import { _decorator } from "cc";

import { EntityManager } from "db://assets/utils/EntityManager";

import { WoodenSkeletonStateMachine } from "db://assets/scripts/woodenskeleton/WoodenSkeletonStateMachine";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import {
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	EVENT_ENUM,
} from "db://assets/enums";

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
		EventManager.Instance.on(EVENT_ENUM.ATTACK_ENEMY, this.onDead, this);

		this.onChangeDirection(true);
	}

	onDestroy() {
		EventManager.Instance.off(
			EVENT_ENUM.PLAYER_MOVE_END,
			this.onChangeDirection
		);
		EventManager.Instance.off(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection);
		EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack);
		EventManager.Instance.off(EVENT_ENUM.ATTACK_ENEMY, this.onDead);
	}

	onChangeDirection(isInit) {
		if (!DataManager.Instance.player || this.state === ENTITY_STATE_ENUM.DEATH)
			return;

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
		if (!DataManager.Instance.player || this.state === ENTITY_STATE_ENUM.DEATH)
			return;

		const {
			x: playerX,
			y: playerY,
			state: playerState,
		} = DataManager.Instance.player;

		if (
			((playerX === this.x && Math.abs(playerY - this.y) <= 1) ||
				(playerY === this.y && Math.abs(playerX - this.x) <= 1)) &&
			playerState !== ENTITY_STATE_ENUM.DEATH &&
			playerState !== ENTITY_STATE_ENUM.AIRDEATH
		) {
			this.state = ENTITY_STATE_ENUM.ATTACK;
			EventManager.Instance.emit(
				EVENT_ENUM.ATTACK_PLAYER,
				ENTITY_STATE_ENUM.DEATH
			);
		} else {
			this.state = ENTITY_STATE_ENUM.IDLE;
		}
	}

	onDead(id: string) {
		if (this.state === ENTITY_STATE_ENUM.DEATH) return;
		if (this.id === id) {
			this.state = ENTITY_STATE_ENUM.DEATH;
		}
	}
}
