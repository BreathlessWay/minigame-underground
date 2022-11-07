import { _decorator, Component, Event } from "cc";

import EventManager from "db://assets/stores/EventManager";

import { EVENT_ENUM } from "db://assets/enums";

const { ccclass } = _decorator;

@ccclass("MenuManager")
export class MenuManager extends Component {
	handleUndo() {
		EventManager.Instance.emit(EVENT_ENUM.REVOKE_STEP);
	}
	handleQuite() {
		EventManager.Instance.emit(EVENT_ENUM.QUIT_BATTLE);
	}
	handleRestart() {
		EventManager.Instance.emit(EVENT_ENUM.RESTART_LEVEL);
	}
}
