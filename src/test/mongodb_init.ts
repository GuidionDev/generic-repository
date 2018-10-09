import { SomeObject } from './some_object.fixtures';
import { AnotherObject } from './another_object.fixtures';
import MongoDBRepository from '../implementations/mongodb_repository';
import MongoConnection from '../mongodb_connect';
import * as dotEnv from 'dotenv';
// Load config setings
dotEnv.config();
process.env.NODE_ENV = 'test';
process.env.DB_URI_TEST = 'mongodb://localhost:27017/';
process.env.DB_NAME_TEST = 'test';
export const connection = MongoConnection.connect();
export const repo = new MongoDBRepository(SomeObject, connection);
export const anotherRepo = new MongoDBRepository(AnotherObject, connection);
export default repo;

after(function () {
  MongoConnection.gracefulExit();
});