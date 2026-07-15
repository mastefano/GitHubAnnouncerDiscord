import DiscordHeaderHandler from "./DiscordHeaderHandler.js";
import type {DiscordHeader} from "./types/DiscordHeader.type.js";
import type {ForumMessagesEmbedded, TextMessages} from "./types/Messages.type.js";

export default class DiscordMessageSender {
    private readonly discordBaseUrl: string;
    private readonly discordApiVersion: string;
    private readonly discordHeaderHandler: DiscordHeaderHandler;
    private readonly headers: DiscordHeader;

    constructor() {
        this.discordBaseUrl = process.env.DISCORD_BASE_URL ?? '';
        this.discordApiVersion = process.env.DISCORD_API_VERSION ?? '';
        this.discordHeaderHandler = new DiscordHeaderHandler();
        this.headers = this.discordHeaderHandler.getHeader();
    }

    private buildUrl(channelId: string, isThread: boolean): string {
        return `${this.discordBaseUrl}${this.discordApiVersion}/channels/${channelId}/${isThread ? "threads" : "messages"}`;
    }

    public async sendMessage(channelId: string, embedData: TextMessages): Promise<unknown> {
        const response: Response = await fetch(this.buildUrl(channelId, false), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                embeds: embedData.embeds,
            })
        })
        if (!response.ok) {
            throw new Error(`sendMessage to channel ${channelId} with messageContent ${JSON.stringify(embedData.embeds)} failed: \n ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    public async createNewThreadWithEmbed(channelId: string, threadTitle: string, embedData: ForumMessagesEmbedded): Promise<unknown> {
        const response: Response = await fetch(this.buildUrl(channelId, true), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                name: threadTitle,
                message: {
                    embeds: embedData.embeds,
                }
            })
        })
        if (!response.ok) {
            throw new Error(`createNewThreadWithEmbed to channel ${channelId} with 
            threadContent ${JSON.stringify(embedData.embeds)} failed: \n ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

}