import { _decorator, Component, Sprite, UITransform } from "cc";

import { StateMachine } from "db://assets/utils/StateMachine";
import { SpikesStateMachine } from "db://assets/scripts/spikes/SpikesStateMachine";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import { randomByLength } from "db://assets/utils";

import {
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	EVENT_ENUM,
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
	type: ENTITY_TYPE_ENUM;

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

		EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onLoop, this);
	}

	onLoop() {
		if (this.count === this.totalCount) {
			this.count = 1;
		} else {
			this.count++;
		}

		this.onAttack();
	}

	back() {
		this.count = 0;
	}

	onAttack() {
		if (!DataManager.Instance.player) return;
		const { x: playerX, y: playerY } = DataManager.Instance.player;
		if (
			playerX === this.x &&
			playerY === this.y &&
			this.count === this.totalCount
		) {
			EventManager.Instance.emit(
				EVENT_ENUM.ATTACK_PLAYER,
				ENTITY_STATE_ENUM.DEATH
			);
		}
	}

	update() {
		this.node.setPosition(
			this.x * TILE_WIDTH - TILE_WIDTH * 1.5,
			-this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5
		);
	}

	onDestroy() {
		EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onLoop);
	}
}
