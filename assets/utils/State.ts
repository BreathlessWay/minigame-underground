import { AnimationClip, Sprite, animation, SpriteFrame } from "cc";

import ResourceManager from "db://assets/stores/ResourceManager";

import { PlayerStateMachine } from "db://assets/scripts/player/PlayerStateMachine";

const ANIMATION_SPEED = 1 / 8;

export default class State {
	private animationClip: AnimationClip;

	constructor(
		private fsm: PlayerStateMachine,
		private path: string,
		private wrapMode = AnimationClip.WrapMode.Normal
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

		const frames: Array<[number, SpriteFrame]> = spriteFrameList.map(
			(item, index) => [ANIMATION_SPEED * index, item]
		);
		track.channel.curve.assignSorted(frames);
		// 最后将轨道添加到动画剪辑以应用
		animationClip.addTrack(track);
		animationClip.duration = frames.length * ANIMATION_SPEED; // 整个动画剪辑的周期
		animationClip.wrapMode = this.wrapMode;

		this.animationClip = animationClip;
	}

	run() {
		this.fsm.animationComp.defaultClip = this.animationClip;
		this.fsm.animationComp.play();
	}
}
