import { _decorator, Animation } from "cc";

import {
	getInitParamsNumber,
	getInitParamsTrigger,
	StateMachine,
} from "db://assets/utils/StateMachine";
import IdleSubStateMachine from "db://assets/scripts/smoke/IdleSubStateMachine";
import DeathSubStateMachine from "db://assets/scripts/smoke/DeathSubStateMachine";
import { EntityManager } from "db://assets/utils/EntityManager";

import { ENTITY_STATE_ENUM, PARAMS_NAME_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("SmokeStateMachine")
export class SmokeStateMachine extends StateMachine {
	async init() {
		this.animationComp = this.addComponent(Animation);
		this.initParams();
		this.initStateMachines();
		this.initAnimationEvent();
		await Promise.all(this.waitingList);
	}

	initParams() {
		this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber());
	}

	initStateMachines() {
		this.stateMachines.set(
			PARAMS_NAME_ENUM.IDLE,
			new IdleSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.DEATH,
			new DeathSubStateMachine(this)
		);
	}

	initAnimationEvent() {
		this.animationComp.on(Animation.EventType.FINISHED, () => {
			const whiteList = ["idle"];
			const name = this.animationComp.defaultClip.name;
			if (whiteList.some(v => name.includes(v))) {
				this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.DEATH;
			}
		});
	}

	run() {
		switch (this.currentState) {
			case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
			case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
				if (this.params.get(PARAMS_NAME_ENUM.DEATH).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
					return;
				}
				// eslint-disable-next-line no-self-assign
				this.currentState = this.currentState;
				break;
			default:
				this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
				break;
		}
	}
}
