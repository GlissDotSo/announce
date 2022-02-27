import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
    LensHub,
    PostCreated,
    ProfileCreated,
    ProfileCreatorWhitelisted,
    FollowModuleWhitelisted,
    ReferenceModuleWhitelisted,
    CollectModuleWhitelisted,
    DispatcherSet,
    ProfileImageURISet,
    FollowNFTURISet,
    FollowModuleSet,
    CommentCreated,
    MirrorCreated,
    FollowNFTDeployed
} from "../generated/LensHub/LensHub"
import { FeedCreated, PostToFeedCreated, FeedProfilePermissionsSet, Feed as FeedContract } from '../generated/Feed/Feed'
import { Comment, FeedAuthor, Post, FollowingEdge, Profile, SocialGraph, FollowNFT, FollowNFTContract as FollowNFTContractEntity, ProfileCreatorWhitelist, CollectModuleWhitelist, FollowModuleWhitelist, ReferenceModuleWhitelist, Mirror, User, Inbox, Feed, FeedPub } from "../generated/schema"
import { FollowNFT as FollowNFTContract } from '../generated/templates'
import { store } from '@graphprotocol/graph-ts'
import { ipfs } from '@graphprotocol/graph-ts'

const ONE = BigInt.fromI32(1);

export function handleProfileCreated(event: ProfileCreated): void {
    let lensContract = LensHub.bind(event.address);

    // Create a Profile.
    let entity = new Profile(event.params.profileId.toString());
    let profileData = lensContract.getProfile(event.params.profileId);

    entity.profileId = event.params.profileId;
    entity.creator = event.params.creator;
    entity.owner = event.params.to;
    entity.pubCount = profileData.pubCount;
    entity.followModule = profileData.followModule;
    // entity.followNFT = profileData.followNFT;
    entity.handle = profileData.handle.toString();
    entity.imageURI = profileData.imageURI.toString();
    entity.createdOn = event.params.timestamp;
    entity.followNFTURI = profileData.followNFTURI.toString();
    entity.followModuleReturnData = event.params.followModuleReturnData;
    entity.dispatcher = new Bytes(0x0000000000000000000000000000000000000000);
    entity.followersCount = 0;
    entity.followingCount = 0;
    entity.save();

    // Create a User for this profile.
    let user = new User(event.params.profileId.toString());

    let inbox = new Inbox(event.params.profileId.toString());
    inbox.user = user.id;
    inbox.save();

    user.inbox = inbox.id;
    user.profile = entity.id;
    user.save();
};

export function handleCommentCreated(event: CommentCreated): void {

    let entity = Comment.load(event.transaction.hash.toString());

    if (!entity) {
        entity = new Comment(event.transaction.hash.toString());

        entity.profileId = event.params.profileId;
        entity.pubId = event.params.pubId;
        entity.contentURI = event.params.contentURI.toString();
        entity.profileIdPointed = event.params.profileIdPointed;
        entity.pubIdPointed = event.params.pubIdPointed;
        entity.collectModule = event.params.collectModule;
        entity.collectModuleReturnData = event.params.collectModuleReturnData;
        entity.referenceModule = event.params.referenceModule;
        entity.referenceModuleReturnData = event.params.referenceModuleReturnData;
        entity.timestamp = event.params.timestamp;
        entity.save();
    }

};

export function handleMirrorCreated(event: MirrorCreated): void {

    let entity = Mirror.load(event.transaction.hash.toString());

    if (!entity) {
        entity = new Mirror(event.transaction.hash.toString());

        entity.profileId = event.params.profileId;
        entity.pubId = event.params.pubId;
        entity.profileIdPointed = event.params.profileIdPointed;
        entity.pubIdPointed = event.params.pubIdPointed;
        entity.referenceModule = event.params.referenceModule;
        entity.referenceModuleReturnData = event.params.referenceModuleReturnData;
        entity.timestamp = event.params.timestamp;
        entity.save();
    }

};

export function handleFollowNFTDeployed(event: FollowNFTDeployed): void {
    let profileId = event.params.profileId;
    let followNFTAddress = event.params.followNFT;
    let timestamp = event.params.timestamp;

    let followNFT = FollowNFTContractEntity.load(followNFTAddress.toHexString());

    if(!followNFT) {
        followNFT = new FollowNFTContractEntity(followNFTAddress.toHexString());
        let profile = Profile.load(profileId.toString());
        if (!profile) {
            throw new Error("Profile not found")
        }
        followNFT.profile = profile.id;
        followNFT.deployedAt = timestamp;
        followNFT.address = followNFTAddress;
        followNFT.save();

        // Start tracking the Follow NFT contract.
        FollowNFTContract.create(followNFTAddress);
    }
}

import { log } from '@graphprotocol/graph-ts'

