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

  public async connect(connectionString: string = undefined, database: string = undefined): Promise<Db> {
    let dbUri = connectionString || process.env.DB_URI;
    let dbName = database || process.env.DB_NAME;
    if (process.env.NODE_ENV === 'test' && process.env.DB_URI_TEST) {
      console.log('Running in ', process.env.NODE_ENV, ' environment');
      dbUri = process.env.DB_URI_TEST;
      dbName = process.env.DB_NAME_TEST;
    }
    if (!connectionString) {
      console.warn('No connectionString found! Make sure you either pass it to the mongo connect, or have it defined in your enviroment settings(DB_URI)');
    } else if (!database) {
      console.warn('No database specified! Make sure you either pass it to the mongo connect, or have it defined in your enviroment settings(DB_NAME)');
    }
    console.log(this, 'Connecting to database..');
    return this._connection = MongoClient.connect(dbUri).then((ready) => {
      console.log('Connected!');
      this._readyConnection = ready;
      return this._db = ready.db(dbName);
    }).catch(error => console.log('Failed to connect to', dbUri, error));
  }
  get connection() {
    return this._connection;
  }
  get db() {
    return this._db;
  }

  public gracefulExit() {
    this._readyConnection && this._readyConnection.close();
  }
}

export const MongoConnection = MongoConnect.Instance;
export default MongoConnection;