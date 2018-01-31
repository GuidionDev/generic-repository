import * as Chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import MongoConnect from '../mongodb_connect';
import MongoDBRepository from '../implementations/mongodb_repository';
import { SomeObject, objectWithoutIdFixture} from './some_object.fixtures';
import * as mongoose from 'mongoose';
import * as dotEnv from 'dotenv';
// Load config setings
dotEnv.config();
process.env.NODE_ENV = 'test';
Chai.use(chaiAsPromised);
const expect = Chai.expect;
const onReady = new MongoConnect().connect();
let resource = new MongoDBRepository<SomeObject>(SomeObject);

describe('', () => {
  let id: string;
  let anotherId: string;
  before((done) => {
    setTimeout(done, 1000);
  });
  after(function () {
    MongoConnect.gracefulExit();
  });
  describe('MongoDBRepository', () => {
    describe('when constructed', () => {
      it('should connect to the database', (done: any) => {
        onReady.then((connection) => {
          expect(mongoose.connection.readyState).to.eq(1);
          done();
        }).catch(done);
      });
    });
    describe('.insert()', () => {
      it('should insert the object and return with id in a promise', (done) => {
        resource.insert(objectWithoutIdFixture).then((survey: SomeObject) => {
          id = survey.id;
          expect(survey.id);
          done();
        });
      });
    });

    describe('.findById()', () => {
      it('should find one object based on the id', (done) => {
        resource.findById(id).then((result) => {
          expect(result.id.toString()).to.equal(id.toString());
          done();
        }).catch(done);
      });
      it('should not find one object based on wrong id', (done) => {
        resource.findById('idontexist').catch((error: Error) => {
          expect(error).to.be.instanceof(Error);
          done();
        });
      });
    });

    describe('.findOne()', () => {
      it('should find one object based on the conditions', (done) => {
        resource.findOne({}).then((result) => {
          expect(result.id.toString()).to.equal(id.toString());
          done();
        }).catch(done);
      });
      it('should not find one object based on wrong conditions', (done) => {
        resource.findOne({ _id: 'idontexistyo' }).catch((error: Error) => {
          expect(error).to.be.instanceof(Error);
          done();
        });
      });
    });

    describe('.findLast()', () => {
      beforeEach((done) => {
        objectWithoutIdFixture['_name'] = 'newName';
        objectWithoutIdFixture['_submitDate'] = new Date();
        resource.insert(objectWithoutIdFixture).then((obj: SomeObject) => {
          anotherId = obj.id;
          done();
        });
      });
      it('should find the last submitted object ', (done) => {
        resource.findLast('_submitDate', 1).then((result) => {
          expect(result[0]['_name']).to.equal(objectWithoutIdFixture.name);
          done();
        });
      });
      it('should not find the last submitted object ', (done) => {
        resource.delete({}).then(() => {
          resource.findLast('_submitDate', 1).then((emptyArray: any[]) => {
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
        resource.insert(objectWithoutIdFixture).then((obj: SomeObject) => {
          anotherId = obj.id;
          done();
        });
      });
      it('should find all objects based on the conditions', (done) => {
        resource.find({ _id: anotherId }).then((result) => {
          expect(result.length).to.equal(1);
          done();
        }).catch(done);
      });
      it('should find all objects with paging', (done) => {
        resource.paginate({ _id: anotherId }, { page: 1 }).then((result) => {
          expect(result.length).to.equal(1);
          done();
        }).catch(done);
      });
      it('should find no objects with invalid paging', (done) => {
        resource.paginate({}, { page: 2 }).then((result) => {
          expect(result.length).to.equal(0);
          done();
        }).catch(done);
      });
      it('should not find objects based on non-existent conditions', (done) => {
        resource.find({ _id: 'imfake' }).catch((error: Error) => {
          expect(error).to.be.instanceof(Error);
          done();
        });
      });
    });
    describe('.findLastByQuery()', () => {
      it('should find all objects based on the conditions', (done) => {
        resource.findLastByQuery({ '_submitDate': objectWithoutIdFixture['_submitDate'] }, '_id', 1).then((result) => {
          expect(result.length).to.equal(1);
          expect(result[0].id).to.not.be.undefined;
          done();
        });
      });
      it('should not find all objects in empty db', (done) => {
        resource.delete({}).then(() => {
          resource.findLastByQuery({ '_submitDate': objectWithoutIdFixture['_submitDate'] }, '_id', 1)
            .then((emptyArray: any[]) => {
              expect(emptyArray).to.have.length(0);
              done();
            });
        });
      });
      it('should not find all objects based on wrong conditions', (done) => {
        resource.findLastByQuery({ '_submitDate': 'bla' }, '_id', 1).then((emptyArray: any[]) => {
          expect(emptyArray).to.have.length(0);
          done();
        });
      });
    });
    describe('.update()', () => {
      it('should update according to query', (done) => {
        resource.insert(new SomeObject(objectWithoutIdFixture)).then((obj: SomeObject) => {
          resource.update({ _id: obj.id }, { $set: { _name: 'bla' } }).then((updated: SomeObject) => {
            expect(updated.name).to.equal('bla');
            done();
          });
        }).catch(done);
      });
    });
    describe('.delete()', () => {
      it('should delete according to query', (done) => {
        resource.delete({ '_id': id }).then((result) => {
          expect(result.id);
          resource.delete({ '_id': anotherId }).then((survey) => {
            expect(survey.id);
            done();
          });
        });
      });
      it('should not delete according to faulty query', (done) => {
        resource.delete({ '_id': 'idontexist' }).catch((error: Error) => {
          expect(error).to.be.instanceof(Error);
          resource.delete({ '_id': 'idontexisteither' }).catch((error: Error) => {
            expect(error).to.be.instanceof(Error);
            done();
          });
        });
      });
      it('should delete everything', (done) => {
        resource.delete({}).then(() => {
          resource.find({}).then(res => expect(res.length).to.equal(0) && done());
        }).catch(done);
      });
    });
  });
});