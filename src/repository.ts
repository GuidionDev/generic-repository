interface Repository<T> {
  Type: { new (...args: any[]): T };
  find(conditions: Object): Promise<T[]>;
  paginate(conditions: Object, page: number, perPage: number): Promise<T[]>;
  findOne(conditions: Object): Promise<T>;
  findById(id: string): Promise<T>;
  insert(data: T): Promise<T>;
  update(query: any, newData: any): Promise<T>;
  findLast?(field: string, limit: number): Promise<T[]>;
  findLastByQuery(query: any, sortField: string, limit: number): Promise<T[]>;
  deleteOne(query: any): Promise<boolean>;
  deleteMany(query: any): Promise<boolean>;
  count(): Promise<number>;
}
export default Repository;
