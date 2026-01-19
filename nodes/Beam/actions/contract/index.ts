import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { BeamClient } from '../../transport/beamClient';
import { MAINNET_CONTRACTS, TESTNET_CONTRACTS } from '../../constants/contracts';

export const contractOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['contract'],
		},
	},
	options: [
		{
			name: 'Read Contract',
			value: 'readContract',
			description: 'Read data from a smart contract',
			action: 'Read data from a smart contract',
		},
		{
			name: 'Write Contract',
			value: 'writeContract',
			description: 'Write data to a smart contract',
			action: 'Write data to a smart contract',
		},
		{
			name: 'Deploy Contract',
			value: 'deployContract',
			description: 'Deploy a new smart contract',
			action: 'Deploy a new smart contract',
		},
		{
			name: 'Get Contract ABI',
			value: 'getContractAbi',
			description: 'Get the ABI of a verified contract',
			action: 'Get the ABI of a verified contract',
		},
		{
			name: 'Encode Function',
			value: 'encodeFunction',
			description: 'Encode function call data',
			action: 'Encode function call data',
		},
		{
			name: 'Decode Result',
			value: 'decodeResult',
			description: 'Decode function return data',
			action: 'Decode function return data',
		},
		{
			name: 'Get Contract Events',
			value: 'getContractEvents',
			description: 'Get events emitted by a contract',
			action: 'Get events emitted by a contract',
		},
		{
			name: 'Estimate Gas',
			value: 'estimateGas',
			description: 'Estimate gas for a contract call',
			action: 'Estimate gas for a contract call',
		},
		{
			name: 'Get Contract Code',
			value: 'getContractCode',
			description: 'Get bytecode of a deployed contract',
			action: 'Get bytecode of a deployed contract',
		},
		{
			name: 'Verify Contract',
			value: 'verifyContract',
			description: 'Check if an address is a contract',
			action: 'Check if an address is a contract',
		},
	],
	default: 'readContract',
};

