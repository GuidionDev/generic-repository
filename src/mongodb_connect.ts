import * as mongoose from 'mongoose';

export default class MongoConnect {

  public connect(connectionString: string | undefined): mongoose.Connection {
    let db_uri = connectionString || process.env.DB_URI;
    console.log('Running in ', process.env.NODE_ENV, ' environment');
    if (process.env.NODE_ENV === 'test' && process.env.DB_URI_TEST) {
      db_uri = process.env.DB_URI_TEST;
    }
    console.info(this, 'Connecting to: ' + db_uri);
    if (process.env.DB_USER && process.env.DB_PASS) {
      mongoose.connect(db_uri, {
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
      });
    } else {
      mongoose.connect(db_uri);
    }
    const ready = new Promise((resolve, reject) => {
      mongoose.connection.on('connected', () => {
        console.info(this, 'Connected! ' + db_uri);
        resolve();
      });

      // If the connection throws an error
      mongoose.connection.on('error', (err: string) => {
        const message = 'Failed to connect to: ' + db_uri;
        console.error(this, message, err);
        reject(message);
      });
    });
    // When the connection is disconnected
    mongoose.connection.on('disconnected', () => {
      console.info(this, 'Disconnected from: ' + db_uri);
    });

    // If the Node process ends, close the Mongoose connection
    process
      .on('SIGINT', MongoConnect.closeConnectionAndProcess.bind(this))
      .on('SIGTERM', MongoConnect.closeConnectionAndProcess.bind(this));

    return ready;
  }

  private static closeConnectionAndProcess() {
    MongoConnect.gracefulExit();
    process.exit();
  }

  public static gracefulExit() {
    return mongoose.connection.close();
  }
}
