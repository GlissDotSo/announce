https://gist.github.com/liamzebedee/57b81f7fd0d70d5bd5f04a16a361fd5e

# Anno Protocol.

Anno protocol tokenises attention and influence in social media. In doing so, we build a platform where fame derivatives are possible - and used to incentivise the network to self-discover and fund early and unknown artists.

## 1. Introduction.


### 1.1. Rebuilding the feed as a marketplace for attention.

Convert the feed into a marketplace for attention.
Every user has their own ATTENTION token which can be used to advertise posts to them.
Every user's feed consists of bids for a user's attention.
The feed algorithm ranks posts [like Reddit](https://medium.com/hacking-and-gonzo/how-reddit-ranking-algorithms-work-ef111e33d0d9) - a post's rank is a combined weighting of its age and the bid for ATTENTION (in Reddit this would be # of upvotes).

How is ATTENTION distributed?
Every user continually issues ATTENTION with the same fixed inflation rate for all users.
When a user follows a profile, they allocate a portion of their ATTENTION inflation to that profile, which is streamed (using the same tech as yield farming).
Recap: When a user follows a profile, they receive a continuous allocation of ATTENTION from you.
Thus, when that profile makes a post, they can use this to bid for that user's attention in their feed



### 1.2. Tokenising influence.

From getting more followers, we accrue influence - as we now have the ability to bid for their attention in their feeds.
The total set of all attention tokens that a user owns is referred to as their "influence".

This portfolio is represented as a "influence NFT" with special mechanics.
 1. It is fractional - eg. it is fungible like ERC20's
 2. The attention tokens in the portfolio can be sold.
 3. The selling of the attention tokens in the portfolio is streamable - e.g. like yield farming.




### 1.3. Fame Derivatives

What if there was a way to buy a derivative on a follower count? 
So if you discovered a content creator early, you could profit on their increase in followers aka influence.
We submit that fame = influence.

This could be implemented using attention-weighted feeds and influence NFT's.
- The influence NFT grants the holder access to attention tokens in its portfolio - both present and future.
- By selling a portion of your rights to "influence" in future, you can sell exposure to your fame. 

Let's design a fame derivative:
- parameters: the derivative entitles holder to X% of issuer’s influence for Y years.
- creation: X% of the influence NFT is transferred to the fame derivative contract. 
- claiming: 
    for the duration of Y years, the holder of the derivative NFT can claim the attention tokens held in the "influence NFT".
- settlement:
    after Y years, the contract returns the X% of influence NFT to the issuer.



### 1.4. Using fame derivatives to reward curators.

Now that we can get exposure to someone's fame, we can build user flows which reward curators in social networks.

Every user will automatically have a certain proportion (default 20%) of their "influence NFT" deposited on an AMM like Uniswap.

When a curator comes along and finds an unknown artist, that they believe will become very famous, they can buy this derivative. 

The unknown artist receives the proceeds of the sale, which they can use to fund their work. 

The artist now "makes it", and has 1M followers. Their influence NFT contains a portfolio of 1,000,000 different attention tokens.
The value of the influence NFT is sum of the price of each attention token in its portfolio multiplied by its balance of it.

The curator, who has bet early, claims the proceeds of their fame derivative. 
- For the first 2yrs, the artist accrued $1.2M of influence.
- This influence is the attention portfolio of over 1M followers.
- The curator calls FameDerivative.claim, and receives a set of 1M attention tokens.
- The curator places a sell order for these 1M tokens, and receives USDC in return.




# 2. Technical details

## Contracts.

 - Money streams. Superfluid or StakingRewards.sol for money streams
 - Attention - ERC1155.
 - AttentionInflation - module which handles inflation for attention.
 - InfluenceNFT - ERC1155.
 - FameDerivative - ERC1155.
 - Uniswap AMM for buying/selling fame.




## 3. Tokenomics, Staking, and Governance.

The protocol takes a fixed 5% on all attention issued and fame derivatives sold. These fees go to the protocol treasury.

Users can stake their attention to receive ANNO, the native governance token of the platform.

The governance token allows them to vote on the parameters of the protocol (fees).

The treasury is governed in part by the protocol. It is important for the network to grow and be well-managed by people with relevant competency.
We haven't yet decided on a model for governance. It will be similar to Synthetix's voting (quadratic weighting) and term periods.



## 4. Conclusion

In this whitepaper, we have redesigned the attention economy using web3. To do this, we have introduced several new primitives:

 * Attention tokens.
 * Feeds as attention marketplaces.
 * Fame derivatives.

The effects of this new design are manifold:

 * New mechanisms for rewarding curators.
 * New ways to design the feed.

