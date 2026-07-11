import fs from 'fs';
import path from "node:path";
import dotenv from 'dotenv';

dotenv.config();

export default class UpdateStateStore {
    private readonly storeDir: string;
    private readonly STORE_FILE_NAME: string;
    private readonly FORMAT_UPDATED_AT: string;
    private readonly fullPath: string;
    private readonly dateToCompareAgainst: string;

    constructor(dateToCompareAgainst: string) {
        this.storeDir = path.join(process.cwd(), "store")
        this.STORE_FILE_NAME = process.env.STORE_FILE_NAME!;
        this.FORMAT_UPDATED_AT = process.env.FORMAT_UPDATED_AT!;
        this.fullPath = path.join(this.storeDir, this.STORE_FILE_NAME);
        this.dateToCompareAgainst = dateToCompareAgainst;

    }

    private removeRedundantFiles(dir: string[]) {
        const keptEntries: string[] = [];

        for (let entry of dir) {
            const fullPath: string = path.join(this.storeDir, entry);
            if (entry !== this.STORE_FILE_NAME) {
                if (fs.existsSync(fullPath)) {
                    fs.rmSync(fullPath);
                }
                continue;
            }
            keptEntries.push(entry);
        }

        return keptEntries;
    }

    private readStoreDir() {
        if (!fs.existsSync(this.storeDir)) {
            console.error(`Could not find '${this.storeDir}'. Attempting to mkdirSync...\n`)
            try {
                fs.mkdirSync(this.storeDir);
            } catch (e) {
                throw new Error(`Could not mkdirSync '${this.storeDir}': ${e}`);
            }
        }
        const dir: string[] = fs.readdirSync(this.storeDir);

        return this.removeRedundantFiles(dir);
    }

    private readStoreFile() {
        const fullPath: string = path.join(this.storeDir, this.STORE_FILE_NAME);
        return fs.readFileSync(fullPath, "utf-8").trim();
    }

    private checkIfEntryValid(file: string): boolean {
        return file.length === this.FORMAT_UPDATED_AT.length;
    }

    private recreateStoreFile(dateString: string) {
        try {
            if (fs.existsSync(this.fullPath)) {
                fs.rmSync(this.fullPath);
            }
            fs.writeFileSync(this.fullPath, dateString);
        } catch (e) {
            throw new Error(`Could not fs.rmSync(${this.fullPath}: ${e}`);
        }
    }

    private transformStringToDate(file: string): Date {
        return new Date(file);
    }

    public init(): boolean {
        const storeDir: string[] = this.readStoreDir();
        const dateToCompareAgainst = new Date(this.dateToCompareAgainst).getTime();
        if (storeDir.length === 0) {
            this.recreateStoreFile(this.FORMAT_UPDATED_AT);
        }
        try {
            let file = this.readStoreFile();
            if (!this.checkIfEntryValid(file)) {
                this.recreateStoreFile(this.FORMAT_UPDATED_AT);
                file = this.readStoreFile();
                // then transform to date...
                const date: Date = this.transformStringToDate(file);
                // then compare and return true/false
                // true tells main to sendMessage()
                if (dateToCompareAgainst > date.getTime()) {
                    this.recreateStoreFile(this.dateToCompareAgainst);
                    return true;
                }
                return false;
            }
            // then transform to date...
            const date: Date = this.transformStringToDate(file);
            // then compare and return true/false
            // true tells main to sendMessage()
            if (dateToCompareAgainst > date.getTime()) {
                this.recreateStoreFile(this.dateToCompareAgainst);
                return true;
            }
            return false;
        } catch (e) {
            throw new Error(`Could not perform init(): ${e}`);
        }

    }
}