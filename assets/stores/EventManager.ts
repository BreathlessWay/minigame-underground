import Singleton from "db://assets/utils/Singleton";

export interface IEventItem {
	func: (...args: unknown[]) => void;
	ctx: unknown;
}

export default class EventManager extends Singleton {
	static get Instance() {
		return super.GetInstance<EventManager>();
	}

	private eventMap: Map<string, Array<IEventItem>> = new Map();

	on(event: string, func: (...args: unknown[]) => void, ctx?: unknown) {
		if (this.eventMap.has(event)) {
			this.eventMap.get(event).push({ func, ctx });
		} else {
			this.eventMap.set(event, [{ func, ctx }]);
		}
	}
	off(event: string, func: (...args: unknown[]) => void) {
		if (this.eventMap.has(event)) {
			const index = this.eventMap.get(event).findIndex(i => func === i.func);
			index > -1 && this.eventMap.get(event).splice(index, 1);
		}
	}

	emit(name: string, ...params: unknown[]) {
		if (this.eventMap.has(name)) {
			const functionList = this.eventMap.get(name);
			functionList.forEach(({ func, ctx }) => {
				if (ctx) {
					func.apply(ctx, params);
				} else {
					func(...params);
				}
			});
		}
	}

	clear() {
		this.eventMap.clear();
	}
}
