import { _decorator, Animation } from "cc";

import SpikesOneSubStateMachine from "db://assets/scripts/spikes/SpikesOneSubStateMachine";

import {
	getInitParamsNumber,
	StateMachine,
} from "db://assets/utils/StateMachine";
import { EntityManager } from "db://assets/utils/EntityManager";

import {
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	PARAMS_NAME_ENUM,
	SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM,
} from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("SpikesManager")
export class SpikesStateMachine extends StateMachine {
	async init() {
		this.animationComp = this.addComponent(Animation);
		this.initParams();
		this.initStateMachines();
		this.initAnimationEvent();

		await Promise.all(this.waitingList);
	}

	initParams() {
		this.params.set(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, getInitParamsNumber());
		this.params.set(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, getInitParamsNumber());
	}

	initStateMachines() {
		this.stateMachines.set(
			ENTITY_TYPE_ENUM.SPIKES_ONE,
			new SpikesOneSubStateMachine(this)
		);
		this.stateMachines.set(
			ENTITY_TYPE_ENUM.SPIKES_TWO,
			new SpikesOneSubStateMachine(this)
		);
		this.stateMachines.set(
			ENTITY_TYPE_ENUM.SPIKES_THREE,
			new SpikesOneSubStateMachine(this)
		);
		this.stateMachines.set(
			ENTITY_TYPE_ENUM.SPIKES_FOUR,
			new SpikesOneSubStateMachine(this)
		);
	}

	initAnimationEvent() {
		// this.animationComp.on(Animation.EventType.FINISHED, () => {
		// 	const name = this.animationComp.defaultClip.name;
		// 	const whiteList = ["attack"];
		// 	if (whiteList.some(_ => name.includes(_))) {
		// 		this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.IDLE;
		// 	}
		// });
	}

	run() {
		const totalCount = this.getParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT);

		switch (this.currentState) {
			case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE):
			case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_TWO):
			case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_THREE):
			case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_FOUR): {
				if (totalCount === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_ONE) {
					this.currentState = this.stateMachines.get(
						ENTITY_TYPE_ENUM.SPIKES_ONE
					);
					return;
				}
				// eslint-disable-next-line no-self-assign
				this.currentState = this.currentState;
				break;
			}
			default: {
				this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE);
			}
		}
	}
}
