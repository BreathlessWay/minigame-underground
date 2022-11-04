import { _decorator } from "cc";
import { IEntity } from "../levels";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import { EntityManager } from "db://assets/utils/EntityManager";

import {
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	EVENT_ENUM,
} from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("EnemyManager")
export class EnemyManager extends EntityManager {
	init(params: IEntity) {
		super.init(params);
		EventManager.Instance.on(
			EVENT_ENUM.PLAYER_BORN,
			this.onChangeDirection,
			this
		);
		EventManager.Instance.on(EVENT_ENUM.ATTACK_ENEMY, this.onDead, this);
		EventManager.Instance.on(
			EVENT_ENUM.PLAYER_MOVE_END,
			this.onChangeDirection,
			this
		);

		this.onChangeDirection(true);
	}

	onDestroy() {
		super.onDestroy();
		EventManager.Instance.off(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection);
		EventManager.Instance.off(EVENT_ENUM.ATTACK_ENEMY, this.onDead);
		EventManager.Instance.off(
			EVENT_ENUM.PLAYER_MOVE_END,
			this.onChangeDirection
		);
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

	onDead(id: string) {
		if (this.state === ENTITY_STATE_ENUM.DEATH) return;
		if (this.id === id) {
			this.state = ENTITY_STATE_ENUM.DEATH;
		}
	}
}
