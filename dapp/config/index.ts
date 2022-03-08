// Environment variables.

import { Deployments } from '../../lens-protocol/tasks/helpers/deployments'

const ANNONCE_SUBGRAPH_URL = process.env.NEXT_PUBLIC_ANNONCE_SUBGRAPH_URL
const IPFS_NODE_URI = process.env.NEXT_PUBLIC_IPFS_NODE_URI

Object.entries({ ANNONCE_SUBGRAPH_URL, IPFS_NODE_URI }).map(([ k, v ]) => {
    if(!v) throw new Error(`Environment variable NEXT_PUBLIC_${k} not defined`)
})

const deployments: Record<string, Deployments> = {
    'localhost': require('../../deployments/localhost/anno.json'),
    'mumbai': require('../../deployments/mumbai/anno.json')
}

const lensAddresses: Record<string, any> = {
    'localhost': require('../../deployments/localhost/lens-addresses.json'),
    'mumbai': require('../../deployments/mumbai/lens-addresses.json')
}

export {
    ANNONCE_SUBGRAPH_URL, 
    IPFS_NODE_URI,
    deployments,
    lensAddresses
}