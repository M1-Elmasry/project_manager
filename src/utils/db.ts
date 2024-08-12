import { MongoClient, Db, Collection } from "mongodb";
import { DB_HOST, DB_PORT, DB_NAME } from "./constants";

class DBClient {
	private host: string;
	private port: string;
	private databaseName: string;
	public client: MongoClient;
	public db: Db;
	public users: Collection;

	constructor(host?: string, port?: string, databaseName?: string) {
		this.host = host || DB_HOST;
		this.port = port || DB_PORT;
		this.databaseName = databaseName || DB_NAME;

		MongoClient.connect(
			`mongodb://${this.host}:${this.port}`,
			(err, client) => {
				if (!err) {
					this.client = client;
					this.db = client.db(this.databaseName);
					this.users = this.db.collection("users");
				}
			},
		);
	}
}

const dbClient = new DBClient();
export default dbClient;
