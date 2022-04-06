a meta-tx dispatcher architecture;


how this works


```
unlock the web3 provider
sign a piece of data
    Sign in with ethereum = I am this addy.  also here's a pubkey client-side I just madeup. and timestamp/expiry.

instantiate the ethers MetaTxProvider
provider hooks sendTx
    it takes the tx, signs it using the session keypair
    it sends that tx to an API endpoint

API endpoint
    receives tx
    recovers pubkey from sig/msg
    verifies sig is signed by pubkey
    executes meta-tx on the contract
        contract.execute(metatx)
            decode metatx
            verify siggy
            set msg.sender to recovered address
            execute siggy
    verify the keypair is linked to the actual address
```