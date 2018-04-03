import { EventEmitter } from 'cellx';
export declare class StoreX extends EventEmitter {
    _typeConstructors: Map<string, typeof EventEmitter>;
    _types: Map<string, Map<any, EventEmitter>>;
    initialize: () => void;
    constructor(types: {
        [typeName: string]: Function;
    }, initialize?: () => void);
    get<T extends EventEmitter = EventEmitter>(typeName: string, id?: any): T | null;
    get<T extends EventEmitter = EventEmitter>(typeName: string, id?: Array<any>): Array<T | null>;
    getAll<T extends EventEmitter = EventEmitter>(typeName: string): Array<T>;
    set(typeName: string, type: EventEmitter): this;
    push<T = any>(data: any): T;
    discard(typeName: string, id?: any): boolean;
    clear(): this;
}
