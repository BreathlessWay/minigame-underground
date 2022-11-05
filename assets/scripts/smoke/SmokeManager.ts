import { _decorator } from "cc";

import { EntityManager } from "db://assets/utils/EntityManager";

import { SmokeStateMachine } from "db://assets/scripts/smoke/SmokeStateMachine";

const { ccclass } = _decorator;

@ccclass("SmokeManager")
export class SmokeManager extends EntityManager {
	async init(params) {
		this.fsm = this.addComponent(SmokeStateMachine);
		await this.fsm.init();
		super.init(params);
	}
}
