import { _decorator } from "cc";

import { EntityManager } from "db://assets/utils/EntityManager";

import { DoorStateMachine } from "db://assets/scripts/door/DoorStateMachine";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import {
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	EVENT_ENUM,
} from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("DoorManager")
export class DoorManager extends EntityManager {
	async init() {
		this.fsm = this.addComponent(DoorStateMachine);
		await this.fsm.init();
		super.init({
			x: 7,
			y: 8,
			type: ENTITY_TYPE_ENUM.DOOR,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});
		EventManager.Instance.on(EVENT_ENUM.DOOR_OPEN, this.onOpen, this);
	}

	onDestroy() {
		EventManager.Instance.off(EVENT_ENUM.DOOR_OPEN, this.onOpen);
	}

	onOpen() {
		if (
			DataManager.Instance.enemies.every(
				({ state }) => state === ENTITY_STATE_ENUM.DEATH
			) &&
			this.state !== ENTITY_STATE_ENUM.DEATH
		) {
			this.state = ENTITY_STATE_ENUM.DEATH;
		}
	}
}
