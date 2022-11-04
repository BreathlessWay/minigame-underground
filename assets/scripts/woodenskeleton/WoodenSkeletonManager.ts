import { _decorator } from "cc";

import { WoodenSkeletonStateMachine } from "db://assets/scripts/woodenskeleton/WoodenSkeletonStateMachine";

import { EnemyManager } from "db://assets/utils/EnemyManager";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import { ENTITY_STATE_ENUM, EVENT_ENUM } from "db://assets/enums";
import { IEntity } from "db://assets/levels";

const { ccclass } = _decorator;

@ccclass("WoodenSkeletonManager")
export class WoodenSkeletonManager extends EnemyManager {
	async init(params: IEntity) {
		this.fsm = this.addComponent(WoodenSkeletonStateMachine);
		await this.fsm.init();
		super.init(params);
		EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this);
	}

	onDestroy() {
		super.onDestroy();
		EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack);
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
}
