import {
	_decorator,
	Component,
	Sprite,
	UITransform,
	Animation,
	AnimationClip,
	animation,
	SpriteFrame,
} from "cc";

import ResourceManager from "db://assets/stores/ResourceManager";

import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";

const { ccclass, property } = _decorator,
	ANIMATION_SPEED = 1 / 8;

@ccclass("PlayerManager")
export class PlayerManager extends Component {
	async init() {
		const sprite = this.addComponent(Sprite);
		sprite.sizeMode = Sprite.SizeMode.CUSTOM;

		const transform = this.getComponent(UITransform);
		transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4);

		const spriteFrameList = await ResourceManager.Instance.loadResource(
				"texture/player/idle/top"
			),
			animationComp = this.addComponent(Animation);

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
		animationClip.wrapMode = AnimationClip.WrapMode.Loop;
		animationComp.defaultClip = animationClip;
		animationComp.play();
	}
}
