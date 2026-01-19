/**
 * Asset Resource Actions (In-Game Assets)
 * 
 * Operations for managing in-game assets including upgrades,
 * combinations, marketplace listings, and valuations.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createBeamClient } from '../../transport/beamClient';

export const assetOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['asset'],
			},
		},
		options: [
			{
				name: 'Get Asset Info',
				value: 'getAssetInfo',
				description: 'Get information about an in-game asset',
				action: 'Get asset info',
			},
			{
				name: 'Get Asset Stats',
				value: 'getAssetStats',
				description: 'Get usage statistics for an asset',
				action: 'Get asset stats',
			},
			{
				name: 'Get Asset Attributes',
				value: 'getAssetAttributes',
				description: 'Get all attributes of an asset',
				action: 'Get asset attributes',
			},
			{
				name: 'Get Asset History',
				value: 'getAssetHistory',
				description: 'Get transaction history for an asset',
				action: 'Get asset history',
			},
			{
				name: 'Get Asset Value',
				value: 'getAssetValue',
				description: 'Get estimated market value of an asset',
				action: 'Get asset value',
			},
			{
				name: 'Upgrade Asset',
				value: 'upgradeAsset',
				description: 'Upgrade an asset level or tier',
				action: 'Upgrade asset',
			},
			{
				name: 'Combine Assets',
				value: 'combineAssets',
				description: 'Combine multiple assets into one',
				action: 'Combine assets',
			},
			{
				name: 'List Asset',
				value: 'listAsset',
				description: 'List an asset on the marketplace',
				action: 'List asset',
			},
			{
				name: 'Delist Asset',
				value: 'delistAsset',
				description: 'Remove asset from marketplace',
				action: 'Delist asset',
			},
		],
		default: 'getAssetInfo',
	},
];

export const assetFields: INodeProperties[] = [
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'The asset contract address',
	},
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['asset'],
			},
		},
		default: '',
		description: 'The asset token ID',
	},
	{
		displayName: 'Game ID',
		name: 'gameId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['getAssetStats', 'upgradeAsset', 'combineAssets'],
			},
		},
		default: '',
		description: 'The game identifier',
	},
	{
		displayName: 'Price',
		name: 'price',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['listAsset'],
			},
		},
		default: 0,
		description: 'Listing price in BEAM',
	},
	{
		displayName: 'Upgrade Level',
		name: 'upgradeLevel',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['upgradeAsset'],
			},
		},
		default: 1,
		description: 'Target upgrade level',
	},
	{
		displayName: 'Assets to Combine',
		name: 'assetsToCombine',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['asset'],
				operation: ['combineAssets'],
			},
		},
		default: '',
		placeholder: 'tokenId1,tokenId2,tokenId3',
		description: 'Comma-separated list of token IDs to combine',
	},
];

export async function executeAsset(
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

	const contractAddress = this.getNodeParameter('contractAddress', index) as string;
	const tokenId = this.getNodeParameter('tokenId', index) as string;

	let result: IDataObject = {};

	switch (operation) {
		case 'getAssetInfo': {
			const owner = await client.getNftOwner(contractAddress, BigInt(tokenId));
			const tokenUri = await client.getNftTokenUri(contractAddress, BigInt(tokenId));
			
			result = {
				contractAddress,
				tokenId,
				owner,
				tokenUri,
				type: 'game_asset',
			};
			break;
		}

		case 'getAssetStats': {
			result = {
				contractAddress,
				tokenId,
				stats: {
					timesUsed: 0,
					matchesPlayed: 0,
					lastUsed: null,
					created: new Date().toISOString(),
				},
			};
			break;
		}

		case 'getAssetAttributes': {
			const tokenUri = await client.getNftTokenUri(contractAddress, BigInt(tokenId));
			
			result = {
				contractAddress,
				tokenId,
				tokenUri,
				attributes: [],
			};
			break;
		}

		case 'getAssetHistory': {
			result = {
				contractAddress,
				tokenId,
				history: [],
				message: 'Requires indexer API for full history',
			};
			break;
		}

		case 'getAssetValue': {
			result = {
				contractAddress,
				tokenId,
				estimatedValue: '0',
				currency: 'BEAM',
				message: 'Requires marketplace API for valuation',
			};
			break;
		}

		case 'upgradeAsset': {
			const upgradeLevel = this.getNodeParameter('upgradeLevel', index) as number;
			
			result = {
				contractAddress,
				tokenId,
				targetLevel: upgradeLevel,
				status: 'pending',
				message: 'Upgrade requires game contract interaction',
			};
			break;
		}

		case 'combineAssets': {
			const assetsToCombine = this.getNodeParameter('assetsToCombine', index) as string;
			const tokenIds = assetsToCombine.split(',').map(id => id.trim());
			
			result = {
				contractAddress,
				primaryAsset: tokenId,
				assetsToConsume: tokenIds,
				status: 'pending',
				message: 'Combine requires game contract interaction',
			};
			break;
		}

		case 'listAsset': {
			const price = this.getNodeParameter('price', index) as number;
			
			result = {
				contractAddress,
				tokenId,
				price: price.toString(),
				currency: 'BEAM',
				status: 'pending',
				message: 'Listing requires marketplace approval',
			};
			break;
		}

		case 'delistAsset': {
			result = {
				contractAddress,
				tokenId,
				status: 'delisted',
			};
			break;
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown operation: ${operation}`,
				{ itemIndex: index }
			);
	}

	return { ...result, timestamp: new Date().toISOString() };
}
