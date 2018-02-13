import Repository from '../repository';
import { Db, Collection, CommonOptions, ObjectId } from 'mongodb';

export default class MongoDBRepository<T> implements Repository<T> {
  public Type: { new(...args: any[]): T; };
  private Model: Promise<Collection<T>>;

  constructor(type: { new(...args: any[]): T; }, db: Promise<Db>) {
    this.Type = type;
    this.Model = db.then(ready => ready.collection(this.Type.prototype.constructor.name))
    .catch(err => {
      console.error(this.Type.prototype.constructor.name, 'An error occured while making connection to the database.');
    });
  }

  public paginate(conditions: any, sortOptions: any, page, perPage): Promise<T[]> {
    return this.Model.then(model => model
      .find(conditions)
      .sort(sortOptions)
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .map(this.toInstance)
      .toArray()
      .catch(this.reject));
  }

  public insertMany(list: T[]): Promise<T[]> {
    return this.Model.then(model => model
      .insertMany(list.map(this.idToObjectId))
      .then(items => items.ops)
      .then(this.toInstanceArray.bind(this))
      .catch(this.reject));
  }

  public count(conditions: Object = {}): Promise<number> {
    return this.Model.then(model => model
      .count(conditions));
  }

  public find(conditions: any): Promise<T[]> {
    return this.Model.then(model => model
      .find(conditions)
      .map(this.toInstance)
      .toArray()
      .catch(this.reject));
  }

  public findOne(conditions: Object): Promise<T> {
    return this.Model.then(model => model
      .findOne(conditions)
      .then(doc => {
        if (doc) {
          return this.toInstance(doc);
        } else {
          throw new Error('No results for query: ' + JSON.stringify(conditions));
        }
      }).catch(this.reject));
  }

  public findById(id: string): Promise<T> {
    return this.findOne({ _id: ObjectId(id) });
  }

  public findLast(sortField: string, limit: number): Promise<T[]> {
    return this.Model.then(model => model
      .find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .map(this.toInstance)
      .toArray()
      .catch(this.reject));
  }

  public findLastByQuery(query: any,
    sortField: string, limit: number): Promise<T[]> {
      return this.Model.then(model => model
      .find(query)
      .sort({ [sortField]: -1 })
      .limit(limit)
      .map(this.toInstance)
      .toArray()
      .catch(this.reject));
  }

  public insert(data: T): Promise<T> {
    this.idToObjectId(data);
    return this.Model.then((model) => model
      .insertOne(data)
      .then(item => item.ops[0])
      .catch(this.reject));
  }

  public update(query: any, newData: any): Promise<T> {
    return this.Model.then(model => model
      .findOneAndUpdate(query, newData, { upsert: true, returnOriginal: false })
      .then(result => this.toInstance(result.value))
      .catch(this.reject));
  }

  public deleteOne(query: any): Promise<boolean> {
    return this.Model.then(model => model
      .deleteOne(query)
      .then(result => !!result.result.ok)
      .catch(this.reject));
  }

  public deleteMany(query: any): Promise<boolean> {
    return this.Model.then(model => model
      .deleteMany(query)
      .then(result => !!result.result.ok)
      .catch(this.reject));
  }

  private idToObjectId(data: T) {
    if (data['_id'] && typeof data['_id'] === 'string') {
      data['_id'] = ObjectId(data['_id']);
    }
  }

  private toInstance = (listItem: T) => {
    return new this.Type(listItem);
  }

  private toInstanceArray(listItems: T[]): Promise<T[]> {
    const instantiatedListItems = listItems.map(this.toInstance);
    return Promise.resolve(instantiatedListItems);
  }

  private reject(error: any) {
    return Promise.reject(error);
  }
}