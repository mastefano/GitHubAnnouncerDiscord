import GithubRequestHandler from "../GitHub/GithubRequestHandler.js";
import GithubResponseMapper from "../GitHub/GithubResponseMapper.js";
import DatabaseHandler from "../Database/DatabaseHandler.js";
import TableHandler from "../Database/TableHandler.js";
import DiscordMessageMapper from "../Discord/DiscordMessageMapper.js";
import DiscordMessageSender from "../Discord/DiscordMessageSender.js";
import type {OctokitResponse} from "@octokit/types";
import type {MapCommitDataResponse, MapGeneralDataResponse} from "../GitHub/types/MapDataResponse.type.js";
import type {ForumMessages} from "../Discord/types/Messages.type.js";

export default class Announcer {
    private readonly requestHandler: GithubRequestHandler;
    private readonly discordMessageSender: DiscordMessageSender;
    private readonly databaseHandler: DatabaseHandler;
    private readonly tableHandler: TableHandler;
    private runCount: number = 0;
    private isCurrentlyRunning: boolean = false;

    constructor() {
        this.requestHandler = new GithubRequestHandler();
        this.discordMessageSender = new DiscordMessageSender();
        this.databaseHandler = new DatabaseHandler(process.env.DB_TABLE_NAME!);
        this.tableHandler = new TableHandler(this.databaseHandler.getConnection(), process.env.DB_TABLE_NAME!, ["repo", "updated_at"]);
    }

    public async run(): Promise<void> {
        console.log("GitHubAnnouncer started... ");

        // ENTRY POINT
        if (this.runCount !== 0) {
            console.log(`[Run ${this.runCount}] -> Checking...`)
        }
        if (this.isCurrentlyRunning) {
            console.log("Service is currently still executing, skipping...");
            return;
        }

        this.isCurrentlyRunning = true;

        try {
            const githubResponseMapper: GithubResponseMapper = new GithubResponseMapper();
            // General data
            const getRequest: OctokitResponse<any> = await this.requestHandler.getGeneralData();
            const generalData: MapGeneralDataResponse = githubResponseMapper.mapGeneralData(getRequest);

            // Commit data
            const getCommits: OctokitResponse<any> = await this.requestHandler.getLatestCommit();
            const commitData: MapCommitDataResponse = githubResponseMapper.mapCommitData(getCommits);

            // Map messages
            const discordMessageMapper: DiscordMessageMapper =
                new DiscordMessageMapper(generalData.repoName,
                    commitData.latestCommit, commitData.latestCommitLink,
                    commitData.latestCommitAuthor)

            const forumMessage: ForumMessages = discordMessageMapper.mapForumMessages();

            if (this.tableHandler.hasRepoUpdated(process.env.GITHUB_REPO!, generalData["updatedAt"])) {
                console.log(`Found new commit, sending new message to ${process.env.DISCORD_TEXT_CHANNEL!} and creating new thread in ${process.env.DISCORD_FORUM_CHANNEL!}.`);

                // Insert new date into database
                this.tableHandler.upsert(process.env.GITHUB_REPO!, generalData["updatedAt"]);

                // Send messages
                await this.discordMessageSender.sendMessage(process.env.DISCORD_TEXT_CHANNEL!, discordMessageMapper.mapTextMessages().TextMessageContent);
                await this.discordMessageSender.createNewThread(
                    process.env.DISCORD_FORUM_CHANNEL!,
                    forumMessage.ThreadTitle,
                    forumMessage.ThreadContent
                );
                console.log(`Successfully sent new message and thread to ${process.env.DISCORD_TEXT_CHANNEL!}/${process.env.DISCORD_FORUM_CHANNEL!} respectively.`)
            }
        } catch (e) {
            console.error(`Error in loop: ${e}`);
        } finally {
            this.isCurrentlyRunning = false;
            this.runCount++;
        }
    }

    public start(intervalMinutes: number): void {
        this.run().catch(console.error);
        setInterval(() => {
            this.run().catch(console.error);
        }, intervalMinutes * 60 * 1000);
    }
}