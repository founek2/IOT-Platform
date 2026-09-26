import { EventEmitter } from 'events';
import * as types from '../types/index.js';
import { TypedEmitter } from "common/emitter/typedEmitter";

class MyClass extends TypedEmitter<types.EmitterEvents> { }

export type BackendEmitter = TypedEmitter<types.EmitterEvents>;
export default new MyClass()