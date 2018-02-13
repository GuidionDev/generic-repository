import { SomeObject } from './some_object.fixtures';
export class AnotherObject extends SomeObject {
  private _order: number;
  private _domain: string;
  constructor(params) {
    super(params);
    this._order = params._order;
    this._domain = params._domain;
  }
  get order() { return this._order; }
  get domain() { return this._domain; }
}

export const anotherObjectWithoutIdFixture = new AnotherObject({ _domain: 'test@guidion.net'});