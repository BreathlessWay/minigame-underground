import State from "db://assets/utils/State";
import { StateMachine } from "db://assets/utils/StateMachine";
import SpikesSubStateMachine from "db://assets/scripts/spikes/SpikesSubStateMachine";

import { SPIKES_COUNT_ENUM } from "db://assets/enums";

const BASE_URL = "texture/spikes/spikesthree";

export default class SpikesThreeSubStateMachine extends SpikesSubStateMachine {
	constructor(fsm: StateMachine) {
		super(fsm);
		this.stateMachines.set(
			SPIKES_COUNT_ENUM.ZERO,
			new State(fsm, `${BASE_URL}/zero`)
		);
		this.stateMachines.set(
			SPIKES_COUNT_ENUM.ONE,
			new State(fsm, `${BASE_URL}/one`)
		);
		this.stateMachines.set(
			SPIKES_COUNT_ENUM.TWO,
			new State(fsm, `${BASE_URL}/two`)
		);
		this.stateMachines.set(
			SPIKES_COUNT_ENUM.TWO,
			new State(fsm, `${BASE_URL}/three`)
		);
		this.stateMachines.set(
			SPIKES_COUNT_ENUM.FOUR,
			new State(fsm, `${BASE_URL}/four`)
		);
	}
}
