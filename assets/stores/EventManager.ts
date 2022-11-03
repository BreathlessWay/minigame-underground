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

	on(name: string, func: (...args: unknown[]) => void, ctx?: unknown) {
		if (this.eventMap.has(name)) {
			this.eventMap.get(name).push({ func, ctx });
		} else {
			this.eventMap.set(name, [{ func, ctx }]);
		}
	}

	off(name: string, func: (...args: unknown[]) => void) {
		if (this.eventMap.has(name)) {
			const functionList = this.eventMap.get(name);
			const filterList = functionList.filter(_ => _.func !== func);
			if (Array.isArray(filterList) && !filterList.length) {
				this.eventMap.delete(name);
			}
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
