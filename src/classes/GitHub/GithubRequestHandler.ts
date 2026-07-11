import GithubAuthHandler from "./GithubAuthHandler.js";
import type {Octokit} from "octokit";
import type {OctokitResponse} from '@octokit/types';

export default class GithubRequestHandler {
    private readonly octokitConnectionHandler: GithubAuthHandler;
    private readonly octokit: Octokit;
    private readonly owner: string;
    private readonly repo: string;

    constructor() {
        this.octokitConnectionHandler = new GithubAuthHandler();
        this.octokit = this.octokitConnectionHandler.authenticate();
        this.owner = process.env.GITHUB_USER!;
        this.repo = process.env.GITHUB_REPO!;
    }

    public async getGeneralData(): Promise<OctokitResponse<any>> {
        return await this.octokit.request(`GET /repos/{owner}/{repo}`, {
            owner: this.owner,
            repo: this.repo,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });
    }

    public async getLatestCommit(): Promise<OctokitResponse<any>> {
        return await this.octokit.request(`GET /repos/{owner}/{repo}/commits`, {
            owner: this.owner,
            repo: this.repo,
            per_page: 1,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        })
    }
}