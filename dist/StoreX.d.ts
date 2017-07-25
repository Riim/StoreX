import { EventEmitter } from 'cellx';
export interface IStoreXType extends EventEmitter {
    [name: string]: any;
}
export declare class StoreX extends EventEmitter {
    _typeConstructors: Map<string, typeof EventEmitter>;
    _types: Map<string, Map<any, IStoreXType>>;
    initialize: () => void;
    constructor(types: {
        [typeName: string]: Function;
    }, initialize?: () => void);
    get<T extends EventEmitter = EventEmitter>(typeName: string, id?: any): T | null;
    get<T extends EventEmitter = EventEmitter>(typeName: string, id?: Array<any>): Array<T | null>;
    set(typeName: string, type: IStoreXType): this;
    push<T = any>(data: any): T;
    delete(typeName: string, id?: any): boolean;
    clear(): this;
}
