/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	weiToBeam,
	beamToWei,
	formatBeam,
	weiToGwei,
	gweiToWei,
	formatNumber,
	formatBalance,
	truncateAddress,
	isHexString,
	formatDuration,
} from '../../nodes/Beam/utils/unitConverter';

describe('Unit Converter', () => {
	describe('weiToBeam', () => {
		it('should convert wei to BEAM correctly', () => {
			expect(weiToBeam('1000000000000000000')).toBe('1.0');
			expect(weiToBeam('500000000000000000')).toBe('0.5');
			expect(weiToBeam('0')).toBe('0.0');
		});

		it('should handle large numbers', () => {
			expect(weiToBeam('100000000000000000000')).toBe('100.0');
		});

		it('should handle bigint input', () => {
			expect(weiToBeam(BigInt('1000000000000000000'))).toBe('1.0');
		});
	});

	describe('beamToWei', () => {
		it('should convert BEAM to wei correctly', () => {
			expect(beamToWei('1')).toBe(BigInt('1000000000000000000'));
			expect(beamToWei('0.5')).toBe(BigInt('500000000000000000'));
		});

		it('should handle number inputs', () => {
			expect(beamToWei(1)).toBe(BigInt('1000000000000000000'));
		});
	});

	describe('formatBeam', () => {
		it('should format BEAM with specified decimals', () => {
			expect(formatBeam('1000000000000000000', 2)).toBe('1');
			expect(formatBeam('1500000000000000000', 2)).toBe('1.5');
		});

		it('should use default 4 decimals', () => {
			expect(formatBeam('1000000000000000000')).toBe('1');
		});

		it('should handle zero', () => {
			expect(formatBeam('0')).toBe('0');
		});
	});

	describe('weiToGwei', () => {
		it('should convert wei to gwei correctly', () => {
			expect(weiToGwei('1000000000')).toBe('1.0');
			expect(weiToGwei('500000000')).toBe('0.5');
		});
	});

	describe('gweiToWei', () => {
		it('should convert gwei to wei correctly', () => {
			expect(gweiToWei('1')).toBe(BigInt('1000000000'));
			expect(gweiToWei(1)).toBe(BigInt('1000000000'));
		});
	});

	describe('formatNumber', () => {
		it('should format numbers with commas', () => {
			expect(formatNumber(1000)).toBe('1,000');
			expect(formatNumber(1000000)).toBe('1,000,000');
			expect(formatNumber('1234567.89')).toBe('1,234,567.89');
		});
	});

	describe('formatBalance', () => {
		it('should format balance for display', () => {
			expect(formatBalance('1000000000000000000')).toBe('1');
			expect(formatBalance('0')).toBe('0');
		});
	});

	describe('truncateAddress', () => {
		it('should truncate address correctly', () => {
			const address = '0x1234567890abcdef1234567890abcdef12345678';
			expect(truncateAddress(address)).toBe('0x1234...5678');
			expect(truncateAddress(address, 6)).toBe('0x123456...345678');
		});

		it('should handle empty address', () => {
			expect(truncateAddress('')).toBe('');
		});
	});

	describe('isHexString', () => {
		it('should validate hex strings', () => {
			expect(isHexString('0x1234')).toBe(true);
			expect(isHexString('0xabcdef')).toBe(true);
			expect(isHexString('0xABCDEF')).toBe(true);
			expect(isHexString('1234')).toBe(false);
			expect(isHexString('0xGHIJ')).toBe(false);
		});
	});

	describe('formatDuration', () => {
		it('should format duration correctly', () => {
			expect(formatDuration(30)).toBe('30s');
			expect(formatDuration(90)).toBe('1m 30s');
			expect(formatDuration(3700)).toBe('1h 1m');
			expect(formatDuration(90000)).toBe('1d 1h');
		});
	});
});
