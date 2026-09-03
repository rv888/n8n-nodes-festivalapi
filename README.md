# n8n-nodes-festivalapi

This is an [n8n](https://n8n.io) community node for [Festival API](https://festivalapi.com).

Search 14,000+ film festivals worldwide — filter by deadline, category, country, fee, and festival score.

## Installation

### n8n Cloud (recommended)

Search **"Festival API"** directly in the n8n node panel and drag it into your workflow. No npm install required.

### Self-hosted n8n

```bash
npm install n8n-nodes-festivalapi
```

Then enable community nodes in your n8n admin panel settings.

## Operations

| Operation | Description |
|-----------|-------------|
| **Search Festivals** | Find festivals by name, category, country, state, deadline, fee, platform, or genre |
| **Get Festival Detail** | Full festival info: primary deadline, standard fee, categories, submission URL, score |
| **Get Festival Roster** | Films previously screened at a festival with awards |
| **Get Top Scored Festivals** | Festivals ranked by Festival Score (0-100) |
| **List Categories** | All available festival categories |
| **List Countries** | All countries with festival counts |

## Credentials

You need a Festival API key from [festivalapi.com](https://festivalapi.com). Get one from your dashboard after signing up.

## Example Workflows

- **Daily deadline alert**: Search for festivals with deadlines approaching this week, send results to Slack or email
- **Festival discovery**: Find festivals in specific categories/countries, add them to Airtable or Google Sheets
- **Score-based routing**: Get top-scored festivals matching your criteria, trigger notifications

## Resources

- [Festival API Docs](https://festivalapi.com/docs)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-festivalapi)
