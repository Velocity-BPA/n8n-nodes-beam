/**
 * Sphere Marketplace API Client
 * 
 * Client for interacting with the Sphere NFT marketplace API.
 * Sphere is the official marketplace for the Beam gaming ecosystem.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

export interface SphereApiConfig {
	apiEndpoint: string;
	apiKey: string;
	publisherId?: string;
}

export interface Listing {
	id: string;
	seller: string;
	nftContract: string;
	tokenId: string;
	price: string;
	currency: string;
	expiry: number;
	status: 'active' | 'sold' | 'cancelled' | 'expired';
	createdAt: number;
	updatedAt: number;
	metadata?: {
		name: string;
		image: string;
		attributes?: Array<{ trait_type: string; value: string | number }>;
	};
}

export interface Offer {
	id: string;
	listingId: string;
	offerer: string;
	price: string;
	currency: string;
	expiry: number;
	status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
	createdAt: number;
}

export interface Sale {
	id: string;
	listingId: string;
	seller: string;
	buyer: string;
	nftContract: string;
	tokenId: string;
	price: string;
	currency: string;
	txHash: string;
	timestamp: number;
}

export interface CollectionStats {
	address: string;
	name: string;
	totalSupply: number;
	holders: number;
	floorPrice: string;
	volume24h: string;
	volumeTotal: string;
	sales24h: number;
	salesTotal: number;
	averagePrice: string;
}

export interface MarketplaceStats {
	totalListings: number;
	activeListings: number;
	totalVolume: string;
	volume24h: string;
	totalSales: number;
	sales24h: number;
	uniqueSellers: number;
	uniqueBuyers: number;
}

export class SphereApiClient {
	private client: AxiosInstance;
	private publisherId?: string;

	constructor(config: SphereApiConfig) {
		this.publisherId = config.publisherId;
		
		this.client = axios.create({
			baseURL: config.apiEndpoint,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${config.apiKey}`,
				...(config.publisherId && { 'X-Publisher-Id': config.publisherId }),
			},
		});
	}

	/**
	 * Handle API errors
	 */
	private handleError(error: AxiosError): never {
		if (error.response) {
			const data = error.response.data as { message?: string; error?: string };
			throw new Error(
				`Sphere API error (${error.response.status}): ${data.message || data.error || 'Unknown error'}`
			);
		}
		throw error;
	}

	// ============ Listing Operations ============

	/**
	 * Get listing by ID
	 */
	async getListing(listingId: string): Promise<Listing> {
		try {
			const response = await this.client.get(`/v1/listings/${listingId}`);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get active listings
	 */
	async getActiveListings(params?: {
		collection?: string;
		seller?: string;
		minPrice?: string;
		maxPrice?: string;
		sortBy?: 'price' | 'createdAt' | 'expiry';
		sortOrder?: 'asc' | 'desc';
		limit?: number;
		offset?: number;
	}): Promise<{ listings: Listing[]; total: number }> {
		try {
			const response = await this.client.get('/v1/listings', { params });
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get listings by seller
	 */
	async getListingsBySeller(
		sellerAddress: string,
		status?: 'active' | 'sold' | 'cancelled'
	): Promise<Listing[]> {
		try {
			const response = await this.client.get('/v1/listings', {
				params: { seller: sellerAddress, status },
			});
			return response.data.listings;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get listings by collection
	 */
	async getListingsByCollection(
		collectionAddress: string,
		params?: {
			status?: 'active' | 'sold' | 'cancelled';
			sortBy?: 'price' | 'createdAt';
			sortOrder?: 'asc' | 'desc';
			limit?: number;
			offset?: number;
		}
	): Promise<{ listings: Listing[]; total: number }> {
		try {
			const response = await this.client.get('/v1/listings', {
				params: { collection: collectionAddress, ...params },
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Create a listing
	 */
	async createListing(data: {
		nftContract: string;
		tokenId: string;
		price: string;
		currency?: string;
		duration?: number;
		signature: string;
	}): Promise<{ listingId: string; txHash?: string }> {
		try {
			const response = await this.client.post('/v1/listings', data);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Cancel a listing
	 */
	async cancelListing(
		listingId: string,
		signature: string
	): Promise<{ success: boolean; txHash?: string }> {
		try {
			const response = await this.client.delete(`/v1/listings/${listingId}`, {
				data: { signature },
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Purchase Operations ============

	/**
	 * Buy an NFT
	 */
	async buyNft(
		listingId: string,
		buyerAddress: string,
		signature: string
	): Promise<{ txHash: string; sale: Sale }> {
		try {
			const response = await this.client.post(`/v1/listings/${listingId}/buy`, {
				buyer: buyerAddress,
				signature,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Offer Operations ============

	/**
	 * Make an offer
	 */
	async makeOffer(data: {
		listingId: string;
		price: string;
		currency?: string;
		duration?: number;
		signature: string;
	}): Promise<{ offerId: string }> {
		try {
			const response = await this.client.post('/v1/offers', data);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Accept an offer
	 */
	async acceptOffer(
		offerId: string,
		signature: string
	): Promise<{ txHash: string; sale: Sale }> {
		try {
			const response = await this.client.post(`/v1/offers/${offerId}/accept`, { signature });
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Cancel an offer
	 */
	async cancelOffer(
		offerId: string,
		signature: string
	): Promise<{ success: boolean }> {
		try {
			const response = await this.client.delete(`/v1/offers/${offerId}`, {
				data: { signature },
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get offers for a listing
	 */
	async getOffers(listingId: string): Promise<Offer[]> {
		try {
			const response = await this.client.get(`/v1/listings/${listingId}/offers`);
			return response.data.offers;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get offers by user
	 */
	async getOffersByUser(userAddress: string): Promise<Offer[]> {
		try {
			const response = await this.client.get('/v1/offers', {
				params: { offerer: userAddress },
			});
			return response.data.offers;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Sales & History ============

	/**
	 * Get recent sales
	 */
	async getRecentSales(params?: {
		collection?: string;
		limit?: number;
		offset?: number;
	}): Promise<{ sales: Sale[]; total: number }> {
		try {
			const response = await this.client.get('/v1/sales', { params });
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get price history for an NFT
	 */
	async getPriceHistory(
		nftContract: string,
		tokenId: string
	): Promise<Array<{ price: string; timestamp: number; txHash: string }>> {
		try {
			const response = await this.client.get('/v1/price-history', {
				params: { contract: nftContract, tokenId },
			});
			return response.data.history;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Collection Operations ============

	/**
	 * Get collection info
	 */
	async getCollection(address: string): Promise<{
		address: string;
		name: string;
		symbol: string;
		description?: string;
		image?: string;
		banner?: string;
		website?: string;
		discord?: string;
		twitter?: string;
		verified: boolean;
	}> {
		try {
			const response = await this.client.get(`/v1/collections/${address}`);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get collection stats
	 */
	async getCollectionStats(address: string): Promise<CollectionStats> {
		try {
			const response = await this.client.get(`/v1/collections/${address}/stats`);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get collection floor price
	 */
	async getFloorPrice(address: string): Promise<{ floorPrice: string; currency: string }> {
		try {
			const response = await this.client.get(`/v1/collections/${address}/floor`);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get collection activity
	 */
	async getCollectionActivity(
		address: string,
		params?: {
			type?: 'listing' | 'sale' | 'offer' | 'transfer';
			limit?: number;
			offset?: number;
		}
	): Promise<Array<{
		type: string;
		from: string;
		to?: string;
		tokenId: string;
		price?: string;
		timestamp: number;
		txHash: string;
	}>> {
		try {
			const response = await this.client.get(`/v1/collections/${address}/activity`, { params });
			return response.data.activity;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Search collections
	 */
	async searchCollections(query: string, limit?: number): Promise<Array<{
		address: string;
		name: string;
		image?: string;
		verified: boolean;
	}>> {
		try {
			const response = await this.client.get('/v1/collections/search', {
				params: { q: query, limit },
			});
			return response.data.collections;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get top collections
	 */
	async getTopCollections(params?: {
		sortBy?: 'volume' | 'sales' | 'floor';
		period?: '24h' | '7d' | '30d' | 'all';
		limit?: number;
	}): Promise<CollectionStats[]> {
		try {
			const response = await this.client.get('/v1/collections/top', { params });
			return response.data.collections;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ NFT Operations ============

	/**
	 * Get NFT info
	 */
	async getNft(contractAddress: string, tokenId: string): Promise<{
		contract: string;
		tokenId: string;
		owner: string;
		metadata: {
			name: string;
			description?: string;
			image?: string;
			attributes?: Array<{ trait_type: string; value: string | number }>;
		};
		listing?: Listing;
	}> {
		try {
			const response = await this.client.get(`/v1/nfts/${contractAddress}/${tokenId}`);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get NFTs by owner
	 */
	async getNftsByOwner(
		ownerAddress: string,
		params?: {
			collection?: string;
			limit?: number;
			offset?: number;
		}
	): Promise<{
		nfts: Array<{
			contract: string;
			tokenId: string;
			metadata: { name: string; image?: string };
		}>;
		total: number;
	}> {
		try {
			const response = await this.client.get('/v1/nfts', {
				params: { owner: ownerAddress, ...params },
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Marketplace Stats ============

	/**
	 * Get marketplace stats
	 */
	async getMarketplaceStats(): Promise<MarketplaceStats> {
		try {
			const response = await this.client.get('/v1/stats');
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ User Operations ============

	/**
	 * Get user profile
	 */
	async getUserProfile(address: string): Promise<{
		address: string;
		username?: string;
		avatar?: string;
		bio?: string;
		totalBought: number;
		totalSold: number;
		volumeBought: string;
		volumeSold: string;
	}> {
		try {
			const response = await this.client.get(`/v1/users/${address}`);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get user activity
	 */
	async getUserActivity(
		address: string,
		params?: { limit?: number; offset?: number }
	): Promise<Array<{
		type: string;
		tokenId: string;
		contract: string;
		price?: string;
		timestamp: number;
		txHash: string;
	}>> {
		try {
			const response = await this.client.get(`/v1/users/${address}/activity`, { params });
			return response.data.activity;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}
}

/**
 * Create Sphere API client from credentials
 */
export function createSphereClient(credentials: {
	apiEndpoint: string;
	customApiUrl?: string;
	apiKey: string;
	publisherId?: string;
}): SphereApiClient {
	const endpoint = credentials.apiEndpoint === 'custom' 
		? credentials.customApiUrl! 
		: credentials.apiEndpoint;
		
	return new SphereApiClient({
		apiEndpoint: endpoint,
		apiKey: credentials.apiKey,
		publisherId: credentials.publisherId,
	});
}
