import { MongoClient, Db } from 'mongodb';

// Singleton, in order to make sure repositories share a connection/db
export class MongoConnect {
  private _readyConnection: MongoClient;
  private _connection: Promise<MongoClient>;
  private _db: Db;
  private static _instance: MongoConnect;

  private constructor() { }

  public static get Instance() {
      return this._instance || (this._instance = new this());
  }

  public async connect(connectionString = undefined, database = undefined, user = undefined, pass = undefined): Promise<Db> {
    let dbUri = connectionString || process.env.DB_URI;
    let dbName = database || process.env.DB_NAME;
    const dbUser = user || process.env.DB_USER;
    const dbPass = pass || process.env.DB_PASS;
    if (process.env.NODE_ENV === 'test' && process.env.DB_URI_TEST) {
      console.log('Running in ', process.env.NODE_ENV, ' environment');
      dbUri = process.env.DB_URI_TEST;
      dbName = process.env.DB_NAME_TEST;
    }
    console.info(this, 'Connecting to: ' + dbUri);
    return this._connection = MongoClient.connect(dbUri).then(async (ready) => {
      if (dbUser && dbPass) {
        console.log('authenticating..');
        await ready.authenticate(process.env.DB_USER, process.env.DB_PASS);
      }
      console.log('connected to: ', dbUri);
      this._readyConnection = ready;
      return this._db = ready.db(dbName);
    }).catch(error => console.log('failed to connect to', dbUri));
  }
  get connection() {
    return this._connection;
  }
  get db() {
    return this._db;
  }

  private closeConnectionAndProcess() {
    this.gracefulExit();
    process.exit();
  }

  public gracefulExit() {
    this._readyConnection && this._readyConnection.close();
  }
}

export const MongoConnection = MongoConnect.Instance;
export default MongoConnection;