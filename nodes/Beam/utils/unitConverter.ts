/**
 * Unit Conversion Utilities for Beam
 * 
 * Handles conversions between different unit representations
 * for BEAM tokens and other values.
 */

import { ethers } from 'ethers';

/**
 * Convert wei to BEAM (18 decimals)
 */
export function weiToBeam(wei: string | bigint): string {
	return ethers.formatEther(wei);
}

/**
 * Convert BEAM to wei
 */
export function beamToWei(beam: string | number): bigint {
	return ethers.parseEther(beam.toString());
}

/**
 * Convert wei to a token amount with custom decimals
 */
export function weiToToken(wei: string | bigint, decimals: number): string {
	return ethers.formatUnits(wei, decimals);
}

/**
 * Convert token amount to wei with custom decimals
 */
export function tokenToWei(amount: string | number, decimals: number): bigint {
	return ethers.parseUnits(amount.toString(), decimals);
}

/**
 * Format a number with commas for display
 */
export function formatNumber(num: number | string): string {
	const parts = num.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return parts.join('.');
}

/**
 * Format token balance for display
 */
export function formatBalance(balance: string | bigint, decimals: number = 18, displayDecimals: number = 4): string {
	const formatted = weiToToken(balance, decimals);
	const num = parseFloat(formatted);
	
	if (num === 0) return '0';
	if (num < 0.0001) return '< 0.0001';
	
	return num.toFixed(displayDecimals).replace(/\.?0+$/, '');
}

/**
 * Format BEAM amount for display
 */
export function formatBeam(wei: string | bigint, displayDecimals: number = 4): string {
	return formatBalance(wei, 18, displayDecimals);
}

/**
 * Parse a human-readable amount to BigInt
 */
export function parseAmount(amount: string, decimals: number = 18): bigint {
	// Remove commas and whitespace
	const cleaned = amount.replace(/,/g, '').trim();
	return ethers.parseUnits(cleaned, decimals);
}

/**
 * Convert gwei to wei
 */
export function gweiToWei(gwei: string | number): bigint {
	return ethers.parseUnits(gwei.toString(), 'gwei');
}

/**
 * Convert wei to gwei
 */
export function weiToGwei(wei: string | bigint): string {
	return ethers.formatUnits(wei, 'gwei');
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
	if (total === 0) return 0;
	return (part / total) * 100;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
	return `${value.toFixed(decimals)}%`;
}

/**
 * Convert seconds to human-readable duration
 */
export function formatDuration(seconds: number): string {
	if (seconds < 60) return `${seconds}s`;
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
	if (seconds < 86400) {
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${mins}m`;
	}
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	return `${days}d ${hours}h`;
}

/**
 * Format timestamp to date string
 */
export function formatTimestamp(timestamp: number): string {
	return new Date(timestamp * 1000).toISOString();
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
	if (!address) return '';
	return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Check if a string is a valid hex string
 */
export function isHexString(value: string): boolean {
	return /^0x[0-9a-fA-F]*$/.test(value);
}

/**
 * Pad hex string to specific length
 */
export function padHex(hex: string, length: number): string {
	const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
	return '0x' + clean.padStart(length, '0');
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
	return '0x' + Array.from(bytes)
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
	const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
	const bytes = new Uint8Array(clean.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
	}
	return bytes;
}
