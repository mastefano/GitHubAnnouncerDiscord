import Database from 'better-sqlite3';
import path from 'path';
import fs from "fs";

export default class DatabaseHandler {
    private readonly db: Database.Database;
    private readonly tableName: string;

    constructor(dbFileName: string) {
        const storeDir: string = path.join(process.cwd(), "database-store");
        fs.mkdirSync(storeDir, {recursive: true})
        const dbPath: string = path.join(storeDir, dbFileName);
        this.db = new Database(dbPath);
        this.db.pragma("journal_mode = WAL");
        this.tableName = process.env.DB_TABLE_NAME!;
        this.initSchema();
    }

    private initSchema() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ${this.tableName} (
                repo TEXT PRIMARY KEY,
                updated_at TEXT NOT NULL
            )
        `);
    }

    public getConnection(): Database.Database {
        return this.db;
    }
}