// export function handleFollowed(event: Followed): void {
    // // We don't care about follows from Ethereum accounts. Only profiles.
    // if (event.params.followedFromProfileIds.length == 0) {
    //     log.info('Ignoring Followed event since it contains no profile metadata', []);
    //     return;
    // }

    // const fromProfileIds = event.params.followedFromProfileIds;
    // const toProfileIds = event.params.profileIds;

    // // Update the following array.
    // for (let i = 0; i < fromProfileIds.length; i++) {
    //     const fromProfileId = fromProfileIds[i];
        
    //     for (let j = 0; j < toProfileIds.length; j++) {
    //         const toProfileId = toProfileIds[j];
    //         let edgeId = ""
    //             .concat(fromProfileId.toString())
    //             .concat("_")
    //             .concat(toProfileId.toString());
            
    //         let edge = FollowingEdge.load(edgeId);

    //         // TODO: Verify if Lens processes follows only once.
    //         if (edge == null) {

    //             edge = new FollowingEdge(edgeId);
    //             edge.from = fromProfileId.toString();
    //             edge.to = toProfileId.toString();
    //             edge.save();

    //             // TODO: decrement somewhere.
    //             // TODO: proper null checks
    //             const fromProfile = Profile.load(fromProfileId.toString());
    //             if (fromProfile != null) {
    //                 fromProfile.followingCount = fromProfile.followingCount + 1;
    //                 fromProfile.save();
    //             }

    //             const toProfile = Profile.load(toProfileId.toString());
    //             if (toProfile != null) {
    //                 toProfile.followersCount = toProfile.followersCount + 1;
    //                 toProfile.save();
    //             }

    //             verifyProfileExists(fromProfileId.toString());
    //             verifyProfileExists(toProfileId.toString());
    //         }
    //     }
    // }
// };

function verifyProfileExists(id: string): void {
    if(Profile.load(id) == null) {
        throw new Error("Profile doesn't exist");
    }
}

export function handlePostCreated(event: PostCreated): void {

    const postId = getPostId(event.params.profileId, event.params.pubId);
    let entity = Post.load(postId);

    if (!entity) {
        let entity = new Post(postId);

        entity.pubId = event.params.pubId;
        entity.profileId = event.params.profileId.toString();
        entity.contentURI = event.params.contentURI;

        log.info("contentURI {}", [event.params.contentURI]);
        if (entity.contentURI && entity.contentURI.startsWith('ipfs:')) {
            const ipfsContent = ipfs.cat(entity.contentURI.split('ipfs:')[1]);
            if (ipfsContent) {
                entity.content = ipfsContent.toString();
            } else {
                log.warning("missing ipfs content for pub {}", [entity.pubId.toString()]);
            }
        }
        
        entity.collectModule = event.params.collectModule;
        entity.collectModuleReturnData = event.params.collectModuleReturnData;
        entity.referenceModule = event.params.referenceModule;
        entity.referenceModuleReturnData = event.params.referenceModuleReturnData;
        entity.timestamp = event.params.timestamp;

        entity.save();

        // Profile
        const profile = Profile.load(event.params.profileId.toString());
        if(!profile) {
        } else {
            profile.pubCount = profile.pubCount.plus(ONE);
            profile.save();
        }
    }
};

export function handleFeedCreated(event: FeedCreated): void {
    let feed = new Feed(event.params.feedId.toString())
    feed.profile = event.params.profileId.toString();
    feed.owner = event.params.owner;
    feed.feedId = event.params.feedId;

    const feedContract = FeedContract.bind(event.address);
    const data = feedContract.getFeedData(feed.feedId);
    feed.name = data.value0;
    feed.owner = data.value1;

    feed.save();
}

export function handleFeedProfilePermissionsSet(event: FeedProfilePermissionsSet): void {
    let feed = new Feed(event.params.feedId.toString());

    const profileId = event.params.profileId;
    const feedAuthorId = ""
        .concat(feed.feedId.toString())
        .concat("_")
        .concat(profileId.toString());
    
    if(event.params.createPost == true) {
        const feedAuthor = new FeedAuthor(feedAuthorId);
        feedAuthor.profile = profileId.toString();
        feedAuthor.feed = feed.id.toString();
        feedAuthor.save();
    } else {
        // TODO: this might catch an error which we don't want to, and invalidate the whole store.
        if (store.get('FeedAuthor', feedAuthorId)) {
            store.remove('FeedAuthor', feedAuthorId);
        }

        // AS100: Not implemented: Exceptions
        // try {    
        // } catch(ex) {}
    }
}

function getPostId(authorId: BigInt, pubId: BigInt): string {
    return ""
        .concat(authorId.toString())
        .concat("_")
        .concat(pubId.toString())
}

