import { MongoClient, Db } from 'mongodb';

export default class MongoConnect {
  private _connection: Promise<MongoClient>;
  private _db: Db;
  public async connect(connectionString = undefined, name = undefined): Promise<Db> {
    let dbUri = connectionString || process.env.DB_URI;
    let dbName = name || process.env.DB_NAME;
    console.log('Running in ', process.env.NODE_ENV, ' environment');
    if (process.env.NODE_ENV === 'test' && process.env.DB_URI_TEST) {
      dbUri = process.env.DB_URI_TEST;
      dbName = process.env.DB_NAME_TEST;
    }
    console.info(this, 'Connecting to: ' + dbUri);
    this._connection = MongoClient.connect(dbUri);
    return this._connection.then(ready => {
      console.log('connected to: ', dbUri);
      return this._db = ready.db(dbName);
    }).catch(error => console.log('failed to connect to', dbUri));
  }
  get connection() {
    return this._connection;
  }
  get db() {
    return this._db;
  }
}