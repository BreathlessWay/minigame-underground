import { _decorator } from "cc";

import { PlayerStateMachine } from "db://assets/scripts/player/PlayerStateMachine";

import EventManager from "db://assets/stores/EventManager";
import DataManager from "db://assets/stores/DataManager";

import { EntityManager } from "db://assets/utils/EntityManager";

import {
	CONTROLLER_ENUM,
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	EVENT_ENUM,
} from "db://assets/enums";
import { IEntity } from "db://assets/levels";

const { ccclass } = _decorator;

@ccclass("PlayerManager")
export class PlayerManager extends EntityManager {
	targetX = 0;
	targetY = 0;
	isMoving = false;
	private readonly speed = 1 / 10;

	update() {
		this.updatePosition();
		super.update();
	}

	async init(params: IEntity) {
		this.fsm = this.addComponent(PlayerStateMachine);
		await this.fsm.init();
		super.init(params);
		this.targetX = this.x;
		this.targetY = this.y;
		EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.moveHandler, this);
		EventManager.Instance.on(EVENT_ENUM.ATTACK_PLAYER, this.onDead, this);
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
			Math.abs(this.targetY - this.y) <= 0.1 &&
			this.isMoving
		) {
			this.isMoving = false;
			this.x = this.targetX;
			this.y = this.targetY;
			EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
		}
	}

	onDead(state: ENTITY_STATE_ENUM) {
		this.state = state;
	}

	moveHandler(direction: CONTROLLER_ENUM) {
		if (this.isMoving) return;
		if (
			this.state === ENTITY_STATE_ENUM.DEATH ||
			this.state === ENTITY_STATE_ENUM.AIRDEATH ||
			this.state === ENTITY_STATE_ENUM.ATTACK
		)
			return;

		const enemyId = this.willAttack(direction);
		if (enemyId) {
			EventManager.Instance.emit(EVENT_ENUM.ATTACK_ENEMY, enemyId);
			EventManager.Instance.emit(EVENT_ENUM.DOOR_OPEN);
			return;
		}
		if (this.willBlock(direction)) return;

		this.move(direction);
	}

	move(direction: CONTROLLER_ENUM) {
		if (direction === CONTROLLER_ENUM.TOP) {
			this.isMoving = true;
			this.targetY -= 1;
		}
		if (direction === CONTROLLER_ENUM.BOTTOM) {
			this.isMoving = true;
			this.targetY += 1;
		}
		if (direction === CONTROLLER_ENUM.LEFT) {
			this.isMoving = true;
			this.targetX -= 1;
		}
		if (direction === CONTROLLER_ENUM.RIGHT) {
			this.isMoving = true;
			this.targetX += 1;
		}
		if (direction === CONTROLLER_ENUM.TURNLEFT) {
			if (this.direction === DIRECTION_ENUM.TOP) {
				this.direction = DIRECTION_ENUM.LEFT;
			} else if (this.direction === DIRECTION_ENUM.LEFT) {
				this.direction = DIRECTION_ENUM.BOTTOM;
			} else if (this.direction === DIRECTION_ENUM.BOTTOM) {
				this.direction = DIRECTION_ENUM.RIGHT;
			} else if (this.direction === DIRECTION_ENUM.RIGHT) {
				this.direction = DIRECTION_ENUM.TOP;
			}
			this.state = ENTITY_STATE_ENUM.TURNLEFT;
			EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
		}
		if (direction === CONTROLLER_ENUM.TURNRIGHT) {
			if (this.direction === DIRECTION_ENUM.TOP) {
				this.direction = DIRECTION_ENUM.RIGHT;
			} else if (this.direction === DIRECTION_ENUM.BOTTOM) {
				this.direction = DIRECTION_ENUM.LEFT;
			} else if (this.direction === DIRECTION_ENUM.LEFT) {
				this.direction = DIRECTION_ENUM.TOP;
			} else if (this.direction === DIRECTION_ENUM.RIGHT) {
				this.direction = DIRECTION_ENUM.BOTTOM;
			}
			this.state = ENTITY_STATE_ENUM.TURNRIGHT;
			EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END);
		}
	}

	willBlock(type: CONTROLLER_ENUM) {
		const { targetX: x, targetY: y, direction } = this;
		const { tileInfo: tileInfo } = DataManager.Instance;
		const enemies = DataManager.Instance.enemies.filter(
			enemy => enemy.state !== ENTITY_STATE_ENUM.DEATH
		);
		const {
			x: doorX,
			y: doorY,
			state: doorState,
		} = DataManager.Instance.door || {};
		const bursts = DataManager.Instance.bursts.filter(
			burst => burst.state !== ENTITY_STATE_ENUM.DEATH
		);

		const { mapRowCount: row, mapColumnCount: column } = DataManager.Instance;

		//按钮方向——向上
		if (type === CONTROLLER_ENUM.TOP) {
			const playerNextY = y - 1;

			//玩家方向——向上
			if (direction === DIRECTION_ENUM.TOP) {
				//判断是否超出地图
				if (playerNextY < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				const weaponNextY = y - 2;
				const nextPlayerTile = tileInfo[x]?.[playerNextY];
				const nextWeaponTile = tileInfo[x]?.[weaponNextY];

				//判断门
				if (
					((doorX === x && doorY === playerNextY) ||
						(doorX === x && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				// 判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === x && enemyY === weaponNextY) ||
						(enemyX === x && enemyY === playerNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === x && burst.y === playerNextY) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				//玩家方向——向下
			} else if (direction === DIRECTION_ENUM.BOTTOM) {
				//判断是否超出地图
				if (playerNextY < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				const weaponNextY = y;
				const nextPlayerTile = tileInfo[x]?.[playerNextY];
				const nextWeaponTile = tileInfo[x]?.[weaponNextY];

				//判断门
				if (
					((doorX === x && doorY === playerNextY) ||
						(doorX === x && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (enemyX === x && enemyY === playerNextY) {
						this.state = ENTITY_STATE_ENUM.BLOCKBACK;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === x && burst.y === playerNextY) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				//玩家方向——向左
			} else if (direction === DIRECTION_ENUM.LEFT) {
				//判断是否超出地图
				if (playerNextY < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				const weaponNextX = x - 1;
				const weaponNextY = y - 1;
				const nextPlayerTile = tileInfo[x]?.[playerNextY];
				const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

				//判断门
				if (
					((doorX === x && doorY === playerNextY) ||
						(doorX === weaponNextX && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === x && enemyY === playerNextY) ||
						(enemyX === weaponNextX && enemyY === weaponNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === x && burst.y === playerNextY) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				//玩家方向——向右
			} else if (direction === DIRECTION_ENUM.RIGHT) {
				//判断是否超出地图
				if (playerNextY < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				const weaponNextX = x + 1;
				const weaponNextY = y - 1;
				const nextPlayerTile = tileInfo[x]?.[playerNextY];
				const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

				//判断门
				if (
					((doorX === x && doorY === playerNextY) ||
						(doorX === weaponNextX && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === x && enemyY === playerNextY) ||
						(enemyX === weaponNextX && enemyY === weaponNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
						return true;
					}
				}

				// 判断地裂陷阱
				if (
					bursts.some(burst => burst.x === x && burst.y === playerNextY) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}
			}

			//按钮方向——向下
		} else if (type === CONTROLLER_ENUM.BOTTOM) {
			const playerNextY = y + 1;

			//玩家方向——向上
			if (direction === DIRECTION_ENUM.TOP) {
				if (playerNextY > column - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;

					return true;
				}

				const weaponNextY = y;
				const nextPlayerTile = tileInfo[x]?.[playerNextY];
				const nextWeaponTile = tileInfo[x]?.[weaponNextY];

				//判断门
				if (
					((doorX === x && doorY === playerNextY) ||
						(doorX === x && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (enemyX === x && enemyY === playerNextY) {
						this.state = ENTITY_STATE_ENUM.BLOCKBACK;
						return true;
					}
				}

				// 判断地裂陷阱
				if (
					bursts.some(burst => burst.x === x && burst.y === playerNextY) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				//玩家方向——向下
			} else if (direction === DIRECTION_ENUM.BOTTOM) {
				if (playerNextY > column - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;

					return true;
				}

				const weaponNextY = y + 2;
				const nextPlayerTile = tileInfo[x]?.[playerNextY];
				const nextWeaponTile = tileInfo[x]?.[weaponNextY];

				//判断门
				if (
					((doorX === x && doorY === playerNextY) ||
						(doorX === x && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				// 判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === x && enemyY === weaponNextY) ||
						(enemyX === x && enemyY === playerNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === x && burst.y === playerNextY) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				//玩家方向——向左
			} else if (direction === DIRECTION_ENUM.LEFT) {
				if (playerNextY > column - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;

					return true;
				}

				const weaponNextX = x - 1;
				const weaponNextY = y + 1;
				const nextPlayerTile = tileInfo[x]?.[playerNextY];
				const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

				//判断门
				if (
					((doorX === x && doorY === playerNextY) ||
						(doorX === weaponNextX && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === x && enemyY === playerNextY) ||
						(enemyX === weaponNextX && enemyY === weaponNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === x && burst.y === playerNextY) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				//玩家方向——向右
			} else if (direction === DIRECTION_ENUM.RIGHT) {
				if (playerNextY > column - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;

					return true;
				}

				const weaponNextX = x + 1;
				const weaponNextY = y + 1;
				const nextPlayerTile = tileInfo[x]?.[playerNextY];
				const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

				//判断门
				if (
					((doorX === x && doorY === playerNextY) ||
						(doorX === weaponNextX && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === x && enemyY === playerNextY) ||
						(enemyX === weaponNextX && enemyY === weaponNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === x && burst.y === playerNextY) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}
			}

			//按钮方向——向左
		} else if (type === CONTROLLER_ENUM.LEFT) {
			const playerNextX = x - 1;

			//玩家方向——向上
			if (direction === DIRECTION_ENUM.TOP) {
				//判断是否超出地图
				if (playerNextX < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;

					return true;
				}

				const weaponNextX = x - 1;
				const weaponNextY = y - 1;
				const nextPlayerTile = tileInfo[playerNextX]?.[y];
				const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

				//判断门
				if (
					((doorX === playerNextX && doorY === y) ||
						(doorX === weaponNextX && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === playerNextX && enemyY === y) ||
						(enemyX === weaponNextX && enemyY === weaponNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === playerNextX && burst.y === y) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				//玩家方向——向下
			} else if (direction === DIRECTION_ENUM.BOTTOM) {
				//判断是否超出地图
				if (playerNextX < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;

					return true;
				}

				const weaponNextX = x - 1;
				const weaponNextY = y + 1;
				const nextPlayerTile = tileInfo[playerNextX]?.[y];
				const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

				//判断门
				if (
					((doorX === playerNextX && doorY === y) ||
						(doorX === weaponNextX && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === playerNextX && enemyY === y) ||
						(enemyX === weaponNextX && enemyY === weaponNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === playerNextX && burst.y === y) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				//玩家方向——向左
			} else if (direction === DIRECTION_ENUM.LEFT) {
				//判断是否超出地图
				if (playerNextX < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;

					return true;
				}

				const weaponNextX = x - 2;
				const nextPlayerTile = tileInfo[playerNextX]?.[y];
				const nextWeaponTile = tileInfo[weaponNextX]?.[y];

				//判断门
				if (
					((doorX === playerNextX && doorY === y) ||
						(doorX === weaponNextX && doorY === y)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === playerNextX && enemyY === y) ||
						(enemyX === weaponNextX && enemyY === y)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === playerNextX && burst.y === y) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				//玩家方向——向右
			} else if (direction === DIRECTION_ENUM.RIGHT) {
				//判断是否超出地图
				if (playerNextX < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;

					return true;
				}

				const weaponNextX = x;
				const nextPlayerTile = tileInfo[playerNextX]?.[y];
				const nextWeaponTile = tileInfo[weaponNextX]?.[y];

				//判断门
				if (
					((doorX === playerNextX && doorY === y) ||
						(doorX === weaponNextX && doorY === y)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (enemyX === playerNextX && enemyY === y) {
						this.state = ENTITY_STATE_ENUM.BLOCKBACK;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === playerNextX && burst.y === y) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}
			}

			//按钮方向——向右
		} else if (type === CONTROLLER_ENUM.RIGHT) {
			const playerNextX = x + 1;

			//玩家方向——向上
			if (direction === DIRECTION_ENUM.TOP) {
				if (playerNextX > row - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;

					return true;
				}

				const weaponNextX = x + 1;
				const weaponNextY = y - 1;
				const nextPlayerTile = tileInfo[playerNextX]?.[y];
				const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

				//判断门
				if (
					((doorX === playerNextX && doorY === y) ||
						(doorX === weaponNextX && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === playerNextX && enemyY === y) ||
						(enemyX === weaponNextX && enemyY === weaponNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === playerNextX && burst.y === y) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				//玩家方向——向下
			} else if (direction === DIRECTION_ENUM.BOTTOM) {
				if (playerNextX > row - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;

					return true;
				}

				const weaponNextX = x + 1;
				const weaponNextY = y + 1;
				const nextPlayerTile = tileInfo[playerNextX]?.[y];
				const nextWeaponTile = tileInfo[weaponNextX]?.[weaponNextY];

				//判断门
				if (
					((doorX === playerNextX && doorY === y) ||
						(doorX === weaponNextX && doorY === weaponNextY)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === playerNextX && enemyY === y) ||
						(enemyX === weaponNextX && enemyY === weaponNextY)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === playerNextX && burst.y === y) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				//玩家方向——向左
			} else if (direction === DIRECTION_ENUM.LEFT) {
				if (playerNextX > row - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;

					return true;
				}

				const weaponNextX = x;
				const nextPlayerTile = tileInfo[playerNextX]?.[y];
				const nextWeaponTile = tileInfo[weaponNextX]?.[y];

				//判断门
				if (
					((doorX === playerNextX && doorY === y) ||
						(doorX === weaponNextX && doorY === y)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (enemyX === playerNextX && enemyY === y) {
						this.state = ENTITY_STATE_ENUM.BLOCKBACK;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === playerNextX && burst.y === y) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				//玩家方向——向右
			} else if (direction === DIRECTION_ENUM.RIGHT) {
				if (playerNextX > row - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;

					return true;
				}

				const weaponNextX = x + 2;
				const nextPlayerTile = tileInfo[playerNextX]?.[y];
				const nextWeaponTile = tileInfo[weaponNextX]?.[y];

				//判断门
				if (
					((doorX === playerNextX && doorY === y) ||
						(doorX === weaponNextX && doorY === y)) &&
					doorState !== ENTITY_STATE_ENUM.DEATH
				) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				//判断敌人
				for (let i = 0; i < enemies.length; i++) {
					const enemy = enemies[i];
					const { x: enemyX, y: enemyY } = enemy;

					if (
						(enemyX === playerNextX && enemyY === y) ||
						(enemyX === weaponNextX && enemyY === y)
					) {
						this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
						return true;
					}
				}

				//判断地裂陷阱
				if (
					bursts.some(burst => burst.x === playerNextX && burst.y === y) &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					return false;
				}

				//最后判断地图元素
				if (
					nextPlayerTile &&
					nextPlayerTile.moveable &&
					(!nextWeaponTile || nextWeaponTile.turnable)
				) {
					// empty
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}
			}

			//按钮方向——左转
		} else if (type === CONTROLLER_ENUM.TURNLEFT) {
			let nextY, nextX;
			if (direction === DIRECTION_ENUM.TOP) {
				//朝上左转的话，左上角三个tile都必须turnable为true，并且没有敌人
				nextY = y - 1;
				nextX = x - 1;
			} else if (direction === DIRECTION_ENUM.BOTTOM) {
				nextY = y + 1;
				nextX = x + 1;
			} else if (direction === DIRECTION_ENUM.LEFT) {
				nextY = y + 1;
				nextX = x - 1;
			} else if (direction === DIRECTION_ENUM.RIGHT) {
				nextY = y - 1;
				nextX = x + 1;
			}

			//判断门
			if (
				((doorX === x && doorY === nextY) ||
					(doorX === nextX && doorY === y) ||
					(doorX === nextX && doorY === nextY)) &&
				doorState !== ENTITY_STATE_ENUM.DEATH
			) {
				this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;
				return true;
			}

			//判断敌人
			for (let i = 0; i < enemies.length; i++) {
				const enemy = enemies[i];
				const { x: enemyX, y: enemyY } = enemy;

				if (enemyX === nextX && enemyY === y) {
					this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;

					return true;
				} else if (enemyX === nextX && enemyY === nextY) {
					this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;

					return true;
				} else if (enemyX === x && enemyY === nextY) {
					this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;

					return true;
				}
			}

			//最后判断地图元素
			if (
				(!tileInfo[x]?.[nextY] || tileInfo[x]?.[nextY].turnable) &&
				(!tileInfo[nextX]?.[y] || tileInfo[nextX]?.[y].turnable) &&
				(!tileInfo[nextX]?.[nextY] || tileInfo[nextX]?.[nextY].turnable)
			) {
				// empty
			} else {
				this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;
				return true;
			}

			//按钮方向——右转
		} else if (type === CONTROLLER_ENUM.TURNRIGHT) {
			let nextX, nextY;
			if (direction === DIRECTION_ENUM.TOP) {
				//朝上右转的话，右上角三个tile都必须turnable为true
				nextY = y - 1;
				nextX = x + 1;
			} else if (direction === DIRECTION_ENUM.BOTTOM) {
				nextY = y + 1;
				nextX = x - 1;
			} else if (direction === DIRECTION_ENUM.LEFT) {
				nextY = y - 1;
				nextX = x - 1;
			} else if (direction === DIRECTION_ENUM.RIGHT) {
				nextY = y + 1;
				nextX = x + 1;
			}

			//判断门
			if (
				((doorX === x && doorY === nextY) ||
					(doorX === nextX && doorY === y) ||
					(doorX === nextX && doorY === nextY)) &&
				doorState !== ENTITY_STATE_ENUM.DEATH
			) {
				this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;
				return true;
			}

			//判断敌人
			for (let i = 0; i < enemies.length; i++) {
				const enemy = enemies[i];
				const { x: enemyX, y: enemyY } = enemy;

				if (enemyX === nextX && enemyY === y) {
					this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;

					return true;
				} else if (enemyX === nextX && enemyY === nextY) {
					this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;

					return true;
				} else if (enemyX === x && enemyY === nextY) {
					this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;

					return true;
				}
			}

			//最后判断地图元素
			if (
				(!tileInfo[x]?.[nextY] || tileInfo[x]?.[nextY].turnable) &&
				(!tileInfo[nextX]?.[y] || tileInfo[nextX]?.[y].turnable) &&
				(!tileInfo[nextX]?.[nextY] || tileInfo[nextX]?.[nextY].turnable)
			) {
				// empty
			} else {
				this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;
				return true;
			}
		}

		return false;
	}

	willAttack(direction: CONTROLLER_ENUM) {
		const enemies = DataManager.Instance.enemies.filter(
			({ state }) => state !== ENTITY_STATE_ENUM.DEATH
		);

		for (let i = 0, len = enemies.length; i < len; i++) {
			const { x: enemyX, y: enemyY, id: enemyId } = enemies[i];
			if (
				direction === CONTROLLER_ENUM.TOP &&
				this.direction === DIRECTION_ENUM.TOP &&
				this.x === enemyX &&
				this.targetY - 2 === enemyY
			) {
				this.state = ENTITY_STATE_ENUM.ATTACK;
				return enemyId;
			}

			if (
				direction === CONTROLLER_ENUM.BOTTOM &&
				this.direction === DIRECTION_ENUM.BOTTOM &&
				enemyY === this.targetY + 2 &&
				enemyX === this.x
			) {
				this.state = ENTITY_STATE_ENUM.ATTACK;
				return enemyId;
			}

			if (
				direction === CONTROLLER_ENUM.LEFT &&
				this.direction === DIRECTION_ENUM.LEFT &&
				enemyY === this.y &&
				enemyX === this.targetX - 2
			) {
				this.state = ENTITY_STATE_ENUM.ATTACK;
				return enemyId;
			}

			if (
				direction === CONTROLLER_ENUM.RIGHT &&
				this.direction === DIRECTION_ENUM.RIGHT &&
				enemyY === this.y &&
				enemyX === this.targetX + 2
			) {
				this.state = ENTITY_STATE_ENUM.ATTACK;
				return enemyId;
			}
		}
		return "";
	}
}
