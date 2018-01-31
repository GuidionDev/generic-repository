import Repository from '../repository';
import * as mongoose from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

(mongoose as any).Promise = global.Promise;

export default class MongoDBRepository<T> implements Repository<T> {
  public Type: { new (...args: any[]): T };
  private Model: any;
  private db: mongoose.Connection;

  constructor(type: { new (...args: any[]): T }) {
    this.Type = type;
    this.db = mongoose.connection;
    this.initModel();
  }

  public getName() {
    return this.Model['modelName'];
  }

  public count(conditions: Object = {}): Promise<number> {
    return this.Model.count(conditions).exec();
  }

  public find(conditions: any): Promise<T[]> {
    return this.Model
      .find(conditions)
      .then(this.instantiateResultArray.bind(this))
      .catch(this.handleError);
  }

  public paginate(conditions: any, options?: any): Promise<T[]> {
    options = options ? options : {};
    return this.Model
      .paginate(conditions, options)
      .then((result: any) => {
        return result.docs;
      })
      .catch(this.handleError);
  }

  private instantiateResultArray(listItems: mongoose.Document[]): Promise<T[]> {
    const instantiatedListItems = listItems.map((listItem: mongoose.Document) => {
      return new this.Type(listItem);
    });
    return Promise.resolve(instantiatedListItems);
  }

  private static promiseResult(result: mongoose.Document) {
    return Promise.resolve(result);
  }

  private promiseResultTyped(result: any) {
    return Promise.resolve(new this.Type(result));
  }

  private handleError(error: string) {
    return Promise.reject(new Error(error));
  }

  public findOne(conditions: Object): Promise<T> {
    return this.Model
      .findOne(conditions)
      .exec()
      .then(this.promiseResultTyped.bind(this))
      .catch(this.handleError);
  }

  public findLast(sortField: string, limit: number): Promise<T[]> {
    return this.Model
      .find()
      .sort({ [sortField]: -1 })
      .limit(limit)
      .exec()
      .then(MongoDBRepository.promiseResult)
      .catch(this.handleError);
  }

  public findById(id: string): Promise<T> {
    return this.Model
      .findById(id)
      .exec()
      .then(this.promiseResultTyped.bind(this))
      .catch(this.handleError);
  }

  public findLastByQuery(query: any, secondField: string, limit: number): Promise<T[]> {
    return this.Model
      .find(query)
      .sort({ [secondField]: -1 })
      .limit(limit)
      .exec()
      .then(MongoDBRepository.promiseResult)
      .catch(this.handleError);
  }

  public insert(data: T): Promise<T> {
    return new this.Model(data)
      .save()
      .then(this.promiseResultTyped.bind(this))
      .catch(this.handleError);
  }

  public update(queryID: any, newData: any): Promise<T> {
    return this.Model
      .findOneAndUpdate(queryID, newData, { new: true, upsert: true })
      .exec()
      .then(this.promiseResultTyped.bind(this))
      .catch(this.handleError);
  }

  public delete(query: any): Promise<T> {
    return this.Model
      .remove(query)
      .exec()
      .then(MongoDBRepository.promiseResult)
      .catch(this.handleError);
  }

  private initModel(): void {
    this.Model = mongoose.model(this.Type.prototype.constructor.name, this.generateSchema());
  }

  private generateSchema(): mongoose.Schema {
    let schema = new mongoose.Schema(
      {},
      {
        toObject: {
          transform: (doc: Object, ret: Object) => new this.Type(doc)
        }
      }
    );
    schema.plugin(mongoosePaginate);

    for (let propertyName of Object.keys(new this.Type({}))) {
      if (propertyName !== 'id') {
        schema.add({ [propertyName]: {} });
      }
      if (propertyName === '_searchName') {
        schema.index({ _searchName: 'text' });
      }
    }
    return schema;
  }
}
