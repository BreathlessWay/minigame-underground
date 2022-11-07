import {
	_decorator,
	Component,
	Graphics,
	view,
	Color,
	game,
	BlockInputEvents,
	UITransform,
} from "cc";

const { ccclass } = _decorator;

export const SCREEN_WIDTH = view.getVisibleSize().width,
	SCREEN_HEIGHT = view.getVisibleSize().height,
	DEFAULT_FADE_DURATION = 200;

enum FADE_STATE_ENUM {
	IDLE,
	FADE_IN,
	FADE_OUT,
}

@ccclass("DrawManager")
export class DrawManager extends Component {
	private ctx: Graphics;
	private state: FADE_STATE_ENUM;
	private oldTime = 0;
	private duration = 0;
	private fadeResolve: (value: PromiseLike<null>) => void;
	private block: BlockInputEvents;

	init() {
		this.block = this.addComponent(BlockInputEvents);
		this.ctx = this.addComponent(Graphics);

		const transform = this.getComponent(UITransform);
		transform.setAnchorPoint(0.5, 0.5);
		transform.setContentSize(SCREEN_WIDTH, SCREEN_HEIGHT);

		this.setAlpha(1);
	}

	setAlpha(percent: number) {
		this.ctx.clear();
		this.ctx.rect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
		this.ctx.fillColor = new Color(0, 0, 0, 255 * percent);
		this.ctx.fill();

		this.block.enabled = percent === 1;
	}

	update() {
		const percent = (game.totalTime - this.oldTime) / this.duration;
		switch (this.state) {
			case FADE_STATE_ENUM.FADE_IN:
				if (percent < 1) {
					this.setAlpha(percent);
				} else {
					this.state = FADE_STATE_ENUM.IDLE;
					this.setAlpha(1);
					this.fadeResolve(null);
				}
				break;
			case FADE_STATE_ENUM.FADE_OUT:
				if (percent < 1) {
					this.setAlpha(1 - percent);
				} else {
					this.state = FADE_STATE_ENUM.IDLE;
					this.setAlpha(0);
					this.fadeResolve(null);
				}
				break;
			default:
				break;
		}
	}

	fadeIn(duration = DEFAULT_FADE_DURATION) {
		this.duration = duration;
		this.state = FADE_STATE_ENUM.FADE_IN;
		this.oldTime = game.totalTime;
		return new Promise(resolve => {
			this.fadeResolve = resolve;
		});
	}

	fadeOut(duration = DEFAULT_FADE_DURATION) {
		this.duration = duration;
		this.state = FADE_STATE_ENUM.FADE_OUT;
		this.oldTime = game.totalTime;
		return new Promise(resolve => {
			this.fadeResolve = resolve;
		});
	}
}
