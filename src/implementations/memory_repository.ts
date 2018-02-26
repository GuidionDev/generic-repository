import Repository from '../repository';
import { NotFoundError } from '../errors/not_found_error';

export default class MemoryRepository<T> implements Repository<T> {
  public Type: { new(...args: any[]): T };
  private docs: { [key: string]: T };

  constructor(type: { new(...args: any[]): T }) {
    this.Type = type;
    this.docs = {};
  }

  public count(): Promise<number> {
    return Promise.resolve(Object.keys(this.docs).length);
  }

  public find(conditions: Object): Promise<T[]> {
    return Promise.resolve(this.findNow(conditions));
  }

  public paginate(conditions: Object, sortOptions: any, page, perPage): Promise<T[]> {
    return Promise.resolve(this.findNow(conditions).slice(page * perPage - perPage, page * perPage));
  }

  private findNow(conditions) {
    const keys = Object.keys(this.docs);
    const surveySubset = new Array<T>();
    keys.forEach(key => {
      if (this.query(this.docs[key], conditions) && surveySubset.length < 5) {
        surveySubset.push(this.docs[key]);
      }
    });
    return surveySubset;
  }

  public findOne(conditions: any): Promise<T> {
    if (typeof conditions === 'string') {
      if (this.docs[conditions]) {
        return Promise.resolve(new this.Type(this.docs[conditions]));
      } else {
        return Promise.reject(new Error(conditions + ' does not exist'));
      }
    }
    return this.find(conditions).then(res => {
      if (res.length === 0) throw new NotFoundError('Not found');
      return res[0];
    });
  }

  public findById(id: string): Promise<T> {
    if (this.docs[id]) {
      return Promise.resolve(new this.Type(this.docs[id]));
    } else {
      return Promise.reject(new NotFoundError(id + ' does not exist'));
    }
  }

  public insert(data: any): Promise<T> {
    const insertData = new this.Type(data);
    if (!insertData['_id'] && !this.docs[insertData['_id']]) {
      insertData['_id'] = 'test123'; // generate id just like mongo would
    }
    this.docs[insertData['_id']] = insertData;
    return Promise.resolve(insertData);
  }

  public insertMany(list: T[]): Promise<T[]> {
    const iterator = 0;
    const result = list.map(item => {
      const insertData = new this.Type(item);
      if (!insertData['_id']) {
        insertData['_id'] = 'test' + iterator; // generate id just like mongo would
      }
      this.docs[insertData['_id']] = insertData;
      return insertData;
    });
    return Promise.resolve(result);
  }

  public update(query: any, newData: any): Promise<T> {
    const current = this.docs[query._id];
    if (current) {
      this.docs[query._id] = this.updateFields(current, newData);
      return Promise.resolve(new this.Type(current));
    } else {
      return this.insert(this.updateFields({ _id: query._id }, newData));
    }
  }

  private updateFields(target: any, data: any) {
    Object.keys(data).forEach(key => {
      if (key === '$set') {
        this.updateFields(target, data[key]);
      }
      target[key] = data[key];
    });
    return target;
  }

  public findLast(sortField: string, limit: number): Promise<T[]> {
    const sorted =  Object.values(this.docs).sort((a, b) => a[sortField] >= b[sortField] ? 1 : -1);
    return Promise.resolve(sorted.slice(0, limit));
  }

  public findLastByQuery(query: any, sortField: string, limit: number): Promise<T[]> {
    return this.find(query);
  }

  private query(obj: T, query: any) {
    const keys = Object.keys(query);
    let match = true;
    keys.forEach(key => {
      if (key === '$and') {
        for (let i = 0; i < query.$and.length; i++) {
          match = this.query(obj, query.$and[i]) ? match : false;
        }
      } else if (query[key]['$in']) {
        const inQuery = query[key]['$in'];
        if (Array.isArray(obj[key])) {
          match = obj[key].some((el: any) => inQuery.includes(el));
        } else {
          match = inQuery.includes(obj[key]) || (inQuery.includes(null) && !obj[key]) ? match : false;
        }
      } else if (query[key] !== obj[key]) {
        match = false;
      }
    });
    return match;
  }

  public deleteMany(query: any): Promise<boolean> {
    const keys = Object.keys(this.docs);
    const surveySubset = new Array<T>();
    keys.forEach(key => {
      if (this.query(this.docs[key], query)) {
        surveySubset.push(this.docs[key]);
        delete this.docs[key];
      }
    });
    if (surveySubset.length > 0 || keys.length === 0) {
      return Promise.resolve(true);
    }
    return Promise.reject(false);
  }

  public deleteOne(query: any): Promise<boolean> {
    const keys = Object.keys(this.docs);
    return Promise.resolve(keys.some(key => {
      if (this.query(this.docs[key], query)) {
        delete this.docs[key];
        return true;
      }
      return false;
    }));
  }
}
