import { _decorator } from "cc";

import { EntityManager } from "db://assets/utils/EntityManager";

import { DoorStateMachine } from "db://assets/scripts/door/DoorStateMachine";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import { ENTITY_STATE_ENUM, EVENT_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("DoorManager")
export class DoorManager extends EntityManager {
	async init(params) {
		this.fsm = this.addComponent(DoorStateMachine);
		await this.fsm.init();
		super.init(params);
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
