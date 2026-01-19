/**
 * Beam Contract Addresses
 * 
 * Core contract addresses for the Beam ecosystem including
 * wrapped BEAM, marketplace, bridge, and gaming contracts.
 */

export interface ContractAddresses {
	wrappedBeam: string;
	multicall: string;
	sphereMarketplace: string;
	sphereExchange: string;
	bridgeMainnet: string;
	bridgeEthereum: string;
	bridgeAvalanche: string;
	meritCircleStaking: string;
	mcToken: string;
	beamSwapRouter: string;
	beamSwapFactory: string;
	nftRegistry: string;
	playerProfiles: string;
	gameAssets: string;
	achievementSystem: string;
	rewardsDistributor: string;
	staking: string;
}

export const MAINNET_CONTRACTS: ContractAddresses = {
	// Core tokens
	wrappedBeam: '0x76BF5E7d2Bcb06b1444C0a2742780051D8D0E304',
	
	// Infrastructure
	multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
	
	// Sphere Marketplace
	sphereMarketplace: '0x8A3749936E723325C6b645a0901470cD9E790B94',
	sphereExchange: '0x3B6078A3B7Ce3846F0a6ED9F3A2B7eCF55B0f745',
	
	// Bridge contracts
	bridgeMainnet: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
	bridgeEthereum: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
	bridgeAvalanche: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
	
	// Merit Circle / DAO
	meritCircleStaking: '0x2A0332E28913A06Fa924d40A3E2160f763010417',
	mcToken: '0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6',
	
	// DEX
	beamSwapRouter: '0x965B104e250648d01d4B3b72BaC751Cde809D29E',
	beamSwapFactory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
	
	// Gaming infrastructure
	nftRegistry: '0x4B5057B2c87Ec9e7C047fb00C0E406dfF2FDaCad',
	playerProfiles: '0x1234567890123456789012345678901234567890',
	gameAssets: '0x2345678901234567890123456789012345678901',
	achievementSystem: '0x3456789012345678901234567890123456789012',
	rewardsDistributor: '0x4567890123456789012345678901234567890123',
	staking: '0x2A0332E28913A06Fa924d40A3E2160f763010417',
};

export const TESTNET_CONTRACTS: ContractAddresses = {
	// Core tokens
	wrappedBeam: '0x76BF5E7d2Bcb06b1444C0a2742780051D8D0E304',
	
	// Infrastructure
	multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
	
	// Sphere Marketplace (testnet)
	sphereMarketplace: '0x1234567890123456789012345678901234567891',
	sphereExchange: '0x2345678901234567890123456789012345678902',
	
	// Bridge contracts (testnet)
	bridgeMainnet: '0x3456789012345678901234567890123456789013',
	bridgeEthereum: '0x4567890123456789012345678901234567890124',
	bridgeAvalanche: '0x5678901234567890123456789012345678901235',
	
	// Merit Circle / DAO (testnet)
	meritCircleStaking: '0x6789012345678901234567890123456789012346',
	mcToken: '0x7890123456789012345678901234567890123457',
	
	// DEX (testnet)
	beamSwapRouter: '0x8901234567890123456789012345678901234568',
	beamSwapFactory: '0x9012345678901234567890123456789012345679',
	
	// Gaming infrastructure (testnet)
	nftRegistry: '0x0123456789012345678901234567890123456780',
	playerProfiles: '0x1234567890123456789012345678901234567891',
	gameAssets: '0x2345678901234567890123456789012345678902',
	achievementSystem: '0x3456789012345678901234567890123456789013',
	rewardsDistributor: '0x4567890123456789012345678901234567890124',
	staking: '0x6789012345678901234567890123456789012346',
};

export const CONTRACTS: Record<string, ContractAddresses> = {
	mainnet: MAINNET_CONTRACTS,
	testnet: TESTNET_CONTRACTS,
};

export function getContracts(network: string): ContractAddresses {
	const contracts = CONTRACTS[network];
	if (!contracts) {
		throw new Error(`Unknown network: ${network}. Use 'mainnet' or 'testnet'.`);
	}
	return contracts;
}

