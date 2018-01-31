import * as Chai from 'chai';
import * as mongoose from 'mongoose';
import { SomeObject, objectWithoutIdFixture} from './some_object.fixtures';
import SomeObjectMongo from './mongodb_init';
const expect = Chai.expect;

describe('MongoDBRepository', () => {
  let id: string;
  let anotherId: string;
  describe('when constructed', () => {
    it('should connect to the database', () => {
      expect(mongoose.connection.readyState).to.eq(1);
    });
  });
  describe('.insert()', () => {
    it('should insert the object and return with id in a promise', (done) => {
      SomeObjectMongo.insert(objectWithoutIdFixture).then((survey: SomeObject) => {
        id = survey.id;
        expect(survey.id);
        done();
      });
    });
  });
  describe('.findById()', () => {
    it('should find one object based on the id', (done) => {
      SomeObjectMongo.findById(id).then((result) => {
        expect(result.id.toString()).to.equal(id.toString());
        done();
      }).catch(done);
    });
    it('should not find one object based on wrong id', (done) => {
      SomeObjectMongo.findById('idontexist').catch((error: Error) => {
        expect(error).to.be.instanceof(Error);
        done();
      });
    });
  });
  describe('.findOne()', () => {
    it('should find one object based on the conditions', (done) => {
      SomeObjectMongo.findOne({}).then((result) => {
        expect(result.id.toString()).to.equal(id.toString());
        done();
      }).catch(done);
    });
    it('should not find one object based on wrong conditions', (done) => {
      SomeObjectMongo.findOne({ _id: 'idontexistyo' }).catch((error: Error) => {
        expect(error).to.be.instanceof(Error);
        done();
      });
    });
  });
  describe('.findLast()', () => {
    beforeEach((done) => {
      objectWithoutIdFixture['_name'] = 'newName';
      objectWithoutIdFixture['_submitDate'] = new Date();
      SomeObjectMongo.insert(objectWithoutIdFixture).then((obj: SomeObject) => {
        anotherId = obj.id;
        done();
      });
    });
    it('should find the last submitted object ', (done) => {
      SomeObjectMongo.findLast('_submitDate', 1).then((result) => {
        expect(result[0]['_name']).to.equal(objectWithoutIdFixture.name);
        done();
      });
    });
    it('should not find the last submitted object ', (done) => {
      SomeObjectMongo.delete({}).then(() => {
        SomeObjectMongo.findLast('_submitDate', 1).then((emptyArray: any[]) => {
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
      SomeObjectMongo.insert(objectWithoutIdFixture).then((obj: SomeObject) => {
        anotherId = obj.id;
        done();
      });
    });
    it('should find all objects based on the conditions', (done) => {
      SomeObjectMongo.find({ _id: anotherId }).then((result) => {
        expect(result.length).to.equal(1);
        done();
      }).catch(done);
    });
    it('should find all objects with paging', (done) => {
      SomeObjectMongo.paginate({ _id: anotherId }, { page: 1 }).then((result) => {
        expect(result.length).to.equal(1);
        done();
      }).catch(done);
    });
    it('should find no objects with invalid paging', (done) => {
      SomeObjectMongo.paginate({}, { page: 2 }).then((result) => {
        expect(result.length).to.equal(0);
        done();
      }).catch(done);
    });
    it('should not find objects based on non-existent conditions', (done) => {
      SomeObjectMongo.find({ _id: 'imfake' }).catch((error: Error) => {
        expect(error).to.be.instanceof(Error);
        done();
      });
    });
  });
  describe('.findLastByQuery()', () => {
    it('should find all objects based on the conditions', (done) => {
      SomeObjectMongo.findLastByQuery({ '_submitDate': objectWithoutIdFixture['_submitDate'] }, '_id', 1).then((result) => {
        expect(result.length).to.equal(1);
        expect(result[0].id).to.not.be.undefined;
        done();
      });
    });
    it('should not find all objects in empty db', (done) => {
      SomeObjectMongo.delete({}).then(() => {
        SomeObjectMongo.findLastByQuery({ '_submitDate': objectWithoutIdFixture['_submitDate'] }, '_id', 1)
          .then((emptyArray: any[]) => {
            expect(emptyArray).to.have.length(0);
            done();
          });
      });
    });
    it('should not find all objects based on wrong conditions', (done) => {
      SomeObjectMongo.findLastByQuery({ '_submitDate': 'bla' }, '_id', 1).then((emptyArray: any[]) => {
        expect(emptyArray).to.have.length(0);
        done();
      });
    });
  });
  describe('.update()', () => {
    it('should update according to query', (done) => {
      SomeObjectMongo.insert(new SomeObject(objectWithoutIdFixture)).then((obj: SomeObject) => {
        SomeObjectMongo.update({ _id: obj.id }, { $set: { _name: 'bla' } }).then((updated: SomeObject) => {
          expect(updated.name).to.equal('bla');
          done();
        });
      }).catch(done);
    });
  });
  describe('.delete()', () => {
    it('should delete according to query', (done) => {
      SomeObjectMongo.delete({ '_id': id }).then((result) => {
        expect(result.id);
        SomeObjectMongo.delete({ '_id': anotherId }).then((survey) => {
          expect(survey.id);
          done();
        });
      });
    });
    it('should not delete according to faulty query', (done) => {
      SomeObjectMongo.delete({ '_id': 'idontexist' }).catch((error: Error) => {
        expect(error).to.be.instanceof(Error);
        SomeObjectMongo.delete({ '_id': 'idontexisteither' }).catch((error: Error) => {
          expect(error).to.be.instanceof(Error);
          done();
        });
      });
    });
    it('should delete everything', (done) => {
      SomeObjectMongo.delete({}).then(() => {
        SomeObjectMongo.find({}).then(res => expect(res.length).to.equal(0) && done());
      }).catch(done);
    });
  });
});