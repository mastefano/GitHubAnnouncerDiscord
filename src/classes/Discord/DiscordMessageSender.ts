import DiscordAuthHandler from "./DiscordAuthHandler.js";
import dotenv from 'dotenv';
dotenv.config();

// console.log(discordAuthHandler.getAuthAttributes(discordBaseUrl));

export default class DiscordMessageSender {
    private readonly discordBaseUrl: string;
    private readonly discordApiVersion: string;
    private readonly discordBotToken: string;

    constructor() {
        this.discordBaseUrl = process.env.DISCORD_BASE_URL ?? '';
        this.discordApiVersion = process.env.DISCORD_API_VERSION ?? '';
        this.discordBotToken = process.env.DISCORD_BOT_TOKEN ?? '';
    }

    public async sendMessage(channelId: string, messageContent: string) {
        const builtUrl: string = `${this.discordBaseUrl}${this.discordApiVersion}/channels/${channelId}/messages`
        const response: Response = await fetch(builtUrl, {
            method: 'POST',
            headers: {
                "Authorization": `Bot ${this.discordBotToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: messageContent })
        })
        if (!response.ok) {
            throw new Error(`sendMessage to channel ${channelId} with messageContent ${messageContent} failed: \n ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

}