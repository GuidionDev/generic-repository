import { SomeObject } from './some_object.fixtures';
import MongoDBRepository from '../implementations/mongodb_repository';
let resource = new MongoDBRepository<SomeObject>(SomeObject);
export default resource;