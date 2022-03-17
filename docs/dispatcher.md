a meta-tx dispatcher architecture;


how this works


```
unlock the web3 provider
sign a piece of data
    Sign in with ethereum = I am this addy.  also here's a keypair client-side I just madeup. and timestamp/expiry.
send to server
verifies and links the two

instantiate the ethers MetaTxProvider
provider hooks sendTx
    it takes the tx, signs it using the session keypair
    it sends that tx to an API endpoint

API endpoint
    receives tx
    recovers pubkey from sig/msg
    matches pubkey to 
    executes meta-tx on the contract
        contract.execute(metatx)
            decode metatx
            verify siggy
            set msg.sender to recovered address
            execute siggy
    verify the keypair is linked to the actual address
```