import Singleton from "db://assets/utils/Singleton";

import { ITile } from "db://assets/levels";

export default class DataManager extends Singleton {
	static get Instance() {
		return super.GetInstance<DataManager>();
	}

	mapInfo: Array<Array<ITile>>;
	mapRowCount: number;
	mapColumnCount: number;
	levelIndex = 1;
}
