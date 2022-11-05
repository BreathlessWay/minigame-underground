import { _decorator, Animation } from "cc";

import SpikesOneSubStateMachine from "db://assets/scripts/spikes/SpikesOneSubStateMachine";
import SpikesTwoSubStateMachine from "db://assets/scripts/spikes/SpikesTwoSubStateMachine";
import SpikesThreeSubStateMachine from "db://assets/scripts/spikes/SpikesThreeSubStateMachine";
import SpikesFourSubStateMachine from "db://assets/scripts/spikes/SpikesFourSubStateMachine";

import {
	getInitParamsNumber,
	StateMachine,
} from "db://assets/utils/StateMachine";

import {
	ENTITY_TYPE_ENUM,
	PARAMS_NAME_ENUM,
	SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM,
} from "db://assets/enums";
import { SpikesManager } from "db://assets/scripts/spikes/SpikesManager";

const { ccclass } = _decorator;

@ccclass("SpikesManager")
export class SpikesStateMachine extends StateMachine {
	async init() {
		this.animationComp = this.addComponent(Animation);
		this.initParams();
		this.initStateMachines();
		this.initAnimationEvent();

		await Promise.all(this.waitingList);
	}

	initParams() {
		this.params.set(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, getInitParamsNumber());
		this.params.set(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, getInitParamsNumber());
	}

	initStateMachines() {
		this.stateMachines.set(
			ENTITY_TYPE_ENUM.SPIKES_ONE,
			new SpikesOneSubStateMachine(this)
		);
		this.stateMachines.set(
			ENTITY_TYPE_ENUM.SPIKES_TWO,
			new SpikesTwoSubStateMachine(this)
		);
		this.stateMachines.set(
			ENTITY_TYPE_ENUM.SPIKES_THREE,
			new SpikesThreeSubStateMachine(this)
		);
		this.stateMachines.set(
			ENTITY_TYPE_ENUM.SPIKES_FOUR,
			new SpikesFourSubStateMachine(this)
		);
	}

	initAnimationEvent() {
		this.animationComp.on(Animation.EventType.FINISHED, () => {
			const name = this.animationComp.defaultClip.name;
			const { value } = this.params.get(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT);
			//例如1个刺的地裂，在播放完1刺之后，回到0的状态
			if (
				(value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_ONE &&
					name.includes("spikesone/two")) ||
				(value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_TWO &&
					name.includes("spikestwo/three")) ||
				(value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_THREE &&
					name.includes("spikesthree/four")) ||
				(value === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_FOUR &&
					name.includes("spikesfour/five"))
			) {
				this.node.getComponent(SpikesManager).back();
			}
		});
	}

	run() {
		const totalCount = this.getParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT);

		switch (this.currentState) {
			case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE):
			case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_TWO):
			case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_THREE):
			case this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_FOUR): {
				if (totalCount === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_ONE) {
					this.currentState = this.stateMachines.get(
						ENTITY_TYPE_ENUM.SPIKES_ONE
					);
					return;
				}
				if (totalCount === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_TWO) {
					this.currentState = this.stateMachines.get(
						ENTITY_TYPE_ENUM.SPIKES_TWO
					);
					return;
				}
				if (totalCount === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_THREE) {
					this.currentState = this.stateMachines.get(
						ENTITY_TYPE_ENUM.SPIKES_THREE
					);
					return;
				}
				if (totalCount === SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM.SPIKES_FOUR) {
					this.currentState = this.stateMachines.get(
						ENTITY_TYPE_ENUM.SPIKES_FOUR
					);
					return;
				}
				// eslint-disable-next-line no-self-assign
				this.currentState = this.currentState;
				break;
			}
			default: {
				this.currentState = this.stateMachines.get(ENTITY_TYPE_ENUM.SPIKES_ONE);
			}
		}
	}
}
