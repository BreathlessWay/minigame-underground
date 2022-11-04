import State from "db://assets/utils/State";
import { StateMachine } from "db://assets/utils/StateMachine";

export abstract class SubStateMachine {
	private _currentState: State;
	stateMachines: Map<string, State> = new Map();

	constructor(public fsm: StateMachine) {}

	get currentState() {
		return this._currentState;
	}

	set currentState(value) {
		if (!value) {
			return;
		}
		this._currentState = value;
		this._currentState.run();
	}

	abstract run(): void;
}
