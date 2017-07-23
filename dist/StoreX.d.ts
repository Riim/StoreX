import { EventEmitter } from 'cellx';
export interface IStoreXType extends EventEmitter {
    [name: string]: any;
}
export declare class StoreX extends EventEmitter {
    _typeConstructors: Map<string, typeof EventEmitter>;
    _types: Map<string, Map<any, IStoreXType>>;
    initialize: () => void | null;
    constructor(types: {
        [typeName: string]: Function;
    }, initialize?: () => void);
    get(typeName: string, id?: any): EventEmitter | null;
    get(typeName: string, id?: Array<any>): Array<EventEmitter | null>;
    set(typeName: string, type: IStoreXType): StoreX;
    push(data: any): any;
    delete(typeName: string, id?: any): boolean;
    clear(): StoreX;
}
