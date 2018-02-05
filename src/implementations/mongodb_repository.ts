import Repository from '../repository';
import { Db, Collection, CommonOptions } from 'mongodb';

export default class MongoDBRepository<T> implements Repository<T> {
  public Type: { new(...args: any[]): T; };
  private Model: Collection<T>;

  constructor(type: { new(...args: any[]): T; }, db: Db) {
    console.log(db);
    this.Type = type;
    this.Model = db.collection(this.Type.prototype.constructor.name);
    console.log(this.Model);
  }

  private mapItems = (listItem: any) => {
    return new this.Type(listItem);
  }

  private instantiateResultArray(listItems: any[]): Promise<T[]> {
    const instantiatedListItems = listItems.map((listItem: any) => {
      return new this.Type(listItem);
    });
    return Promise.resolve(instantiatedListItems);
  }

  private handleError(error: any) {
    return Promise.reject(error);
  }

  public paginate(conditions: any, page, perPage): Promise<T[]> {
    return this.Model
      .find(conditions)
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .map(this.mapItems)
      .toArray()
      .catch(this.handleError);
  }

  public bulkInsert(list: T[]): Promise<T[]> {
    return this.Model.insertMany(list)
      .then(items => items.ops)
      .then(this.instantiateResultArray.bind(this))
      .catch(this.handleError);
  }

  public count(conditions: Object = {}): Promise<number> {
    return this.Model.count(conditions);
  }

  public find(conditions: any): Promise<T[]> {
    return this.Model
      .find(conditions)
      .map(this.mapItems)
      .toArray()
      .catch(this.handleError);
  }

  public findOne(conditions: Object): Promise<T> {
    return this.Model
      .find(conditions)
      .limit(1)
      .catch(this.handleError);
  }

  public findLast(sortField: string, limit: number): Promise<T[]> {
    return this.Model
      .find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .map(this.mapItems)
      .toArray()
      .catch(this.handleError);
  }

  public findById(id: string): Promise<T> {
    return this.Model
      .find({ _id: id })
      .limit(1)
      .then(item => { console.log(item); return item; })
      .catch(this.handleError);
  }

  public findLastByQuery(query: any,
    secondField: string, limit: number): Promise<T[]> {
    return this.Model.find(query)
      .sort({ [secondField]: -1 })
      .limit(limit)
      .map(this.mapItems)
      .toArray()
      .catch(this.handleError);
  }

  public insert(data: T): Promise<T> {
    return this.Model
      .insertOne(data)
      .then(item => item.ops)
      .catch(this.handleError);
  }

  public update(query: any, newData: any): Promise<T> {
    return this.Model
      .findOneAndUpdate(query, newData, { upsert: true, returnOriginal: false })
      .then(items => items.value)
      .catch(this.handleError);
  }

  public deleteOne(query: any): Promise<boolean> {
    return this.Model
      .deleteOne(query)
      .then(result => !!result.result.ok)
      .catch(this.handleError);
  }

  public deleteMany(query: any): Promise<boolean> {
    return this.Model
      .deleteMany(query)
      .then(result => !!result.result.ok)
      .catch(this.handleError);
  }
}