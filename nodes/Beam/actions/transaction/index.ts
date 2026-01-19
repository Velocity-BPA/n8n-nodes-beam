import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { BeamClient } from '../../transport/beamClient';
import { weiToBeam, beamToWei, weiToGwei, gweiToWei } from '../../utils/unitConverter';

export const transactionOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['transaction'],
		},
	},
	options: [
		{
			name: 'Send Transaction',
			value: 'sendTransaction',
			description: 'Send a raw transaction',
			action: 'Send a raw transaction',
		},
		{
			name: 'Get Transaction',
			value: 'getTransaction',
			description: 'Get transaction details by hash',
			action: 'Get transaction details by hash',
		},
		{
			name: 'Get Transaction Receipt',
			value: 'getTransactionReceipt',
			description: 'Get transaction receipt',
			action: 'Get transaction receipt',
		},
		{
			name: 'Get Transaction Status',
			value: 'getTransactionStatus',
			description: 'Check transaction status',
			action: 'Check transaction status',
		},
		{
			name: 'Estimate Gas',
			value: 'estimateGas',
			description: 'Estimate gas for a transaction',
			action: 'Estimate gas for a transaction',
		},
		{
			name: 'Get Gas Price',
			value: 'getGasPrice',
			description: 'Get current gas price',
			action: 'Get current gas price',
		},
		{
			name: 'Speed Up Transaction',
			value: 'speedUpTransaction',
			description: 'Speed up a pending transaction',
			action: 'Speed up a pending transaction',
		},
		{
			name: 'Cancel Transaction',
			value: 'cancelTransaction',
			description: 'Cancel a pending transaction',
			action: 'Cancel a pending transaction',
		},
		{
			name: 'Wait for Transaction',
			value: 'waitForTransaction',
			description: 'Wait for transaction confirmation',
			action: 'Wait for transaction confirmation',
		},
	],
	default: 'getTransaction',
};

export const transactionFields: INodeProperties[] = [
	// Transaction Hash
	{
		displayName: 'Transaction Hash',
		name: 'transactionHash',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'The transaction hash',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: [
					'getTransaction',
					'getTransactionReceipt',
					'getTransactionStatus',
					'speedUpTransaction',
					'cancelTransaction',
					'waitForTransaction',
				],
			},
		},
	},

	// Send Transaction Fields
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendTransaction', 'estimateGas'],
			},
		},
	},
	{
		displayName: 'Value (BEAM)',
		name: 'value',
		type: 'string',
		default: '0',
		placeholder: '1.5',
		description: 'Amount of BEAM to send',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendTransaction', 'estimateGas'],
			},
		},
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '0x',
		placeholder: '0x...',
		description: 'Transaction data (hex encoded)',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendTransaction', 'estimateGas'],
			},
		},
	},

	// Transaction Options
	{
		displayName: 'Transaction Options',
		name: 'txOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['sendTransaction'],
			},
		},
		options: [
			{
				displayName: 'Gas Limit',
				name: 'gasLimit',
				type: 'number',
				default: 21000,
				description: 'Maximum gas to use',
			},
			{
				displayName: 'Max Fee Per Gas (Gwei)',
				name: 'maxFeePerGas',
				type: 'number',
				default: 0,
				description: 'Maximum fee per gas in Gwei (0 for auto)',
			},
			{
				displayName: 'Max Priority Fee (Gwei)',
				name: 'maxPriorityFeePerGas',
				type: 'number',
				default: 0,
				description: 'Maximum priority fee in Gwei (0 for auto)',
			},
			{
				displayName: 'Nonce',
				name: 'nonce',
				type: 'number',
				default: -1,
				description: 'Transaction nonce (-1 for auto)',
			},
			{
				displayName: 'Wait for Confirmation',
				name: 'waitForConfirmation',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for confirmation',
			},
			{
				displayName: 'Confirmations',
				name: 'confirmations',
				type: 'number',
				default: 1,
				description: 'Number of confirmations to wait for',
			},
		],
	},

	// Speed Up Options
	{
		displayName: 'Speed Up Options',
		name: 'speedUpOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['speedUpTransaction'],
			},
		},
		options: [
			{
				displayName: 'Gas Price Increase (%)',
				name: 'gasPriceIncrease',
				type: 'number',
				default: 20,
				description: 'Percentage to increase gas price',
			},
			{
				displayName: 'Max Fee Per Gas (Gwei)',
				name: 'maxFeePerGas',
				type: 'number',
				default: 0,
				description: 'Set specific max fee (0 for calculated)',
			},
		],
	},

	// Wait Options
	{
		displayName: 'Wait Options',
		name: 'waitOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['waitForTransaction'],
			},
		},
		options: [
			{
				displayName: 'Confirmations',
				name: 'confirmations',
				type: 'number',
				default: 1,
				description: 'Number of confirmations to wait for',
			},
			{
				displayName: 'Timeout (seconds)',
				name: 'timeout',
				type: 'number',
				default: 120,
				description: 'Maximum time to wait in seconds',
			},
		],
	},
];

