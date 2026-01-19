/**
 * Gaming Utilities for Beam
 * 
 * Helper functions for gaming-related operations including
 * player profiles, achievements, and in-game asset management.
 */

import { PLAYER_LEVELS, RARITY_LEVELS, getLevelForXP } from '../constants/games';

export interface PlayerStats {
	gamesPlayed: number;
	wins: number;
	losses: number;
	draws: number;
	totalXP: number;
	level: number;
	rank?: string;
}

export interface Achievement {
	id: string;
	name: string;
	description: string;
	unlockedAt?: number;
	progress?: number;
	maxProgress?: number;
}

export interface GameAsset {
	tokenId: string;
	contractAddress: string;
	name: string;
	rarity: string;
	attributes: Record<string, string | number>;
	gameId?: string;
	equipped?: boolean;
}

/**
 * Calculate player level from XP
 */
export function calculateLevel(xp: number): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
	const level = getLevelForXP(xp);
	const currentLevelXP = PLAYER_LEVELS[level as keyof typeof PLAYER_LEVELS] || 0;
	const nextLevelXP = PLAYER_LEVELS[(level + 1) as keyof typeof PLAYER_LEVELS] || currentLevelXP;
	
	const xpInLevel = xp - currentLevelXP;
	const xpNeeded = nextLevelXP - currentLevelXP;
	const progress = xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 100;
	
	return {
		level,
		currentXP: xpInLevel,
		nextLevelXP: xpNeeded,
		progress: Math.min(progress, 100),
	};
}

/**
 * Calculate win rate
 */
export function calculateWinRate(wins: number, total: number): number {
	if (total === 0) return 0;
	return (wins / total) * 100;
}

/**
 * Get rank based on rating/score
 */
export function getRank(rating: number): string {
	if (rating >= 2500) return 'Grandmaster';
	if (rating >= 2200) return 'Master';
	if (rating >= 1900) return 'Diamond';
	if (rating >= 1600) return 'Platinum';
	if (rating >= 1300) return 'Gold';
	if (rating >= 1000) return 'Silver';
	if (rating >= 700) return 'Bronze';
	return 'Unranked';
}

/**
 * Parse player stats from chain data
 */
export function parsePlayerStats(data: {
	gamesPlayed: bigint | number;
	wins: bigint | number;
	losses: bigint | number;
	totalXP: bigint | number;
}): PlayerStats {
	const gamesPlayed = Number(data.gamesPlayed);
	const wins = Number(data.wins);
	const losses = Number(data.losses);
	const draws = gamesPlayed - wins - losses;
	const totalXP = Number(data.totalXP);
	
	return {
		gamesPlayed,
		wins,
		losses,
		draws,
		totalXP,
		level: getLevelForXP(totalXP),
	};
}

/**
 * Check if achievement is unlocked
 */
export function isAchievementUnlocked(achievement: Achievement): boolean {
	if (achievement.unlockedAt) return true;
	if (achievement.progress !== undefined && achievement.maxProgress !== undefined) {
		return achievement.progress >= achievement.maxProgress;
	}
	return false;
}

/**
 * Calculate achievement progress percentage
 */
export function getAchievementProgress(achievement: Achievement): number {
	if (achievement.unlockedAt) return 100;
	if (achievement.progress === undefined || achievement.maxProgress === undefined) return 0;
	return Math.min((achievement.progress / achievement.maxProgress) * 100, 100);
}

/**
 * Sort assets by rarity (highest first)
 */
export function sortByRarity(assets: GameAsset[]): GameAsset[] {
	return [...assets].sort((a, b) => {
		const aIndex = RARITY_LEVELS.indexOf(a.rarity.toLowerCase());
		const bIndex = RARITY_LEVELS.indexOf(b.rarity.toLowerCase());
		return bIndex - aIndex;
	});
}

/**
 * Filter assets by rarity threshold
 */
export function filterByMinRarity(assets: GameAsset[], minRarity: string): GameAsset[] {
	const minIndex = RARITY_LEVELS.indexOf(minRarity.toLowerCase());
	if (minIndex === -1) return assets;
	
	return assets.filter(asset => {
		const assetIndex = RARITY_LEVELS.indexOf(asset.rarity.toLowerCase());
		return assetIndex >= minIndex;
	});
}

/**
 * Group assets by game
 */
export function groupAssetsByGame(assets: GameAsset[]): Record<string, GameAsset[]> {
	return assets.reduce((acc, asset) => {
		const gameId = asset.gameId || 'unknown';
		if (!acc[gameId]) {
			acc[gameId] = [];
		}
		acc[gameId].push(asset);
		return acc;
	}, {} as Record<string, GameAsset[]>);
}

/**
 * Calculate total asset value (based on rarity weights)
 */
export function calculateAssetValue(assets: GameAsset[]): number {
	const rarityWeights: Record<string, number> = {
		common: 1,
		uncommon: 5,
		rare: 25,
		epic: 100,
		legendary: 500,
		mythic: 2500,
	};
	
	return assets.reduce((total, asset) => {
		const weight = rarityWeights[asset.rarity.toLowerCase()] || 1;
		return total + weight;
	}, 0);
}

/**
 * Format leaderboard entry
 */
export function formatLeaderboardEntry(entry: {
	address: string;
	score: number;
	rank: number;
	playerName?: string;
}): string {
	const name = entry.playerName || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`;
	return `#${entry.rank} ${name}: ${entry.score.toLocaleString()}`;
}

/**
 * Validate game action parameters
 */
export function validateGameAction(action: string, params: Record<string, unknown>): { valid: boolean; error?: string } {
	const requiredParams: Record<string, string[]> = {
		move: ['direction', 'distance'],
		attack: ['target', 'weapon'],
		use_item: ['itemId'],
		trade: ['itemId', 'recipientAddress', 'price'],
		equip: ['itemId', 'slot'],
		unequip: ['slot'],
	};
	
	const required = requiredParams[action];
	if (!required) {
		return { valid: true }; // Unknown action, allow it
	}
	
	for (const param of required) {
		if (params[param] === undefined || params[param] === null) {
			return { valid: false, error: `Missing required parameter: ${param}` };
		}
	}
	
	return { valid: true };
}

/**
 * Generate match ID
 */
export function generateMatchId(): string {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).substring(2, 8);
	return `match-${timestamp}-${random}`;
}

/**
 * Parse match result
 */
export function parseMatchResult(result: number): 'win' | 'loss' | 'draw' {
	if (result === 1) return 'win';
	if (result === -1) return 'loss';
	return 'draw';
}

/**
 * Calculate ELO rating change
 */
export function calculateEloChange(
	playerRating: number,
	opponentRating: number,
	result: 'win' | 'loss' | 'draw',
	kFactor: number = 32
): number {
	const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
	const actualScore = result === 'win' ? 1 : result === 'loss' ? 0 : 0.5;
	return Math.round(kFactor * (actualScore - expectedScore));
}
