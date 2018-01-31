interface Repository<T> {
  Type: { new (...args: any[]): T };
  find(conditions: Object): Promise<T[]>;
  paginate(conditions: Object, options?: any): Promise<T[]>;
  findOne(conditions: Object): Promise<T>;
  findById(id: string): Promise<T>;
  insert(data: T): Promise<T>;
  update(query: any, newData: any): Promise<T>;
  findLast?(field: string, limit: number): Promise<T[]>;
  findLastByQuery(query: any, sortField: string, limit: number): Promise<T[]>;
  delete(query: any): Promise<T>;
  getName(): string;
}
export default Repository;
