/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NETWORKS, getNetworkConfig, BEAM_MAINNET, BEAM_TESTNET } from '../../nodes/Beam/constants/networks';
import { MAINNET_CONTRACTS, TESTNET_CONTRACTS, getContracts, CONTRACTS } from '../../nodes/Beam/constants/contracts';
import { MAINNET_TOKENS, TESTNET_TOKENS, getToken, getTokenByAddress, TOKENS } from '../../nodes/Beam/constants/tokens';

describe('Network Constants', () => {
	describe('NETWORKS', () => {
		it('should have mainnet configuration', () => {
			expect(NETWORKS.mainnet).toBeDefined();
			expect(NETWORKS.mainnet.chainId).toBe(4337);
			expect(NETWORKS.mainnet.rpcUrl).toBeDefined();
		});

		it('should have testnet configuration', () => {
			expect(NETWORKS.testnet).toBeDefined();
			expect(NETWORKS.testnet.chainId).toBe(13337);
			expect(NETWORKS.testnet.rpcUrl).toBeDefined();
		});
	});

	describe('BEAM_MAINNET', () => {
		it('should have correct chain ID', () => {
			expect(BEAM_MAINNET.chainId).toBe(4337);
		});

		it('should have native currency defined', () => {
			expect(BEAM_MAINNET.nativeCurrency.symbol).toBe('BEAM');
			expect(BEAM_MAINNET.nativeCurrency.decimals).toBe(18);
		});
	});

	describe('BEAM_TESTNET', () => {
		it('should have correct chain ID', () => {
			expect(BEAM_TESTNET.chainId).toBe(13337);
		});

		it('should be marked as testnet', () => {
			expect(BEAM_TESTNET.isTestnet).toBe(true);
		});
	});

	describe('getNetworkConfig', () => {
		it('should return mainnet config', () => {
			const config = getNetworkConfig('mainnet');
			expect(config.chainId).toBe(4337);
		});

		it('should return testnet config', () => {
			const config = getNetworkConfig('testnet');
			expect(config.chainId).toBe(13337);
		});

		it('should throw for invalid network', () => {
			expect(() => getNetworkConfig('invalid')).toThrow();
		});
	});
});

describe('Contract Constants', () => {
	describe('MAINNET_CONTRACTS', () => {
		it('should have required contract addresses', () => {
			expect(MAINNET_CONTRACTS.wrappedBeam).toBeDefined();
			expect(MAINNET_CONTRACTS.sphereMarketplace).toBeDefined();
			expect(MAINNET_CONTRACTS.beamSwapRouter).toBeDefined();
			expect(MAINNET_CONTRACTS.mcToken).toBeDefined();
		});

		it('should have valid ethereum addresses', () => {
			expect(MAINNET_CONTRACTS.wrappedBeam).toMatch(/^0x[a-fA-F0-9]{40}$/);
			expect(MAINNET_CONTRACTS.sphereMarketplace).toMatch(/^0x[a-fA-F0-9]{40}$/);
		});
	});

	describe('TESTNET_CONTRACTS', () => {
		it('should have required contract addresses', () => {
			expect(TESTNET_CONTRACTS.wrappedBeam).toBeDefined();
			expect(TESTNET_CONTRACTS.sphereMarketplace).toBeDefined();
		});
	});

	describe('getContracts', () => {
		it('should return mainnet contracts', () => {
			const contracts = getContracts('mainnet');
			expect(contracts.wrappedBeam).toBe(MAINNET_CONTRACTS.wrappedBeam);
		});

		it('should return testnet contracts', () => {
			const contracts = getContracts('testnet');
			expect(contracts.wrappedBeam).toBe(TESTNET_CONTRACTS.wrappedBeam);
		});

		it('should throw for invalid network', () => {
			expect(() => getContracts('invalid')).toThrow();
		});
	});
});

describe('Token Constants', () => {
	describe('MAINNET_TOKENS', () => {
		it('should have BEAM token defined', () => {
			expect(MAINNET_TOKENS.BEAM).toBeDefined();
			expect(MAINNET_TOKENS.BEAM.symbol).toBe('BEAM');
			expect(MAINNET_TOKENS.BEAM.decimals).toBe(18);
		});

		it('should have WBEAM token defined', () => {
			expect(MAINNET_TOKENS.WBEAM).toBeDefined();
			expect(MAINNET_TOKENS.WBEAM.symbol).toBe('WBEAM');
		});

		it('should have MC token defined', () => {
			expect(MAINNET_TOKENS.MC).toBeDefined();
			expect(MAINNET_TOKENS.MC.symbol).toBe('MC');
		});
	});

	describe('getToken', () => {
		it('should return token by symbol', () => {
			const token = getToken('mainnet', 'BEAM');
			expect(token).toBeDefined();
			expect(token?.symbol).toBe('BEAM');
		});

		it('should return undefined for unknown symbol', () => {
			const token = getToken('mainnet', 'UNKNOWN');
			expect(token).toBeUndefined();
		});

		it('should be case insensitive', () => {
			const token = getToken('mainnet', 'beam');
			expect(token).toBeDefined();
			expect(token?.symbol).toBe('BEAM');
		});
	});

	describe('getTokenByAddress', () => {
		it('should return token by address', () => {
			const token = getTokenByAddress('mainnet', MAINNET_TOKENS.WBEAM.address);
			expect(token).toBeDefined();
			expect(token?.symbol).toBe('WBEAM');
		});

		it('should return undefined for unknown address', () => {
			const token = getTokenByAddress('mainnet', '0x0000000000000000000000000000000000000001');
			expect(token).toBeUndefined();
		});
	});
});
