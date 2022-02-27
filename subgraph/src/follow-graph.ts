import { Entity, store } from "@graphprotocol/graph-ts";
import {
    FollowEdgeChanged
} from "../generated/FollowGraph/FollowGraph"
import { FollowingEdge, Profile } from "../generated/schema";

const DELETE = false
const CREATE = true
export function handleFollowEdgeChanged(event: FollowEdgeChanged): void {
    const fromProfileId = event.params.fromProfileId;
    const toProfileId = event.params.toProfileId;
    const deleteOrCreate = event.params.deleteOrCreate;

    let edgeId = ""
        .concat(fromProfileId.toString())
        .concat("_")
        .concat(toProfileId.toString());
    
    // 
    // TODO: refactor below into processFollow
    // 

    if (deleteOrCreate == DELETE) {
        if (store.get('FollowingEdge', edgeId)) {
            store.remove('FollowingEdge', edgeId);
        }

        // TODO: decrement somewhere.
        // TODO: proper null checks
        const fromProfile = Profile.load(fromProfileId.toString());
        if (fromProfile != null) {
            fromProfile.followingCount = fromProfile.followingCount - 1;
            fromProfile.save();
        }

        const toProfile = Profile.load(toProfileId.toString());
        if (toProfile != null) {
            toProfile.followersCount = toProfile.followersCount - 1;
            toProfile.save();
        }

        return;
    }


    // 
    // TODO: refactor below into processUnfollow
    // 

    let edge = FollowingEdge.load(edgeId);

    // TODO: Verify if Lens processes follows only once.
    if (edge == null) {

        edge = new FollowingEdge(edgeId);
        edge.from = fromProfileId.toString();
        edge.to = toProfileId.toString();
        edge.save();

        // TODO: decrement somewhere.
        // TODO: proper null checks
        const fromProfile = Profile.load(fromProfileId.toString());
        if (fromProfile != null) {
            fromProfile.followingCount = fromProfile.followingCount + 1;
            fromProfile.save();
        }

        const toProfile = Profile.load(toProfileId.toString());
        if (toProfile != null) {
            toProfile.followersCount = toProfile.followersCount + 1;
            toProfile.save();
        }

        verifyProfileExists(fromProfileId.toString());
        verifyProfileExists(toProfileId.toString());
    }
}

function processFollow(): void {}
function processUnfollow(): void {}

function verifyProfileExists(id: string): void {
    if (Profile.load(id) == null) {
        throw new Error("Profile doesn't exist");
    }
}
