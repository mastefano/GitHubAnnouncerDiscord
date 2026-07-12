import type {OctokitResponse} from "@octokit/types";
import type {MapGeneralDataResponse, MapCommitDataResponse} from "./types/MapDataResponse.type.js";
export default class GithubResponseMapper {
    // map general data
    public mapGeneralData(response: OctokitResponse<any>): MapGeneralDataResponse {
        return {
            "repoName": response.data.full_name,
            "updatedAt": response.data.updated_at
        }
    }
    // map commit data
    public mapCommitData(response: OctokitResponse<any>): MapCommitDataResponse {
        return {
            "latestCommit": response.data[0].sha,
            "latestCommitLink": response.data[0].html_url,
            "latestCommitAuthor": response.data[0].commit.author.name,
        }
    }
}

