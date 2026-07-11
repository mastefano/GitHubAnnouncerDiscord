import GithubRequestHandler from "./classes/GitHub/GithubRequestHandler.js";
import type {OctokitResponse} from "@octokit/types";
import DiscordMessageSender from "./classes/Discord/DiscordMessageSender.js";
import UpdateStateStore from "./classes/Internal/UpdateStateStore.js";
const requestHandler = new GithubRequestHandler();

const discordMessageSender = new DiscordMessageSender();

function getMessageText(repo: string): string {
    return `UPDATE! ${repo} got updated!`;
}
let isCurrentlyRunning: boolean = false;
async function main() {
    if (isCurrentlyRunning) {
        console.log("Service is currently still executing, skipping...");
    }

    isCurrentlyRunning = true;

    try {
        const getRequest: OctokitResponse<any> = await requestHandler.getRequest();
        const updatedAt = getRequest.data.updated_at;
        const updateStateStore = new UpdateStateStore(updatedAt);
        if (updateStateStore.init()) {
            await discordMessageSender.sendMessage("1525496492264001566", getMessageText(getRequest.data.html_url));
        }
    } catch (e) {
        console.error(`Error in loop: ${e}`);
    } finally {
        isCurrentlyRunning = false;
    }
    // console.log(getRequest);
}

setInterval(() => {
    main().catch(console.error);
}, 30_000)