/**
 * Asset Utilities for Beam
 * 
 * Helper functions for in-game asset management including
 * NFT metadata parsing, attribute handling, and asset validation.
 */

export interface NFTAttribute {
	trait_type: string;
	value: string | number;
	display_type?: string;
	max_value?: number;
}

export interface NFTMetadata {
	name: string;
	description?: string;
	image?: string;
	animation_url?: string;
	external_url?: string;
	attributes?: NFTAttribute[];
	properties?: Record<string, unknown>;
}

export interface AssetTransfer {
	from: string;
	to: string;
	tokenId: string;
	contractAddress: string;
	timestamp: number;
	txHash: string;
}

/**
 * Parse NFT metadata from URI or JSON
 */
export async function parseMetadata(uriOrJson: string): Promise<NFTMetadata> {
	// Check if it's already JSON
	if (uriOrJson.startsWith('{')) {
		return JSON.parse(uriOrJson);
	}
	
	// Check for data URI
	if (uriOrJson.startsWith('data:application/json')) {
		const base64 = uriOrJson.split(',')[1];
		const json = Buffer.from(base64, 'base64').toString('utf-8');
		return JSON.parse(json);
	}
	
	// IPFS URI handling
	if (uriOrJson.startsWith('ipfs://')) {
		const cid = uriOrJson.replace('ipfs://', '');
		const httpUrl = `https://ipfs.io/ipfs/${cid}`;
		// Note: Actual fetch would happen in the transport layer
		return { name: 'IPFS Asset', description: `CID: ${cid}` };
	}
	
	// Return placeholder for HTTP URIs (actual fetch in transport)
	return { name: 'Remote Asset', external_url: uriOrJson };
}

/**
 * Get specific attribute from NFT metadata
 */
export function getAttribute(metadata: NFTMetadata, traitType: string): string | number | undefined {
	if (!metadata.attributes) return undefined;
	const attr = metadata.attributes.find(
		a => a.trait_type.toLowerCase() === traitType.toLowerCase()
	);
	return attr?.value;
}

/**
 * Get all attributes as a key-value object
 */
export function getAttributesObject(metadata: NFTMetadata): Record<string, string | number> {
	if (!metadata.attributes) return {};
	return metadata.attributes.reduce((acc, attr) => {
		acc[attr.trait_type] = attr.value;
		return acc;
	}, {} as Record<string, string | number>);
}

/**
 * Validate NFT ownership
 */
export function validateOwnership(
	ownerAddress: string,
	expectedOwner: string
): boolean {
	return ownerAddress.toLowerCase() === expectedOwner.toLowerCase();
}

/**
 * Calculate rarity score from attributes
 */
export function calculateRarityScore(
	attributes: NFTAttribute[],
	traitRarities: Record<string, Record<string, number>>
): number {
	let totalScore = 0;
	let traitCount = 0;
	
	for (const attr of attributes) {
		const traitRarity = traitRarities[attr.trait_type];
		if (traitRarity && traitRarity[attr.value.toString()]) {
			totalScore += traitRarity[attr.value.toString()];
			traitCount++;
		}
	}
	
	return traitCount > 0 ? totalScore / traitCount : 0;
}

/**
 * Format token ID for display
 */
export function formatTokenId(tokenId: string | bigint): string {
	const id = tokenId.toString();
	if (id.length > 10) {
		return `${id.slice(0, 6)}...${id.slice(-4)}`;
	}
	return id;
}

/**
 * Validate ERC-721 token ID
 */
export function isValidTokenId(tokenId: string): boolean {
	try {
		const id = BigInt(tokenId);
		return id >= 0n;
	} catch {
		return false;
	}
}

/**
 * Parse transfer event data
 */
export function parseTransferEvent(event: {
	args: { from: string; to: string; tokenId: bigint };
	transactionHash: string;
	blockNumber: number;
}): AssetTransfer {
	return {
		from: event.args.from,
		to: event.args.to,
		tokenId: event.args.tokenId.toString(),
		contractAddress: '', // To be filled by caller
		timestamp: 0, // To be filled by caller
		txHash: event.transactionHash,
	};
}

