import { AnimationClip, Sprite, animation, SpriteFrame } from "cc";

import ResourceManager from "db://assets/stores/ResourceManager";

import { StateMachine } from "db://assets/utils/StateMachine";
import { sortSpriteFrame } from "db://assets/utils/index";

export const ANIMATION_SPEED = 1 / 8;

export default class State {
	private animationClip: AnimationClip;

	constructor(
		private fsm: StateMachine,
		private path: string,
		private wrapMode = AnimationClip.WrapMode.Normal,
		private speed = ANIMATION_SPEED
	) {
		this.init();
	}

	async init() {
		const promisify = ResourceManager.Instance.loadResource(this.path);

		this.fsm.waitingList.push(promisify);

		const spriteFrameList = await promisify;

		const animationClip = new AnimationClip();

		const track = new animation.ObjectTrack();
		track.path = new animation.TrackPath()
			.toComponent(Sprite)
			.toProperty("spriteFrame");

		const frames: Array<[number, SpriteFrame]> = sortSpriteFrame(
			spriteFrameList
		).map((item, index) => [this.speed * index, item]);

		track.channel.curve.assignSorted(frames);
		// 最后将轨道添加到动画剪辑以应用
		animationClip.addTrack(track);
		animationClip.name = this.path;
		animationClip.duration = frames.length * this.speed; // 整个动画剪辑的周期
		animationClip.wrapMode = this.wrapMode;

		this.animationClip = animationClip;
	}

	run() {
		if (this.fsm.animationComp.defaultClip?.name === this.animationClip.name) {
			return;
		}

		this.fsm.animationComp.defaultClip = this.animationClip;
		this.fsm.animationComp.play();
	}
}
