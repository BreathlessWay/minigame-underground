import { _decorator, Component, Sprite, UITransform } from "cc";

import { StateMachine } from "db://assets/utils/StateMachine";
import { SpikesStateMachine } from "db://assets/scripts/spikes/SpikesStateMachine";

import { randomByLength } from "db://assets/utils";

import {
	ENTITY_TYPE_ENUM,
	PARAMS_NAME_ENUM,
	SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM,
} from "db://assets/enums";
import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";
import { ISpikes } from "db://assets/levels";

const { ccclass } = _decorator;

@ccclass("SpikesManager")
export class SpikesManager extends Component {
	id = randomByLength(12);
	x = 0;
	y = 0;
	fsm: StateMachine;
	private _count: number;
	private _totalCount: number;
	private type: ENTITY_TYPE_ENUM;

	get count() {
		return this._count;
	}

	set count(newCount) {
		this._count = newCount;
		this.fsm.setParams(PARAMS_NAME_ENUM.SPIKES_CUR_COUNT, newCount);
	}

	get totalCount() {
		return this._totalCount;
	}

	set totalCount(newCount) {
		this._totalCount = newCount;
		this.fsm.setParams(PARAMS_NAME_ENUM.SPIKES_TOTAL_COUNT, newCount);
	}

	async init(params: ISpikes) {
		const sprite = this.node.addComponent(Sprite);
		sprite.sizeMode = Sprite.SizeMode.CUSTOM;
		const transform = this.getComponent(UITransform);
		transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4);

		this.fsm = this.node.addComponent(SpikesStateMachine);
		await this.fsm.init();
		this.x = params.x;
		this.y = params.y;
		const type = params.type;
		this.totalCount = SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM[type];
		this.count = params.count;
	}

	update() {
		this.node.setPosition(
			this.x * TILE_WIDTH - TILE_WIDTH * 1.5,
			-this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5
		);
	}

	onDestroy() {
		//
	}
}