/**
 * Generate asset URI
 */
export function generateAssetUri(
	contractAddress: string,
	tokenId: string,
	chainId: number = 4337
): string {
	return `beam:${chainId}:${contractAddress}:${tokenId}`;
}

/**
 * Parse asset URI
 */
export function parseAssetUri(uri: string): {
	chainId: number;
	contractAddress: string;
	tokenId: string;
} | null {
	const parts = uri.split(':');
	if (parts.length !== 4 || parts[0] !== 'beam') {
		return null;
	}
	
	return {
		chainId: parseInt(parts[1]),
		contractAddress: parts[2],
		tokenId: parts[3],
	};
}

/**
 * Check if asset is game-compatible
 */
export function isGameCompatible(
	metadata: NFTMetadata,
	gameId: string
): boolean {
	// Check for game compatibility attribute
	const games = getAttribute(metadata, 'compatible_games');
	if (typeof games === 'string') {
		return games.split(',').map(g => g.trim()).includes(gameId);
	}
	
	// Check properties
	if (metadata.properties?.compatible_games) {
		const compatibleGames = metadata.properties.compatible_games as string[];
		return compatibleGames.includes(gameId);
	}
	
	return false;
}

/**
 * Get asset type from metadata
 */
export function getAssetType(metadata: NFTMetadata): string {
	const type = getAttribute(metadata, 'asset_type') || getAttribute(metadata, 'type');
	if (type) return type.toString();
	
	// Infer from properties
	if (metadata.properties?.type) {
		return metadata.properties.type as string;
	}
	
	// Check for common types
	if (metadata.animation_url) return 'animated';
	if (metadata.image) return 'image';
	
	return 'unknown';
}

/**
 * Validate batch transfer
 */
export function validateBatchTransfer(
	tokenIds: string[],
	maxBatchSize: number = 100
): { valid: boolean; error?: string } {
	if (tokenIds.length === 0) {
		return { valid: false, error: 'No token IDs provided' };
	}
	
	if (tokenIds.length > maxBatchSize) {
		return { valid: false, error: `Batch size exceeds maximum of ${maxBatchSize}` };
	}
	
	// Check for duplicates
	const uniqueIds = new Set(tokenIds);
	if (uniqueIds.size !== tokenIds.length) {
		return { valid: false, error: 'Duplicate token IDs in batch' };
	}
	
	// Validate each token ID
	for (const id of tokenIds) {
		if (!isValidTokenId(id)) {
			return { valid: false, error: `Invalid token ID: ${id}` };
		}
	}
	
	return { valid: true };
}

/**
 * Sort assets by value/rarity/date
 */
export function sortAssets<T extends { tokenId: string }>(
	assets: T[],
	sortBy: 'tokenId' | 'newest' | 'oldest' = 'tokenId'
): T[] {
	return [...assets].sort((a, b) => {
		switch (sortBy) {
			case 'tokenId':
				return BigInt(a.tokenId) > BigInt(b.tokenId) ? 1 : -1;
			case 'newest':
				return BigInt(b.tokenId) > BigInt(a.tokenId) ? 1 : -1;
			case 'oldest':
				return BigInt(a.tokenId) > BigInt(b.tokenId) ? 1 : -1;
			default:
				return 0;
		}
	});
}

/**
 * Filter assets by attributes
 */
export function filterByAttributes(
	assets: Array<{ attributes?: NFTAttribute[] }>,
	filters: Record<string, string | number>
): Array<{ attributes?: NFTAttribute[] }> {
	return assets.filter(asset => {
		if (!asset.attributes) return false;
		
		for (const [trait, value] of Object.entries(filters)) {
			const attr = asset.attributes.find(
				a => a.trait_type.toLowerCase() === trait.toLowerCase()
			);
			if (!attr || attr.value !== value) {
				return false;
			}
		}
		
		return true;
	});
}
