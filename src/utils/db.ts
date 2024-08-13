import { MongoClient } from 'mongodb';
import { DB_HOST, DB_PORT, DB_NAME } from './constants';

import type { Db, Collection } from 'mongodb';
import type { User } from '../types/auth';

class DBClient {
  readonly host: string;
  readonly port: string;
  readonly databaseName: string;

  public client: MongoClient | null = null;
  public db: Db | null = null;
  public users: Collection<User> | null = null;

  constructor(host?: string, port?: string, databaseName?: string) {
    this.host = host || DB_HOST;
    this.port = port || DB_PORT;
    this.databaseName = databaseName || DB_NAME;

    MongoClient.connect(`mongodb://${this.host}:${this.port}`)
      .then((client: MongoClient) => {
        this.client = client;
        this.db = this.client.db(this.databaseName);
        this.users = this.db.collection('users');
        console.log(`db connected on ${this.host}:${this.port}`);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  closeConnection() {
    if (!this.client) {
      throw new Error('cannot close database connection before connecting');
    }
    this.client.close();
    console.log('db connection closed');
  }
}

const dbClient = new DBClient();
export default dbClient;
