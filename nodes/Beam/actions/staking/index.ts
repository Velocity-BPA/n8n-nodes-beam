import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createBeamClient } from '../../transport/beamClient';
import { ethers } from 'ethers';

export const stakingOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['staking'],
		},
	},
	options: [
		{ name: 'Get Staking Info', value: 'getStakingInfo', description: 'Get staking information', action: 'Get staking info' },
		{ name: 'Stake BEAM', value: 'stakeBeam', description: 'Stake BEAM tokens', action: 'Stake beam tokens' },
		{ name: 'Unstake BEAM', value: 'unstakeBeam', description: 'Unstake BEAM tokens', action: 'Unstake beam tokens' },
		{ name: 'Get Validators', value: 'getValidators', description: 'Get list of validators', action: 'Get validators' },
		{ name: 'Delegate to Validator', value: 'delegateToValidator', description: 'Delegate stake to validator', action: 'Delegate to validator' },
		{ name: 'Get Delegation Info', value: 'getDelegationInfo', description: 'Get delegation information', action: 'Get delegation info' },
		{ name: 'Get Staking Rewards', value: 'getStakingRewards', description: 'Get staking rewards', action: 'Get staking rewards' },
		{ name: 'Claim Rewards', value: 'claimRewards', description: 'Claim staking rewards', action: 'Claim rewards' },
		{ name: 'Get APY', value: 'getApy', description: 'Get current staking APY', action: 'Get apy' },
	],
	default: 'getStakingInfo',
};

export const stakingFields: INodeProperties[] = [
	{
		displayName: 'Wallet Address',
		name: 'walletAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['staking'], operation: ['getStakingInfo', 'getDelegationInfo', 'getStakingRewards'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['staking'], operation: ['stakeBeam', 'unstakeBeam', 'delegateToValidator'] } },
	},
	{
		displayName: 'Validator Address',
		name: 'validatorAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['staking'], operation: ['delegateToValidator', 'getDelegationInfo'] } },
	},
];

export async function executeStaking(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork') as any;
	const client = createBeamClient(credentials);
	const contracts = client.getContracts();

	switch (operation) {
		case 'getStakingInfo': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			const balance = await client.getBalance(walletAddress);
			return {
				walletAddress,
				stakedBalance: '0',
				availableBalance: ethers.formatEther(balance),
				pendingRewards: '0',
				stakingContract: contracts.staking,
				timestamp: new Date().toISOString(),
			};
		}

		case 'stakeBeam': {
			const amount = this.getNodeParameter('amount', index) as string;
			const amountWei = ethers.parseEther(amount);
			return {
				operation: 'stake',
				amount,
				amountWei: amountWei.toString(),
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}

		case 'unstakeBeam': {
			const amount = this.getNodeParameter('amount', index) as string;
			return {
				operation: 'unstake',
				amount,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getValidators': {
			return {
				validators: [],
				totalValidators: 0,
				activeValidators: 0,
				timestamp: new Date().toISOString(),
			};
		}

		case 'delegateToValidator': {
			const validatorAddress = this.getNodeParameter('validatorAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			return {
				validatorAddress,
				amount,
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getDelegationInfo': {
			const walletAddress = this.getNodeParameter('walletAddress', index) as string;
			return {
				walletAddress,
				delegations: [],
				totalDelegated: '0',
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
				operation: 'claimRewards',
				status: 'pending',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getApy': {
			return {
				currentApy: '5.0',
				averageApy: '5.0',
				timestamp: new Date().toISOString(),
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