export async function executeTransaction(
	this: IExecuteFunctions,
	client: BeamClient,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	switch (operation) {
		case 'sendTransaction': {
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const value = this.getNodeParameter('value', itemIndex, '0') as string;
			const data = this.getNodeParameter('data', itemIndex, '0x') as string;
			const txOptions = this.getNodeParameter('txOptions', itemIndex, {}) as IDataObject;

			if (!client.isValidAddress(toAddress)) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid address: ${toAddress}`,
					{ itemIndex },
				);
			}

			const wallet = client.getWallet();
			const txRequest: any = {
				to: toAddress,
				value: beamToWei(value),
				data,
			};

			if (txOptions.gasLimit && Number(txOptions.gasLimit) > 0) {
				txRequest.gasLimit = BigInt(txOptions.gasLimit as number);
			}

			if (txOptions.maxFeePerGas && Number(txOptions.maxFeePerGas) > 0) {
				txRequest.maxFeePerGas = gweiToWei(txOptions.maxFeePerGas as number);
			}

			if (txOptions.maxPriorityFeePerGas && Number(txOptions.maxPriorityFeePerGas) > 0) {
				txRequest.maxPriorityFeePerGas = gweiToWei(txOptions.maxPriorityFeePerGas as number);
			}

			if (txOptions.nonce !== undefined && (txOptions.nonce as number) >= 0) {
				txRequest.nonce = txOptions.nonce as number;
			}

			const tx = await wallet.sendTransaction(txRequest as any);

			let receipt = null;
			if (txOptions.waitForConfirmation !== false) {
				receipt = await client.waitForTransaction(tx.hash, (txOptions.confirmations as number) || 1);
			}

			return {
				transactionHash: tx.hash,
				from: tx.from,
				to: tx.to,
				value,
				valueWei: beamToWei(value).toString(),
				nonce: tx.nonce,
				status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
				blockNumber: receipt?.blockNumber,
				blockHash: receipt?.blockHash,
				gasUsed: receipt?.gasUsed?.toString(),
				effectiveGasPrice: receipt?.gasPrice?.toString(),
				timestamp: new Date().toISOString(),
			};
		}

		case 'getTransaction': {
			const transactionHash = this.getNodeParameter('transactionHash', itemIndex) as string;

			const tx = await client.getTransaction(transactionHash);

			if (!tx) {
				throw new NodeOperationError(
					this.getNode(),
					`Transaction not found: ${transactionHash}`,
					{ itemIndex },
				);
			}

			return {
				hash: tx.hash,
				from: tx.from,
				to: tx.to,
				value: weiToBeam(tx.value),
				valueWei: tx.value?.toString(),
				nonce: tx.nonce,
				gasLimit: tx.gasLimit?.toString(),
				gasPrice: tx.gasPrice?.toString(),
				maxFeePerGas: tx.maxFeePerGas?.toString(),
				maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
				data: tx.data,
				blockNumber: tx.blockNumber,
				blockHash: tx.blockHash,
				transactionIndex: tx.index,
				type: tx.type,
				chainId: tx.chainId?.toString(),
			};
		}

		case 'getTransactionReceipt': {
			const transactionHash = this.getNodeParameter('transactionHash', itemIndex) as string;

			const receipt = await client.getTransactionReceipt(transactionHash);

			if (!receipt) {
				return {
					transactionHash,
					status: 'pending',
					message: 'Transaction is still pending or not found',
					timestamp: new Date().toISOString(),
				};
			}

			return {
				transactionHash: receipt.hash,
				status: receipt.status === 1 ? 'success' : 'failed',
				blockNumber: receipt.blockNumber,
				blockHash: receipt.blockHash,
				from: receipt.from,
				to: receipt.to,
				contractAddress: receipt.contractAddress,
				gasUsed: receipt.gasUsed?.toString(),
				cumulativeGasUsed: receipt.cumulativeGasUsed?.toString(),
				effectiveGasPrice: receipt.gasPrice?.toString(),
				logsCount: receipt.logs?.length || 0,
				logs: receipt.logs?.slice(0, 10),
				type: receipt.type,
			};
		}

		case 'getTransactionStatus': {
			const transactionHash = this.getNodeParameter('transactionHash', itemIndex) as string;

			const tx = await client.getTransaction(transactionHash);
			const receipt = await client.getTransactionReceipt(transactionHash);
			const currentBlock = await client.getBlockNumber();

			let status = 'unknown';
			let confirmations = 0;

			if (!tx) {
				status = 'not_found';
			} else if (!receipt) {
				status = 'pending';
			} else {
				status = receipt.status === 1 ? 'success' : 'failed';
				confirmations = currentBlock - receipt.blockNumber;
			}

			return {
				transactionHash,
				status,
				confirmations,
				blockNumber: receipt?.blockNumber,
				currentBlock,
				gasUsed: receipt?.gasUsed?.toString(),
				timestamp: new Date().toISOString(),
			};
		}

		case 'estimateGas': {
			const toAddress = this.getNodeParameter('toAddress', itemIndex) as string;
			const value = this.getNodeParameter('value', itemIndex, '0') as string;
			const data = this.getNodeParameter('data', itemIndex, '0x') as string;

			const gasEstimate = await client.estimateGas({
				to: toAddress,
				value: beamToWei(value),
				data,
			});

			const gasPrice = await client.getGasPrice();
			const estimatedCost = gasEstimate * gasPrice;

			return {
				to: toAddress,
				value,
				gasEstimate: gasEstimate.toString(),
				gasPrice: gasPrice.toString(),
				gasPriceGwei: weiToGwei(gasPrice),
				estimatedCostWei: estimatedCost.toString(),
				estimatedCostBeam: weiToBeam(estimatedCost),
				timestamp: new Date().toISOString(),
			};
		}

		case 'getGasPrice': {
			const gasPrice = await client.getGasPrice();
			const feeData = await client.getProvider().getFeeData();

			return {
				gasPrice: gasPrice.toString(),
				gasPriceGwei: weiToGwei(gasPrice),
				maxFeePerGas: feeData.maxFeePerGas?.toString(),
				maxFeePerGasGwei: feeData.maxFeePerGas ? weiToGwei(feeData.maxFeePerGas) : null,
				maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
				maxPriorityFeePerGasGwei: feeData.maxPriorityFeePerGas ? weiToGwei(feeData.maxPriorityFeePerGas) : null,
				timestamp: new Date().toISOString(),
			};
		}

		case 'speedUpTransaction': {
			const transactionHash = this.getNodeParameter('transactionHash', itemIndex) as string;
			const speedUpOptions = this.getNodeParameter('speedUpOptions', itemIndex, {}) as IDataObject;

			const originalTx = await client.getTransaction(transactionHash);

			if (!originalTx) {
				throw new NodeOperationError(
					this.getNode(),
					`Transaction not found: ${transactionHash}`,
					{ itemIndex },
				);
			}

			if (originalTx.blockNumber !== null) {
				throw new NodeOperationError(
					this.getNode(),
					'Transaction is already confirmed and cannot be sped up',
					{ itemIndex },
				);
			}

			const wallet = client.getWallet();
			const gasPriceIncrease = (speedUpOptions.gasPriceIncrease as number) || 20;

			let newMaxFeePerGas: bigint;
			if (speedUpOptions.maxFeePerGas && Number(speedUpOptions.maxFeePerGas) > 0) {
				newMaxFeePerGas = gweiToWei(speedUpOptions.maxFeePerGas as number);
			} else if (originalTx.maxFeePerGas) {
				newMaxFeePerGas = (originalTx.maxFeePerGas * BigInt(100 + gasPriceIncrease)) / BigInt(100);
			} else {
				const currentGasPrice = await client.getGasPrice();
				newMaxFeePerGas = (currentGasPrice * BigInt(100 + gasPriceIncrease)) / BigInt(100);
			}

			const replacementTx = await wallet.sendTransaction({
				to: originalTx.to!,
				value: originalTx.value,
				data: originalTx.data,
				nonce: originalTx.nonce,
				gasLimit: originalTx.gasLimit,
				maxFeePerGas: newMaxFeePerGas,
				maxPriorityFeePerGas: (originalTx.maxPriorityFeePerGas || BigInt(0)) * BigInt(100 + gasPriceIncrease) / BigInt(100),
			});

			return {
				originalTransactionHash: transactionHash,
				newTransactionHash: replacementTx.hash,
				nonce: replacementTx.nonce,
				newMaxFeePerGas: newMaxFeePerGas.toString(),
				gasPriceIncrease: `${gasPriceIncrease}%`,
				status: 'replacement_sent',
				timestamp: new Date().toISOString(),
			};
		}

		case 'cancelTransaction': {
			const transactionHash = this.getNodeParameter('transactionHash', itemIndex) as string;

			const originalTx = await client.getTransaction(transactionHash);

			if (!originalTx) {
				throw new NodeOperationError(
					this.getNode(),
					`Transaction not found: ${transactionHash}`,
					{ itemIndex },
				);
			}

			if (originalTx.blockNumber !== null) {
				throw new NodeOperationError(
					this.getNode(),
					'Transaction is already confirmed and cannot be cancelled',
					{ itemIndex },
				);
			}

			const wallet = client.getWallet();
			const currentGasPrice = await client.getGasPrice();
			const higherGasPrice = (currentGasPrice * BigInt(120)) / BigInt(100); // 20% higher

			// Send 0 value tx to self with same nonce
			const cancelTx = await wallet.sendTransaction({
				to: await wallet.getAddress(),
				value: BigInt(0),
				nonce: originalTx.nonce,
				maxFeePerGas: higherGasPrice,
				maxPriorityFeePerGas: (higherGasPrice * BigInt(10)) / BigInt(100),
			});

			return {
				originalTransactionHash: transactionHash,
				cancellationTransactionHash: cancelTx.hash,
				nonce: cancelTx.nonce,
				status: 'cancellation_sent',
				timestamp: new Date().toISOString(),
			};
		}

		case 'waitForTransaction': {
			const transactionHash = this.getNodeParameter('transactionHash', itemIndex) as string;
			const waitOptions = this.getNodeParameter('waitOptions', itemIndex, {}) as IDataObject;

			const confirmations = (waitOptions.confirmations as number) || 1;
			const timeout = ((waitOptions.timeout as number) || 120) * 1000;

			const startTime = Date.now();

			try {
				const receipt = await Promise.race([
					client.waitForTransaction(transactionHash, confirmations),
					new Promise((_, reject) =>
						setTimeout(() => reject(new Error('Timeout waiting for transaction')), timeout)
					),
				]) as any;

				const currentBlock = await client.getBlockNumber();

				return {
					transactionHash,
					status: receipt.status === 1 ? 'success' : 'failed',
					blockNumber: receipt.blockNumber,
					confirmations: currentBlock - receipt.blockNumber,
					gasUsed: receipt.gasUsed?.toString(),
					waitTime: `${((Date.now() - startTime) / 1000).toFixed(2)} seconds`,
					timestamp: new Date().toISOString(),
				};
			} catch (error) {
				return {
					transactionHash,
					status: 'timeout',
					message: 'Transaction did not confirm within the specified timeout',
					waitTime: `${timeout / 1000} seconds`,
					timestamp: new Date().toISOString(),
				};
			}
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown operation: ${operation}`,
				{ itemIndex },
			);
	}
}
