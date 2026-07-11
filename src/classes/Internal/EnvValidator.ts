export default class EnvValidator {
    private static readonly REQUIRED_VARS: string[] = [
        "GITHUB_AUTH_TOKEN",
        "DISCORD_BASE_URL",
        "DISCORD_API_VERSION",
        "DISCORD_APP_ID",
        "DISCORD_PUBLIC_KEY",
        "DISCORD_BOT_TOKEN",
        "DISCORD_TEXT_CHANNEL",
        "DISCORD_FORUM_CHANNEL",
        "CHECK_FREQUENCY_IN_MINUTES",
        "DB_TABLE_NAME",
        "GITHUB_USER",
        "GITHUB_REPO"
    ];

    public validate(): boolean {
        const missing: string[] = EnvValidator.REQUIRED_VARS.filter(
            (key) => !process.env[key] || process.env[key]!.trim().length === 0
        );

        if (missing.length > 0) {
            throw new Error(
                `Missing required environment variables: ${missing.join(", ")}. Check your .env and set them properly.`
            );
        }

        return true;
    }
}