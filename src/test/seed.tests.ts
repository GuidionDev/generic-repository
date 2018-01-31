import * as Chai from 'chai';
import * as mongoose from 'mongoose';
import { SomeObject, objectWithoutIdFixture} from './some_object.fixtures';
import Seed from '../implementations/seed';
const expect = Chai.expect;
import SomeObjectMongo from './mongodb_init';
import seedFile from './SomeObject.seed';
import MemoryRepository from '../implementations/memory_repository';
let memRepo = new MemoryRepository<SomeObject>(SomeObject);

describe('Seed', () => {
  let id: string;
  let anotherId: string;
  let seed: Seed<SomeObject>;
  describe('with mongodb repository', () => {
    before(() => {
      seed = new Seed(SomeObjectMongo, '_name', __dirname);
    });
    it('should seed files', (done) => {
      seed.seed().then((result) => {
        expect(result.length).to.equal(1);
        SomeObjectMongo.findById(seedFile.data[0]._id).then(found => {
          expect(found.name).to.equal(seedFile.data[0]._name);
          done();
        });
      }).catch(done);
    });
  });
  describe('with memory repository', () => {
    before(() => {
      seed = new Seed(memRepo, '_name', __dirname);
    });
    it('should seed files', (done) => {
      seed.seed().then((result) => {
        expect(result.length).to.equal(1);
        memRepo.findById(seedFile.data[0]._id).then(found => {
          expect(found.name).to.equal(seedFile.data[0]._name);
          done();
        });
      }).catch(done);
    });
  });
  after(function() {
    SomeObjectMongo.delete({});
  });
});