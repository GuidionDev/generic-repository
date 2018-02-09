import { SomeObject } from './some_object.fixtures';
export class AnotherObject extends SomeObject {
  private _order: number;
  constructor(params) {
    super(params);
    this._order = params._order;
  }
  get order() { return this._order; }
}

export const anotherObjectWithoutIdFixture = new AnotherObject({});