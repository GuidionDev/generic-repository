import * as Chai from 'chai';
import { SomeObject, objectWithoutIdFixture} from './some_object.fixtures';
import Repository from '../repository';
const expect = Chai.expect;

export function tests(readyRepo: Repository<SomeObject>) {
  let id: string;
  let anotherId: string;
  describe('.insert()', () => {
    it('should insert the object and return with id in a promise', (done) => {
      readyRepo.insert(objectWithoutIdFixture).then((inserted: SomeObject) => {
        id = inserted.id;
        expect(id);
        done();
      });
    });
  });
  describe('.findById()', () => {
    it('should find one object based on the id', (done) => {
      readyRepo.findById(id).then((result) => {
        expect(result.id.toString()).to.equal(id.toString());
        done();
      }).catch(done);
    });
    it('should not find one object based on wrong id', (done) => {
      readyRepo.findById('idontexist').then(done).catch((error: Error) => {
        expect(error).to.be.instanceof(Error);
        done();
      });
    });
  });
  describe('.findOne()', () => {
    it('should find one object based on the conditions', (done) => {
      readyRepo.findOne({}).then((result) => {
        expect(result.id.toString()).to.equal(id.toString());
        done();
      }).catch(done);
    });
    it('should not find one object based on wrong conditions', (done) => {
      readyRepo.findOne({ _id: 'idontexistyo' }).catch((error: Error) => {
        expect(error).to.be.instanceof(Error);
        done();
      });
    });
  });
  describe('.findLast()', () => {
    beforeEach((done) => {
      objectWithoutIdFixture['_name'] = 'newName';
      objectWithoutIdFixture['_submitDate'] = new Date();
      objectWithoutIdFixture['_id'] = undefined;
      readyRepo.insert(objectWithoutIdFixture).then((obj: SomeObject) => {
        anotherId = obj.id;
        done();
      }).catch(done);
    });
    it('should find the last submitted object ', (done) => {
      readyRepo.findLast('_submitDate', 1).then((result) => {
        expect(result[0]['_name']).to.equal(objectWithoutIdFixture.name);
        done();
      });
    });
    it('should not find the last submitted object ', (done) => {
      readyRepo.deleteMany({}).then(() => {
        readyRepo.findLast('_submitDate', 1).then((emptyArray: any[]) => {
          expect(emptyArray).to.have.length(0);
          done();
        });
      });
    });
  });
  describe('.find()', () => {
    before((done) => {
      objectWithoutIdFixture['_name'] = 'newName';
      objectWithoutIdFixture['_submitDate'] = new Date();
      objectWithoutIdFixture['_id'] = undefined;
      readyRepo.insert(objectWithoutIdFixture).then((obj: SomeObject) => {
        anotherId = obj.id;
        done();
      });
    });
    it('should find all objects based on the conditions', (done) => {
      readyRepo.find({ _id: anotherId }).then((result) => {
        expect(result.length).to.equal(1);
        done();
      }).catch(done);
    });
    it('should find all objects with paging', (done) => {
      readyRepo.paginate({ _id: anotherId }, ['_id', 'asc'], 1, 10).then((result) => {
        expect(result.length).to.equal(1);
        done();
      }).catch(done);
    });
    it('should find no objects with invalid paging', (done) => {
      readyRepo.paginate({}, ['_id', 'asc'], 2, 10).then((result) => {
        expect(result.length).to.equal(0);
        done();
      }).catch(done);
    });
    it('should not find objects based on non-existent conditions', (done) => {
      readyRepo.find({ _id: 'imfake' }).then((result) => {
        expect(result.length).to.equal(0);
        done();
      }).catch(done);
    });
  });
  describe('.findLastByQuery()', () => {
    it('should find all objects based on the conditions', (done) => {
      readyRepo.findLastByQuery({ '_submitDate': objectWithoutIdFixture['_submitDate'] }, '_id', 1).then((result) => {
        expect(result.length).to.equal(1);
        expect(result[0].id).to.not.be.undefined;
        done();
      });
    });
    it('should not find all objects in empty db', (done) => {
      readyRepo.deleteMany({}).then(() => {
        readyRepo.findLastByQuery({ '_submitDate': objectWithoutIdFixture['_submitDate'] }, '_id', 1)
          .then((emptyArray: any[]) => {
            expect(emptyArray).to.have.length(0);
            done();
          });
      });
    });
    it('should not find all objects based on wrong conditions', (done) => {
      readyRepo.findLastByQuery({ '_submitDate': 'bla' }, '_id', 1).then((emptyArray: any[]) => {
        expect(emptyArray).to.have.length(0);
        done();
      });
    });
  });
  describe('.update()', () => {
    it('should update according to query', (done) => {
      readyRepo.insert(new SomeObject(objectWithoutIdFixture)).then((obj: SomeObject) => {
        readyRepo.update({ _id: obj.id }, { $set: { _name: 'bla' } }).then((updated: SomeObject) => {
          expect(updated.name).to.equal('bla');
          done();
        });
      }).catch(done);
    });
  });
  describe('.delete()', () => {
    it('should delete according to query', (done) => {
      readyRepo.deleteOne({ '_id': id }).then((result) => {
        expect(result);
        readyRepo.deleteOne({ '_id': anotherId }).then((another) => {
          expect(another);
          done();
        });
      });
    });
    it('should not delete according to faulty query', (done) => {
      readyRepo.deleteOne({ '_id': 'idontexist' }).then((success) => {
        expect(!success);
        readyRepo.deleteOne({ '_id': 'idontexisteither' }).then((success) => {
          expect(!success);
          done();
        });
      });
    });
    it('should delete everything', (done) => {
      readyRepo.deleteMany({}).then(() => {
        readyRepo.find({}).then(res => expect(res.length).to.equal(0) && done());
      }).catch(done);
    });
  });
}
