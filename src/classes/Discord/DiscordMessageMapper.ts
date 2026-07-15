import type {TextMessages, ForumMessagesEmbedded} from "./types/Messages.type.js";

export default class DiscordMessageMapper {
    private readonly repoName: string;
    private readonly latestCommit: string;
    private readonly latestCommitLink: string;
    private readonly latestCommitAuthor: string;
    private readonly latestCommitMessage: string;

    constructor(repoName: string, latestCommit: string, latestCommitLink: string, latestCommitAuthor: string, latestCommitMessage: string) {
        this.repoName = repoName;
        this.latestCommit = latestCommit;
        this.latestCommitLink = latestCommitLink;
        this.latestCommitAuthor = latestCommitAuthor;
        this.latestCommitMessage = latestCommitMessage;

    }

    public mapTextMessages(): TextMessages {
        return {
            embeds: [{
                title: `${this.repoName} >> ${this.latestCommit.slice(0, 7)}`,
                url: this.latestCommitLink,
                description: `Commited by **${this.latestCommitAuthor}**`,
                color: 5814783,
                fields: [
                    {name: "Full Sha", value: `\`${this.latestCommit}\``, inline: true}
                ],
                timestamp: new Date().toISOString(),
            }],
        }
    }

    public mapForumEmbedded(): ForumMessagesEmbedded {
        return {
            embeds: [{
                title: `${this.repoName} >> ${this.latestCommit.slice(0, 7)}`,
                url: this.latestCommitLink,
                description: `Commited by **${this.latestCommitAuthor}**`,
                color: 5814783,
                fields: [
                    {name: "Full Sha", value: `\`${this.latestCommit}\``, inline: true},
                    {name: "Commit message", value:`\`\`\` ${this.latestCommitMessage} \`\`\` `, inline: true},
                ],
                timestamp: new Date().toISOString(),
            }],
        }
    }

}