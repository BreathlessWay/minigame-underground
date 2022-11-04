import { _decorator } from "cc";

import EventManager from "db://assets/stores/EventManager";
import { EntityManager } from "db://assets/utils/EntityManager";

import { PlayerStateMachine } from "db://assets/scripts/player/PlayerStateMachine";
import {
	CONTROLLER_ENUM,
	DIRECTION_ENUM,
	ENTITY_STATE_ENUM,
	ENTITY_TYPE_ENUM,
	EVENT_ENUM,
} from "db://assets/enums";
import DataManager from "db://assets/stores/DataManager";

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

	async init() {
		this.fsm = this.addComponent(PlayerStateMachine);
		await this.fsm.init();
		super.init({
			x: 2,
			y: 8,
			type: ENTITY_TYPE_ENUM.PLAYER,
			direction: DIRECTION_ENUM.TOP,
			state: ENTITY_STATE_ENUM.IDLE,
		});
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
			this.state === ENTITY_STATE_ENUM.AIRDEATH
		)
			return;

		if (this.willAttack(direction)) return;
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

	willBlock(direction: CONTROLLER_ENUM) {
		const { targetX, targetY, direction: _dir } = this,
			{ tileInfo, mapColumnCount, mapRowCount } = DataManager.Instance;

		if (direction === CONTROLLER_ENUM.TOP) {
			const playerNextY = targetY - 1;

			if (_dir === DIRECTION_ENUM.TOP) {
				const weaponNextY = targetY - 2;

				if (playerNextY < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				const playerTile = tileInfo[targetX][playerNextY],
					weaponTile = tileInfo[targetX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				const weaponNextY = targetY;

				if (playerNextY < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				const playerTile = tileInfo[targetX][playerNextY],
					weaponTile = tileInfo[targetX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				const weaponNextY = targetY - 1,
					weaponNextX = targetX - 1;

				if (playerNextY < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				const playerTile = tileInfo[targetX][playerNextY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				const weaponNextY = targetY - 1,
					weaponNextX = targetX + 1;

				if (playerNextY < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}

				const playerTile = tileInfo[targetX][playerNextY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKFRONT;
					return true;
				}
			}
		}
		if (direction === CONTROLLER_ENUM.BOTTOM) {
			const playerNextY = targetY + 1;

			if (_dir === DIRECTION_ENUM.TOP) {
				const weaponNextY = targetY;

				if (playerNextY > mapColumnCount - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				const playerTile = tileInfo[targetX][playerNextY],
					weaponTile = tileInfo[targetX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				const weaponNextY = targetY + 2;

				if (playerNextY > mapColumnCount - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				const playerTile = tileInfo[targetX][playerNextY],
					weaponTile = tileInfo[targetX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				const weaponNextY = targetY + 1,
					weaponNextX = targetX - 1;

				if (playerNextY > mapColumnCount - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				const playerTile = tileInfo[targetX][playerNextY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				const weaponNextY = targetY + 1,
					weaponNextX = targetX + 1;

				if (playerNextY > mapColumnCount - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}

				const playerTile = tileInfo[targetX][playerNextY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKBACK;
					return true;
				}
			}
		}
		if (direction === CONTROLLER_ENUM.LEFT) {
			const playerNextX = targetX - 1;

			if (_dir === DIRECTION_ENUM.TOP) {
				const weaponNextX = targetX - 1,
					weaponNextY = targetY - 1;

				if (playerNextX < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				const playerTile = tileInfo[playerNextX][targetY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				const weaponNextX = targetX - 1,
					weaponNextY = targetY + 1;

				if (playerNextX < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				const playerTile = tileInfo[playerNextX][targetY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				const weaponNextY = targetY,
					weaponNextX = targetX - 2;

				if (playerNextX < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				const playerTile = tileInfo[playerNextX][targetY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				const weaponNextY = targetY,
					weaponNextX = targetX;

				if (playerNextX < 0) {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}

				const playerTile = tileInfo[playerNextX][targetY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKLEFT;
					return true;
				}
			}
		}
		if (direction === CONTROLLER_ENUM.RIGHT) {
			const playerNextX = targetX + 1;

			if (_dir === DIRECTION_ENUM.TOP) {
				const weaponNextX = targetX + 1,
					weaponNextY = targetY - 1;

				if (playerNextX > mapRowCount - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				const playerTile = tileInfo[playerNextX][targetY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				const weaponNextX = targetX + 1,
					weaponNextY = targetY;

				if (playerNextX > mapRowCount - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				const playerTile = tileInfo[playerNextX][targetY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				const weaponNextY = targetY,
					weaponNextX = targetX;

				if (playerNextX > mapRowCount - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				const playerTile = tileInfo[playerNextX][targetY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				const weaponNextY = targetY,
					weaponNextX = targetX + 2;

				if (playerNextX > mapRowCount - 1) {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}

				const playerTile = tileInfo[playerNextX][targetY],
					weaponTile = tileInfo[weaponNextX][weaponNextY];

				if (
					playerTile &&
					playerTile.moveable &&
					(!weaponTile || weaponTile.turnable)
				) {
					//
				} else {
					this.state = ENTITY_STATE_ENUM.BLOCKRIGHT;
					return true;
				}
			}
		}
		if (direction === CONTROLLER_ENUM.TURNLEFT) {
			let nextX, nextY;
			if (_dir === DIRECTION_ENUM.TOP) {
				nextX = targetX - 1;
				nextY = targetY - 1;
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				nextX = targetX + 1;
				nextY = targetY + 1;
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				nextX = targetX - 1;
				nextY = targetY + 1;
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				nextX = targetX + 1;
				nextY = targetY - 1;
			}

			const nextTile1 = tileInfo[targetX][nextY],
				nextTile2 = tileInfo[nextX][targetY],
				nextTile3 = tileInfo[nextX][nextY];

			if (
				(!nextTile1 || nextTile1.turnable) &&
				(!nextTile2 || nextTile2.turnable) &&
				(!nextTile3 || nextTile3.turnable)
			) {
				//
			} else {
				this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT;
				return true;
			}
		}
		if (direction === CONTROLLER_ENUM.TURNRIGHT) {
			let nextX, nextY;
			if (_dir === DIRECTION_ENUM.TOP) {
				//朝上右转的话，右上角三个tile都必须turnable为true
				nextY = targetY - 1;
				nextX = targetX + 1;
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				nextY = targetY + 1;
				nextX = targetX - 1;
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				nextY = targetY - 1;
				nextX = targetX - 1;
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				nextY = targetY + 1;
				nextX = targetX + 1;
			}

			const nextTile1 = tileInfo[targetX][nextY],
				nextTile2 = tileInfo[nextX][targetY],
				nextTile3 = tileInfo[nextX][nextY];

			if (
				(!nextTile1 || nextTile1.turnable) &&
				(!nextTile2 || nextTile2.turnable) &&
				(!nextTile3 || nextTile3.turnable)
			) {
				//
			} else {
				this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT;
				return true;
			}
		}
		return false;
	}

	willAttack(direction: CONTROLLER_ENUM) {
		const enemies = DataManager.Instance.enemies;

		for (let i = 0, len = enemies.length; i < len; i++) {
			const { x: enemyX, y: enemyY } = enemies[i];
			if (
				direction === CONTROLLER_ENUM.TOP &&
				this.direction === DIRECTION_ENUM.TOP &&
				this.x === enemyX &&
				this.targetY - 2 === enemyY
			) {
				this.state = ENTITY_STATE_ENUM.ATTACK;
				return true;
			}

			if (
				direction === CONTROLLER_ENUM.BOTTOM &&
				this.direction === DIRECTION_ENUM.BOTTOM &&
				enemyY === this.targetY + 2 &&
				enemyX === this.x
			) {
				this.state = ENTITY_STATE_ENUM.ATTACK;
				return true;
			}

			if (
				direction === CONTROLLER_ENUM.LEFT &&
				this.direction === DIRECTION_ENUM.LEFT &&
				enemyY === this.y &&
				enemyX === this.targetX - 2
			) {
				this.state = ENTITY_STATE_ENUM.ATTACK;
				return true;
			}

			if (
				direction === CONTROLLER_ENUM.RIGHT &&
				this.direction === DIRECTION_ENUM.RIGHT &&
				enemyY === this.y &&
				enemyX === this.targetX + 2
			) {
				this.state = ENTITY_STATE_ENUM.ATTACK;
				return true;
			}
		}
		return false;
	}
}
