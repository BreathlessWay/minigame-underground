import { _decorator, Animation, AnimationClip } from "cc";

import State from "db://assets/utils/State";

import { FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from "db://assets/enums";
import { StateMachine } from "db://assets/utils/StateMachine";

const { ccclass } = _decorator;

export interface IParams {
	type: FSM_PARAM_TYPE_ENUM;
	value: boolean | number;
}

export const getInitParamsTrigger = () => {
	return {
		type: FSM_PARAM_TYPE_ENUM.TRIGGER,
		value: false,
	};
};

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
	}

	initStateMachines() {
		this.stateMachines.set(
			PARAMS_NAME_ENUM.IDLE,
			new State(this, "texture/player/idle/top", AnimationClip.WrapMode.Loop)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.TURNLEFT,
			new State(this, "texture/player/turnleft/top")
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
			case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE): {
				if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT);
				}
				if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
				}
				break;
			}
			default: {
				this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
			}
		}
	}
}
