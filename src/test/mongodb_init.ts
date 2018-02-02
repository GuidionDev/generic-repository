import { SomeObject } from './some_object.fixtures';
import MongoDBRepository from '../implementations/mongodb_repository';
import * as mongoose from 'mongoose';
let resource = new MongoDBRepository(SomeObject, mongoose.connection);
export default resource;