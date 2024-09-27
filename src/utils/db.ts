import { MongoClient } from 'mongodb';
import { DB_HOST, DB_PORT, DB_NAME } from './constants';
import type { Db, Collection } from 'mongodb';
import type { UserDocument } from '@typing/auth';
import type { Workspace } from '@typing/workspaces';
import type { ProjectDocument } from '@typing/projects';
import type { NoteDocument } from '@typing/projects';
import type { QuestionDocument } from '@typing/projects';
import type { ReplyDocument } from '@typing/projects';
import {
  ChecklistDocument,
  ChecklistItemDocument,
  TaskDocument,
} from '../types/tasks';

class DBClient {
  readonly host: string;
  readonly port: string;
  readonly databaseName: string;

  public client: MongoClient | null = null;
  public db: Db | null = null;
  public users: Collection<UserDocument> | null = null;
  public workspaces: Collection<Workspace> | null = null;
  public projects: Collection<ProjectDocument> | null = null;
  public notes: Collection<NoteDocument> | null = null;
  public questions: Collection<QuestionDocument> | null = null;
  public replies: Collection<ReplyDocument> | null = null;
  public tasks: Collection<TaskDocument> | null = null;
  public checklists: Collection<ChecklistDocument> | null = null;
  public checklistItems: Collection<ChecklistItemDocument> | null = null;

  constructor(host?: string, port?: string, databaseName?: string) {
    this.host = host || DB_HOST;
    this.port = port || DB_PORT;
    this.databaseName = databaseName || DB_NAME;
  }

  async connect() {
    return MongoClient.connect(`mongodb://${this.host}:${this.port}`)
      .then((client: MongoClient) => {
        this.client = client;
        this.db = this.client.db(this.databaseName);
        this.users = this.db.collection('users');
        this.workspaces = this.db.collection('workspaces');
        this.projects = this.db.collection('projects');
        this.notes = this.db.collection('notes');
        this.questions = this.db.collection('questions');
        this.replies = this.db.collection('replies');
        this.tasks = this.db.collection('tasks');
        this.checklists = this.db.collection('checklists');
        this.checklistItems = this.db.collection('checklistItems');
        return client;
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  get is_connected(): boolean {
    return !!this.client;
  }

  async close() {
    if (!this.client) {
      throw new Error('cannot close database connection before connecting');
    }
    await this.client.close();
    this.client = null;
  }
}

const dbClient = new DBClient();
export default dbClient;
