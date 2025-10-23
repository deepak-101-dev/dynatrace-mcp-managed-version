# Dynatrace MCP Server for Managed

> **Intelligent Dynatrace Management for Cursor IDE** - An MCP server that enables intelligent interaction with your Dynatrace Managed environment directly from your development environment.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)

## What is Dynatrace MCP Server?

The **Dynatrace MCP Server** is a Model Context Protocol (MCP) server built specifically for **Dynatrace Managed** environments. It enables intelligent interaction with your Dynatrace environment, allowing you to manage problems, monitor infrastructure, and automate maintenance operations directly from your IDE.

### Key Use Cases

- **Intelligent Problem Triaging** - Quickly identify, analyze, and resolve Dynatrace problems
- **Environment Management** - Monitor and manage your Dynatrace environment intelligently  
- **Maintenance Operations** - Schedule and manage maintenance windows with precision
- **Performance Analytics** - Query metrics and analyze performance data
- **Infrastructure Monitoring** - Monitor hosts, services, and applications
- **Dashboard Management** - Create and manage custom dashboards
- **Event Management** - Handle and analyze Dynatrace events

## Features

### 38+ Powerful Tools across 7 categories:

#### Problem Management (8 tools)
- **Problem Discovery** - Find and analyze problems across your environment
- **Problem Details** - Get comprehensive problem information and root cause analysis
- **Problem Resolution** - Close problems and add contextual comments
- **Comment Management** - Add, update, and manage problem comments
- **Problem Filtering** - Filter problems by status, severity, and timeframes

#### Maintenance Windows (6 tools)
- **Maintenance Scheduling** - Create and manage maintenance windows
- **Temporary Tagging** - Create temporary tags for maintenance filtering
- **Window Management** - Enable/disable maintenance windows
- **Host & Application Filtering** - Target specific hosts and applications

#### Host Monitoring (7 tools)
- **Host Configuration** - Get and update host monitoring settings
- **Monitoring Control** - Enable/disable monitoring for specific hosts
- **Anomaly Detection** - Configure CPU, memory, and disk thresholds
- **Host Discovery** - Find hosts by tags, groups, and Kubernetes clusters

#### Dashboard Management (5 tools)
- **Dashboard Creation** - Create custom dashboards with tiles
- **CPU Usage Dashboards** - Specialized CPU monitoring dashboards
- **Dashboard Management** - List, update, and manage existing dashboards
- **Tile Configuration** - Configure dashboard tiles and metrics

#### Event Management (7 tools)
- **Event Discovery** - List and filter Dynatrace events
- **Event Details** - Get comprehensive event information
- **Custom Events** - Ingest custom events into Dynatrace
- **Event Properties** - Manage event properties and types

#### Metrics & Analytics (2 tools)
- **Metric Discovery** - List available metrics with filtering
- **Metric Querying** - Query timeseries data for analysis

#### Entity Management (3 tools)
- **Entity Discovery** - Find entities by tags and filters
- **Host Group Management** - Manage host groups and clusters
- **Kubernetes Integration** - Discover Kubernetes entities

## Prerequisites

### Required
- **Node.js** 18.0.0 or higher
- **Cursor IDE** with MCP support
- **Dynatrace Managed** environment access
- **Valid Dynatrace API Token** with appropriate permissions

### API Token Permissions
Your Dynatrace API token needs the following permissions:
- **Read problems** - View and analyze problems
- **Write problems** - Close problems and add comments
- **Read entities** - Access host and service information
- **Read metrics** - Query performance metrics
- **Read events** - Access event data
- **Write events** - Create custom events
- **Read settings** - Access configuration data
- **Write settings** - Modify monitoring settings

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd dynatrace-mcp-server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Credentials
```bash
cp env.example .env
```

Edit your `.env` file with your Dynatrace credentials:
```env
DYNATRACE_API_TOKEN=your_dynatrace_api_token_here
DYNATRACE_ENV_URL=https://your-environment-id.live.dynatrace.com
```

### 4. Build the Project
```bash
npm run build
```

### 5. Configure MCP Server in Cursor

Copy the built `index.js` file path and add it to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "DynatraceManagedMCP": {
      "command": "node",
      "args": [
        "<full path to your directory>\\dist\\index.js"
      ]
    }
  }
}
```

**Important:** Replace `<full path to your directory>` with your actual project path to the `dist/index.js` file.

### 6. Enable MCP Server in Cursor
- Open Cursor settings
- Navigate to MCP settings  
- Enable the `DynatraceManagedMCP` server
- Restart Cursor if needed

### 7. Start Using!
The MCP server is now active in Cursor. You can:
- Ask Cursor to fetch problems: *"Show me problems from the last hour"*
- Request environment analysis: *"Get CPU usage for production hosts"*
- Manage maintenance: *"Create a maintenance window for server updates"*

## Development

### Development Mode
```bash
npm run dev
```

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Tool Categories & Examples

### Problem Management
**Perfect for:** Incident response, problem triaging, root cause analysis

**Example Use Cases:**
- *"Get all open problems from the last 2 hours"*
- *"Show me details for problem P-12345"*
- *"Close problem P-12345 with resolution comment"*
- *"Find problems affecting production hosts"*

### Maintenance Windows  
**Perfect for:** Planned maintenance, change management, system updates

**Example Use Cases:**
- *"Create a maintenance window for database updates"*
- *"Schedule maintenance for all production hosts"*
- *"Enable maintenance mode for specific applications"*

### Host Monitoring
**Perfect for:** Infrastructure management, performance optimization, capacity planning

**Example Use Cases:**
- *"Show me CPU usage for all production hosts"*
- *"Disable monitoring for hosts under maintenance"*
- *"Configure anomaly detection thresholds"*

### Dashboard Management
**Perfect for:** Custom monitoring, executive reporting, performance visualization

**Example Use Cases:**
- *"Create a CPU usage dashboard for production"*
- *"Build a dashboard for application performance"*
- *"Show me existing dashboards"*

### Event Management
**Perfect for:** Event correlation, custom monitoring, alerting

**Example Use Cases:**
- *"Create a custom event for deployment completion"*
- *"Show me all events from the last hour"*
- *"Get details for event type LOW_DISK_SPACE"*

## Future Roadmap

### Version 2.0 (Coming Soon)
- **Enterprise Proxy Support** - Full proxy configuration for enterprise environments
- **AI-Powered Insights** - Intelligent problem analysis and recommendations
- **Advanced Analytics** - Enhanced metrics analysis and trending
- **Smart Alerting** - Intelligent alert management and escalation
- **Custom Prompts** - Pre-built prompts for common operations
- **Multi-IDE Support** - Support for Claude and other IDEs
- **Multi-Environment** - Support for multiple Dynatrace environments
- **Performance Optimization** - Enhanced query performance and caching

### Additional Tools (Planned)
- **Synthetic Monitoring** - Manage synthetic tests
- **Security Management** - Security vulnerability scanning
- **Cost Optimization** - Resource usage and cost analysis
- **Compliance Reporting** - Automated compliance checks

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create your feature branch: `git checkout -b feature/amazing-feature`
5. Make your changes and test them
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to your fork: `git push origin feature/amazing-feature`
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact [Deepak Singh](https://github.com/deepak-101-dev) or create an issue.