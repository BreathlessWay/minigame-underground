import { RenderRoot2D, game } from "cc";

import Singleton from "db://assets/utils/Singleton";

import {
	DEFAULT_FADE_DURATION,
	DrawManager,
} from "db://assets/scripts/ui/DrawManager";

import { createUINode } from "db://assets/utils/index";

export default class FadeManager extends Singleton {
	static get Instance() {
		return super.GetInstance<FadeManager>();
	}

	private _fader: DrawManager;

	get fader() {
		if (this._fader) {
			return this._fader;
		}

		const root = createUINode();
		root.addComponent(RenderRoot2D);

		const fadeNode = createUINode();
		fadeNode.setParent(root);
		this._fader = fadeNode.addComponent(DrawManager);
		this._fader.init();

		game.addPersistRootNode(root);

		return this._fader;
	}

	set fader(val) {
		this._fader = val;
	}

	fadeIn(duration = DEFAULT_FADE_DURATION) {
		return this.fader.fadeIn(duration);
	}

	fadeOut(duration = DEFAULT_FADE_DURATION) {
		return this.fader.fadeOut(duration);
	}
}
