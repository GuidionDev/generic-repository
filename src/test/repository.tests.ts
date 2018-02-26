import * as Chai from 'chai';
import { SomeObject, objectWithoutIdFixture} from './some_object.fixtures';
import Repository from '../repository';
import { NotFoundError } from '../errors/not_found_error';
const expect = Chai.expect;

export function tests(readyRepo: Repository<SomeObject>) {
  let id: string;
  let anotherId: string;
  before((done) => {
    readyRepo.deleteMany({}).then(() => done());
  });
  describe('.insert()', () => {
    it('should insert the object and return with id in a promise', (done) => {
      readyRepo.insert(objectWithoutIdFixture).then((inserted: SomeObject) => {
        id = inserted.id;
        expect(id).to.not.be.empty;
        done();
      }).catch(done);
    });
  });
  describe('.findById()', () => {
    it('should find one object based on the id', (done) => {
      readyRepo.findById(id.toString()).then((result) => {
        expect(result.id.toString()).to.equal(id.toString());
        done();
      }).catch(done);
    });
    it('should find one object based on a new id', (done) => {
      const insertWithId: any = { name: objectWithoutIdFixture.name, _id: '12345'};
      readyRepo.insert(insertWithId).then((result) => {
        return readyRepo.findById(insertWithId._id).then((result) => {
          expect(result.id.toString()).to.equal('12345');
          readyRepo.deleteOne({ _id: insertWithId._id });
          done();
        });
      }).catch(done);
    });
    it('should not find one object based on wrong id', (done) => {
      readyRepo.findById('598b189fb4593800112122af').then(done).catch((error: NotFoundError) => {
        expect(error).to.be.instanceof(NotFoundError);
        done();
      });
    });
  });
  describe('.findOne()', () => {
    it('should find one object based on no conditions', (done) => {
      readyRepo.findOne({}).then((result) => {
        expect(result.id.toString()).to.equal(id.toString());
        done();
      }).catch(done);
    });
    it('should not find one object based on wrong conditions', (done) => {
      readyRepo.findOne({ _id: 'idontexistyo' }).catch((error: NotFoundError) => {
        expect(error).to.be.instanceof(NotFoundError);
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
    it('should find all objects', (done) => {
      readyRepo.find({}).then((result) => {
        expect(result.length).to.equal(1);
        done();
      }).catch(done);
    });
    it('should find specific object based on the conditions', (done) => {
      readyRepo.find({ _id: anotherId }).then((result) => {
        expect(result.length).to.equal(1);
        done();
      }).catch(done);
    });
    it('should find specific object based on the conditions with a string id', (done) => {
      readyRepo.find({ _id: anotherId.toString() }).then((result) => {
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
    let objId;
    before((done) => {
      readyRepo.insert(new SomeObject(objectWithoutIdFixture)).then((obj: SomeObject) => {
        objId = obj.id;
        done();
      });
    });
    it('should update entirte object', (done) => {
      readyRepo.update({ _id: objId }, {_id: objId.toString(), _name: 'newName'}).then((updated: SomeObject) => {
        expect(updated.name).to.equal('newName');
        done();
      }).catch(done);
    });
    it('should update according to query', (done) => {
      readyRepo.update({ _id: objId }, { $set: { _name: 'bla' } }).then((updated: SomeObject) => {
        expect(updated.name).to.equal('bla');
        done();
      }).catch(done);
    });
    it('should update according to query with string id', (done) => {
      readyRepo.update({ _id: objId.toString() }, { $set: { _name: 'bla2' } }).then((updated: SomeObject) => {
          expect(updated.name).to.equal('bla2');
          done();
        }).catch(done);
    });
  });
  describe('.delete()', () => {
    it('should delete according to query', (done) => {
      console.log(JSON.stringify(anotherId));
      readyRepo.deleteOne({ '_id': anotherId.toString() }).then((another) => {
        expect(another).to.be.true;
        console.log(JSON.stringify(anotherId));
        return readyRepo.find({ '_id': anotherId }).then(res => expect(res.length).to.equal(0) && done());
      }).catch(done);
    });
    it('should not delete according to faulty query', (done) => {
      readyRepo.deleteOne({ '_id': 'idontexist' }).then((success) => {
        expect(!success);
        return readyRepo.deleteOne({ '_id': 'idontexisteither' }).then((success) => {
          expect(!success);
          done();
        });
      }).catch(done);
    });
    it('should delete everything', (done) => {
      readyRepo.deleteMany({}).then(() => {
        readyRepo.find({}).then(res => expect(res.length).to.equal(0) && done());
      }).catch(done);
    });
  });
}
