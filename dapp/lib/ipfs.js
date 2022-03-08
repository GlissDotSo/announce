

const IPFSHttp = require('ipfs-http-client')
const { IPFS_NODE_URI } = require('../config')

function normaliseCID(cid) {
    return cid.asCID.toV1().toString()
}

let _ipfs
async function getIpfs() {
    if (!_ipfs) {
        _ipfs = await createIPFS()
    }
    return _ipfs
}

async function createIPFS() {
    // return await IPFSHttp.create(IPFS_NODE_URI)
    return await getProdIpfs()
}

async function getProdIpfs() {
    const IPFS_PROJECT_ID = '265OK2U0ndvPDw7RyOui6QfMyXz';
    const IPFS_PROJECT_SECRET = 'f232270d4d7437db1af5ce31b1775b80';
    const auth =
        'Basic ' + Buffer.from(IPFS_PROJECT_ID + ':' + IPFS_PROJECT_SECRET).toString('base64');
    
    const client = IPFSHttp.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });

    return client;
}


async function uploadToIpfs(bufferOrString) {
    const ipfs = await getIpfs()
    const { cid } = await ipfs.add(bufferOrString)
    console.debug('ipfs', 'add', cid)
    
    const ipfsUri = `ipfs:${normaliseCID(cid)}`
    console.debug(`https://ipfs.infura.io/ipfs/${cid}`)

    const res = await ipfs.pin.add(cid)
    console.debug('ipfs', 'pin', ipfsUri)

    return { ipfsUri, _cid: cid, cid: normaliseCID(cid) }
}

module.exports = {
    normaliseCID,
    uploadToIpfs
}