export const contractFields: INodeProperties[] = [
	// Contract Address - used by most operations
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'The address of the smart contract',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: [
					'readContract',
					'writeContract',
					'getContractAbi',
					'getContractEvents',
					'estimateGas',
					'getContractCode',
					'verifyContract',
				],
			},
		},
	},

	// ABI Input
	{
		displayName: 'ABI',
		name: 'abi',
		type: 'json',
		required: true,
		default: '[]',
		description: 'The ABI (Application Binary Interface) of the contract as JSON',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['readContract', 'writeContract', 'encodeFunction', 'decodeResult', 'estimateGas'],
			},
		},
	},

	// Function Name
	{
		displayName: 'Function Name',
		name: 'functionName',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'balanceOf',
		description: 'The name of the function to call',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['readContract', 'writeContract', 'encodeFunction', 'estimateGas'],
			},
		},
	},

	// Function Arguments
	{
		displayName: 'Function Arguments',
		name: 'functionArgs',
		type: 'json',
		default: '[]',
		placeholder: '["0x123...", 1000]',
		description: 'Arguments to pass to the function as a JSON array',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['readContract', 'writeContract', 'encodeFunction', 'estimateGas'],
			},
		},
	},

	// Deploy Contract Fields
	{
		displayName: 'Bytecode',
		name: 'bytecode',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x608060405234801561001057600080fd5b50...',
		description: 'The bytecode of the contract to deploy',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['deployContract'],
			},
		},
	},
	{
		displayName: 'Constructor ABI',
		name: 'constructorAbi',
		type: 'json',
		default: '[]',
		description: 'The ABI for the constructor (if it has parameters)',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['deployContract'],
			},
		},
	},
	{
		displayName: 'Constructor Arguments',
		name: 'constructorArgs',
		type: 'json',
		default: '[]',
		description: 'Arguments for the constructor as a JSON array',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['deployContract'],
			},
		},
	},

	// Decode Result Fields
	{
		displayName: 'Encoded Data',
		name: 'encodedData',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'The encoded data to decode',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['decodeResult'],
			},
		},
	},
	{
		displayName: 'Output Types',
		name: 'outputTypes',
		type: 'json',
		required: true,
		default: '["uint256"]',
		description: 'The expected output types as a JSON array',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['decodeResult'],
			},
		},
	},

	// Event Filtering
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		default: '',
		placeholder: 'Transfer',
		description: 'Filter by specific event name (leave empty for all events)',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['getContractEvents'],
			},
		},
	},
	{
		displayName: 'From Block',
		name: 'fromBlock',
		type: 'number',
		default: 0,
		description: 'Start block for event search (0 for genesis)',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['getContractEvents'],
			},
		},
	},
	{
		displayName: 'To Block',
		name: 'toBlock',
		type: 'string',
		default: 'latest',
		description: 'End block for event search (number or "latest")',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['getContractEvents'],
			},
		},
	},

	// Transaction Options for Write Operations
	{
		displayName: 'Transaction Options',
		name: 'txOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['writeContract', 'deployContract'],
			},
		},
		options: [
			{
				displayName: 'Value (BEAM)',
				name: 'value',
				type: 'string',
				default: '0',
				description: 'Amount of BEAM to send with the transaction',
			},
			{
				displayName: 'Gas Limit',
				name: 'gasLimit',
				type: 'number',
				default: 0,
				description: 'Maximum gas to use (0 for auto-estimate)',
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
				displayName: 'Wait for Confirmation',
				name: 'waitForConfirmation',
				type: 'boolean',
				default: true,
				description: 'Whether to wait for transaction confirmation',
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

	// Known Contracts Quick Select
	{
		displayName: 'Use Known Contract',
		name: 'useKnownContract',
		type: 'boolean',
		default: false,
		description: 'Whether to use a known Beam ecosystem contract',
		displayOptions: {
			show: {
				resource: ['contract'],
				operation: ['readContract', 'writeContract', 'getContractEvents', 'getContractCode', 'verifyContract'],
			},
		},
	},
	{
		displayName: 'Known Contract',
		name: 'knownContract',
		type: 'options',
		default: 'wrappedBeam',
		description: 'Select a known Beam ecosystem contract',
		displayOptions: {
			show: {
				resource: ['contract'],
				useKnownContract: [true],
			},
		},
		options: [
			{ name: 'Wrapped BEAM', value: 'wrappedBeam' },
			{ name: 'Sphere Marketplace', value: 'sphereMarketplace' },
			{ name: 'MC Token', value: 'mcToken' },
			{ name: 'BeamSwap Router', value: 'beamSwapRouter' },
			{ name: 'Player Profiles', value: 'playerProfiles' },
			{ name: 'Game Assets', value: 'gameAssets' },
			{ name: 'Staking', value: 'staking' },
			{ name: 'Bridge', value: 'bridgeMainnet' },
			{ name: 'Multicall', value: 'multicall' },
		],
	},
];

export async function executeContract(
	this: IExecuteFunctions,
	client: BeamClient,
	operation: string,
	itemIndex: number,
): Promise<IDataObject> {
	const chainId = await client.getChainId();
	const isTestnet = Number(chainId) === 13337;
	const contracts = isTestnet ? TESTNET_CONTRACTS : MAINNET_CONTRACTS;

	// Get contract address (from known contract or direct input)
	let contractAddress = '';
	const useKnownContract = this.getNodeParameter('useKnownContract', itemIndex, false) as boolean;

	if (useKnownContract && ['readContract', 'writeContract', 'getContractEvents', 'getContractCode', 'verifyContract'].includes(operation)) {
		const knownContract = this.getNodeParameter('knownContract', itemIndex) as keyof typeof contracts;
		contractAddress = contracts[knownContract];
	} else if (['readContract', 'writeContract', 'getContractAbi', 'getContractEvents', 'estimateGas', 'getContractCode', 'verifyContract'].includes(operation)) {
		contractAddress = this.getNodeParameter('contractAddress', itemIndex) as string;
	}

	switch (operation) {
		case 'readContract': {
			const abi = JSON.parse(this.getNodeParameter('abi', itemIndex) as string);
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const functionArgs = JSON.parse(this.getNodeParameter('functionArgs', itemIndex, '[]') as string);

			const result = await client.readContract(contractAddress, abi, functionName, functionArgs);

			return {
				contractAddress,
				functionName,
				result: typeof result === 'bigint' ? result.toString() : (typeof result === 'object' ? JSON.stringify(result) : String(result)),
				timestamp: new Date().toISOString(),
			};
		}

		case 'writeContract': {
			const abi = JSON.parse(this.getNodeParameter('abi', itemIndex) as string);
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const functionArgs = JSON.parse(this.getNodeParameter('functionArgs', itemIndex, '[]') as string);
			const txOptions = this.getNodeParameter('txOptions', itemIndex, {}) as IDataObject;

			const options: any = {};
			if (txOptions.value) options.value = txOptions.value;
			if (txOptions.gasLimit && Number(txOptions.gasLimit) > 0) options.gasLimit = txOptions.gasLimit;
			if (txOptions.maxFeePerGas && Number(txOptions.maxFeePerGas) > 0) {
				options.maxFeePerGas = BigInt(Number(txOptions.maxFeePerGas) * 1e9);
			}
			if (txOptions.maxPriorityFeePerGas && Number(txOptions.maxPriorityFeePerGas) > 0) {
				options.maxPriorityFeePerGas = BigInt(Number(txOptions.maxPriorityFeePerGas) * 1e9);
			}

			const tx = await client.writeContract(contractAddress, abi, functionName, functionArgs, options);

			let receipt = null;
			if (txOptions.waitForConfirmation !== false) {
				const confirmations = (txOptions.confirmations as number) || 1;
				receipt = await client.waitForTransaction(tx.hash, confirmations);
			}

			return {
				transactionHash: tx.hash,
				contractAddress,
				functionName,
				status: receipt ? (receipt.status === 1 ? 'confirmed' : 'failed') : 'pending',
				blockNumber: receipt?.blockNumber,
				gasUsed: receipt?.gasUsed?.toString(),
				timestamp: new Date().toISOString(),
			};
		}

		case 'deployContract': {
			const bytecode = this.getNodeParameter('bytecode', itemIndex) as string;
			const constructorAbi = JSON.parse(this.getNodeParameter('constructorAbi', itemIndex, '[]') as string);
			const constructorArgs = JSON.parse(this.getNodeParameter('constructorArgs', itemIndex, '[]') as string);
			const txOptions = this.getNodeParameter('txOptions', itemIndex, {}) as IDataObject;

			// Create deployment transaction
			const { ethers } = await import('ethers');
			const factory = new ethers.ContractFactory(constructorAbi, bytecode, client.getWallet());

			const deployOptions: any = {};
			if (txOptions.gasLimit && Number(txOptions.gasLimit) > 0) {
				deployOptions.gasLimit = BigInt(txOptions.gasLimit as number);
			}

			const contract = await factory.deploy(...constructorArgs, deployOptions);
			const deployTx = contract.deploymentTransaction();

			let deployedAddress = '';
			if (txOptions.waitForConfirmation !== false && deployTx) {
				await contract.waitForDeployment();
				deployedAddress = await contract.getAddress();
			}

			return {
				transactionHash: deployTx?.hash,
				contractAddress: deployedAddress || 'pending',
				status: deployedAddress ? 'deployed' : 'pending',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getContractAbi': {
			// Note: This would typically require a block explorer API
			// For now, return a placeholder indicating manual ABI is needed
			return {
				contractAddress,
				message: 'ABI retrieval requires Beam block explorer API integration. Please provide ABI manually.',
				knownAbis: ['ERC20', 'ERC721', 'ERC1155'],
				timestamp: new Date().toISOString(),
			};
		}

		case 'encodeFunction': {
			const abi = JSON.parse(this.getNodeParameter('abi', itemIndex) as string);
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const functionArgs = JSON.parse(this.getNodeParameter('functionArgs', itemIndex, '[]') as string);

			const encoded = client.encodeFunctionCall(abi, functionName, functionArgs);

			return {
				functionName,
				encodedData: encoded,
				timestamp: new Date().toISOString(),
			};
		}

		case 'decodeResult': {
			const abi = JSON.parse(this.getNodeParameter('abi', itemIndex) as string);
			const encodedData = this.getNodeParameter('encodedData', itemIndex) as string;
			const functionName = this.getNodeParameter('functionName', itemIndex, '') as string;

			const decoded = client.decodeFunctionResult(abi, functionName || 'result', encodedData);

			return {
				encodedData,
				decodedResult: decoded,
				timestamp: new Date().toISOString(),
			};
		}

		case 'getContractEvents': {
			const eventName = this.getNodeParameter('eventName', itemIndex, '') as string;
			const fromBlock = this.getNodeParameter('fromBlock', itemIndex, 0) as number;
			const toBlockInput = this.getNodeParameter('toBlock', itemIndex, 'latest') as string;
			const toBlock = toBlockInput === 'latest' ? 'latest' : parseInt(toBlockInput, 10);

			const abi = JSON.parse(this.getNodeParameter('abi', itemIndex, '[]') as string);
			const events = await client.getEvents(contractAddress, abi, eventName || 'Transfer', fromBlock, toBlock);

			return {
				contractAddress,
				eventName: eventName || 'all',
				fromBlock,
				toBlock,
				count: events.length,
				events: events.slice(0, 100), // Limit to 100 events
				timestamp: new Date().toISOString(),
			};
		}

		case 'estimateGas': {
			const abi = JSON.parse(this.getNodeParameter('abi', itemIndex) as string);
			const functionName = this.getNodeParameter('functionName', itemIndex) as string;
			const functionArgs = JSON.parse(this.getNodeParameter('functionArgs', itemIndex, '[]') as string);

			const { ethers } = await import('ethers');
			const iface = new ethers.Interface(abi);
			const data = iface.encodeFunctionData(functionName, functionArgs);

			const gasEstimate = await client.estimateGas({
				to: contractAddress,
				data,
			});

			const gasPrice = await client.getGasPrice();

			return {
				contractAddress,
				functionName,
				gasEstimate: gasEstimate.toString(),
				gasPrice: gasPrice.toString(),
				estimatedCost: ((gasEstimate * gasPrice) / BigInt(1e18)).toString() + ' BEAM',
				timestamp: new Date().toISOString(),
			};
		}

		case 'getContractCode': {
			const code = await client.getCode(contractAddress);

			return {
				contractAddress,
				hasCode: code !== '0x',
				bytecodeLength: code.length,
				bytecode: code,
				timestamp: new Date().toISOString(),
			};
		}

		case 'verifyContract': {
			const isContract = await client.isContract(contractAddress);

			return {
				address: contractAddress,
				isContract,
				type: isContract ? 'contract' : 'eoa',
				timestamp: new Date().toISOString(),
			};
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown operation: ${operation}`,
				{ itemIndex },
			);
	}
}
