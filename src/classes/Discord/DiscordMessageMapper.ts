import type {TextMessages, ForumMessages} from "./types/Messages.type.js";
import type {StrFormat} from "./types/StrFormat.type.js";

export default class DiscordMessageMapper {
    private readonly repoName: string;
    private readonly latestCommit: string;
    private readonly latestCommitLink: string;
    private readonly latestCommitAuthor: string;

    constructor(repoName: string, latestCommit: string, latestCommitLink: string, latestCommitAuthor: string) {
        this.repoName = repoName;
        this.latestCommit = latestCommit;
        this.latestCommitLink = latestCommitLink;
        this.latestCommitAuthor = latestCommitAuthor;
    }

    private formatStr(str: string): StrFormat {
        return {
            "Bold": `**${str}**`,
            "Codequote": `\`${str}\``,
        }
    }

    public mapTextMessages(): TextMessages {
        return {
            "TextMessageContent": `UPDATE! ${this.repoName} got updated by ${this.latestCommitAuthor}. Created new Thread for discussion!`
        }
    }

    public mapForumMessages(): ForumMessages {
        return {
            "ThreadTitle": `${this.repoName} -> ${this.latestCommit.slice(0, 7)} Discussion`,
            "ThreadContent":
                `Full commit sha: ${this.formatStr(this.latestCommit).Codequote}\nCommit link: ${this.latestCommitLink}\nAuthor: ${this.formatStr(this.latestCommitAuthor).Bold}`
        }
    }

}