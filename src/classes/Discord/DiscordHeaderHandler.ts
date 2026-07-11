import type {DiscordHeader} from "./types/DiscordHeader.type.js";

export default class DiscordHeaderHandler {
    private readonly discordBotToken: string;

    constructor() {
        this.discordBotToken = process.env.DISCORD_BOT_TOKEN!;
    }

    public getHeader(): DiscordHeader {
        return {
            "Authorization": `Bot ${this.discordBotToken}`,
            "Content-Type": "application/json"
        }
    }
}