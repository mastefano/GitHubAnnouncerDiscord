import GithubAuthHandler from "./GithubAuthHandler.js";
import type {Octokit} from "octokit";
import type {OctokitResponse} from '@octokit/types';
import dotenv from 'dotenv';
dotenv.config();
// https://docs.github.com/de/rest/guides/scripting-with-the-rest-api-and-javascript?apiVersion=2026-03-10

export default class GithubRequestHandler {
    private readonly octokitConnectionHandler: GithubAuthHandler;
    private readonly owner: string;
    private readonly repo: string;

    constructor() {
        this.octokitConnectionHandler = new GithubAuthHandler();
        this.owner = process.env.GITHUB_USER!;
        this.repo = process.env.GITHUB_REPO!;
    }

    public async getRequest(): Promise<OctokitResponse<any>> {
        const octokit: Octokit = this.octokitConnectionHandler.authenticate();
        return await octokit.request(`GET /repos/{owner}/{repo}`, {
            owner: this.owner,
            repo: this.repo,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });
    }
}