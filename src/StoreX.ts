import { Map } from '@riim/map-set-polyfill';
import { EventEmitter, ObservableList, ObservableMap } from 'cellx';

let ObjectProto = Object.prototype;

function isObjectOrArray(value: any): boolean {
	return value && typeof value == 'object' && (Object.getPrototypeOf(value) === ObjectProto || Array.isArray(value));
}

export class StoreX extends EventEmitter {
	_typeConstructors: Map<string, typeof EventEmitter>;
	_types: Map<string, Map<any, EventEmitter>>;

	initialize: () => void;

	// tslint:disable-next-line
	constructor(types: { [typeName: string]: Function }, initialize?: () => void) {
		super();

		this._typeConstructors = new Map<string, typeof EventEmitter>(
			Object.keys(types).map((name) => [name, types[name]]) as any
		);
		this._types = new Map<string, Map<any, EventEmitter>>();

		if (initialize) {
			this.initialize = initialize;
			this.initialize();
		}
	}

	get<T extends EventEmitter = EventEmitter>(typeName: string, id?: any): T | null;
	get<T extends EventEmitter = EventEmitter>(typeName: string, id?: Array<any>): Array<T | null>;
	get(typeName: string, id?: any | Array<any>): EventEmitter | Array<EventEmitter | null> | null {
		let types = this._types.get(typeName);
		return Array.isArray(id) ? id.map((id) => types && types.get(id) || null) : types && types.get(id) || null;
	}

	getAll<T extends EventEmitter = EventEmitter>(typeName: string): Array<T> {
		let types = [] as Array<T>;

		((this._types.get(typeName) || []) as Array<T>).forEach((type) => {
			types.push(type);
		});

		return types;
	}

	set(typeName: string, type: EventEmitter): this {
		let types = this._types.get(typeName);

		if (!types) {
			types = new Map<any, EventEmitter>();
			this._types.set(typeName, types);
		}

		types.set((type as any).id, type);

		return this;
	}

	push<T = any>(data: any): T {
		if (Array.isArray(data)) {
			let list = [] as Array<any>;

			for (let i = 0, l = data.length; i < l; i++) {
				let value = data[i];
				list[i] = isObjectOrArray(value) ? this.push(value) : value;
			}

			return list as any;
		}

		let typeName = data.__type;

		if (typeName) {
			let typeConstructor = this._typeConstructors.get(typeName);

			if (!typeConstructor) {
				throw new TypeError(`Type "${ typeName }" is not defined`);
			}

			let types = this._types.get(typeName);

			if (!types) {
				types = new Map<any, EventEmitter>();
				this._types.set(typeName, types);
			}

			let id = data.id;
			let type = types.get(id);

			if (!type) {
				type = new typeConstructor();
				types.set(id, type);
			}

			for (let name in data) {
				if (name != '__type') {
					let value = data[name];

					if (value && typeof value == 'object') {
						if (Object.getPrototypeOf(value) === ObjectProto) {
							value = this.push(value);

							if (Object.getPrototypeOf(value) === ObjectProto) {
								value = new ObservableMap(value);
							}
						} else if (Array.isArray(value)) {
							value = new ObservableList(this.push(value) as Array<any>);
						}
					}

					(type as any)[name] = value;
				}
			}

			return type as any;
		}

		let dataCopy = {} as { [name: string]: any };

		for (let name in data) {
			let value = data[name];
			dataCopy[name] = isObjectOrArray(value) ? this.push(value) : value;
		}

		return dataCopy as any;
	}

	delete(typeName: string, id?: any): boolean {
		let types = this._types.get(typeName);

		if (types && types.has(id)) {
			types.delete(id);
			return true;
		}

		return false;
	}

	clear(): this {
		this._types = new Map<string, Map<any, EventEmitter>>();

		if (this.initialize) {
			this.initialize();
		}

		return this;
	}
}
