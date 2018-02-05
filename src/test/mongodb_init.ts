import { SomeObject } from './some_object.fixtures';
import MongoDBRepository from '../implementations/mongodb_repository';
import MongoConnect from '../mongodb_connect';
import * as dotEnv from 'dotenv';
// Load config setings
dotEnv.config();
process.env.NODE_ENV = 'test';

export const repo = new MongoConnect().connect().then(ready => {
  return new MongoDBRepository(SomeObject, ready);
});
export default repo;