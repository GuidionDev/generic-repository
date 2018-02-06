import { SomeObject } from './some_object.fixtures';
import MongoDBRepository from '../implementations/mongodb_repository';
import MongoConnection from '../mongodb_connect';
import * as dotEnv from 'dotenv';
// Load config setings
dotEnv.config();
process.env.NODE_ENV = 'test';

export const connection = MongoConnection.connect();
export const repo = new MongoDBRepository(SomeObject, connection);
export default repo;

after(function() {
  MongoConnection.gracefulExit();
});