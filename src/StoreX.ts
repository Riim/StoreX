import {
	EventEmitter,
	JS,
	ObservableList,
	ObservableMap
	} from 'cellx';

let Map = JS.Map;

let ObjectProto = Object.prototype;

function isObjectOrArray(value: any): boolean {
	return value && typeof value == 'object' && (Object.getPrototypeOf(value) === ObjectProto || Array.isArray(value));
}

export interface IStoreXType extends EventEmitter {
	[name: string]: any;
}

export class StoreX extends EventEmitter {
	_typeConstructors: Map<string, typeof EventEmitter>;
	_types: Map<string, Map<any, IStoreXType>>;

	initialize: () => void | null;

	// tslint:disable-next-line
	constructor(types: { [typeName: string]: Function }, initialize?: () => void) {
		super();

		this._typeConstructors = new Map<string, typeof EventEmitter>(
			Object.keys(types).map((name) => [name, types[name]]) as any
		);
		this._types = new Map<string, Map<any, IStoreXType>>();

		if (initialize) {
			this.initialize = initialize;
			this.initialize();
		}
	}

	get(typeName: string, id?: any): EventEmitter | null;
	get(typeName: string, id?: Array<any>): Array<EventEmitter | null>;
	get(typeName: string, id?: any | Array<any>): EventEmitter | Array<EventEmitter | null> | null {
		let types = this._types.get(typeName);
		return Array.isArray(id) ? id.map((id) => types && types.get(id) || null) : types && types.get(id) || null;
	}

	set(typeName: string, type: IStoreXType): StoreX {
		let types = this._types.get(typeName);

		if (!types) {
			types = new Map<any, IStoreXType>();
			this._types.set(typeName, types);
		}

		types.set(type.id, type);

		return this;
	}

	push(data: any): any {
		if (Array.isArray(data)) {
			let list = [] as Array<any>;

			for (let i = 0, l = data.length; i < l; i++) {
				let value = data[i];
				list[i] = isObjectOrArray(value) ? this.push(value) : value;
			}

			return list;
		}

		let typeName = data.__type;

		if (typeName) {
			let typeConstructor = this._typeConstructors.get(typeName);

			if (!typeConstructor) {
				throw new TypeError(`Type "${ typeName }" is not defined`);
			}

			let types = this._types.get(typeName);

			if (!types) {
				types = new Map<any, IStoreXType>();
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

					type[name] = value;
				}
			}

			return type;
		}

		let dataCopy = {} as { [name: string]: any };

		for (let name in data) {
			let value = data[name];
			dataCopy[name] = isObjectOrArray(value) ? this.push(value) : value;
		}

		return dataCopy;
	}

	delete(typeName: string, id?: any): boolean {
		let types = this._types.get(typeName);

		if (types && types.has(id)) {
			types.delete(id);
			return true;
		}

		return false;
	}

	clear(): StoreX {
		this._types = new Map<string, Map<any, IStoreXType>>();

		if (this.initialize) {
			this.initialize();
		}

		return this;
	}
}
