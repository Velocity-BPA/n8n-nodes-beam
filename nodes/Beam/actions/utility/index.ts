/**
 * Utility Resource Actions
 * 
 * Helper operations for unit conversion, ABI encoding/decoding,
 * message signing, and network utilities.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ethers } from 'ethers';
import { createBeamClient } from '../../transport/beamClient';
import { weiToBeam, beamToWei, weiToGwei, gweiToWei } from '../../utils/unitConverter';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Convert Units',
				value: 'convertUnits',
				description: 'Convert between Wei, Gwei, and BEAM',
				action: 'Convert units',
			},
			{
				name: 'Encode ABI',
				value: 'encodeAbi',
				description: 'Encode function call data',
				action: 'Encode ABI',
			},
			{
				name: 'Decode ABI',
				value: 'decodeAbi',
				description: 'Decode ABI-encoded data',
				action: 'Decode ABI',
			},
			{
				name: 'Sign Message',
				value: 'signMessage',
				description: 'Sign a message with private key',
				action: 'Sign message',
			},
			{
				name: 'Verify Signature',
				value: 'verifySignature',
				description: 'Verify a signed message',
				action: 'Verify signature',
			},
			{
				name: 'Get Chain ID',
				value: 'getChainId',
				description: 'Get the current chain ID',
				action: 'Get chain ID',
			},
			{
				name: 'Get Network Status',
				value: 'getNetworkStatus',
				description: 'Check network connectivity and status',
				action: 'Get network status',
			},
			{
				name: 'Hash Data',
				value: 'hashData',
				description: 'Compute Keccak256 hash',
				action: 'Hash data',
			},
			{
				name: 'Validate Address',
				value: 'validateAddress',
				description: 'Check if an address is valid',
				action: 'Validate address',
			},
			{
				name: 'Get Gas Oracle',
				value: 'getGasOracle',
				description: 'Get current gas price recommendations',
				action: 'Get gas oracle',
			},
		],
		default: 'convertUnits',
	},
];

export const utilityFields: INodeProperties[] = [
	// Convert units fields
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
		default: '',
		description: 'Value to convert',
	},
	{
		displayName: 'From Unit',
		name: 'fromUnit',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
		options: [
			{ name: 'Wei', value: 'wei' },
			{ name: 'Gwei', value: 'gwei' },
			{ name: 'BEAM', value: 'beam' },
		],
		default: 'wei',
	},
	{
		displayName: 'To Unit',
		name: 'toUnit',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['convertUnits'],
			},
		},
		options: [
			{ name: 'Wei', value: 'wei' },
			{ name: 'Gwei', value: 'gwei' },
			{ name: 'BEAM', value: 'beam' },
		],
		default: 'beam',
	},
	// ABI fields
	{
		displayName: 'ABI',
		name: 'abi',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['encodeAbi', 'decodeAbi'],
			},
		},
		default: '[]',
		description: 'Contract ABI',
	},
	{
		displayName: 'Function Name',
		name: 'functionName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['encodeAbi'],
			},
		},
		default: '',
		description: 'Name of the function to encode',
	},
	{
		displayName: 'Function Arguments',
		name: 'functionArgs',
		type: 'json',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['encodeAbi'],
			},
		},
		default: '[]',
		description: 'Arguments for the function',
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['decodeAbi', 'hashData'],
			},
		},
		default: '',
		description: 'Data to decode or hash',
	},
	// Sign/verify fields
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['signMessage', 'verifySignature'],
			},
		},
		default: '',
		description: 'Message to sign or verify',
	},
	{
		displayName: 'Signature',
		name: 'signature',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['verifySignature'],
			},
		},
		default: '',
		description: 'Signature to verify',
	},
	{
		displayName: 'Expected Signer',
		name: 'expectedSigner',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['verifySignature'],
			},
		},
		default: '',
		description: 'Expected signer address',
	},
	// Validate address
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateAddress'],
			},
		},
		default: '',
		description: 'Address to validate',
	},
];

export async function executeUtility(
	this: IExecuteFunctions,
	index: number,
	operation: string
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork');
	
	const client = createBeamClient({
		network: credentials.network as string,
		rpcUrl: credentials.rpcUrl as string,
		privateKey: credentials.privateKey as string,
		chainId: credentials.chainId as number,
	});

	let result: IDataObject = {};

	switch (operation) {
		case 'convertUnits': {
			const value = this.getNodeParameter('value', index) as string;
			const fromUnit = this.getNodeParameter('fromUnit', index) as string;
			const toUnit = this.getNodeParameter('toUnit', index) as string;

			let valueInWei: bigint;
			
			// Convert input to Wei
			if (fromUnit === 'wei') {
				valueInWei = BigInt(value);
			} else if (fromUnit === 'gwei') {
				valueInWei = gweiToWei(value);
			} else {
				valueInWei = beamToWei(value);
			}

			// Convert Wei to output unit
			let converted: string;
			if (toUnit === 'wei') {
				converted = valueInWei.toString();
			} else if (toUnit === 'gwei') {
				converted = weiToGwei(valueInWei);
			} else {
				converted = weiToBeam(valueInWei);
			}

			result = {
				input: value,
				fromUnit,
				toUnit,
				output: converted,
			};
			break;
		}

		case 'encodeAbi': {
			const abi = JSON.parse(this.getNodeParameter('abi', index) as string);
			const functionName = this.getNodeParameter('functionName', index) as string;
			const functionArgs = JSON.parse(this.getNodeParameter('functionArgs', index) as string);

			const iface = new ethers.Interface(abi);
			const encoded = iface.encodeFunctionData(functionName, functionArgs);

			result = {
				functionName,
				args: functionArgs,
				encoded,
			};
			break;
		}

		case 'decodeAbi': {
			const abi = JSON.parse(this.getNodeParameter('abi', index) as string);
			const data = this.getNodeParameter('data', index) as string;

			const iface = new ethers.Interface(abi);
			const decoded = iface.parseTransaction({ data });

			result = {
				functionName: decoded?.name || 'unknown',
				args: decoded?.args ? Array.from(decoded.args).map(a => 
					typeof a === 'bigint' ? a.toString() : a
				) : [],
			};
			break;
		}

		case 'signMessage': {
			const message = this.getNodeParameter('message', index) as string;
			
			const provider = new ethers.JsonRpcProvider(credentials.rpcUrl as string);
			const wallet = new ethers.Wallet(credentials.privateKey as string, provider);
			const signature = await wallet.signMessage(message);

			result = {
				message,
				signature,
				signer: wallet.address,
			};
			break;
		}

		case 'verifySignature': {
			const message = this.getNodeParameter('message', index) as string;
			const signature = this.getNodeParameter('signature', index) as string;
			const expectedSigner = this.getNodeParameter('expectedSigner', index) as string;

			const recoveredAddress = ethers.verifyMessage(message, signature);
			const isValid = recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();

			result = {
				message,
				signature,
				expectedSigner,
				recoveredAddress,
				isValid,
			};
			break;
		}

		case 'getChainId': {
			const chainId = await client.getChainId();

			result = {
				chainId: chainId.toString(),
				network: credentials.network,
			};
			break;
		}

		case 'getNetworkStatus': {
			const provider = new ethers.JsonRpcProvider(credentials.rpcUrl as string);
			const [blockNumber, network, feeData] = await Promise.all([
				provider.getBlockNumber(),
				provider.getNetwork(),
				provider.getFeeData(),
			]);

			result = {
				connected: true,
				blockNumber,
				chainId: network.chainId.toString(),
				gasPrice: feeData.gasPrice?.toString() || '0',
				maxFeePerGas: feeData.maxFeePerGas?.toString() || '0',
				maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || '0',
			};
			break;
		}

		case 'hashData': {
			const data = this.getNodeParameter('data', index) as string;
			const hash = ethers.keccak256(ethers.toUtf8Bytes(data));

			result = {
				input: data,
				hash,
				algorithm: 'keccak256',
			};
			break;
		}

		case 'validateAddress': {
			const address = this.getNodeParameter('address', index) as string;
			const isValid = ethers.isAddress(address);
			const checksumAddress = isValid ? ethers.getAddress(address) : null;

			result = {
				address,
				isValid,
				checksumAddress,
			};
			break;
		}

		case 'getGasOracle': {
			const provider = new ethers.JsonRpcProvider(credentials.rpcUrl as string);
			const feeData = await provider.getFeeData();

			const gasPrice = feeData.gasPrice || 0n;
			
			result = {
				gasPrice: gasPrice.toString(),
				gasPriceGwei: weiToGwei(gasPrice),
				maxFeePerGas: feeData.maxFeePerGas?.toString() || '0',
				maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString() || '0',
				recommendations: {
					slow: (gasPrice * 8n / 10n).toString(),
					standard: gasPrice.toString(),
					fast: (gasPrice * 12n / 10n).toString(),
				},
			};
			break;
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unknown operation: ${operation}`,
				{ itemIndex: index }
			);
	}

	return { ...result, timestamp: new Date().toISOString() };
}
