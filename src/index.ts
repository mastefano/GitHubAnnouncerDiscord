import GithubRequestHandler from "./classes/GitHub/GithubRequestHandler.js";
import type {OctokitResponse} from "@octokit/types";
import DiscordMessageSender from "./classes/Discord/DiscordMessageSender.js";
import EnvValidator from "./classes/Internal/EnvValidator.js";
import DatabaseHandler from "./classes/Database/DatabaseHandler.js";
import TableHandler from "./classes/Database/TableHandler.js";
import dotenv from 'dotenv';
import Database from "better-sqlite3";

dotenv.config();


const envValidator: EnvValidator = new EnvValidator();

if (envValidator.validate()) {

    const requestHandler = new GithubRequestHandler();

    const discordMessageSender = new DiscordMessageSender();

    function getMessageText(repo: string): string {
        return `UPDATE! ${repo} got updated!`;
    }

    function getThreadText(repo: string, commitSha: string, commitLink: string, author: string): {ThreadTitle: string; ThreadContent: string;} {
        const formatCommitSha: string = `\`${commitSha}\``;
        const formatCommitAuthor: string = `**${author}**`;
        return {
            "ThreadTitle": `${repo} -> ${commitSha} Discussion`,
            "ThreadContent": `Full commit sha: ${formatCommitSha}\nCommit link: ${commitLink}\nAuthor: ${formatCommitAuthor}`
        };
    }
    console.log("GitHubAnnouncer started... ");

    const databaseHandler: DatabaseHandler = new DatabaseHandler(process.env.DB_TABLE_NAME!);
    let runCount: number = 0;
    let isCurrentlyRunning: boolean = false;

    async function main(): Promise<void> {
        if (runCount !== 0) {
            console.log(`[Run ${runCount}] -> Checking...`)
        }
        if (isCurrentlyRunning) {
            console.log("Service is currently still executing, skipping...");
            return;
        }

        isCurrentlyRunning = true;

        try {
            // General data
            const getRequest: OctokitResponse<any> = await requestHandler.getGeneralData();
            const repoName: string = getRequest.data.full_name;
            const updatedAt: string = getRequest.data.updated_at;

            // Commit data
            const getCommits: OctokitResponse<any> = await requestHandler.getLatestCommit();
            const latestCommit: string = getCommits.data[0].sha;
            const latestCommitLink: string = getCommits.data[0].html_url;
            const latestCommitAuthor: string = getCommits.data[0].commit.author.name;

            //SQLite3
            const db: Database.Database = databaseHandler.getConnection();
            const columns: string[] = [
                "repo",
                "updated_at"
            ];
            const tableHandler: TableHandler = new TableHandler(db, process.env.DB_TABLE_NAME!, columns);

            if (tableHandler.hasRepoUpdated(process.env.GITHUB_REPO!, updatedAt)) {
                console.log(`Found new commit, sending new message to ${process.env.DISCORD_TEXT_CHANNEL!} and creating new thread in ${process.env.DISCORD_FORUM_CHANNEL!}.`);
                // Insert new date into database
                tableHandler.upsert(process.env.GITHUB_REPO!, updatedAt);
                const threadText =
                    getThreadText(repoName, latestCommit.slice(0,7), latestCommitLink, latestCommitAuthor);

                await discordMessageSender.sendMessage(process.env.DISCORD_TEXT_CHANNEL!, getMessageText(repoName));
                await discordMessageSender.createNewThread(process.env.DISCORD_FORUM_CHANNEL!, threadText["ThreadTitle"], threadText["ThreadContent"]);
                console.log(`Successfully sent new message and thread to ${process.env.DISCORD_TEXT_CHANNEL!}/${process.env.DISCORD_FORUM_CHANNEL!} respectively.`)
            }
        } catch (e) {
            console.error(`Error in loop: ${e}`);
        } finally {
            isCurrentlyRunning = false;
            runCount++;
        }
    }

    main();

    setInterval(() => {
        main().catch(console.error);
    }, (Number(process.env.CHECK_FREQUENCY_IN_MINUTES) * 60) * 1000)
}