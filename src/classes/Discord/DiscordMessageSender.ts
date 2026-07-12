import DiscordHeaderHandler from "./DiscordHeaderHandler.js";
import type {DiscordHeader} from "./types/DiscordHeader.type.js";
import type {TextMessages} from "./types/Messages.type.js";

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

    public async sendMessage(channelId: string, messageContent: string): Promise<unknown> {
        const response: Response = await fetch(this.buildUrl(channelId, false), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ content: messageContent })
        })
        if (!response.ok) {
            throw new Error(`sendMessage to channel ${channelId} with messageContent ${messageContent} failed: \n ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    public async createNewThread(channelId: string, threadTitle: string, threadContent: string): Promise<unknown> {
        const response: Response = await fetch(this.buildUrl(channelId, true), {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                name: threadTitle,
                message: {
                    content: threadContent
                }
            })
        });
        if (!response.ok) {
            throw new Error(`sendMessage to channel ${channelId} with threadContent ${threadContent} failed: \n ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

}