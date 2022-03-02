// Environment variables.

const ANNONCE_SUBGRAPH_URL = process.env.NEXT_PUBLIC_ANNONCE_SUBGRAPH_URL
const IPFS_NODE_URI = process.env.NEXT_PUBLIC_IPFS_NODE_URI

Object.entries({ ANNONCE_SUBGRAPH_URL, IPFS_NODE_URI }).map(([ k, v ]) => {
    if(!v) throw new Error(`Environment variable ${k} not defined`)
})

const deployments = {
    'localhost': require('../../deployments/localhost/anno.json'),
    // 'polygon-mainnet': require('../../deployments/polygon-mainnet.json')
}

const lensAddresses = {
    'localhost': require('../../deployments/localhost/lens-addresses.json'),
    // 'polygon-mainnet': require('../../deployments/polygon-mainnet.json')
}

export {
    ANNONCE_SUBGRAPH_URL, 
    IPFS_NODE_URI,
    deployments,
    lensAddresses
}