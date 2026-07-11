import type {AuthAttributes} from "./types/AuthAttributes.type.js";

export default class DiscordAuthHandler {
    private readonly discordApiVersion: string;
    private readonly discordBotToken: string;

    constructor(discordApiVersion: string, discordBotToken: string) {
        this.discordApiVersion = discordApiVersion;
        this.discordBotToken = discordBotToken;
    }

    public getAuthAttributes(): AuthAttributes {
        return {
            "discordApiVersion": this.discordApiVersion,
            "discordBotToken": this.discordBotToken,
        }
    }
}