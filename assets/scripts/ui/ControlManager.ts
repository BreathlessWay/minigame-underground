import { _decorator, Component, Event } from "cc";

import EventManager from "db://assets/stores/EventManager";

import { EVENT_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("ControlManager")
export class ControlManager extends Component {
	handleControl(event: Event, type: string) {
		EventManager.Instance.emit(EVENT_ENUM.PLAYER_CTRL, type);
	}
}
