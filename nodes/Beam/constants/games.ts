/**
 * Beam Games Registry
 * 
 * Registry of games integrated with the Beam ecosystem.
 * Beam is specifically designed for gaming with native support
 * for player profiles, in-game assets, and cross-game interoperability.
 */

export interface GameInfo {
	id: string;
	name: string;
	description: string;
	developer: string;
	website?: string;
	contractAddress?: string;
	nftCollections?: string[];
	categories: string[];
	status: 'live' | 'beta' | 'upcoming';
}

export const GAMES_REGISTRY: GameInfo[] = [
	{
		id: 'trial-xtreme',
		name: 'Trial Xtreme',
		description: 'Extreme motorcycle racing game with NFT bikes and tracks',
		developer: 'Deemedya',
		website: 'https://trialxtreme.com',
		categories: ['racing', 'sports'],
		status: 'live',
	},
	{
		id: 'walker-world',
		name: 'Walker World',
		description: 'Open world exploration game with collectible NFT items',
		developer: 'Walker World Studios',
		website: 'https://walkerworld.io',
		categories: ['adventure', 'open-world'],
		status: 'live',
	},
	{
		id: 'hash-rush',
		name: 'Hash Rush',
		description: 'Real-time strategy game with blockchain-based economy',
		developer: 'Vorto Gaming',
		website: 'https://hashrush.com',
		categories: ['strategy', 'rts'],
		status: 'live',
	},
	{
		id: 'edenbrawl',
		name: 'Edenbrawl',
		description: 'Competitive arena brawler with NFT characters',
		developer: 'Bad Seed',
		website: 'https://edenbrawl.com',
		categories: ['fighting', 'pvp'],
		status: 'beta',
	},
	{
		id: 'monkeyball',
		name: 'MonkeyBall',
		description: 'Play-to-earn soccer game with monkey NFTs',
		developer: 'MonkeyBall',
		website: 'https://monkeyball.com',
		categories: ['sports', 'soccer'],
		status: 'live',
	},
];

export const GAME_CATEGORIES = [
	'racing',
	'sports',
	'adventure',
	'open-world',
	'strategy',
	'rts',
	'fighting',
	'pvp',
	'rpg',
	'shooter',
	'puzzle',
	'card',
	'casual',
];

export function getGameById(id: string): GameInfo | undefined {
	return GAMES_REGISTRY.find(g => g.id === id);
}

export function getGamesByCategory(category: string): GameInfo[] {
	return GAMES_REGISTRY.filter(g => g.categories.includes(category));
}

export function getGamesByStatus(status: 'live' | 'beta' | 'upcoming'): GameInfo[] {
	return GAMES_REGISTRY.filter(g => g.status === status);
}

export function getAllGames(): GameInfo[] {
	return GAMES_REGISTRY;
}

// Player profile levels and XP requirements
export const PLAYER_LEVELS = {
	1: 0,
	2: 100,
	3: 300,
	4: 600,
	5: 1000,
	6: 1500,
	7: 2100,
	8: 2800,
	9: 3600,
	10: 4500,
	11: 5500,
	12: 6600,
	13: 7800,
	14: 9100,
	15: 10500,
	16: 12000,
	17: 13600,
	18: 15300,
	19: 17100,
	20: 19000,
};

export function getLevelForXP(xp: number): number {
	let level = 1;
	for (const [lvl, requiredXp] of Object.entries(PLAYER_LEVELS)) {
		if (xp >= requiredXp) {
			level = parseInt(lvl);
		} else {
			break;
		}
	}
	return level;
}

// Achievement types
export const ACHIEVEMENT_TYPES = [
	'first_win',
	'winning_streak',
	'collector',
	'trader',
	'veteran',
	'explorer',
	'champion',
	'legendary',
];

// Asset rarity levels
export const RARITY_LEVELS = [
	'common',
	'uncommon',
	'rare',
	'epic',
	'legendary',
	'mythic',
];

export function getRarityIndex(rarity: string): number {
	return RARITY_LEVELS.indexOf(rarity.toLowerCase());
}

export function compareRarity(a: string, b: string): number {
	return getRarityIndex(a) - getRarityIndex(b);
}
