/**
 * Beam Network Configurations
 * 
 * Beam is an Avalanche subnet built specifically for gaming.
 * It offers fast finality, low fees, and native gaming features.
 */

export interface NetworkConfig {
	name: string;
	chainId: number;
	rpcUrl: string;
	wsUrl: string;
	explorerUrl: string;
	explorerApiUrl: string;
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	isTestnet: boolean;
}

export const BEAM_MAINNET: NetworkConfig = {
	name: 'Beam Mainnet',
	chainId: 4337,
	rpcUrl: 'https://build.onbeam.com/rpc',
	wsUrl: 'wss://build.onbeam.com/ws',
	explorerUrl: 'https://subnets.avax.network/beam',
	explorerApiUrl: 'https://api.routescan.io/v2/network/mainnet/evm/4337/etherscan',
	nativeCurrency: {
		name: 'BEAM',
		symbol: 'BEAM',
		decimals: 18,
	},
	isTestnet: false,
};

export const BEAM_TESTNET: NetworkConfig = {
	name: 'Beam Testnet',
	chainId: 13337,
	rpcUrl: 'https://build.onbeam.com/rpc/testnet',
	wsUrl: 'wss://build.onbeam.com/ws/testnet',
	explorerUrl: 'https://subnets-test.avax.network/beam',
	explorerApiUrl: 'https://api.routescan.io/v2/network/testnet/evm/13337/etherscan',
	nativeCurrency: {
		name: 'BEAM',
		symbol: 'BEAM',
		decimals: 18,
	},
	isTestnet: true,
};

export const NETWORKS: Record<string, NetworkConfig> = {
	mainnet: BEAM_MAINNET,
	testnet: BEAM_TESTNET,
};

export function getNetworkConfig(network: string): NetworkConfig {
	const config = NETWORKS[network];
	if (!config) {
		throw new Error(`Unknown network: ${network}. Use 'mainnet' or 'testnet'.`);
	}
	return config;
}

export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
	return Object.values(NETWORKS).find(n => n.chainId === chainId);
}

// API Endpoints
export const BEAM_API = {
	mainnet: 'https://api.onbeam.com',
	testnet: 'https://api.testnet.onbeam.com',
};

export const SPHERE_API = {
	mainnet: 'https://api.sphere.market',
	testnet: 'https://api.testnet.sphere.market',
};

// Bridge supported chains
export const BRIDGE_CHAINS = {
	ethereum: {
		chainId: 1,
		name: 'Ethereum',
		bridgeContract: '0x...',
	},
	avalanche: {
		chainId: 43114,
		name: 'Avalanche C-Chain',
		bridgeContract: '0x...',
	},
	arbitrum: {
		chainId: 42161,
		name: 'Arbitrum One',
		bridgeContract: '0x...',
	},
};

// Gas configuration
export const GAS_CONFIG = {
	defaultGasLimit: 21000,
	erc20TransferGas: 65000,
	erc721TransferGas: 100000,
	contractDeployGas: 3000000,
	maxPriorityFeePerGas: '1500000000', // 1.5 gwei
	maxFeePerGas: '30000000000', // 30 gwei
};
