export class SomeObject {
  private _id: string;
  private _name: string;
  private _submitDate: Date;
  constructor(params) {
    if (params._id) {
      this._id = params._id;
    }
    this._name = params._name;
    this._submitDate = params._submitDate;
  }
  get id() { return this._id; }
  get name() { return this._name; }
}

export const objectWithoutIdFixture = new SomeObject({});