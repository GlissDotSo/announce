import { Entity, store, BigInt } from "@graphprotocol/graph-ts";
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

    if (deleteOrCreate == DELETE) {
        processUnfollow(fromProfileId, toProfileId);
    } else if(deleteOrCreate == CREATE) {
        processFollow(fromProfileId, toProfileId);
    }
}

function getFollowEdgeId(fromProfileId: BigInt, toProfileId: BigInt): string {
    let edgeId = ""
        .concat(fromProfileId.toString())
        .concat("_")
        .concat(toProfileId.toString());
    return edgeId;
}

function processFollow(fromProfileId: BigInt, toProfileId: BigInt): void {
    const edgeId = getFollowEdgeId(fromProfileId, toProfileId);
    let edge = FollowingEdge.load(edgeId);

    if (edge == null) {

        edge = new FollowingEdge(edgeId);
        edge.from = fromProfileId.toString();
        edge.to = toProfileId.toString();
        edge.save();

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

function processUnfollow(fromProfileId: BigInt, toProfileId: BigInt): void {
    const edgeId = getFollowEdgeId(fromProfileId, toProfileId);

    if (store.get('FollowingEdge', edgeId)) {
        store.remove('FollowingEdge', edgeId);
    }

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
}

function verifyProfileExists(id: string): void {
    if (Profile.load(id) == null) {
        throw new Error("Profile doesn't exist");
    }
}
