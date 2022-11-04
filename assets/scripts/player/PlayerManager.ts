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

	moveHandler(direction: CONTROLLER_ENUM) {
		if (this.willBlock(direction)) {
			return;
		}

		this.move(direction);
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				const weaponNextY = targetY;

				if (playerNextY < 0) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				const weaponNextY = targetY - 1,
					weaponNextX = targetX - 1;

				if (playerNextY < 0) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				const weaponNextY = targetY - 1,
					weaponNextX = targetX + 1;

				if (playerNextY < 0) {
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
					return true;
				}
			}
		}
		if (direction === CONTROLLER_ENUM.BOTTOM) {
			const playerNextY = targetY + 1;

			if (_dir === DIRECTION_ENUM.TOP) {
				const weaponNextY = targetY;

				if (playerNextY > mapColumnCount - 1) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				const weaponNextY = targetY + 2;

				if (playerNextY > mapColumnCount - 1) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				const weaponNextY = targetY + 1,
					weaponNextX = targetX - 1;

				if (playerNextY > mapColumnCount - 1) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				const weaponNextY = targetY + 1,
					weaponNextX = targetX + 1;

				if (playerNextY > mapColumnCount - 1) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				const weaponNextX = targetX - 1,
					weaponNextY = targetY + 1;

				if (playerNextX < 0) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				const weaponNextY = targetY,
					weaponNextX = targetX - 2;

				if (playerNextX < 0) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				const weaponNextY = targetY,
					weaponNextX = targetX;

				if (playerNextX < 0) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.BOTTOM) {
				const weaponNextX = targetX + 1,
					weaponNextY = targetY;

				if (playerNextX > mapRowCount - 1) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.LEFT) {
				const weaponNextY = targetY,
					weaponNextX = targetX;

				if (playerNextX > mapRowCount - 1) {
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
					return true;
				}
			}
			if (_dir === DIRECTION_ENUM.RIGHT) {
				const weaponNextY = targetY,
					weaponNextX = targetX + 2;

				if (playerNextX > mapRowCount - 1) {
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
				return true;
			}
		}
		return false;
	}
}
