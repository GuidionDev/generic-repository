import * as fs from 'fs';
import * as path from 'path';
import Repository from '../repository';

export default class Seed<T> {
  private repo: Repository<T>;
  private dir: string;
  private identifier: string;
  constructor(repo: Repository<T>, identifier: string, seedFileLocation: string) {
    this.repo = repo;
    this.identifier = identifier || '_name' ;
    this.dir = seedFileLocation || __dirname;
  }

  public seed(): Promise<T[]> {
    return this.checkSeedFileExists().then((seedFilePath) => {
      let _promises = Array();
      let _data = require(seedFilePath);
      return this.repo.count().then(count => {
        if (this.shouldUpdateSeed(_data, count)) {
          return this.updateWithSeedData(_data, _promises);
        } else if (this.shouldInsertSeed(count)) {
          return this.insertSeedData(_data, _promises);
        } else {
          console.log('Resource is up-to-date, did not seed ' +
            this.repo.Type.prototype.constructor.name + ' collection again.');
          return Promise.resolve([]);
        }
      });
    });
  }

  private updateWithSeedData(_data: any, _promises: Promise<any>[]) {
    if (Array.isArray(_data.default.data)) {
      _promises.push(..._data.default.data.map((item: any) => {
        return this.updateWithDefaults(item);
      }));
    } else {
        _promises.push(this.updateWithDefaults(_data.default.data));
    }
    return Promise.all(_promises);
  }

  private updateWithDefaults(item) {
    return this.repo.update({ [this.identifier]: item[this.identifier] }, item);
  }

  private insertSeedData(_data: any, _promises: Promise<any>[]) {
    if (Array.isArray(_data.default.data)) {
      _data.default.data.forEach((item: any) => {
        _promises.push(this.repo.insert(item));
      });
    } else {
      _promises.push(this.repo.insert(_data.default.data));
    }
    return Promise.all(_promises);
  }

  private shouldUpdateSeed(_data: any, count: number): boolean {
    if (count > 0 && _data.default.seedAlways) {
      return true;
    } else {
      return false;
    }
  }

  private shouldInsertSeed(count: number): boolean {
    if (count <= 0) {
      return true;
    } else {
      return false;
    }
  }

  private checkSeedFileExists(): Promise<string> {
    return new Promise<any>((resolve, reject) => {
      let seedFilePath = path.join(this.dir, this.repo.Type.prototype.constructor.name + '.seed.js');
      fs.access(seedFilePath, fs.constants.R_OK, (err) => {
        err ? reject(err) : resolve(seedFilePath);
      });
    });
  }
}