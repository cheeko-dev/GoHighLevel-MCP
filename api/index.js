/**
 * GoHighLevel MCP Server - Real Implementation
 * Connects directly to GHL API using Private Integrations key
 */

const https = require('https');

const MCP_PROTOCOL_VERSION = "2024-11-05";
const GHL_BASE_URL = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

function log(message, data = null) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [MCP] ${message}${data ? ': ' + JSON.stringify(data) : ''}`);
}

function createJsonRpcResponse(id, result = null, error = null) {
  const response = { jsonrpc: "2.0", id };
  if (error) response.error = error;
  else response.result = result;
  return response;
}

function createJsonRpcNotification(method, params = {}) {
  return { jsonrpc: "2.0", method, params };
}

function ghlRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(GHL_BASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const TOOLS = [
  {
    name: "search_contacts",
    description: "Search contacts in GoHighLevel by name, email, or phone",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term (name, email, or phone)" },
        limit: { type: "number", description: "Number of results (default 20)" }
      },
      required: ["query"]
    }
  },
  {
    name: "create_contact",
    description: "Create a new contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        customFields: { type: "array", items: { type: "object" } }
      }
    }
  },
  {
    name: "update_contact",
    description: "Update an existing contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "The contact ID to update" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        customFields: { type: "array", items: { type: "object" } }
      },
      required: ["contactId"]
    }
  },
  {
    name: "get_contact",
    description: "Get a specific contact by ID from GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "The contact ID" }
      },
      required: ["contactId"]
    }
  },
  {
    name: "add_tags",
    description: "Add tags to a contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        tags: { type: "array", items: { type: "string" }, description: "Tags to add" }
      },
      required: ["contactId", "tags"]
    }
  },
  {
    name: "get_pipelines",
    description: "Get all pipelines in GoHighLevel",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "create_opportunity",
    description: "Create a new opportunity in a GoHighLevel pipeline",
    inputSchema: {
      type: "object",
      properties: {
        pipelineId: { type: "string" },
        pipelineStageId: { type: "string" },
        contactId: { type: "string" },
        name: { type: "string" },
        monetaryValue: { type: "number" },
        status: { type: "string", enum: ["open", "won", "lost", "abandoned"] }
      },
      required: ["pipelineId", "pipelineStageId", "contactId", "name"]
    }
  },
  {
    name: "search_opportunities",
    description: "Search opportunities in GoHighLevel pipelines",
    inputSchema: {
      type: "object",
      properties: {
        pipelineId: { type: "string" },
        query: { type: "string" },
        status: { type: "string" }
      }
    }
  },
  {
    name: "get_custom_fields",
    description: "Get all custom fields for contacts in GoHighLevel",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "create_custom_field",
    description: "Create a custom field in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        fieldKey: { type: "string" },
        dataType: { type: "string", enum: ["TEXT", "LARGE_TEXT", "NUMERICAL", "PHONE", "MONETORY", "CHECKBOX", "SINGLE_OPTIONS", "MULTIPLE_OPTIONS", "FLOAT", "TIME", "DATE", "TEXTBOX_LIST", "FILE_UPLOAD", "SIGNATURE"] },
        options: { type: "array", items: { type: "object", properties: { label: { type: "string" }, value: { type: "string" } } } }
      },
      required: ["name", "fieldKey", "dataType"]
    }
  },
  {
    name: "get_tags",
    description: "Get all tags in the GoHighLevel location",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "create_tag",
    description: "Create a new tag in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Tag name" }
      },
      required: ["name"]
    }
  },
  {
    name: "get_workflows",
    description: "Get all workflows in GoHighLevel",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "get_calendars",
    description: "Get all calendars in GoHighLevel",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "create_calendar",
    description: "Create a new calendar in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        calendarType: { type: "string" }
      },
      required: ["name"]
    }
  },
  {
    name: "send_sms",
    description: "Send an SMS message to a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        message: { type: "string" }
      },
      required: ["contactId", "message"]
    }
  },
  {
    name: "send_email",
    description: "Send an email to a contact",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        subject: { type: "string" },
        body: { type: "string" },
        emailFrom: { type: "string" }
      },
      required: ["contactId", "subject", "body"]
    }
  },
  {
    name: "get_location",
    description: "Get the current GoHighLevel location/sub-account details",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "add_contact_to_workflow",
    description: "Add a contact to a GoHighLevel workflow",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        workflowId: { type: "string" }
      },
      required: ["contactId", "workflowId"]
    }
  },
  {
    name: "create_note",
    description: "Add a note to a contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string" },
        body: { type: "string" }
      },
      required: ["contactId", "body"]
    }
  },
  {
    name: "update_opportunity_stage",
    description: "Move an opportunity to a different pipeline stage",
    inputSchema: {
      type: "object",
      properties: {
        opportunityId: { type: "string" },
        pipelineStageId: { type: "string" },
        status: { type: "string", enum: ["open", "won", "lost", "abandoned"] }
      },
      required: ["opportunityId"]
    }
  }
];

async function handleToolCall(name, args) {
  try {
    switch (name) {

      case "get_location": {
        const res = await ghlRequest('GET', `/locations/${GHL_LOCATION_ID}`);
        return JSON.stringify(res.data, null, 2);
      }

      case "search_contacts": {
        const limit = args.limit || 20;
        const res = await ghlRequest('GET', `/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(args.query)}&limit=${limit}`);
        return JSON.stringify(res.data, null, 2);
      }

      case "get_contact": {
        const res = await ghlRequest('GET', `/contacts/${args.contactId}`);
        return JSON.stringify(res.data, null, 2);
      }

      case "create_contact": {
        const body = { ...args, locationId: GHL_LOCATION_ID };
        const res = await ghlRequest('POST', `/contacts/`, body);
        return JSON.stringify(res.data, null, 2);
      }

      case "update_contact": {
        const { contactId, ...updateData } = args;
        const res = await ghlRequest('PUT', `/contacts/${contactId}`, updateData);
        return JSON.stringify(res.data, null, 2);
      }

      case "add_tags": {
        const res = await ghlRequest('POST', `/contacts/${args.contactId}/tags`, { tags: args.tags });
        return JSON.stringify(res.data, null, 2);
      }

      case "create_note": {
        const res = await ghlRequest('POST', `/contacts/${args.contactId}/notes`, { body: args.body, userId: '' });
        return JSON.stringify(res.data, null, 2);
      }

      case "get_pipelines": {
        const res = await ghlRequest('GET', `/opportunities/pipelines/?locationId=${GHL_LOCATION_ID}`);
        return JSON.stringify(res.data, null, 2);
      }

      case "create_opportunity": {
        const body = { ...args, locationId: GHL_LOCATION_ID };
        const res = await ghlRequest('POST', `/opportunities/`, body);
        return JSON.stringify(res.data, null, 2);
      }

      case "search_opportunities": {
        let path = `/opportunities/search/?location_id=${GHL_LOCATION_ID}`;
        if (args.pipelineId) path += `&pipeline_id=${args.pipelineId}`;
        if (args.query) path += `&query=${encodeURIComponent(args.query)}`;
        if (args.status) path += `&status=${args.status}`;
        const res = await ghlRequest('GET', path);
        return JSON.stringify(res.data, null, 2);
      }

      case "update_opportunity_stage": {
        const body = {};
        if (args.pipelineStageId) body.pipelineStageId = args.pipelineStageId;
        if (args.status) body.status = args.status;
        const res = await ghlRequest('PUT', `/opportunities/${args.opportunityId}`, body);
        return JSON.stringify(res.data, null, 2);
      }

      case "get_custom_fields": {
        const res = await ghlRequest('GET', `/locations/${GHL_LOCATION_ID}/customFields`);
        return JSON.stringify(res.data, null, 2);
      }

      case "create_custom_field": {
        const body = { name: args.name, fieldKey: args.fieldKey, dataType: args.dataType, locationId: GHL_LOCATION_ID };
        if (args.options) body.options = args.options;
        const res = await ghlRequest('POST', `/locations/${GHL_LOCATION_ID}/customFields`, body);
        return JSON.stringify(res.data, null, 2);
      }

      case "get_tags": {
        const res = await ghlRequest('GET', `/locations/${GHL_LOCATION_ID}/tags`);
        return JSON.stringify(res.data, null, 2);
      }

      case "create_tag": {
        const res = await ghlRequest('POST', `/locations/${GHL_LOCATION_ID}/tags`, { name: args.name });
        return JSON.stringify(res.data, null, 2);
      }

      case "get_workflows": {
        const res = await ghlRequest('GET', `/workflows/?locationId=${GHL_LOCATION_ID}`);
        return JSON.stringify(res.data, null, 2);
      }

      case "get_calendars": {
        const res = await ghlRequest('GET', `/calendars/?locationId=${GHL_LOCATION_ID}`);
        return JSON.stringify(res.data, null, 2);
      }

      case "create_calendar": {
        const body = { ...args, locationId: GHL_LOCATION_ID };
        const res = await ghlRequest('POST', `/calendars/`, body);
        return JSON.stringify(res.data, null, 2);
      }

      case "send_sms": {
        const convRes = await ghlRequest('POST', `/conversations/`, { locationId: GHL_LOCATION_ID, contactId: args.contactId });
        const convId = convRes.data?.conversation?.id;
        if (!convId) return `Failed to get conversation: ${JSON.stringify(convRes.data)}`;
        const msgRes = await ghlRequest('POST', `/conversations/messages`, { type: 'SMS', conversationId: convId, message: args.message });
        return JSON.stringify(msgRes.data, null, 2);
      }

      case "send_email": {
        const convRes = await ghlRequest('POST', `/conversations/`, { locationId: GHL_LOCATION_ID, contactId: args.contactId });
        const convId = convRes.data?.conversation?.id;
        if (!convId) return `Failed to get conversation: ${JSON.stringify(convRes.data)}`;
        const msgRes = await ghlRequest('POST', `/conversations/messages`, {
          type: 'Email', conversationId: convId,
          subject: args.subject, html: args.body,
          emailFrom: args.emailFrom || 'hello@musichabitat.com'
        });
        return JSON.stringify(msgRes.data, null, 2);
      }

      case "add_contact_to_workflow": {
        const res = await ghlRequest('POST', `/contacts/${args.contactId}/workflow/${args.workflowId}`, {});
        return JSON.stringify(res.data, null, 2);
      }

      default:
        return `Unknown tool: ${name}`;
    }
  } catch (err) {
    return `Error calling ${name}: ${err.message}`;
  }
}

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
}

function sendSSE(res, data) {
  try {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    res.write(`data: ${message}\n\n`);
  } catch (e) {
    log('SSE write error', e.message);
  }
}

function handleInitialize(req) {
  return createJsonRpcResponse(req.id, {
    protocolVersion: MCP_PROTOCOL_VERSION,
    capabilities: { tools: {} },
    serverInfo: { name: 'ghl-mcp-server', version: '1.0.0' }
  });
}

function handleToolsList(req) {
  return createJsonRpcResponse(req.id, { tools: TOOLS });
}

async function handleToolsCall(req) {
  const { name, arguments: args } = req.params;
  log(`Tool call: ${name}`, args);
  const result = await handleToolCall(name, args || {});
  return createJsonRpcResponse(req.id, {
    content: [{ type: 'text', text: result }]
  });
}

async function processMessage(message) {
  if (message.jsonrpc !== '2.0') {
    return createJsonRpcResponse(message.id, null, { code: -32600, message: 'Invalid Request' });
  }
  switch (message.method) {
    case 'initialize': return handleInitialize(message);
    case 'tools/list': return handleToolsList(message);
    case 'tools/call': return await handleToolsCall(message);
    case 'ping': return createJsonRpcResponse(message.id, {});
    default: return createJsonRpcResponse(message.id, null, { code: -32601, message: `Method not found: ${message.method}` });
  }
}

module.exports = async (req, res) => {
  log(`${req.method} ${req.url}`);
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.url === '/' || req.url === '/health') {
    res.status(200).json({
      status: 'healthy', server: 'ghl-mcp-server', version: '1.0.0',
      protocol: MCP_PROTOCOL_VERSION,
      timestamp: new Date().toISOString(),
      tools: TOOLS.map(t => t.name),
      endpoint: '/sse',
      locationId: GHL_LOCATION_ID,
      hasApiKey: !!GHL_API_KEY
    });
    return;
  }

  if (req.url?.includes('favicon')) { res.status(404).end(); return; }

  if (req.url === '/sse') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    if (req.method === 'GET') {
      log('SSE connection established');
      sendSSE(res, createJsonRpcNotification('notification/initialized', {}));
      setTimeout(() => sendSSE(res, createJsonRpcNotification('notification/tools/list_changed', {})), 100);

      const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000);
      req.on('close', () => { log('SSE closed'); clearInterval(heartbeat); });
      setTimeout(() => { clearInterval(heartbeat); res.end(); }, 50000);
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', async () => {
        try {
          const message = JSON.parse(body);
          const response = await processMessage(message);
          sendSSE(res, response);
          setTimeout(() => res.end(), 100);
        } catch (e) {
          sendSSE(res, createJsonRpcResponse(null, null, { code: -32700, message: 'Parse error' }));
          res.end();
        }
      });
      return;
    }
  }

  res.status(404).json({ error: 'Not found' });
};
