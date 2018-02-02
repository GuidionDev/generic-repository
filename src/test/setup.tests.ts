import * as mongoose from 'mongoose';
import * as dotEnv from 'dotenv';
import * as Chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
Chai.use(chaiAsPromised);
// Load config setings
dotEnv.config();
process.env.NODE_ENV = 'test';
import MongoConnect from '../mongodb_connect';
before(function (done) {
  const onReady = new MongoConnect().connect();
  onReady.then(() => done()).catch(done);
});

after(function() {
  MongoConnect.gracefulExit();
});