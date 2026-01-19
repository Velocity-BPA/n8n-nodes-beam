import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const playerOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['player'] } },
	options: [
		{ name: 'Get Player Info', value: 'getPlayerInfo', description: 'Get player information', action: 'Get player info' },
		{ name: 'Get Player Stats', value: 'getPlayerStats', description: 'Get player statistics', action: 'Get player stats' },
		{ name: 'Get Player NFTs', value: 'getPlayerNfts', description: 'Get player NFTs', action: 'Get player nfts' },
		{ name: 'Get Player History', value: 'getPlayerHistory', description: 'Get player history', action: 'Get player history' },
		{ name: 'Get Player Ranking', value: 'getPlayerRanking', description: 'Get player ranking', action: 'Get player ranking' },
		{ name: 'Link Player Account', value: 'linkPlayerAccount', description: 'Link player account', action: 'Link player account' },
		{ name: 'Update Player Profile', value: 'updatePlayerProfile', description: 'Update player profile', action: 'Update player profile' },
		{ name: 'Get Player Achievements', value: 'getPlayerAchievements', description: 'Get achievements', action: 'Get achievements' },
		{ name: 'Get Player Rewards', value: 'getPlayerRewards', description: 'Get player rewards', action: 'Get player rewards' },
	],
	default: 'getPlayerInfo',
};

export const playerFields: INodeProperties[] = [
	{
		displayName: 'Player ID',
		name: 'playerId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['player'], operation: ['getPlayerInfo', 'getPlayerStats', 'getPlayerNfts', 'getPlayerHistory', 'getPlayerRanking', 'updatePlayerProfile', 'getPlayerAchievements', 'getPlayerRewards'] } },
	},
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['player'], operation: ['linkPlayerAccount'] } },
	},
	{
		displayName: 'Platform',
		name: 'platform',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['player'], operation: ['linkPlayerAccount'] } },
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['player'], operation: ['updatePlayerProfile'] } },
	},
	{
		displayName: 'Game ID',
		name: 'gameId',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['player'], operation: ['getPlayerRanking', 'getPlayerAchievements'] } },
	},
];

export async function executePlayer(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	switch (operation) {
		case 'getPlayerInfo': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return {
				playerId,
				username: '',
				level: 1,
				xp: 0,
				createdAt: new Date().toISOString(),
				timestamp: new Date().toISOString(),
			};
		}
		case 'getPlayerStats': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return {
				playerId,
				gamesPlayed: 0,
				wins: 0,
				losses: 0,
				totalXP: 0,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getPlayerNfts': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return {
				playerId,
				nfts: [],
				total: 0,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getPlayerHistory': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return {
				playerId,
				history: [],
				total: 0,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getPlayerRanking': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			const gameId = this.getNodeParameter('gameId', index, '') as string;
			return {
				playerId,
				gameId,
				rank: 0,
				score: 0,
				timestamp: new Date().toISOString(),
			};
		}
		case 'linkPlayerAccount': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			const platform = this.getNodeParameter('platform', index) as string;
			return {
				walletAddress,
				platform,
				linked: true,
				timestamp: new Date().toISOString(),
			};
		}
		case 'updatePlayerProfile': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			const username = this.getNodeParameter('username', index) as string;
			return {
				playerId,
				username,
				updated: true,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getPlayerAchievements': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return {
				playerId,
				achievements: [],
				total: 0,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getPlayerRewards': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return {
				playerId,
				rewards: [],
				total: 0,
				timestamp: new Date().toISOString(),
			};
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
