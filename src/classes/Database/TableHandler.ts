import Database, {type Statement} from "better-sqlite3";
import type {RepoRow} from "./types/RepoRow.type.js";

export default class TableHandler {
    private readonly db: Database.Database;
    private readonly table: string;
    private readonly columns: string[];

    constructor(db: Database.Database, table: string, columns: string[]) {
        this.db = db;
        this.table = table;
        this.columns = columns;
    }

    public upsert(repo: string, updatedAt: string): void {
        const insert: Statement<any> = this.db.prepare(
            `
                        INSERT INTO ${this.table} (${this.columns[0]}, ${this.columns[1]}) 
                        VALUES (@repo, @updated_at)
                        ON CONFLICT(${this.columns[0]}) DO UPDATE SET ${this.columns[1]} = @updated_at`
        );
        insert.run({repo, updated_at: updatedAt});
    }

    private getUpdatedAt(repo: string): string | null {
        const select: Statement<any> = this.db.prepare(
            `
                        SELECT ${this.columns[1]} FROM ${this.table} WHERE ${this.columns[0]} = @repo
            `
        );
        const row = select.get({repo}) as RepoRow | undefined;
        return row?.updated_at ?? null;
    }

    public hasRepoUpdated(repo: string, currentUpdatedAt: string): boolean {
        const stateUpdatedAt: string | null = this.getUpdatedAt(repo);
        if (stateUpdatedAt === null) {
            return true; // if repo doesnt exist, counts as update
        }
        return new Date(currentUpdatedAt).getTime() > new Date(stateUpdatedAt).getTime();
    }

}