"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var map_set_polyfill_1 = require("@riim/map-set-polyfill");
var cellx_1 = require("cellx");
var ObjectProto = Object.prototype;
function isObjectOrArray(value) {
    return value && typeof value == 'object' && (Object.getPrototypeOf(value) === ObjectProto || Array.isArray(value));
}
var StoreX = (function (_super) {
    __extends(StoreX, _super);
    // tslint:disable-next-line
    function StoreX(types, initialize) {
        var _this = _super.call(this) || this;
        _this._typeConstructors = new map_set_polyfill_1.Map(Object.keys(types).map(function (name) { return [name, types[name]]; }));
        _this._types = new map_set_polyfill_1.Map();
        if (initialize) {
            _this.initialize = initialize;
            _this.initialize();
        }
        return _this;
    }
    StoreX.prototype.get = function (typeName, id) {
        var types = this._types.get(typeName);
        return Array.isArray(id) ? id.map(function (id) { return types && types.get(id) || null; }) : types && types.get(id) || null;
    };
    StoreX.prototype.getAll = function (typeName) {
        var types = [];
        (this._types.get(typeName) || []).forEach(function (type) {
            types.push(type);
        });
        return types;
    };
    StoreX.prototype.set = function (typeName, type) {
        var types = this._types.get(typeName);
        if (!types) {
            types = new map_set_polyfill_1.Map();
            this._types.set(typeName, types);
        }
        types.set(type.id, type);
        return this;
    };
    StoreX.prototype.push = function (data) {
        if (Array.isArray(data)) {
            var list = [];
            for (var i = 0, l = data.length; i < l; i++) {
                var value = data[i];
                list[i] = isObjectOrArray(value) ? this.push(value) : value;
            }
            return list;
        }
        var typeName = data.__type;
        if (typeName) {
            var typeConstructor = this._typeConstructors.get(typeName);
            if (!typeConstructor) {
                throw new TypeError("Type \"" + typeName + "\" is not defined");
            }
            var types = this._types.get(typeName);
            if (!types) {
                types = new map_set_polyfill_1.Map();
                this._types.set(typeName, types);
            }
            var id = data.id;
            var type = types.get(id);
            if (!type) {
                type = new typeConstructor();
                types.set(id, type);
            }
            for (var name in data) {
                if (name != '__type') {
                    var value = data[name];
                    if (value && typeof value == 'object') {
                        if (Object.getPrototypeOf(value) === ObjectProto) {
                            value = this.push(value);
                            if (Object.getPrototypeOf(value) === ObjectProto) {
                                value = new cellx_1.ObservableMap(value);
                            }
                        }
                        else if (Array.isArray(value)) {
                            value = new cellx_1.ObservableList(this.push(value));
                        }
                    }
                    type[name] = value;
                }
            }
            return type;
        }
        var dataCopy = {};
        for (var name in data) {
            var value = data[name];
            dataCopy[name] = isObjectOrArray(value) ? this.push(value) : value;
        }
        return dataCopy;
    };
    StoreX.prototype.delete = function (typeName, id) {
        var types = this._types.get(typeName);
        if (types && types.has(id)) {
            types.delete(id);
            return true;
        }
        return false;
    };
    StoreX.prototype.clear = function () {
        this._types = new map_set_polyfill_1.Map();
        if (this.initialize) {
            this.initialize();
        }
        return this;
    };
    return StoreX;
}(cellx_1.EventEmitter));
exports.StoreX = StoreX;
