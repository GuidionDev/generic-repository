import * as Chai from 'chai';
import { SomeObject, objectWithoutIdFixture } from './some_object.fixtures';
import { AnotherObject, anotherObjectWithoutIdFixture } from './another_object.fixtures';
import MongoDBRepository from '../implementations/mongodb_repository';
const expect = Chai.expect;
import { repo, anotherRepo, connection } from './mongodb_init';
import { tests } from './repository.tests';

describe('MongoDBRepository<SomeObject>', () => {
  tests(repo);
});

describe('MongoDBRepository<AnotherObject>', () => {
  tests(anotherRepo);

  describe('.findOne()', () => {
    it('should find one object based on object specific conditions', (done) => {
      anotherRepo.insert(new AnotherObject(anotherObjectWithoutIdFixture));
      anotherRepo.findOne({ _domain: 'test@guidion.net'}).then((result) => {
        expect(result.domain).to.equal(anotherObjectWithoutIdFixture.domain);
        done();
      }).catch(done);
    });
    it('should not find one object based on wrong conditions', (done) => {
      anotherRepo.findOne({ _domain: 'failing.test@guidion.net'}).catch((error: Error) => {
        expect(error).to.be.instanceof(Error);
        done();
      });
    });
  });
});