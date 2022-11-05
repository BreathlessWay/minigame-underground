import Singleton from "db://assets/utils/Singleton";

import { ITile } from "db://assets/levels";
import { TileManager } from "db://assets/scripts/tile/TileManager";
import { PlayerManager } from "db://assets/scripts/player/PlayerManager";
import { DoorManager } from "db://assets/scripts/door/DoorManager";
import { EnemyManager } from "db://assets/utils/EnemyManager";
import { BurstManager } from "db://assets/scripts/burst/BurstManager";
import { SpikesManager } from "db://assets/scripts/spikes/SpikesManager";

export default class DataManager extends Singleton {
	static get Instance() {
		return super.GetInstance<DataManager>();
	}

	reset() {
		this.mapInfo = [];
		this.mapRowCount = 0;
		this.mapColumnCount = 0;
		this.player = null;
		this.enemies = [];
		this.bursts = [];
		this.spikes = [];
		this.tileInfo = null;
		this.door = null;
	}

	mapInfo: Array<Array<ITile>>;
	mapRowCount: number;
	mapColumnCount: number;
	levelIndex = 2;
	tileInfo: Array<TileManager[]>;
	player: PlayerManager;
	enemies: EnemyManager[] = [];
	bursts: BurstManager[] = [];
	spikes: SpikesManager[] = [];
	door: DoorManager;
}
