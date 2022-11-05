import State from "db://assets/utils/State";
import { StateMachine } from "db://assets/utils/StateMachine";
import { SubStateMachine } from "db://assets/utils/SubStateMachine";

import {
	PARAMS_NAME_ENUM,
	SPIKES_COUNT_ENUM,
	SPIKES_COUNT_MAP_NUMBER_ENUM,
} from "db://assets/enums";

const BASE_URL = "texture/spikes/spikesone";

export default class SpikesOneSubStateMachine extends SubStateMachine {
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
	}

	run() {
		const { value } = this.fsm.params.get(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT);
		this.currentState = this.stateMachines.get(
			SPIKES_COUNT_MAP_NUMBER_ENUM[value as number]
		);
	}
}
