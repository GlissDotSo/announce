import '@nomiclabs/hardhat-ethers';
import { ethers } from 'ethers';
import fs from 'fs';
import { join } from 'path';

// TODO: import this dynamically from somewhere
const contracts = [
    'LensHubImpl',
    'LensHubProxy',
    'FeedProxy',
    'FollowGraph'
] as const

export type DeployedContractNames = typeof contracts[number];

export interface Deployments {
    // TODO: ContractDeployment may still be undefined? 
    contracts: Record<DeployedContractNames, ContractDeployment>
}

export interface ContractDeployment {
    address: string
    txHash?: string
    abi: any[]
    deployTransaction: ContractDeployTransaction
}

export interface ContractDeployTransaction {
    blockHash: string
    blockNumber: number
    transactionHash: string
}

export interface DeploymentContext {
    deploymentsDir: string
    deploymentFilePath: string
    deployments: Deployments
    provider: ethers.providers.Provider,
    getAddress: Function
}

type LensDeployments = Record<string, {
    address: string
    txHash: string
}>

export function loadLensDeployment(network: string) {
    const deploymentFolderPath = join(__dirname, `../../../deployments/${network}/`)
    if (!fs.existsSync(deploymentFolderPath)) fs.mkdirSync(deploymentFolderPath)

    const deploymentFilePath = join(deploymentFolderPath, `/lens-addresses.json`)

    const deployments = require(deploymentFilePath) as LensDeployments

    const getAddress = (name: string) => {
        const contract = deployments[name]
        if (!contract) throw new Error(`Deployment for ${name} not found`)
        return contract.address
    }

    return {
        deploymentsDir: deploymentFolderPath,
        deploymentFilePath: deploymentFilePath,
        deployments,
        getAddress
    }
}

export function loadDeploymentCtx({ network, project, provider }: { network: string, project: string, provider: ethers.providers.Provider }): DeploymentContext {
    const deploymentFolderPath = join(__dirname, `../../../deployments/${network}/`)
    if (!fs.existsSync(deploymentFolderPath)) fs.mkdirSync(deploymentFolderPath)

    const deploymentFilePath = join(deploymentFolderPath, `/${project}.json`)
    let deployments = {
        contracts: {}
    } as Deployments

    if (fs.existsSync(deploymentFilePath)) {
        deployments = require(deploymentFilePath)
    }

    const getAddress = (name: DeployedContractNames) => {
        const contract = deployments.contracts[name]
        if (!contract) throw new Error(`Deployment for ${name} not found`)
        return contract.address
    }

    return {
        deploymentsDir: deploymentFolderPath,
        deploymentFilePath: deploymentFilePath,
        deployments: deployments,
        provider,
        getAddress
    }
}

export async function transformEthersInstance(ctx: DeploymentContext, args: { name: string, instance: ethers.Contract, address: string, abi: object[] }): Promise<ContractDeployment> {
    const { instance, address, abi, name } = args

    if (!instance.deployTransaction) {
        console.error(`No instance.deployTransaction for `, name)
    }

    let deployTransaction = {
        blockHash: instance.deployTransaction.blockHash,
        blockNumber: instance.deployTransaction.blockNumber,
        transactionHash: instance.deployTransaction.hash
    }

    // FIX: The deployTransaction field had a null blockNumber when I deployed to Polygon.
    // Usually it is filled in Harhdat. Cause unknown.
    if (!deployTransaction.blockNumber || !deployTransaction.blockHash) {
        const txHash = instance.deployTransaction.hash

        console.log(`Missing deployment info for contract ${name}. Fetching from tx ${txHash}...`)
        const receipt = await ctx.provider.getTransactionReceipt(txHash)
        deployTransaction = {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            transactionHash: receipt.transactionHash
        }
    }

    return {
        address,
        deployTransaction: <ContractDeployTransaction>deployTransaction,
        abi,
    };
}


export async function transformVendoredInstance(ctx: DeploymentContext, args: { name: DeployedContractNames, address: string, txHash: string, abi: object[], force: boolean }): Promise<ContractDeployment> {
    const { address, abi, txHash, name } = args

    const deployment = ctx.deployments.contracts[name]
    let deployTransaction = deployment?.deployTransaction
    const needsRefresh = !deployTransaction && txHash

    if (needsRefresh || args.force) {
        console.log(`Missing deployment info for contract ${name}. Fetching from tx ${txHash}...`)
        const receipt = await ctx.provider.getTransactionReceipt(txHash)
        deployTransaction = {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber,
            transactionHash: receipt.transactionHash
        }
    }

    return {
        address,
        deployTransaction: <ContractDeployTransaction>deployTransaction,
        abi,
    };
}