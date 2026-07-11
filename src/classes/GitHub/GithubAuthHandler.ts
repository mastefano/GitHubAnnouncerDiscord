import {Octokit} from "octokit";

export default class GithubAuthHandler {
    private readonly authToken: string;

    constructor() {
        this.authToken = process.env.GITHUB_AUTH_TOKEN ?? '';
    }

    public authenticate(): Octokit {
        return new Octokit({
            auth: this.authToken,
        });
    }
}