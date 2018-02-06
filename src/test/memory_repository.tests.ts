import * as Chai from 'chai';
import { SomeObject, objectWithoutIdFixture} from './some_object.fixtures';
import MemoryRepository from '../implementations/memory_repository';
const expect = Chai.expect;
import { tests } from './repository.tests';

describe('MemoryRepository', () => {
  tests(new MemoryRepository(SomeObject));
});