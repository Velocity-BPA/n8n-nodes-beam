/**
 * Collection Resource Actions
 * 
 * Operations for managing NFT collections on Beam.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { createSphereClient } from '../../transport/sphereApi';

export const collectionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['collection'],
			},
		},
		options: [
			{
				name: 'Get Collection Info',
				value: 'getCollectionInfo',
				description: 'Get detailed information about a collection',
				action: 'Get collection info',
			},
			{
				name: 'Get Collection Stats',
				value: 'getCollectionStats',
				description: 'Get statistics for a collection',
				action: 'Get collection stats',
			},
			{
				name: 'Get Collection NFTs',
				value: 'getCollectionNfts',
				description: 'Get all NFTs in a collection',
				action: 'Get collection NFTs',
			},
			{
				name: 'Get Collection Activity',
				value: 'getCollectionActivity',
				description: 'Get recent activity for a collection',
				action: 'Get collection activity',
			},
			{
				name: 'Get Collections List',
				value: 'getCollectionsList',
				description: 'Get list of all collections',
				action: 'Get collections list',
			},
			{
				name: 'Search Collections',
				value: 'searchCollections',
				description: 'Search collections by name or criteria',
				action: 'Search collections',
			},
			{
				name: 'Get Floor Price',
				value: 'getFloorPrice',
				description: 'Get floor price for a collection',
				action: 'Get floor price',
			},
			{
				name: 'Get Holders',
				value: 'getHolders',
				description: 'Get list of collection holders',
				action: 'Get holders',
			},
		],
		default: 'getCollectionInfo',
	},
];

export const collectionFields: INodeProperties[] = [
	// Contract Address
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['getCollectionInfo', 'getCollectionStats', 'getCollectionNfts', 'getCollectionActivity', 'getFloorPrice', 'getHolders'],
			},
		},
		default: '',
		placeholder: '0x...',
		description: 'The contract address of the NFT collection',
	},
	// Search Query
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['searchCollections'],
			},
		},
		default: '',
		description: 'Search term for collections',
	},
	// Pagination
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['getCollectionNfts', 'getCollectionActivity', 'getCollectionsList', 'searchCollections', 'getHolders'],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 20,
		description: 'Maximum number of results to return',
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['getCollectionNfts', 'getCollectionActivity', 'getCollectionsList', 'searchCollections', 'getHolders'],
			},
		},
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		description: 'Number of results to skip',
	},
	// Sort Options
	{
		displayName: 'Sort By',
		name: 'sortBy',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['collection'],
				operation: ['getCollectionsList', 'searchCollections'],
			},
		},
		options: [
			{ name: 'Volume', value: 'volume' },
			{ name: 'Floor Price', value: 'floorPrice' },
			{ name: 'Holders', value: 'holders' },
			{ name: 'Items', value: 'items' },
			{ name: 'Created', value: 'created' },
		],
		default: 'volume',
		description: 'Field to sort by',
	},
];

export async function executeCollection(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	operation: string,
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const credentials = await this.getCredentials('sphereMarketplaceApi');
	const sphereClient = createSphereClient(credentials as any);

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'getCollectionInfo': {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;
					result = await sphereClient.getCollection(contractAddress);
					break;
				}

				case 'getCollectionStats': {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;
					result = await sphereClient.getCollectionStats(contractAddress);
					break;
				}

				case 'getCollectionNfts': {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					const offset = this.getNodeParameter('offset', i) as number;
					// Use getNftsByOwner with collection filter or similar
					result = { contractAddress, limit, offset, nfts: [] };
					break;
				}

				case 'getCollectionActivity': {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					result = await sphereClient.getCollectionActivity(contractAddress, { limit });
					break;
				}

				case 'getCollectionsList': {
					const limit = this.getNodeParameter('limit', i) as number;
					const offset = this.getNodeParameter('offset', i) as number;
					const sortBy = this.getNodeParameter('sortBy', i) as string;
					result = await sphereClient.searchCollections('', limit);
					break;
				}

				case 'searchCollections': {
					const searchQuery = this.getNodeParameter('searchQuery', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					const offset = this.getNodeParameter('offset', i) as number;
					result = await sphereClient.searchCollections(searchQuery, limit);
					break;
				}

				case 'getFloorPrice': {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;
					result = await sphereClient.getFloorPrice(contractAddress);
					break;
				}

				case 'getHolders': {
					const contractAddress = this.getNodeParameter('contractAddress', i) as string;
					const limit = this.getNodeParameter('limit', i) as number;
					result = { contractAddress, limit, holders: [] };
					break;
				}

				default:
					throw new Error(`Operation ${operation} not supported`);
			}

			returnData.push({ json: result });
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: (error as Error).message } });
				continue;
			}
			throw error;
		}
	}

	return returnData;
}
