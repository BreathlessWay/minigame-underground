import { _decorator } from "cc";

import { EntityManager } from "db://assets/utils/EntityManager";

import { WoodenSkeletonStateMachine } from "db://assets/scripts/woodenskeleton/WoodenSkeletonStateMachine";
import {
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
} from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("WoodenSkeletonManager")
export class WoodenSkeletonManager extends EntityManager {
	async init() {
		this.fsm = this.addComponent(WoodenSkeletonStateMachine);
		await this.fsm.init();
		super.init({
			x: 7,
			y: 7,
			type: ENTITY_TYPE_ENUM.SKELETON_WOODEN,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});
	}
}
