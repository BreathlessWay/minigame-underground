import { _decorator } from "cc";

import { IronSkeletonStateMachine } from "db://assets/scripts/ironskeleton/IronSkeletonStateMachine";

import { EnemyManager } from "db://assets/utils/EnemyManager";

import { IEntity } from "db://assets/levels";

const { ccclass } = _decorator;

@ccclass("IronSkeletonManager")
export class IronSkeletonManager extends EnemyManager {
	async init(params: IEntity) {
		this.fsm = this.addComponent(IronSkeletonStateMachine);
		await this.fsm.init();
		super.init(params);
	}
}