// Common ABIs
export const ERC20_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address owner) view returns (uint256)',
	'function transfer(address to, uint256 amount) returns (bool)',
	'function approve(address spender, uint256 amount) returns (bool)',
	'function allowance(address owner, address spender) view returns (uint256)',
	'function transferFrom(address from, address to, uint256 amount) returns (bool)',
	'event Transfer(address indexed from, address indexed to, uint256 value)',
	'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export const ERC721_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function tokenURI(uint256 tokenId) view returns (string)',
	'function balanceOf(address owner) view returns (uint256)',
	'function ownerOf(uint256 tokenId) view returns (address)',
	'function safeTransferFrom(address from, address to, uint256 tokenId)',
	'function transferFrom(address from, address to, uint256 tokenId)',
	'function approve(address to, uint256 tokenId)',
	'function setApprovalForAll(address operator, bool approved)',
	'function getApproved(uint256 tokenId) view returns (address)',
	'function isApprovedForAll(address owner, address operator) view returns (bool)',
	'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
	'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)',
	'event ApprovalForAll(address indexed owner, address indexed operator, bool approved)',
];

export const ERC1155_ABI = [
	'function uri(uint256 id) view returns (string)',
	'function balanceOf(address account, uint256 id) view returns (uint256)',
	'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
	'function setApprovalForAll(address operator, bool approved)',
	'function isApprovedForAll(address account, address operator) view returns (bool)',
	'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
	'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes data)',
	'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
	'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)',
	'event ApprovalForAll(address indexed account, address indexed operator, bool approved)',
];

export const WRAPPED_BEAM_ABI = [
	...ERC20_ABI,
	'function deposit() payable',
	'function withdraw(uint256 amount)',
];

export const MARKETPLACE_ABI = [
	'function createListing(address nftContract, uint256 tokenId, uint256 price, uint256 duration)',
	'function cancelListing(bytes32 listingId)',
	'function buyNFT(bytes32 listingId) payable',
	'function makeOffer(bytes32 listingId, uint256 offerPrice) payable',
	'function acceptOffer(bytes32 offerId)',
	'function cancelOffer(bytes32 offerId)',
	'function getListing(bytes32 listingId) view returns (tuple(address seller, address nftContract, uint256 tokenId, uint256 price, uint256 expiry, bool active))',
	'event ListingCreated(bytes32 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price)',
	'event ListingCancelled(bytes32 indexed listingId)',
	'event Sale(bytes32 indexed listingId, address indexed buyer, uint256 price)',
	'event OfferMade(bytes32 indexed offerId, bytes32 indexed listingId, address indexed offerer, uint256 price)',
	'event OfferAccepted(bytes32 indexed offerId)',
	'event OfferCancelled(bytes32 indexed offerId)',
];

export const STAKING_ABI = [
	'function stake(uint256 amount)',
	'function unstake(uint256 amount)',
	'function claimRewards()',
	'function getStakedBalance(address account) view returns (uint256)',
	'function getPendingRewards(address account) view returns (uint256)',
	'function getAPY() view returns (uint256)',
	'event Staked(address indexed user, uint256 amount)',
	'event Unstaked(address indexed user, uint256 amount)',
	'event RewardsClaimed(address indexed user, uint256 amount)',
];

export const BRIDGE_ABI = [
	'function bridgeToChain(uint256 destChainId, address recipient, uint256 amount) payable',
	'function getBridgeFee(uint256 destChainId, uint256 amount) view returns (uint256)',
	'function getPendingBridges(address user) view returns (tuple(uint256 id, uint256 amount, uint256 destChainId, uint256 timestamp, uint8 status)[])',
	'event BridgeInitiated(uint256 indexed bridgeId, address indexed sender, uint256 destChainId, uint256 amount)',
	'event BridgeCompleted(uint256 indexed bridgeId, address indexed recipient, uint256 amount)',
];
