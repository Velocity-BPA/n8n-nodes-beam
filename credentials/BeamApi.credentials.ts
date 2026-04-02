import type {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BeamApi implements ICredentialType {
	name = 'beamApi';
	displayName = 'Beam API';
	documentationUrl = 'https://docs.beam.mw/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'API key for Beam platform. You can obtain this from your Beam account settings.',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			required: true,
			default: 'https://api.beam.mw/v1',
			description: 'Base URL for the Beam API',
		},
	];
}