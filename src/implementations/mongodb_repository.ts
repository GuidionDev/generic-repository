import Repository from '../repository';
import { Db, Collection, CommonOptions } from 'mongodb';

export default class MongoDBRepository<T> implements Repository<T> {
  public Type: { new(...args: any[]): T; };
  private Model: Collection<T>;

  constructor(type: { new(...args: any[]): T; }, db: Promise<Db>) {
    this.Type = type;
    db.then(ready => {
      this.Model = ready.collection(this.Type.prototype.constructor.name);
    }).catch(err => console.error('generic repository for:', this.Type.prototype.constructor.name, 'An error occured while making connection to the database.'));
  }

  public paginate(conditions: any, page, perPage): Promise<T[]> {
    return this.Model
      .find(conditions)
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .map(this.toInstance)
      .toArray()
      .catch(this.reject);
  }

  public insertMany(list: T[]): Promise<T[]> {
    return this.Model.insertMany(list)
      .then(items => items.ops)
      .then(this.toInstanceArray.bind(this))
      .catch(this.reject);
  }

  public count(conditions: Object = {}): Promise<number> {
    return this.Model.count(conditions);
  }

  public find(conditions: any): Promise<T[]> {
    return this.Model
      .find(conditions)
      .map(this.toInstance)
      .toArray()
      .catch(this.reject);
  }

  public findOne(conditions: Object): Promise<T> {
    return this.Model
      .findOne(conditions)
      .then(this.toInstance)
      .catch(this.reject);
  }

  public findById(id: string): Promise<T> {
    return this.findOne({ _id: id });
  }

  public findLast(sortField: string, limit: number): Promise<T[]> {
    return this.Model
      .find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .map(this.toInstance)
      .toArray()
      .catch(this.reject);
  }

  public findLastByQuery(query: any,
    secondField: string, limit: number): Promise<T[]> {
    return this.Model.find(query)
      .sort({ [secondField]: -1 })
      .limit(limit)
      .map(this.toInstance)
      .toArray()
      .catch(this.reject);
  }

  public insert(data: T): Promise<T> {
    return this.Model
      .insertOne(data)
      .then(item => item.ops[0])
      .catch(this.reject);
  }

  public update(query: any, newData: any): Promise<T> {
    return this.Model
      .findOneAndUpdate(query, newData, { upsert: true, returnOriginal: false })
      .then(result => this.toInstance(result.value))
      .catch(this.reject);
  }

  public deleteOne(query: any): Promise<boolean> {
    return this.Model
      .deleteOne(query)
      .then(result => !!result.result.ok)
      .catch(this.reject);
  }

  public deleteMany(query: any): Promise<boolean> {
    return this.Model
      .deleteMany(query)
      .then(result => !!result.result.ok)
      .catch(this.reject);
  }

  private toInstance = (listItem: any) => {
    return new this.Type(listItem);
  }

  private toInstanceArray(listItems: any[]): Promise<T[]> {
    const instantiatedListItems = listItems.map(this.toInstance);
    return Promise.resolve(instantiatedListItems);
  }

  private reject(error: any) {
    return Promise.reject(error);
  }
}