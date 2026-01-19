/**
 * Gaming Client for Beam
 * 
 * Handles gaming-specific operations including player profiles,
 * achievements, in-game assets, and game integrations.
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { GAMES_REGISTRY, type GameInfo } from '../constants/games';

export interface GamingClientConfig {
	apiEndpoint: string;
	apiKey: string;
	projectId: string;
}

export interface PlayerProfile {
	id: string;
	address: string;
	username?: string;
	avatar?: string;
	level: number;
	xp: number;
	gamesPlayed: number;
	achievements: string[];
	createdAt: number;
	lastActive: number;
}

export interface PlayerStats {
	gameId: string;
	wins: number;
	losses: number;
	draws: number;
	totalMatches: number;
	rank?: string;
	rating?: number;
	highScore?: number;
}

export interface Achievement {
	id: string;
	name: string;
	description: string;
	image?: string;
	points: number;
	rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
	gameId?: string;
	unlockedAt?: number;
}

export interface GameAsset {
	tokenId: string;
	contractAddress: string;
	name: string;
	description?: string;
	image?: string;
	rarity: string;
	gameId: string;
	equipped: boolean;
	attributes: Record<string, string | number>;
}

export interface Match {
	id: string;
	gameId: string;
	players: string[];
	winner?: string;
	status: 'pending' | 'active' | 'completed' | 'cancelled';
	startedAt: number;
	endedAt?: number;
	result?: Record<string, unknown>;
}

export interface LeaderboardEntry {
	rank: number;
	address: string;
	username?: string;
	score: number;
	wins?: number;
	games?: number;
}

export class GamingClient {
	private client: AxiosInstance;
	private projectId: string;

	constructor(config: GamingClientConfig) {
		this.projectId = config.projectId;
		
		this.client = axios.create({
			baseURL: config.apiEndpoint,
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': config.apiKey,
				'x-project-id': config.projectId,
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
				`Gaming API error (${error.response.status}): ${data.message || data.error || 'Unknown error'}`
			);
		}
		throw error;
	}

	// ============ Game Operations ============

	/**
	 * Get game info
	 */
	async getGameInfo(gameId: string): Promise<GameInfo | null> {
		// First check local registry
		const localGame = GAMES_REGISTRY.find(g => g.id === gameId);
		if (localGame) return localGame;

		// Try API if not found locally
		try {
			const response = await this.client.get(`/v1/games/${gameId}`);
			return response.data;
		} catch {
			return null;
		}
	}

	/**
	 * Get available games
	 */
	async getAvailableGames(params?: {
		category?: string;
		status?: 'live' | 'beta' | 'upcoming';
		limit?: number;
	}): Promise<GameInfo[]> {
		try {
			const response = await this.client.get('/v1/games', { params });
			return response.data.games;
		} catch {
			// Fall back to local registry
			let games = [...GAMES_REGISTRY];
			if (params?.category) {
				games = games.filter(g => g.categories.includes(params.category!));
			}
			if (params?.status) {
				games = games.filter(g => g.status === params.status);
			}
			if (params?.limit) {
				games = games.slice(0, params.limit);
			}
			return games;
		}
	}

	/**
	 * Get game stats
	 */
	async getGameStats(gameId: string): Promise<{
		totalPlayers: number;
		activePlayers24h: number;
		totalMatches: number;
		matches24h: number;
		totalAssets: number;
	}> {
		try {
			const response = await this.client.get(`/v1/games/${gameId}/stats`);
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Player Operations ============

	/**
	 * Get player profile
	 */
	async getPlayerProfile(address: string): Promise<PlayerProfile | null> {
		try {
			const response = await this.client.get(`/v1/players/${address}`);
			return response.data;
		} catch {
			return null;
		}
	}

	/**
	 * Get player stats for a game
	 */
	async getPlayerStats(address: string, gameId: string): Promise<PlayerStats | null> {
		try {
			const response = await this.client.get(`/v1/players/${address}/stats/${gameId}`);
			return response.data;
		} catch {
			return null;
		}
	}

	/**
	 * Get player inventory (assets)
	 */
	async getPlayerInventory(
		address: string,
		params?: {
			gameId?: string;
			equipped?: boolean;
			rarity?: string;
			limit?: number;
			offset?: number;
		}
	): Promise<{ assets: GameAsset[]; total: number }> {
		try {
			const response = await this.client.get(`/v1/players/${address}/inventory`, { params });
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get player achievements
	 */
	async getPlayerAchievements(
		address: string,
		params?: {
			gameId?: string;
			unlocked?: boolean;
		}
	): Promise<Achievement[]> {
		try {
			const response = await this.client.get(`/v1/players/${address}/achievements`, { params });
			return response.data.achievements;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Link player account
	 */
	async linkPlayerAccount(
		address: string,
		platform: string,
		platformId: string,
		signature: string
	): Promise<{ success: boolean }> {
		try {
			const response = await this.client.post(`/v1/players/${address}/link`, {
				platform,
				platformId,
				signature,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Update player profile
	 */
	async updatePlayerProfile(
		address: string,
		updates: {
			username?: string;
			avatar?: string;
		},
		signature: string
	): Promise<PlayerProfile> {
		try {
			const response = await this.client.patch(`/v1/players/${address}`, {
				...updates,
				signature,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Match Operations ============

	/**
	 * Get match info
	 */
	async getMatch(matchId: string): Promise<Match | null> {
		try {
			const response = await this.client.get(`/v1/matches/${matchId}`);
			return response.data;
		} catch {
			return null;
		}
	}

	/**
	 * Get player match history
	 */
	async getMatchHistory(
		address: string,
		params?: {
			gameId?: string;
			status?: string;
			limit?: number;
			offset?: number;
		}
	): Promise<{ matches: Match[]; total: number }> {
		try {
			const response = await this.client.get(`/v1/players/${address}/matches`, { params });
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Leaderboard Operations ============

	/**
	 * Get leaderboard
	 */
	async getLeaderboard(
		gameId: string,
		params?: {
			period?: '24h' | '7d' | '30d' | 'all';
			limit?: number;
			offset?: number;
		}
	): Promise<{ entries: LeaderboardEntry[]; total: number }> {
		try {
			const response = await this.client.get(`/v1/games/${gameId}/leaderboard`, { params });
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get player ranking
	 */
	async getPlayerRanking(address: string, gameId: string): Promise<{
		rank: number;
		score: number;
		totalPlayers: number;
		percentile: number;
	} | null> {
		try {
			const response = await this.client.get(`/v1/games/${gameId}/leaderboard/rank/${address}`);
			return response.data;
		} catch {
			return null;
		}
	}

	// ============ Game Actions ============

	/**
	 * Execute a game action
	 */
	async executeGameAction(
		gameId: string,
		action: string,
		params: Record<string, unknown>,
		signature: string
	): Promise<{
		success: boolean;
		result?: Record<string, unknown>;
		txHash?: string;
	}> {
		try {
			const response = await this.client.post(`/v1/games/${gameId}/actions`, {
				action,
				params,
				signature,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Claim game rewards
	 */
	async claimRewards(
		gameId: string,
		rewardIds: string[],
		signature: string
	): Promise<{
		success: boolean;
		claimed: Array<{
			id: string;
			type: string;
			amount?: string;
			tokenId?: string;
		}>;
		txHash: string;
	}> {
		try {
			const response = await this.client.post(`/v1/games/${gameId}/rewards/claim`, {
				rewardIds,
				signature,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Get available rewards
	 */
	async getAvailableRewards(address: string, gameId?: string): Promise<Array<{
		id: string;
		type: string;
		name: string;
		description?: string;
		amount?: string;
		tokenId?: string;
		expiresAt?: number;
	}>> {
		try {
			const params = gameId ? { gameId } : {};
			const response = await this.client.get(`/v1/players/${address}/rewards`, { params });
			return response.data.rewards;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	// ============ Asset Operations ============

	/**
	 * Get asset info
	 */
	async getAssetInfo(contractAddress: string, tokenId: string): Promise<GameAsset | null> {
		try {
			const response = await this.client.get(`/v1/assets/${contractAddress}/${tokenId}`);
			return response.data;
		} catch {
			return null;
		}
	}

	/**
	 * Get game assets
	 */
	async getGameAssets(
		gameId: string,
		params?: {
			type?: string;
			rarity?: string;
			limit?: number;
			offset?: number;
		}
	): Promise<{ assets: GameAsset[]; total: number }> {
		try {
			const response = await this.client.get(`/v1/games/${gameId}/assets`, { params });
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}

	/**
	 * Equip/unequip asset
	 */
	async toggleEquipAsset(
		address: string,
		contractAddress: string,
		tokenId: string,
		equip: boolean,
		signature: string
	): Promise<{ success: boolean }> {
		try {
			const response = await this.client.post(`/v1/players/${address}/inventory/equip`, {
				contractAddress,
				tokenId,
				equip,
				signature,
			});
			return response.data;
		} catch (error) {
			this.handleError(error as AxiosError);
		}
	}
}

/**
 * Create gaming client from credentials
 */
export function createGamingClient(credentials: {
	apiEndpoint: string;
	customApiUrl?: string;
	apiKey: string;
	projectId: string;
}): GamingClient {
	const endpoint = credentials.apiEndpoint === 'custom'
		? credentials.customApiUrl!
		: credentials.apiEndpoint;
		
	return new GamingClient({
		apiEndpoint: endpoint,
		apiKey: credentials.apiKey,
		projectId: credentials.projectId,
	});
}
