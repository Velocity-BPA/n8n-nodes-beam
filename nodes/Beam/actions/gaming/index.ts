import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export const gamingOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['gaming'] } },
	options: [
		{ name: 'Get Game Info', value: 'getGameInfo', description: 'Get game information', action: 'Get game info' },
		{ name: 'Get Available Games', value: 'getAvailableGames', description: 'Get available games', action: 'Get available games' },
		{ name: 'Get Game Stats', value: 'getGameStats', description: 'Get game statistics', action: 'Get game stats' },
		{ name: 'Get Player Profile', value: 'getPlayerProfile', description: 'Get player profile', action: 'Get player profile' },
		{ name: 'Get Player Inventory', value: 'getPlayerInventory', description: 'Get player inventory', action: 'Get player inventory' },
		{ name: 'Get Player Achievements', value: 'getPlayerAchievements', description: 'Get achievements', action: 'Get achievements' },
		{ name: 'Get Leaderboard', value: 'getLeaderboard', description: 'Get game leaderboard', action: 'Get leaderboard' },
		{ name: 'Execute Game Action', value: 'executeGameAction', description: 'Execute game action', action: 'Execute game action' },
		{ name: 'Get Game Assets', value: 'getGameAssets', description: 'Get game assets', action: 'Get game assets' },
		{ name: 'Claim Game Rewards', value: 'claimGameRewards', description: 'Claim rewards', action: 'Claim rewards' },
		{ name: 'Get Match History', value: 'getMatchHistory', description: 'Get match history', action: 'Get match history' },
	],
	default: 'getGameInfo',
};

export const gamingFields: INodeProperties[] = [
	{
		displayName: 'Game ID',
		name: 'gameId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['gaming'], operation: ['getGameInfo', 'getGameStats', 'getLeaderboard', 'getGameAssets'] } },
	},
	{
		displayName: 'Player ID',
		name: 'playerId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['gaming'], operation: ['getPlayerProfile', 'getPlayerInventory', 'getPlayerAchievements', 'getMatchHistory', 'claimGameRewards'] } },
	},
	{
		displayName: 'Action Type',
		name: 'actionType',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['gaming'], operation: ['executeGameAction'] } },
	},
];

export async function executeGaming(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	switch (operation) {
		case 'getGameInfo': {
			const gameId = this.getNodeParameter('gameId', index) as string;
			return { gameId, name: '', description: '', status: 'active', timestamp: new Date().toISOString() };
		}
		case 'getAvailableGames': {
			return { games: [], total: 0, timestamp: new Date().toISOString() };
		}
		case 'getGameStats': {
			const gameId = this.getNodeParameter('gameId', index) as string;
			return { gameId, players: 0, matches: 0, timestamp: new Date().toISOString() };
		}
		case 'getPlayerProfile': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return { playerId, username: '', level: 1, timestamp: new Date().toISOString() };
		}
		case 'getPlayerInventory': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return { playerId, items: [], total: 0, timestamp: new Date().toISOString() };
		}
		case 'getPlayerAchievements': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return { playerId, achievements: [], total: 0, timestamp: new Date().toISOString() };
		}
		case 'getLeaderboard': {
			const gameId = this.getNodeParameter('gameId', index) as string;
			return { gameId, entries: [], timestamp: new Date().toISOString() };
		}
		case 'executeGameAction': {
			const actionType = this.getNodeParameter('actionType', index) as string;
			return { actionType, status: 'executed', timestamp: new Date().toISOString() };
		}
		case 'getGameAssets': {
			const gameId = this.getNodeParameter('gameId', index) as string;
			return { gameId, assets: [], timestamp: new Date().toISOString() };
		}
		case 'claimGameRewards': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return { playerId, rewards: [], claimed: true, timestamp: new Date().toISOString() };
		}
		case 'getMatchHistory': {
			const playerId = this.getNodeParameter('playerId', index) as string;
			return { playerId, matches: [], total: 0, timestamp: new Date().toISOString() };
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
