import Singleton from "db://assets/utils/Singleton";

import { TileManager } from "db://assets/scripts/tile/TileManager";
import { ITile } from "db://assets/levels";

export default class DataManager extends Singleton {
	static get Instance() {
		return super.GetInstance<DataManager>();
	}

	reset() {
		this.mapInfo = [];
		this.mapRowCount = 0;
		this.mapColumnCount = 0;
	}

	mapInfo: Array<Array<ITile>>;
	mapRowCount: number;
	mapColumnCount: number;
	levelIndex = 1;
	tileInfo: Array<TileManager[]>;
}
