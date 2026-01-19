/**
 * Beam Token Registry
 * 
 * Common tokens on the Beam network including
 * BEAM, wrapped BEAM, Merit Circle (MC), and popular gaming tokens.
 */

export interface TokenInfo {
	name: string;
	symbol: string;
	decimals: number;
	address: string;
	logoUri?: string;
	isNative?: boolean;
}

export const NATIVE_BEAM: TokenInfo = {
	name: 'BEAM',
	symbol: 'BEAM',
	decimals: 18,
	address: '0x0000000000000000000000000000000000000000',
	isNative: true,
};

export const MAINNET_TOKENS: Record<string, TokenInfo> = {
	BEAM: NATIVE_BEAM,
	WBEAM: {
		name: 'Wrapped BEAM',
		symbol: 'WBEAM',
		decimals: 18,
		address: '0x76BF5E7d2Bcb06b1444C0a2742780051D8D0E304',
	},
	MC: {
		name: 'Merit Circle',
		symbol: 'MC',
		decimals: 18,
		address: '0x949D48EcA67b17269629c7194F4b727d4Ef9E5d6',
	},
	USDC: {
		name: 'USD Coin',
		symbol: 'USDC',
		decimals: 6,
		address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
	},
	USDT: {
		name: 'Tether USD',
		symbol: 'USDT',
		decimals: 6,
		address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
	},
	AVAX: {
		name: 'Avalanche',
		symbol: 'AVAX',
		decimals: 18,
		address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
	},
	ETH: {
		name: 'Wrapped Ether',
		symbol: 'WETH',
		decimals: 18,
		address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
	},
};

export const TESTNET_TOKENS: Record<string, TokenInfo> = {
	BEAM: NATIVE_BEAM,
	WBEAM: {
		name: 'Wrapped BEAM',
		symbol: 'WBEAM',
		decimals: 18,
		address: '0x76BF5E7d2Bcb06b1444C0a2742780051D8D0E304',
	},
	MC: {
		name: 'Merit Circle (Test)',
		symbol: 'tMC',
		decimals: 18,
		address: '0x1234567890123456789012345678901234567890',
	},
	USDC: {
		name: 'USD Coin (Test)',
		symbol: 'tUSDC',
		decimals: 6,
		address: '0x2345678901234567890123456789012345678901',
	},
};

export const TOKENS: Record<string, Record<string, TokenInfo>> = {
	mainnet: MAINNET_TOKENS,
	testnet: TESTNET_TOKENS,
};

export function getToken(network: string, symbol: string): TokenInfo | undefined {
	const networkTokens = TOKENS[network];
	if (!networkTokens) {
		return undefined;
	}
	return networkTokens[symbol.toUpperCase()];
}

export function getTokenByAddress(network: string, address: string): TokenInfo | undefined {
	const networkTokens = TOKENS[network];
	if (!networkTokens) {
		return undefined;
	}
	const normalizedAddress = address.toLowerCase();
	return Object.values(networkTokens).find(
		t => t.address.toLowerCase() === normalizedAddress
	);
}

export function getAllTokens(network: string): TokenInfo[] {
	const networkTokens = TOKENS[network];
	if (!networkTokens) {
		return [];
	}
	return Object.values(networkTokens);
}

// Common token pairs for DEX
export const COMMON_PAIRS = [
	['BEAM', 'WBEAM'],
	['BEAM', 'USDC'],
	['BEAM', 'MC'],
	['WBEAM', 'USDC'],
	['WBEAM', 'MC'],
	['MC', 'USDC'],
];

// Stablecoin addresses for price calculations
export const STABLECOINS = ['USDC', 'USDT'];

export function isStablecoin(symbol: string): boolean {
	return STABLECOINS.includes(symbol.toUpperCase());
}
