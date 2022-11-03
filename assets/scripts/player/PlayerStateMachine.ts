import { _decorator, Animation } from "cc";

import {
	getInitParamsNumber,
	getInitParamsTrigger,
	StateMachine,
} from "db://assets/utils/StateMachine";
import IdleSubStateMachine from "db://assets/scripts/player/IdleSubStateMachine";
import TurnLeftSubStateMachine from "db://assets/scripts/player/TurnLeftSubStateMachine";
import TurnRightSubStateMachine from "db://assets/scripts/player/TurnRightSubStateMachine";

import { FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

export interface IParams {
	type: FSM_PARAM_TYPE_ENUM;
	value: boolean | number;
}

@ccclass("PlayerStateMachine")
export class PlayerStateMachine extends StateMachine {
	async init() {
		this.animationComp = this.addComponent(Animation);
		this.initParams();
		this.initStateMachines();
		this.initAnimationEvent();

		await Promise.all(this.waitingList);
	}

	initParams() {
		this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.TURNLEFT, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.TURNRIGHT, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber());
	}

	initStateMachines() {
		this.stateMachines.set(
			PARAMS_NAME_ENUM.IDLE,
			new IdleSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.TURNLEFT,
			new TurnLeftSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.TURNRIGHT,
			new TurnRightSubStateMachine(this)
		);
	}

	initAnimationEvent() {
		this.animationComp.on(Animation.EventType.FINISHED, () => {
			const name = this.animationComp.defaultClip.name;
			const whiteList = ["turn"];
			if (whiteList.some(_ => name.includes(_))) {
				this.setParams(PARAMS_NAME_ENUM.IDLE, true);
			}
		});
	}

	run() {
		switch (this.currentState) {
			case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE): {
				if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT);
				}
				if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
				}
				if (this.params.get(PARAMS_NAME_ENUM.TURNRIGHT).value) {
					this.currentState = this.stateMachines.get(
						PARAMS_NAME_ENUM.TURNRIGHT
					);
				}
				// eslint-disable-next-line no-self-assign
				this.currentState = this.currentState;
				break;
			}
			default: {
				this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
			}
		}
	}
}
