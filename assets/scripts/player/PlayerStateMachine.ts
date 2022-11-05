import { _decorator, Animation } from "cc";

import { EntityManager } from "db://assets/utils/EntityManager";

import {
	getInitParamsNumber,
	getInitParamsTrigger,
	StateMachine,
} from "db://assets/utils/StateMachine";
import IdleSubStateMachine from "db://assets/scripts/player/IdleSubStateMachine";
import TurnLeftSubStateMachine from "db://assets/scripts/player/TurnLeftSubStateMachine";
import TurnRightSubStateMachine from "db://assets/scripts/player/TurnRightSubStateMachine";
import BlockFrontSubStateMachine from "db://assets/scripts/player/BlockFrontSubStateMachine";
import BlockBackSubStateMachine from "db://assets/scripts/player/BlockBackSubStateMachine";
import BlockLeftSubStateMachine from "db://assets/scripts/player/BlockLeftSubStateMachine";
import BlockRightSubStateMachine from "db://assets/scripts/player/BlockRightSubStateMachine";
import BlockTurnLeftSubStateMachine from "db://assets/scripts/player/BlockTurnLeftSubStateMachine";
import BlockTurnRightSubStateMachine from "db://assets/scripts/player/BlockTurnRightSubStateMachine";
import DeathSubStateMachine from "db://assets/scripts/player/DeathSubStateMachine";
import AttackSubStateMachine from "db://assets/scripts/player/AttackSubStateMachine";
import AirDeathSubStateMachine from "db://assets/scripts/player/AirDeathSubStateMachine";

import {
	ENTITY_STATE_ENUM,
	FSM_PARAM_TYPE_ENUM,
	PARAMS_NAME_ENUM,
} from "db://assets/enums";

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
		this.params.set(PARAMS_NAME_ENUM.DEATH, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.AIRDEATH, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.ATTACK, getInitParamsTrigger());

		this.params.set(PARAMS_NAME_ENUM.BLOCKFRONT, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.BLOCKLEFT, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.BLOCKRIGHT, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.BLOCKBACK, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.BLOCKTURNLEFT, getInitParamsTrigger());
		this.params.set(PARAMS_NAME_ENUM.BLOCKTURNRIGHT, getInitParamsTrigger());

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
		this.stateMachines.set(
			PARAMS_NAME_ENUM.BLOCKFRONT,
			new BlockFrontSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.BLOCKBACK,
			new BlockBackSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.BLOCKLEFT,
			new BlockLeftSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.BLOCKRIGHT,
			new BlockRightSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.BLOCKTURNLEFT,
			new BlockTurnLeftSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.BLOCKTURNRIGHT,
			new BlockTurnRightSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.DEATH,
			new DeathSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.AIRDEATH,
			new AirDeathSubStateMachine(this)
		);
		this.stateMachines.set(
			PARAMS_NAME_ENUM.ATTACK,
			new AttackSubStateMachine(this)
		);
	}

	initAnimationEvent() {
		this.animationComp.on(Animation.EventType.FINISHED, () => {
			const name = this.animationComp.defaultClip.name;
			const whiteList = ["block", "turn", "attack"];
			if (whiteList.some(_ => name.includes(_))) {
				this.node.getComponent(EntityManager).state = ENTITY_STATE_ENUM.IDLE;
			}
		});
	}

	run() {
		switch (this.currentState) {
			case this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.TURNRIGHT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKFRONT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKBACK):
			case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKLEFT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKRIGHT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT):
			case this.stateMachines.get(PARAMS_NAME_ENUM.DEATH):
			case this.stateMachines.get(PARAMS_NAME_ENUM.AIRDEATH):
			case this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK):
			case this.stateMachines.get(PARAMS_NAME_ENUM.IDLE): {
				if (this.params.get(PARAMS_NAME_ENUM.IDLE).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.IDLE);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.DEATH).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.DEATH);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.AIRDEATH).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.AIRDEATH);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.ATTACK).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.ATTACK);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.TURNLEFT).value) {
					this.currentState = this.stateMachines.get(PARAMS_NAME_ENUM.TURNLEFT);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.TURNRIGHT).value) {
					this.currentState = this.stateMachines.get(
						PARAMS_NAME_ENUM.TURNRIGHT
					);
					return;
				}

				if (this.params.get(PARAMS_NAME_ENUM.BLOCKFRONT).value) {
					this.currentState = this.stateMachines.get(
						PARAMS_NAME_ENUM.BLOCKFRONT
					);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.BLOCKBACK).value) {
					this.currentState = this.stateMachines.get(
						PARAMS_NAME_ENUM.BLOCKBACK
					);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.BLOCKLEFT).value) {
					this.currentState = this.stateMachines.get(
						PARAMS_NAME_ENUM.BLOCKLEFT
					);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.BLOCKRIGHT).value) {
					this.currentState = this.stateMachines.get(
						PARAMS_NAME_ENUM.BLOCKRIGHT
					);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.BLOCKTURNLEFT).value) {
					this.currentState = this.stateMachines.get(
						PARAMS_NAME_ENUM.BLOCKTURNLEFT
					);
					return;
				}
				if (this.params.get(PARAMS_NAME_ENUM.BLOCKTURNRIGHT).value) {
					this.currentState = this.stateMachines.get(
						PARAMS_NAME_ENUM.BLOCKTURNRIGHT
					);
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
