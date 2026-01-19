/**
 * Beam Blockchain Trigger Node for n8n
 * 
 * Real-time event monitoring for the Beam blockchain.
 * 
 * @author Velocity BPA
 * @website https://velobpa.com
 * @github https://github.com/Velocity-BPA
 */

import type {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ethers } from 'ethers';

import { BEAM_MAINNET, BEAM_TESTNET } from './constants/networks';
import { MAINNET_CONTRACTS, TESTNET_CONTRACTS, ERC20_ABI, ERC721_ABI } from './constants/contracts';

export class BeamTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Beam Trigger',
		name: 'beamTrigger',
		icon: 'file:beam.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["triggerType"]}}',
		description: 'Trigger workflows on Beam blockchain events',
		defaults: {
			name: 'Beam Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'beamNetwork',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'BEAM Received', value: 'beamReceived', description: 'Trigger when BEAM is received' },
					{ name: 'BEAM Sent', value: 'beamSent', description: 'Trigger when BEAM is sent' },
					{ name: 'Token Transfer', value: 'tokenTransfer', description: 'Trigger on ERC20 transfers' },
					{ name: 'NFT Transfer', value: 'nftTransfer', description: 'Trigger on NFT transfers' },
					{ name: 'New Block', value: 'newBlock', description: 'Trigger on new blocks' },
					{ name: 'Contract Event', value: 'contractEvent', description: 'Trigger on contract events' },
				],
				default: 'beamReceived',
			},
			{
				displayName: 'Watch Address',
				name: 'watchAddress',
				type: 'string',
				required: true,
				displayOptions: { show: { triggerType: ['beamReceived', 'beamSent', 'tokenTransfer', 'nftTransfer'] } },
				default: '',
				placeholder: '0x...',
			},
			{
				displayName: 'Token/Collection Address',
				name: 'tokenAddress',
				type: 'string',
				displayOptions: { show: { triggerType: ['tokenTransfer', 'nftTransfer'] } },
				default: '',
				placeholder: '0x... (leave empty for all)',
			},
			{
				displayName: 'Contract Address',
				name: 'contractAddress',
				type: 'string',
				required: true,
				displayOptions: { show: { triggerType: ['contractEvent'] } },
				default: '',
			},
			{
				displayName: 'Event Name',
				name: 'eventName',
				type: 'string',
				displayOptions: { show: { triggerType: ['contractEvent'] } },
				default: '',
			},
			{
				displayName: 'Contract ABI',
				name: 'contractAbi',
				type: 'json',
				displayOptions: { show: { triggerType: ['contractEvent'] } },
				default: '[]',
			},
			{
				displayName: 'Minimum Amount',
				name: 'minAmount',
				type: 'number',
				displayOptions: { show: { triggerType: ['beamReceived', 'beamSent', 'tokenTransfer'] } },
				default: 0,
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const triggerType = this.getNodeParameter('triggerType') as string;
		const credentials = await this.getCredentials('beamNetwork');
		const network = credentials.network as string;
		
		const networkConfig = network === 'mainnet' ? BEAM_MAINNET : BEAM_TESTNET;
		const rpcUrl = network === 'custom' ? credentials.customRpcUrl as string : networkConfig.rpcUrl;
		const provider = new ethers.JsonRpcProvider(rpcUrl);

		const workflowStaticData = this.getWorkflowStaticData('node');
		const lastBlock = (workflowStaticData.lastBlock as number) || 0;

		try {
			const currentBlock = await provider.getBlockNumber();
			
			if (lastBlock === 0) {
				workflowStaticData.lastBlock = currentBlock;
				return null;
			}

			if (currentBlock <= lastBlock) return null;

			const events: IDataObject[] = [];
			const fromBlock = lastBlock + 1;
			const toBlock = Math.min(currentBlock, fromBlock + 10);

			switch (triggerType) {
				case 'beamReceived':
				case 'beamSent': {
					const watchAddress = (this.getNodeParameter('watchAddress') as string).toLowerCase();
					const minAmount = this.getNodeParameter('minAmount') as number;
					
					for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
						const block = await provider.getBlock(blockNum, true);
						if (!block?.transactions) continue;

						for (const txHash of block.transactions) {
							const tx = await provider.getTransaction(txHash as string);
							if (!tx) continue;

							const isMatch = triggerType === 'beamReceived'
								? tx.to?.toLowerCase() === watchAddress
								: tx.from.toLowerCase() === watchAddress;
							
							if (isMatch) {
								const valueInBeam = parseFloat(ethers.formatEther(tx.value));
								if (valueInBeam >= minAmount) {
									events.push({
										type: triggerType,
										from: tx.from,
										to: tx.to,
										value: tx.value.toString(),
										valueInBeam,
										transactionHash: tx.hash,
										blockNumber: tx.blockNumber,
										timestamp: block.timestamp,
									});
								}
							}
						}
					}
					break;
				}

				case 'tokenTransfer': {
					const watchAddress = (this.getNodeParameter('watchAddress') as string).toLowerCase();
					const tokenAddress = this.getNodeParameter('tokenAddress') as string;
					const minAmount = this.getNodeParameter('minAmount') as number;

					const filter: ethers.Filter = {
						fromBlock,
						toBlock,
						topics: [ethers.id('Transfer(address,address,uint256)')],
						...(tokenAddress && { address: tokenAddress }),
					};

					const logs = await provider.getLogs(filter);
					const iface = new ethers.Interface(ERC20_ABI);
					
					for (const log of logs) {
						try {
							const decoded = iface.parseLog({ topics: log.topics as string[], data: log.data });
							if (!decoded) continue;

							const [from, to, value] = decoded.args as unknown as [string, string, bigint];
							if (from.toLowerCase() === watchAddress || to.toLowerCase() === watchAddress) {
								const valueNum = parseFloat(ethers.formatUnits(value, 18));
								if (valueNum >= minAmount) {
									events.push({
										type: 'tokenTransfer',
										tokenAddress: log.address,
										from, to,
										value: value.toString(),
										transactionHash: log.transactionHash,
										blockNumber: log.blockNumber,
									});
								}
							}
						} catch { /* skip */ }
					}
					break;
				}

				case 'nftTransfer': {
					const watchAddress = (this.getNodeParameter('watchAddress') as string).toLowerCase();
					const collectionAddress = this.getNodeParameter('tokenAddress') as string;

					const filter: ethers.Filter = {
						fromBlock,
						toBlock,
						topics: [ethers.id('Transfer(address,address,uint256)')],
						...(collectionAddress && { address: collectionAddress }),
					};

					const logs = await provider.getLogs(filter);
					const iface = new ethers.Interface(ERC721_ABI);

					for (const log of logs) {
						try {
							const decoded = iface.parseLog({ topics: log.topics as string[], data: log.data });
							if (!decoded) continue;

							const [from, to, tokenId] = decoded.args as unknown as [string, string, bigint];
							if (from.toLowerCase() === watchAddress || to.toLowerCase() === watchAddress) {
								events.push({
									type: 'nftTransfer',
									collection: log.address,
									tokenId: tokenId.toString(),
									from, to,
									transactionHash: log.transactionHash,
									blockNumber: log.blockNumber,
								});
							}
						} catch { /* skip */ }
					}
					break;
				}

				case 'newBlock': {
					for (let blockNum = fromBlock; blockNum <= toBlock; blockNum++) {
						const block = await provider.getBlock(blockNum);
						if (block) {
							events.push({
								type: 'newBlock',
								number: block.number,
								hash: block.hash,
								parentHash: block.parentHash,
								timestamp: block.timestamp,
								gasUsed: block.gasUsed.toString(),
								transactionCount: block.transactions?.length || 0,
							});
						}
					}
					break;
				}

				case 'contractEvent': {
					const contractAddress = this.getNodeParameter('contractAddress') as string;
					const eventName = this.getNodeParameter('eventName') as string;
					const contractAbi = this.getNodeParameter('contractAbi') as string;

					let abi: ethers.InterfaceAbi;
					try { abi = JSON.parse(contractAbi); }
					catch { throw new NodeOperationError(this.getNode(), 'Invalid ABI JSON'); }

					const iface = new ethers.Interface(abi);
					const filter: ethers.Filter = { address: contractAddress, fromBlock, toBlock };

					if (eventName) {
						try {
							const evt = iface.getEvent(eventName);
							if (evt) filter.topics = [evt.topicHash];
						} catch { /* event not found */ }
					}

					const logs = await provider.getLogs(filter);

					for (const log of logs) {
						try {
							const decoded = iface.parseLog({ topics: log.topics as string[], data: log.data });
							if (decoded) {
								const args: IDataObject = {};
								decoded.fragment.inputs.forEach((input, i) => {
									const v = decoded.args[i];
									args[input.name || `arg${i}`] = typeof v === 'bigint' ? v.toString() : v;
								});
								events.push({
									type: 'contractEvent',
									eventName: decoded.name,
									args,
									contractAddress: log.address,
									transactionHash: log.transactionHash,
									blockNumber: log.blockNumber,
								});
							}
						} catch { /* skip */ }
					}
					break;
				}
			}

			workflowStaticData.lastBlock = currentBlock;

			if (events.length === 0) return null;

			return [events.map(e => ({ json: { ...e, network, processedAt: new Date().toISOString() } }))];

		} catch (err) {
			throw new NodeOperationError(this.getNode(), `Polling error: ${(err as Error).message}`);
		}
	}
}
