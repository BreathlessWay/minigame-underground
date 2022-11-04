import { _decorator, Component, SpriteFrame, Animation } from "cc";

import State from "db://assets/utils/State";
import { SubStateMachine } from "db://assets/utils/SubStateMachine";

import { FSM_PARAM_TYPE_ENUM } from "db://assets/enums";

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

export const getInitParamsNumber = () => {
	return {
		type: FSM_PARAM_TYPE_ENUM.NUMBER,
		value: 0,
	};
};

@ccclass("StateMachine")
export abstract class StateMachine extends Component {
	private _currentState: State | SubStateMachine;
	params: Map<string, IParams> = new Map();
	stateMachines: Map<string, State | SubStateMachine> = new Map();
	animationComp: Animation;
	waitingList: Array<Promise<SpriteFrame[]>> = [];

	getParams(name: string) {
		if (this.params.has(name)) {
			return this.params.get(name).value;
		}
	}

	setParams(name: string, value: boolean | number) {
		if (this.params.has(name)) {
			this.params.get(name).value = value;
			this.run();
			this.resetTrigger();
		}
	}

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

	resetTrigger() {
		for (const [, value] of this.params) {
			if (value.type === FSM_PARAM_TYPE_ENUM.TRIGGER) {
				value.value = false;
			}
		}
	}

	abstract init(): void;
	abstract run(): void;
}
