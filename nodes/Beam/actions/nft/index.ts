/**
 * NFT Resource Actions
 * 
 * Operations for managing NFTs including transfers, metadata,
 * and ownership verification.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { createBeamClient } from '../../transport/beamClient';
import axios from 'axios';

export const nftOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['nft'],
			},
		},
		options: [
			{
				name: 'Get NFT Info',
				value: 'getNftInfo',
				description: 'Get information about an NFT',
				action: 'Get NFT info',
			},
			{
				name: 'Get NFT Metadata',
				value: 'getNftMetadata',
				description: 'Get NFT metadata from token URI',
				action: 'Get NFT metadata',
			},
			{
				name: 'Get NFTs by Owner',
				value: 'getNftsByOwner',
				description: 'Get all NFTs owned by an address',
				action: 'Get NFTs by owner',
			},
			{
				name: 'Transfer NFT',
				value: 'transferNft',
				description: 'Transfer an NFT to another address',
				action: 'Transfer NFT',
			},
			{
				name: 'Verify NFT Ownership',
				value: 'verifyOwnership',
				description: 'Verify that an address owns a specific NFT',
				action: 'Verify NFT ownership',
			},
			{
				name: 'Get NFT History',
				value: 'getNftHistory',
				description: 'Get transfer history for an NFT',
				action: 'Get NFT history',
			},
			{
				name: 'Batch Transfer NFTs',
				value: 'batchTransfer',
				description: 'Transfer multiple NFTs at once',
				action: 'Batch transfer NFTs',
			},
		],
		default: 'getNftInfo',
	},
];

export const nftFields: INodeProperties[] = [
	// Contract address for NFT operations
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nft'],
				operation: [
					'getNftInfo',
					'getNftMetadata',
					'transferNft',
					'verifyOwnership',
					'getNftHistory',
					'batchTransfer',
				],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'The NFT contract address',
	},
	// Token ID
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nft'],
				operation: [
					'getNftInfo',
					'getNftMetadata',
					'transferNft',
					'verifyOwnership',
					'getNftHistory',
				],
			},
		},
		default: '',
		placeholder: '1',
		description: 'The NFT token ID',
	},
	// Owner address for queries
	{
		displayName: 'Owner Address',
		name: 'ownerAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nft'],
				operation: ['getNftsByOwner', 'verifyOwnership'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'The owner wallet address',
	},
	// Recipient for transfers
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nft'],
				operation: ['transferNft', 'batchTransfer'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'The recipient address',
	},
	// Batch transfer token IDs
	{
		displayName: 'Token IDs',
		name: 'tokenIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nft'],
				operation: ['batchTransfer'],
			},
		},
		default: '',
		placeholder: '1,2,3,4,5',
		description: 'Comma-separated list of token IDs to transfer',
	},
	// Collection address for getNftsByOwner
	{
		displayName: 'Collection Address',
		name: 'collectionAddress',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['nft'],
				operation: ['getNftsByOwner'],
			},
		},
		default: '',
		placeholder: '0x... (optional)',
		description: 'Filter by specific collection (optional)',
	},
	// Options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['nft'],
				operation: ['transferNft', 'batchTransfer'],
			},
		},
		options: [
			{
				displayName: 'Gas Limit',
				name: 'gasLimit',
				type: 'number',
				default: 100000,
				description: 'Maximum gas to use for the transaction',
			},
			{
				displayName: 'Wait for Confirmation',
				name: 'waitForConfirmation',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for the transaction to be confirmed',
			},
		],
	},
];

export async function executeNft(
	this: IExecuteFunctions,
	index: number,
	operation: string
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork');
	
	const client = createBeamClient({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string,
		privateKey: credentials.privateKey as string,
		chainId: credentials.chainId as number,
	});

	let result: IDataObject = {};

	switch (operation) {
		case 'getNftInfo': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			
			const owner = await client.getNftOwner(contractAddress, BigInt(tokenId));
			const tokenUri = await client.getNftTokenUri(contractAddress, BigInt(tokenId));
			
			result = {
				contractAddress,
				tokenId,
				owner,
				tokenUri,
			};
			break;
		}

		case 'getNftMetadata': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			
			const tokenUri = await client.getNftTokenUri(contractAddress, BigInt(tokenId));
			
			let metadata = {};
			try {
				// Handle IPFS URIs
				let fetchUrl = tokenUri;
				if (tokenUri.startsWith('ipfs://')) {
					fetchUrl = `https://ipfs.io/ipfs/${tokenUri.replace('ipfs://', '')}`;
				}
				
				// Handle data URIs
				if (tokenUri.startsWith('data:application/json')) {
					const base64 = tokenUri.split(',')[1];
					metadata = JSON.parse(Buffer.from(base64, 'base64').toString());
				} else {
					const response = await axios.get(fetchUrl, { timeout: 10000 });
					metadata = response.data;
				}
			} catch (error) {
				metadata = { error: 'Failed to fetch metadata', tokenUri };
			}
			
			result = {
				contractAddress,
				tokenId,
				tokenUri,
				metadata,
			};
			break;
		}

		case 'getNftsByOwner': {
			const ownerAddress = this.getNodeParameter('ownerAddress', index) as string;
			const collectionAddress = this.getNodeParameter('collectionAddress', index, '') as string;
			
			if (collectionAddress) {
				const balance = await client.getNftBalance(collectionAddress, ownerAddress);
				result = {
					ownerAddress,
					collectionAddress,
					balance: balance.toString(),
					message: 'Use Beam API for detailed NFT enumeration',
				};
			} else {
				result = {
					ownerAddress,
					message: 'Provide a collection address or use Beam API for full enumeration',
				};
			}
			break;
		}

		case 'transferNft': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const options = this.getNodeParameter('options', index, {}) as {
				gasLimit?: number;
				waitForConfirmation?: boolean;
			};
			
			const wallet = client.getWallet();
			if (!wallet) {
				throw new Error('Private key required for transfers');
			}
			
			const tx = await client.transferNft(
				contractAddress,
				wallet.address,
				toAddress,
				BigInt(tokenId),
				{
					gasLimit: options.gasLimit ? BigInt(options.gasLimit) : undefined,
				}
			);
			
			if (options.waitForConfirmation !== false) {
				const receipt = await tx.wait();
				result = {
					txHash: tx.hash,
					contractAddress,
					tokenId,
					from: wallet.address,
					to: toAddress,
					status: receipt?.status === 1 ? 'success' : 'failed',
					blockNumber: receipt?.blockNumber,
					gasUsed: receipt?.gasUsed?.toString(),
				};
			} else {
				result = {
					txHash: tx.hash,
					contractAddress,
					tokenId,
					from: wallet.address,
					to: toAddress,
					status: 'pending',
				};
			}
			break;
		}

		case 'verifyOwnership': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const ownerAddress = this.getNodeParameter('ownerAddress', index) as string;
			
			const actualOwner = await client.getNftOwner(contractAddress, BigInt(tokenId));
			const isOwner = actualOwner.toLowerCase() === ownerAddress.toLowerCase();
			
			result = {
				contractAddress,
				tokenId,
				expectedOwner: ownerAddress,
				actualOwner,
				isOwner,
			};
			break;
		}

		case 'getNftHistory':
		case 'batchTransfer': {
			result = {
				message: 'This operation requires additional indexer integration',
				operation,
			};
			break;
		}

		default:
			throw new Error(`Unsupported operation: ${operation}`);
	}

	return { ...result, timestamp: new Date().toISOString() };
}
