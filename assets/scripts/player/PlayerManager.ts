import {
	_decorator,
	Animation,
	animation,
	AnimationClip,
	Component,
	Sprite,
	SpriteFrame,
	UITransform,
} from "cc";

import ResourceManager from "db://assets/stores/ResourceManager";

import EventManager from "db://assets/stores/EventManager";

import { TILE_HEIGHT, TILE_WIDTH } from "db://assets/scripts/tile/TileManager";
import { CONTROLLER_ENUM, EVENT_ENUM } from "db://assets/enums";

const { ccclass, property } = _decorator,
	ANIMATION_SPEED = 1 / 8;

@ccclass("PlayerManager")
export class PlayerManager extends Component {
	x = 0;
	y = 0;
	targetX = 0;
	targetY = 0;
	private readonly speed = 1 / 10;

	update() {
		this.updatePosition();
		this.node.setPosition(
			this.x * TILE_WIDTH - TILE_WIDTH * 1.5,
			-this.y * TILE_HEIGHT + TILE_HEIGHT * 1.5
		);
	}

	async init() {
		await this.render();
		EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.move, this);
	}

	updatePosition() {
		if (this.x < this.targetX) {
			this.x += this.speed;
		}
		if (this.x > this.targetX) {
			this.x -= this.speed;
		}

		if (this.y < this.targetY) {
			this.y += this.speed;
		}
		if (this.y > this.targetY) {
			this.y -= this.speed;
		}

		if (
			Math.abs(this.targetX - this.x) <= 0.1 &&
			Math.abs(this.targetY - this.y) <= 0.1
		) {
			this.x = this.targetX;
			this.y = this.targetY;
		}
	}

	move(direction: CONTROLLER_ENUM) {
		if (direction === CONTROLLER_ENUM.TOP) {
			this.targetY -= 1;
		}
		if (direction === CONTROLLER_ENUM.BOTTOM) {
			this.targetY += 1;
		}
		if (direction === CONTROLLER_ENUM.LEFT) {
			this.targetX -= 1;
		}
		if (direction === CONTROLLER_ENUM.RIGHT) {
			this.targetX += 1;
		}
	}

	async render() {
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
