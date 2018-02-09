import * as Chai from 'chai';
import { SomeObject, objectWithoutIdFixture} from './some_object.fixtures';
import Seed from '../implementations/seed';
const expect = Chai.expect;
import { repo, connection } from './mongodb_init';
import MongoDBRepository from '../implementations/mongodb_repository';
import seedFile from './SomeObject.seed';
import MemoryRepository from '../implementations/memory_repository';
import SeedFile from './SomeObject.seed';
let memRepo = new MemoryRepository(SomeObject);

describe('Seed', () => {
  let id: string;
  let anotherId: string;
  let seed: Seed<SomeObject>;
  describe('with mongodb repository', () => {
    let readyRepo = repo;
    before(function (done) {
      connection.then((ready) => {
        seed = new Seed(readyRepo, '_name', SeedFile);
        done();
      }).catch(done);
    });
    it('should seed files', (done) => {
      seed.seed().then((result) => {
        expect(result.length).to.equal(1);
        return readyRepo.findById(seedFile.data[0]._id).then(found => {
          expect(found.name).to.equal(seedFile.data[0]._name);
          done();
        });
      }).catch(done);
    });
    after(function() {
      readyRepo.deleteMany({});
    });
  });
  describe('with memory repository', () => {
    before(() => {
      seed = new Seed(memRepo, '_name', SeedFile);
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
});