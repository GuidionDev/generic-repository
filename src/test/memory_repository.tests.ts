import * as Chai from 'chai';
import { SomeObject, objectWithoutIdFixture } from './some_object.fixtures';
import MemoryRepository from '../implementations/memory_repository';
const expect = Chai.expect;
import { tests } from './repository.tests';
import { AnotherObject, anotherObjectWithoutIdFixture } from './another_object.fixtures';
import { NotFoundError } from '../errors/not_found_error';

describe('MemoryRepository<SomeObject>', () => {
  tests(new MemoryRepository(SomeObject));
});

describe('MemoryRepository<AnotherObject>', () => {
  const memoryRepository = new MemoryRepository(AnotherObject);
  describe('.findOne()', () => {
    it('should find one object based on object specific conditions', (done) => {
      memoryRepository.insert(new AnotherObject(anotherObjectWithoutIdFixture));
      memoryRepository.findOne({ _domain: 'test@guidion.net'}).then((result) => {
        expect(result.domain).to.equal(anotherObjectWithoutIdFixture.domain);
        done();
      }).catch(done);
    });
    it('should not find one object based on wrong conditions', (done) => {
      memoryRepository.findOne({ _domain: 'failing.test@guidion.net'}).catch((error: NotFoundError) => {
        expect(error).to.be.instanceof(NotFoundError);
        done();
      });
    });
  });
});
