
import * as Chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { repo } from './mongodb_init';
Chai.use(chaiAsPromised);
before(function (done) {
  repo.then(() => done()).catch(done);
});