import {
	_decorator,
	Component,
	AnimationClip,
	Animation,
	SpriteFrame,
} from "cc";

import State from "db://assets/utils/State";

import { FSM_PARAM_TYPE_ENUM, PARAMS_NAME_ENUM } from "db://assets/enums";

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
export class PlayerStateMachine extends Component {
	private _currentState: State;
	params: Map<string, IParams> = new Map();
	stateMachines: Map<string, State> = new Map();
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
		}
	}

	get currentState() {
		return this._currentState;
	}

	set currentState(value) {
		this._currentState = value;
		this._currentState.run();
	}

	async init() {
		this.animationComp = this.addComponent(Animation);
		this.initParams();
		this.initStateMachines();

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

	run() {
		switch (this.currentState) {
			case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE): {
				if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT)) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT);
				}
				if (this.params.get(PARAMS_NAME_ENUM.IDLE)) {
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
