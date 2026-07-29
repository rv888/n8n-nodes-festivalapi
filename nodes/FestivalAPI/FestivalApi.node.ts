import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

const BASE_URL = 'https://festivalapi.com/v1';

export class FestivalAPI implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Festival API',
    name: 'festivalApi',
    icon: { light: 'file:festival.svg', dark: 'file:festival_dark.svg' },
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description:
      'Search 12,000+ film festivals worldwide — filter by deadline, category, country, fee, and festival score',
    defaults: { name: 'Festival API' },
    usableAsTool: true,
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'festivalApiApi', required: true }],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Festival', value: 'festival' },
          { name: 'Reference Data', value: 'referenceData' },
        ],
        default: 'festival',
        required: true,
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['festival'] } },
        options: [
          { name: 'Get Festival Detail', value: 'getFestival', action: 'Get festival detail', description: 'Full festival detail with deadlines, fees, categories, and submission URL' },
          { name: 'Get Festival Roster', value: 'getRoster', action: 'Get festival roster', description: 'Films previously screened at this festival' },
          { name: 'Get Top Scored Festivals', value: 'getScored', action: 'Get top scored festivals', description: 'Festivals ranked by Festival Score (0-100)' },
          { name: 'Search Festivals', value: 'searchFestivals', action: 'Search festivals', description: 'Find festivals by name, category, country, deadline, fee, and more' },
        ],
        default: 'searchFestivals',
        required: true,
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['referenceData'] } },
        options: [
          { name: 'List Categories', value: 'listCategories', action: 'List categories', description: 'All available festival categories' },
          { name: 'List Countries', value: 'listCountries', action: 'List countries', description: 'All available countries with festival counts' },
        ],
        default: 'listCountries',
        required: true,
      },
      {
        displayName: 'Festival ID',
        name: 'festivalId',
        type: 'number',
        default: 1,
        required: true,
        displayOptions: {
          show: { resource: ['festival'], operation: ['getFestival', 'getRoster'] },
        },
        description: 'Festival ID (find IDs with the Search Festivals operation)',
      },
      {
        displayName: 'Search Query',
        name: 'search',
        type: 'string',
        default: '',
        placeholder: 'Sundance',
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Search festivals by name (case-insensitive). Leave empty to list all.',
      },
      {
        displayName: 'Category',
        name: 'category',
        type: 'string',
        default: '',
        placeholder: 'short_film',
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Filter by category (e.g. short_film, feature, documentary, animation, horror, sci_fi)',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
        placeholder: 'United States',
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Filter by country name or code (e.g. United States, US, Canada, CA)',
      },
      {
        displayName: 'State / Province',
        name: 'state',
        type: 'string',
        default: '',
        placeholder: 'California',
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Filter by state or province (e.g. California, Ontario)',
      },
      {
        displayName: 'Genre',
        name: 'genre',
        type: 'string',
        default: '',
        placeholder: 'drama',
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Filter by accepted genre (e.g. drama, comedy, experimental)',
      },
      {
        displayName: 'Submission Platform',
        name: 'submissionPlatform',
        type: 'string',
        default: '',
        placeholder: 'filmfreeway',
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Filter by submission platform (e.g. filmfreeway, withoutabox)',
      },
      {
        displayName: 'Max Fee (USD)',
        name: 'feeMax',
        type: 'number',
        default: 0,
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Maximum submission fee in USD. Set to 0 for no limit.',
      },
      {
        displayName: 'Deadline After',
        name: 'deadlineAfter',
        type: 'dateTime',
        default: '',
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Filter by submission deadline on or after this date',
      },
      {
        displayName: 'Deadline Before',
        name: 'deadlineBefore',
        type: 'dateTime',
        default: '',
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals'] } },
        description: 'Filter by submission deadline before this date',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        typeOptions: { minValue: 1, maxValue: 200 },
        displayOptions: { show: { resource: ['festival'], operation: ['searchFestivals', 'getRoster', 'getScored'] } },
        description: 'Max number of results to return',
      },
      {
        displayName: 'Page',
        name: 'page',
        type: 'number',
        default: 1,
        typeOptions: { minValue: 1 },
        displayOptions: { show: { resource: ['festival'], operation: ['getRoster', 'getScored'] } },
        description: 'Page number for paginated results',
      },
    ],
  };

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;
			try {
				let url: string;
				const opKey = `${resource}.${operation}`;
				switch (opKey) {
					case 'festival.getFestival':
						url = `${BASE_URL}/festivals/${this.getNodeParameter('festivalId', i)}/`; break;
					case 'festival.getRoster': {
						const fid = this.getNodeParameter('festivalId', i) as number;
						const page = this.getNodeParameter('page', i, 1) as number;
						const limit = this.getNodeParameter('limit', i, 50) as number;
						url = `${BASE_URL}/festivals/${fid}/roster/?page=${page}&per_page=${limit}`; break;
					}
					case 'festival.getScored': {
						const sPage = this.getNodeParameter('page', i, 1) as number;
						const sLimit = this.getNodeParameter('limit', i, 50) as number;
						url = `${BASE_URL}/festivals/scored/?page=${sPage}&per_page=${sLimit}`; break;
					}
					case 'referenceData.listCategories':
						url = `${BASE_URL}/categories/`; break;
					case 'referenceData.listCountries':
						url = `${BASE_URL}/countries/`; break;
					case 'festival.searchFestivals': {
						const p = new URLSearchParams();
						const q = this.getNodeParameter('search', i, '') as string;
						const cat = this.getNodeParameter('category', i, '') as string;
						const c = this.getNodeParameter('country', i, '') as string;
						const st = this.getNodeParameter('state', i, '') as string;
						const g = this.getNodeParameter('genre', i, '') as string;
						const sp = this.getNodeParameter('submissionPlatform', i, '') as string;
						const fm = this.getNodeParameter('feeMax', i, 0) as number;
						const da = this.getNodeParameter('deadlineAfter', i, '') as string;
						const db = this.getNodeParameter('deadlineBefore', i, '') as string;
						const limit = this.getNodeParameter('limit', i, 50) as number;
						if (q) p.append('q', q);
						if (cat) p.append('category', cat);
						if (c) p.append('country', c);
						if (st) p.append('state', st);
						if (g) p.append('genre', g);
						if (sp) p.append('submission_platform', sp);
						if (fm > 0) p.append('fee_max', String(fm));
						if (da) p.append('deadline_after', da);
						if (db) p.append('deadline_before', db);
						p.append('per_page', String(limit));
						url = `${BASE_URL}/festivals/?${p.toString()}`;
						break;
					}
					default:
						throw new NodeOperationError(this.getNode(), `Unknown ${resource} operation: ${operation}`);
				}

				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'festivalApiApi',
					{
						method: 'GET',
						url,
					},
				);
				returnData.push({ json: response, pairedItem: { item: i } });
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message || String(error) }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject);
			}
		}
		return [returnData];
	}
}
