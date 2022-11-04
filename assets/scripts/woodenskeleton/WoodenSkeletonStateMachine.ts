import { _decorator, Animation } from "cc";

import {
	getInitParamsNumber,
	getInitParamsTrigger,
	StateMachine,
} from "db://assets/utils/StateMachine";
import IdleSubStateMachine from "db://assets/scripts/woodenskeleton/IdleSubStateMachine";

import { PARAMS_NAME_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("WoodenSkeletonStateMachine")
export class WoodenSkeletonStateMachine extends StateMachine {
	async init() {
		this.animationComp = this.addComponent(Animation);
		this.initParams();
		this.initStateMachines();
		this.initAnimationEvent();

		await Promise.all(this.waitingList);
	}

	initParams() {
		this.params.set(PARAMS_NAME_ENUM.IDLE, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.DIRECTION, getInitParamsNumber());
	}

	initStateMachines() {
		this.stateMachines.set(
			PARAMS_NAME_ENUM.IDLE,
			new IdleSubStateMachine(this)
		);
	}

	initAnimationEvent() {
		this.animationComp.on(Animation.EventType.FINISHED, () => {
			// const name = this.animationComp.defaultClip.name;
			// const whiteList = ["block", "turn"];
			// if (whiteList.some(_ => name.includes(_))) {
			// 	this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.IDLE;
			// }
		});
	}

	run() {
		switch (this.currentState) {
			case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE): {
				if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
					return;
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
