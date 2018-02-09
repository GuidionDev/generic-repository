import * as Chai from 'chai';
import { SomeObject, objectWithoutIdFixture} from './some_object.fixtures';
import MongoDBRepository from '../implementations/mongodb_repository';
const expect = Chai.expect;
import { repo, anotherRepo, connection } from './mongodb_init';
import { tests } from './repository.tests';

describe('MongoDBRepository<SomeObject>', () => {
  tests(repo);
});

describe('MongoDBRepository<AnotherObject>', () => {
  tests(anotherRepo);
});