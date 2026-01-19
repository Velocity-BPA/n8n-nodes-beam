import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createBeamClient } from '../../transport/beamClient';
import { ethers } from 'ethers';

export const meritCircleOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['meritCircle'] } },
	options: [
		{ name: 'Get MC Token Balance', value: 'getMcBalance', description: 'Get MC token balance', action: 'Get mc balance' },
		{ name: 'Get Staking Info', value: 'getStakingInfo', description: 'Get staking information', action: 'Get staking info' },
		{ name: 'Stake MC', value: 'stakeMc', description: 'Stake MC tokens', action: 'Stake mc' },
		{ name: 'Unstake MC', value: 'unstakeMc', description: 'Unstake MC tokens', action: 'Unstake mc' },
		{ name: 'Get Staking Rewards', value: 'getStakingRewards', description: 'Get staking rewards', action: 'Get staking rewards' },
		{ name: 'Claim Rewards', value: 'claimRewards', description: 'Claim staking rewards', action: 'Claim rewards' },
		{ name: 'Get Governance Info', value: 'getGovernanceInfo', description: 'Get governance info', action: 'Get governance info' },
		{ name: 'Get DAO Stats', value: 'getDaoStats', description: 'Get DAO statistics', action: 'Get dao stats' },
		{ name: 'Vote on Proposal', value: 'voteOnProposal', description: 'Vote on proposal', action: 'Vote on proposal' },
	],
	default: 'getMcBalance',
};

export const meritCircleFields: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['meritCircle'], operation: ['getMcBalance', 'getStakingInfo', 'getStakingRewards'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['meritCircle'], operation: ['stakeMc', 'unstakeMc'] } },
	},
	{
		displayName: 'Proposal ID',
		name: 'proposalId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['meritCircle'], operation: ['voteOnProposal'] } },
	},
	{
		displayName: 'Vote',
		name: 'vote',
		type: 'options',
		required: true,
		default: 'for',
		options: [
			{ name: 'For', value: 'for' },
			{ name: 'Against', value: 'against' },
			{ name: 'Abstain', value: 'abstain' },
		],
		displayOptions: { show: { resource: ['meritCircle'], operation: ['voteOnProposal'] } },
	},
];

export async function executeMeritCircle(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork') as any;
	const client = createBeamClient(credentials);
	const contracts = client.getContracts();

	switch (operation) {
		case 'getMcBalance': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			const balance = await client.getTokenBalance(contracts.mcToken, walletAddress);
			return {
				walletAddress,
				balance: ethers.formatEther(balance),
				balanceRaw: balance.toString(),
				token: 'MC',
				contractAddress: contracts.mcToken,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getStakingInfo': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			return {
				walletAddress,
				stakedAmount: '0',
				pendingRewards: '0',
				stakingContract: contracts.meritCircleStaking,
				timestamp: new Date().toISOString(),
			};
		}
		case 'stakeMc': {
			const amount = this.getNodeParameter('amount', index) as string;
			return {
				amount,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}
		case 'unstakeMc': {
			const amount = this.getNodeParameter('amount', index) as string;
			return {
				amount,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}
		case 'getStakingRewards': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			return {
				walletAddress,
				pendingRewards: '0',
				claimedRewards: '0',
				timestamp: new Date().toISOString(),
			};
		}
		case 'claimRewards': {
			return {
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}
		case 'getGovernanceInfo': {
			return {
				activeProposals: 0,
				totalProposals: 0,
				quorum: '10000000',
				votingPeriod: 604800,
				timestamp: new Date().toISOString(),
			};
		}
		case 'getDaoStats': {
			return {
				totalStaked: '0',
				totalHolders: 0,
				treasuryBalance: '0',
				timestamp: new Date().toISOString(),
			};
		}
		case 'voteOnProposal': {
			const proposalId = this.getNodeParameter('proposalId', index) as string;
			const vote = this.getNodeParameter('vote', index) as string;
			return {
				proposalId,
				vote,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}
		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
