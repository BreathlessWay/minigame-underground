import Singleton from "db://assets/utils/Singleton";

import { ITile } from "db://assets/levels";
import { TileManager } from "db://assets/scripts/tile/TileManager";
import { PlayerManager } from "db://assets/scripts/player/PlayerManager";
import { WoodenSkeletonManager } from "db://assets/scripts/woodenskeleton/WoodenSkeletonManager";

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
		this.tileInfo = null;
	}

	mapInfo: Array<Array<ITile>>;
	mapRowCount: number;
	mapColumnCount: number;
	levelIndex = 1;
	tileInfo: Array<TileManager[]>;
	player: PlayerManager;
	enemies: WoodenSkeletonManager[] = [];
}
