import { AnimationClip } from "cc";

import State from "db://assets/utils/State";
import { StateMachine } from "db://assets/utils/StateMachine";
import { SubStateMachine } from "db://assets/utils/SubStateMachine";

import {
	DIRECTION_ENUM,
	DIRECTION_ORDER_ENUM,
	PARAMS_NAME_ENUM,
} from "db://assets/enums";

const BASE_URL = "texture/player/idle";

export default class IdleSubStateMachine extends SubStateMachine {
	constructor(fsm: StateMachine) {
		super(fsm);
		this.stateMachines.set(
			DIRECTION_ENUM.TOP,
			new State(fsm, `${BASE_URL}/top`, AnimationClip.WrapMode.Loop)
		);
		this.stateMachines.set(
			DIRECTION_ENUM.BOTTOM,
			new State(fsm, `${BASE_URL}/bottom`, AnimationClip.WrapMode.Loop)
		);
		this.stateMachines.set(
			DIRECTION_ENUM.LEFT,
			new State(fsm, `${BASE_URL}/left`, AnimationClip.WrapMode.Loop)
		);
		this.stateMachines.set(
			DIRECTION_ENUM.RIGHT,
			new State(fsm, `${BASE_URL}/right`, AnimationClip.WrapMode.Loop)
		);
	}

	run() {
		const value = this.fsm.getParams(PARAMS_NAME_ENUM.DIRECTION);
		this.currentState = this.stateMachines.get(
			DIRECTION_ORDER_ENUM[value as number]
		);
	}
}
