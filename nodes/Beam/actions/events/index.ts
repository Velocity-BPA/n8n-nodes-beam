import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { createBeamClient } from '../../transport/beamClient';
import { ERC20_ABI, ERC721_ABI } from '../../constants/contracts';

export const eventsOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['events'],
		},
	},
	options: [
		{ name: 'Get Events', value: 'getEvents', description: 'Get filtered events', action: 'Get events' },
		{ name: 'Decode Event', value: 'decodeEvent', description: 'Decode event data', action: 'Decode event' },
		{ name: 'Get Events by Contract', value: 'getEventsByContract', description: 'Get events for contract', action: 'Get events by contract' },
		{ name: 'Get Transfer Events', value: 'getTransferEvents', description: 'Get transfer events', action: 'Get transfer events' },
		{ name: 'Get Approval Events', value: 'getApprovalEvents', description: 'Get approval events', action: 'Get approval events' },
		{ name: 'Get Event History', value: 'getEventHistory', description: 'Get event history', action: 'Get event history' },
	],
	default: 'getEvents',
};

export const eventsFields: INodeProperties[] = [
	{
		displayName: 'Contract Address',
		name: 'contractAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['events'], operation: ['getEvents', 'getEventsByContract', 'getTransferEvents', 'getApprovalEvents', 'getEventHistory'] } },
	},
	{
		displayName: 'Event Name',
		name: 'eventName',
		type: 'string',
		default: 'Transfer',
		displayOptions: { show: { resource: ['events'], operation: ['getEvents', 'decodeEvent'] } },
	},
	{
		displayName: 'From Block',
		name: 'fromBlock',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['events'], operation: ['getEvents', 'getEventsByContract', 'getTransferEvents', 'getApprovalEvents', 'getEventHistory'] } },
	},
	{
		displayName: 'To Block',
		name: 'toBlock',
		type: 'string',
		default: 'latest',
		displayOptions: { show: { resource: ['events'], operation: ['getEvents', 'getEventsByContract', 'getTransferEvents', 'getApprovalEvents', 'getEventHistory'] } },
	},
	{
		displayName: 'Event Data',
		name: 'eventData',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['events'], operation: ['decodeEvent'] } },
	},
	{
		displayName: 'Topics',
		name: 'topics',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['events'], operation: ['decodeEvent'] } },
	},
];

export async function executeEvents(
	this: IExecuteFunctions,
	index: number,
	operation: string,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('beamNetwork') as any;
	const client = createBeamClient(credentials);

	switch (operation) {
		case 'getEvents': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const eventName = this.getNodeParameter('eventName', index, 'Transfer') as string;
			const fromBlock = this.getNodeParameter('fromBlock', index, 0) as number;
			const toBlockStr = this.getNodeParameter('toBlock', index, 'latest') as string;
			const toBlock = toBlockStr === 'latest' ? 'latest' : parseInt(toBlockStr, 10);

			const events = await client.getEvents(contractAddress, ERC20_ABI, eventName, fromBlock, toBlock);

			return {
				contractAddress,
				eventName,
				fromBlock,
				toBlock,
				count: events.length,
				events: events.slice(0, 100),
				timestamp: new Date().toISOString(),
			};
		}

		case 'decodeEvent': {
			const eventName = this.getNodeParameter('eventName', index) as string;
			const eventData = this.getNodeParameter('eventData', index) as string;
			return {
				eventName,
				eventData,
				decoded: {},
				timestamp: new Date().toISOString(),
			};
		}

		case 'getEventsByContract': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const fromBlock = this.getNodeParameter('fromBlock', index, 0) as number;
			const toBlockStr = this.getNodeParameter('toBlock', index, 'latest') as string;
			const toBlock = toBlockStr === 'latest' ? 'latest' : parseInt(toBlockStr, 10);

			const events = await client.getEvents(contractAddress, ERC20_ABI, 'Transfer', fromBlock, toBlock);

			return {
				contractAddress,
				fromBlock,
				toBlock,
				count: events.length,
				events: events.slice(0, 100),
				timestamp: new Date().toISOString(),
			};
		}

		case 'getTransferEvents': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const fromBlock = this.getNodeParameter('fromBlock', index, 0) as number;
			const toBlockStr = this.getNodeParameter('toBlock', index, 'latest') as string;
			const toBlock = toBlockStr === 'latest' ? 'latest' : parseInt(toBlockStr, 10);

			const events = await client.getEvents(contractAddress, ERC20_ABI, 'Transfer', fromBlock, toBlock);

			return {
				contractAddress,
				eventType: 'Transfer',
				fromBlock,
				toBlock,
				count: events.length,
				events: events.slice(0, 100),
				timestamp: new Date().toISOString(),
			};
		}

		case 'getApprovalEvents': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const fromBlock = this.getNodeParameter('fromBlock', index, 0) as number;
			const toBlockStr = this.getNodeParameter('toBlock', index, 'latest') as string;
			const toBlock = toBlockStr === 'latest' ? 'latest' : parseInt(toBlockStr, 10);

			const events = await client.getEvents(contractAddress, ERC20_ABI, 'Approval', fromBlock, toBlock);

			return {
				contractAddress,
				eventType: 'Approval',
				fromBlock,
				toBlock,
				count: events.length,
				events: events.slice(0, 100),
				timestamp: new Date().toISOString(),
			};
		}

		case 'getEventHistory': {
			const contractAddress = this.getNodeParameter('contractAddress', index) as string;
			const fromBlock = this.getNodeParameter('fromBlock', index, 0) as number;
			const toBlockStr = this.getNodeParameter('toBlock', index, 'latest') as string;
			const toBlock = toBlockStr === 'latest' ? 'latest' : parseInt(toBlockStr, 10);

			const events = await client.getEvents(contractAddress, ERC20_ABI, 'Transfer', fromBlock, toBlock);

			return {
				contractAddress,
				fromBlock,
				toBlock,
				count: events.length,
				events: events.slice(0, 100),
				timestamp: new Date().toISOString(),
			};
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
	}
}
