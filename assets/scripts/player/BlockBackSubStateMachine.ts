import State from "db://assets/utils/State";
import { StateMachine } from "db://assets/utils/StateMachine";
import DirectionSubStateMachine from "db://assets/utils/DirectionSubStateMachine";

import { DIRECTION_ENUM } from "db://assets/enums";

const BASE_URL = "texture/player/blockback";

export default class BlockBackSubStateMachine extends DirectionSubStateMachine {
	constructor(fsm: StateMachine) {
		super(fsm);
		this.stateMachines.set(
			DIRECTION_ENUM.TOP,
			new State(fsm, `${BASE_URL}/top`)
		);
		this.stateMachines.set(
			DIRECTION_ENUM.BOTTOM,
			new State(fsm, `${BASE_URL}/bottom`)
		);
		this.stateMachines.set(
			DIRECTION_ENUM.LEFT,
			new State(fsm, `${BASE_URL}/left`)
		);
		this.stateMachines.set(
			DIRECTION_ENUM.RIGHT,
			new State(fsm, `${BASE_URL}/right`)
		);
	}
}