export function handlePostToFeedCreated(event: PostToFeedCreated): void {
    let feed = Feed.load(event.params.feedId.toString());
    if (!feed) throw new Error("No feed found for profile")
    
    const feedPub = new FeedPub(
        ""
        .concat(feed.id)
        .concat("_")
        .concat(event.params.pubId.toString())
    );
    feedPub.author = event.params.authorProfileId.toString();
    feedPub.createdAt = event.block.timestamp;
    feedPub.feed = feed.id;
    feedPub.pub = getPostId(event.params.profileId, event.params.pubId);
    feedPub.save();
}

// function distributePostToFollowers(feed: Feed, feedPub: FeedPub): void {
//     const feedProfile = Profile.load(feed.profile);
//     if (!feedProfile) throw new Error("No profile found for feed")

//     log.info("feed.profile {}", [feed.profile]);

//     // Get followers of feed.
//     // HACK because the graph sucks and can't query computed views from inside mappings,
//     // despite the fact they're deterministic.

//     const followers = feedProfile.followers;
//     if(!followers) {
//         log.warning("No followers for feed profile {}", [ feedProfile.profileId.toString() ]);
//     }

//     for (let i = 0; i < followers.length; i++) {
//         let inbox = Inbox.load(followers[i]);
//         if (!inbox) throw new Error("No inbox found for profile")

//         let inboxItem = new InboxItem(
//             ""
//                 .concat(followers[i])
//                 .concat("_")
//                 .concat(feedPub.id.toString())
//         );

//         inboxItem.inbox = inbox.id;
//         inboxItem.item = feedPub.id;
//         inboxItem.save();
//     }
// }

export function handleProfileCreatorWhitelisted(event: ProfileCreatorWhitelisted): void {

    let entity = ProfileCreatorWhitelist.load(event.params.profileCreator.toHexString());

    if (!entity) {
        let entity = new ProfileCreatorWhitelist(event.params.profileCreator.toHexString());
        entity.isWhitelisted = event.params.whitelisted;
        entity.lastUpdated = event.params.timestamp;
        entity.save();
    }
    else {
        entity.isWhitelisted = event.params.whitelisted;
        entity.lastUpdated = event.params.timestamp;
        entity.save();
    }

};

export function handleFollowModuleWhitelisted(event: FollowModuleWhitelisted): void {

    let entity = FollowModuleWhitelist.load(event.params.followModule.toHexString());

    if (!entity) {
        let entity = new FollowModuleWhitelist(event.params.followModule.toHexString());
        entity.isWhitelisted = event.params.whitelisted;
        entity.lastUpdated = event.params.timestamp;
        entity.save();
    }
    else {
        entity.isWhitelisted = event.params.whitelisted;
        entity.lastUpdated = event.params.timestamp;
        entity.save();
    }

};

export function handleReferenceModuleWhitelisted(event: ReferenceModuleWhitelisted): void {

    let entity = ReferenceModuleWhitelist.load(event.params.referenceModule.toHexString());

    if (!entity) {
        let entity = new ReferenceModuleWhitelist(event.params.referenceModule.toHexString());
        entity.isWhitelisted = event.params.whitelisted;
        entity.lastUpdated = event.params.timestamp;
        entity.save();
    }
    else {
        entity.isWhitelisted = event.params.whitelisted;
        entity.lastUpdated = event.params.timestamp;
        entity.save();
    }

};

export function handleCollectModuleWhitelisted(event: CollectModuleWhitelisted): void {

    let entity = CollectModuleWhitelist.load(event.params.collectModule.toHexString());

    if (!entity) {
        let entity = new CollectModuleWhitelist(event.params.collectModule.toHexString());
        entity.isWhitelisted = event.params.whitelisted;
        entity.lastUpdated = event.params.timestamp;
        entity.save();
    }
    else {
        entity.isWhitelisted = event.params.whitelisted;
        entity.lastUpdated = event.params.timestamp;
        entity.save();
    }

};

export function handleDispatcherSet(event: DispatcherSet): void {

    let entity = Profile.load(event.params.profileId.toString());

    if (entity) {
        entity.dispatcher = event.params.dispatcher;
        entity.save();
    }

};

export function handleProfileImageURISet(event: ProfileImageURISet): void {

    let entity = Profile.load(event.params.profileId.toString());

    if (entity) {
        entity.imageURI = event.params.imageURI;
        entity.save();
    }

};

export function handleFollowNFTURISet(event: FollowNFTURISet): void {

    let entity = Profile.load(event.params.profileId.toString());

    if (entity) {
        entity.followNFTURI = event.params.followNFTURI;
        entity.save();
    }

};

export function handleFollowModuleSet(event: FollowModuleSet): void {

    let entity = Profile.load(event.params.profileId.toString());

    if (entity) {
        entity.followModule = event.params.followModule;
        entity.followModuleReturnData = event.params.followModuleReturnData;
        entity.save();
    }

};