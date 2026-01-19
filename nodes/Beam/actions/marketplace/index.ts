import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createSphereClient } from '../../transport/sphereApi';

export const marketplaceOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['marketplace'] } },
	options: [
		{ name: 'Get Listing Info', value: 'getListingInfo', description: 'Get listing information', action: 'Get listing info' },
		{ name: 'Create Listing', value: 'createListing', description: 'Create new listing', action: 'Create listing' },
		{ name: 'Cancel Listing', value: 'cancelListing', description: 'Cancel listing', action: 'Cancel listing' },
		{ name: 'Buy NFT', value: 'buyNft', description: 'Buy an NFT', action: 'Buy nft' },
		{ name: 'Get Active Listings', value: 'getActiveListings', description: 'Get active listings', action: 'Get active listings' },
		{ name: 'Get Listings by User', value: 'getListingsByUser', description: 'Get user listings', action: 'Get user listings' },
		{ name: 'Get Listings by Collection', value: 'getListingsByCollection', description: 'Get collection listings', action: 'Get collection listings' },
		{ name: 'Get Recent Sales', value: 'getRecentSales', description: 'Get recent sales', action: 'Get recent sales' },
		{ name: 'Get Price History', value: 'getPriceHistory', description: 'Get price history', action: 'Get price history' },
		{ name: 'Make Offer', value: 'makeOffer', description: 'Make offer on NFT', action: 'Make offer' },
		{ name: 'Accept Offer', value: 'acceptOffer', description: 'Accept an offer', action: 'Accept offer' },
		{ name: 'Cancel Offer', value: 'cancelOffer', description: 'Cancel an offer', action: 'Cancel offer' },
		{ name: 'Get Offers', value: 'getOffers', description: 'Get offers on NFT', action: 'Get offers' },
		{ name: 'Get Marketplace Stats', value: 'getMarketplaceStats', description: 'Get marketplace stats', action: 'Get marketplace stats' },
	],
	default: 'getActiveListings',
};

export const marketplaceFields: INodeProperties[] = [
	{
		displayName: 'Listing ID',
		name: 'listingId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['marketplace'], operation: ['getListingInfo', 'cancelListing', 'buyNft'] } },
	},
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['marketplace'], operation: ['createListing', 'getListingsByCollection', 'getPriceHistory', 'makeOffer'] } },
	},
	{
		displayName: 'Token ID',
		name: 'tokenId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['marketplace'], operation: ['createListing', 'makeOffer', 'getOffers', 'getPriceHistory'] } },
	},
	{
		displayName: 'Price',
		name: 'price',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['marketplace'], operation: ['createListing', 'makeOffer'] } },
	},
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['marketplace'], operation: ['getListingsByUser'] } },
	},
	{
		displayName: 'Offer ID',
		name: 'offerId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['marketplace'], operation: ['acceptOffer', 'cancelOffer'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 20,
		displayOptions: { show: { resource: ['marketplace'], operation: ['getActiveListings', 'getListingsByUser', 'getListingsByCollection', 'getRecentSales'] } },
	},
];

export async function executeMarketplace(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('sphereMarketplaceApi') as any;
	const sphereClient = createSphereClient(credentials);

	switch (operation) {
		case 'getListingInfo': {
			const listingId = this.getNodeParameter('listingId', index) as string;
			const listing = await sphereClient.getListing(listingId);
			return { ...listing, timestamp: new Date().toISOString() };
		}
		case 'createListing': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const price = this.getNodeParameter('price', index) as string;
			return { contractAddress, tokenId, price, status: 'pending', timestamp: new Date().toISOString() };
		}
		case 'cancelListing': {
			const listingId = this.getNodeParameter('listingId', index) as string;
			return { listingId, status: 'cancelled', timestamp: new Date().toISOString() };
		}
		case 'buyNft': {
			const listingId = this.getNodeParameter('listingId', index) as string;
			return { listingId, status: 'pending', timestamp: new Date().toISOString() };
		}
		case 'getActiveListings': {
			const limit = this.getNodeParameter('limit', index, 20) as number;
			const result = await sphereClient.getActiveListings({ limit });
			return { listings: result.listings, count: result.total, timestamp: new Date().toISOString() };
		}
		case 'getListingsByUser': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			const listings = await sphereClient.getListingsBySeller(walletAddress);
			return { walletAddress, listings, count: listings.length, timestamp: new Date().toISOString() };
		}
		case 'getListingsByCollection': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const limit = this.getNodeParameter('limit', index, 20) as number;
			const result = await sphereClient.getListingsByCollection(contractAddress, { limit });
			return { contractAddress, listings: result.listings, count: result.total, timestamp: new Date().toISOString() };
		}
		case 'getRecentSales': {
			const limit = this.getNodeParameter('limit', index, 20) as number;
			const result = await sphereClient.getRecentSales({ limit });
			return { sales: result.sales, count: result.total, timestamp: new Date().toISOString() };
		}
		case 'getPriceHistory': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const history = await sphereClient.getPriceHistory(contractAddress, tokenId);
			return { contractAddress, tokenId, history, timestamp: new Date().toISOString() };
		}
		case 'makeOffer': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			const price = this.getNodeParameter('price', index) as string;
			return { contractAddress, tokenId, price, status: 'pending', timestamp: new Date().toISOString() };
		}
		case 'acceptOffer': {
			const offerId = this.getNodeParameter('offerId', index) as string;
			return { offerId, status: 'accepted', timestamp: new Date().toISOString() };
		}
		case 'cancelOffer': {
			const offerId = this.getNodeParameter('offerId', index) as string;
			return { offerId, status: 'cancelled', timestamp: new Date().toISOString() };
		}
		case 'getOffers': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const tokenId = this.getNodeParameter('tokenId', index) as string;
			return { contractAddress, tokenId, offers: [], timestamp: new Date().toISOString() };
		}
		case 'getMarketplaceStats': {
			const stats = await sphereClient.getMarketplaceStats();
			return { ...stats, timestamp: new Date().toISOString() };
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
