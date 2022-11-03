import { _decorator, Component, Node } from "cc";

import EventManager from "db://assets/stores/EventManager";

import { EVENT_ENUM } from "db://assets/enums";

const { ccclass, property } = _decorator;

@ccclass("ControlManager")
export class ControlManager extends Component {
	handleControl() {
		EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL);
	}
}
