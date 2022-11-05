import { _decorator, Animation } from "cc";

import State from "db://assets/utils/State";
import {
	getInitParamsNumber,
	getInitParamsTrigger,
	StateMachine,
} from "db://assets/utils/StateMachine";

import { PARAMS_NAME_ENUM } from "db://assets/enums";

const { ccclass } = _decorator,
	BASE_URL = "texture/burst";

@ccclass("BurstStateMachine")
export class BurstStateMachine extends StateMachine {
	async init() {
		this.animationComp = this.addComponent(Animation);
		this.initParams();
		this.initStateMachines();

		await Promise.all(this.waitingList);
	}

	initParams() {
		this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.ATTACK, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber());
	}

	initStateMachines() {
		this.stateMachines.set(
			PARAMS_NAME_ENUM.IDLE,
			new State(this, `${BASE_URL}/idle`)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.ATTACK,
			new State(this, `${BASE_URL}/attack`)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.DEATH,
			new State(this, `${BASE_URL}/death`)
		);
	}

	run() {
		switch (this.currentState) {
			case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE):
			case this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK):
			case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
				if (this.params.get(PARAMS_NAME_ENUM.DEATH).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.ATTACK).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK);
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
