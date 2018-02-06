import * as fs from 'fs';
import * as path from 'path';
import Repository from '../repository';

export default class Seed<T> {
  private repo: Repository<T>;
  private seedFile: any;
  private identifier: string;
  constructor(repo: Repository<T>, identifier: string, seedFile: any) {
    this.repo = repo;
    this.identifier = identifier || '_name' ;
    this.seedFile = seedFile;
  }

  public seed(): Promise<T[]> {
    let _promises = Array();
    return this.repo.count().then(count => {
      if (this.shouldUpdateSeed(this.seedFile, count)) {
        return this.updateWithSeedData(this.seedFile, _promises);
      } else if (this.shouldInsertSeed(count)) {
        return this.insertSeedData(this.seedFile, _promises);
      } else {
        console.log('Resource is up-to-date, did not seed ' +
          this.repo.Type.prototype.constructor.name + ' collection again.');
        return Promise.resolve([]);
      }
    });
  }

  private updateWithSeedData(_data: any, _promises: Promise<any>[]) {
    if (Array.isArray(_data.data)) {
      _promises.push(..._data.data.map((item: any) => {
        return this.updateWithDefaults(item);
      }));
    } else {
        _promises.push(this.updateWithDefaults(_data.data));
    }
    return Promise.all(_promises);
  }

  private updateWithDefaults(item) {
    return this.repo.update({ [this.identifier]: item[this.identifier] }, item);
  }

  private insertSeedData(_data: any, _promises: Promise<any>[]) {
    if (Array.isArray(_data.data)) {
      _data.data.forEach((item: any) => {
        _promises.push(this.repo.insert(item));
      });
    } else {
      _promises.push(this.repo.insert(_data.data));
    }
    return Promise.all(_promises);
  }

  private shouldUpdateSeed(_data: any, count: number): boolean {
    if (count > 0 && _data.seedAlways) {
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
}