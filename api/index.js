const https=require('https');
const MCP_PROTOCOL_VERSION="2024-11-05";
const GHL_BASE_URL=process.env.GHL_BASE_URL||'https://services.leadconnectorhq.com';
const GHL_API_KEY=process.env.GHL_API_KEY;
const GHL_LOCATION_ID=process.env.GHL_LOCATION_ID;
function createJsonRpcResponse(id,result=null,error=null){const r={jsonrpc:"2.0",id};if(error)r.error=error;else r.result=result;return r;}
function ghlRequest(method,path,body=null){return new Promise((resolve,reject)=>{const url=new URL(GHL_BASE_URL+path);const options={hostname:url.hostname,path:url.pathname+url.search,method:method,headers:{'Authorization':`Bearer ${GHL_API_KEY}`,'Content-Type':'application/json','Version':'2021-07-28','Accept':'application/json'}};const req=https.request(options,(res)=>{let data='';res.on('data',chunk=>data+=chunk);res.on('end',()=>{try{resolve({status:res.statusCode,data:JSON.parse(data)});}catch(e){resolve({status:res.statusCode,data:data});}});});req.on('error',reject);if(body)req.write(JSON.stringify(body));req.end();});}
const TOOLS=[
{name:"search_contacts",description:"Search contacts by name, email, or phone",inputSchema:{type:"object",properties:{query:{type:"string"},limit:{type:"number"}},required:["query"]}},
{name:"get_contact",description:"Get a contact by ID",inputSchema:{type:"object",properties:{contactId:{type:"string"}},required:["contactId"]}},
{name:"create_contact",description:"Create a new contact",inputSchema:{type:"object",properties:{firstName:{type:"string"},lastName:{type:"string"},email:{type:"string"},phone:{type:"string"},tags:{type:"array",items:{type:"string"}},customFields:{type:"array",items:{type:"object"}},source:{type:"string"}}}},
{name:"upsert_contact",description:"Create or update a contact by email or phone",inputSchema:{type:"object",properties:{firstName:{type:"string"},lastName:{type:"string"},email:{type:"string"},phone:{type:"string"},tags:{type:"array",items:{type:"string"}},customFields:{type:"array",items:{type:"object"}}}}},
{name:"update_contact",description:"Update an existing contact by ID",inputSchema:{type:"object",properties:{contactId:{type:"string"},firstName:{type:"string"},lastName:{type:"string"},email:{type:"string"},phone:{type:"string"},tags:{type:"array",items:{type:"string"}},customFields:{type:"array",items:{type:"object"}}},required:["contactId"]}},
{name:"delete_contact",description:"Delete a contact by ID",inputSchema:{type:"object",properties:{contactId:{type:"string"}},required:["contactId"]}},
{name:"add_tags",description:"Add tags to a contact",inputSchema:{type:"object",properties:{contactId:{type:"string"},tags:{type:"array",items:{type:"string"}}},required:["contactId","tags"]}},
{name:"remove_tags",description:"Remove tags from a contact",inputSchema:{type:"object",properties:{contactId:{type:"string"},tags:{type:"array",items:{type:"string"}}},required:["contactId","tags"]}},
{name:"create_note",description:"Add a note to a contact",inputSchema:{type:"object",properties:{contactId:{type:"string"},body:{type:"string"}},required:["contactId","body"]}},
{name:"create_task",description:"Create a task for a contact",inputSchema:{type:"object",properties:{contactId:{type:"string"},title:{type:"string"},dueDate:{type:"string"},description:{type:"string"}},required:["contactId","title","dueDate"]}},
{name:"get_contact_tasks",description:"Get all tasks for a contact",inputSchema:{type:"object",properties:{contactId:{type:"string"}},required:["contactId"]}},
{name:"add_contact_to_workflow",description:"Add a contact to a workflow",inputSchema:{type:"object",properties:{contactId:{type:"string"},workflowId:{type:"string"}},required:["contactId","workflowId"]}},
{name:"remove_contact_from_workflow",description:"Remove a contact from a workflow",inputSchema:{type:"object",properties:{contactId:{type:"string"},workflowId:{type:"string"}},required:["contactId","workflowId"]}},
{name:"get_pipelines",description:"Get all pipelines",inputSchema:{type:"object",properties:{}}},
{name:"create_pipeline",description:"Create a new pipeline",inputSchema:{type:"object",properties:{name:{type:"string"},stages:{type:"array",items:{type:"object"}}},required:["name"]}},
{name:"create_opportunity",description:"Create a new opportunity",inputSchema:{type:"object",properties:{pipelineId:{type:"string"},pipelineStageId:{type:"string"},contactId:{type:"string"},name:{type:"string"},monetaryValue:{type:"number"},status:{type:"string"}},required:["pipelineId","pipelineStageId","contactId","name"]}},
{name:"search_opportunities",description:"Search opportunities",inputSchema:{type:"object",properties:{pipelineId:{type:"string"},query:{type:"string"},status:{type:"string"},stageId:{type:"string"}}}},
{name:"update_opportunity_stage",description:"Move an opportunity to a different stage",inputSchema:{type:"object",properties:{opportunityId:{type:"string"},pipelineStageId:{type:"string"},status:{type:"string"}},required:["opportunityId"]}},
{name:"delete_opportunity",description:"Delete an opportunity",inputSchema:{type:"object",properties:{opportunityId:{type:"string"}},required:["opportunityId"]}},
{name:"get_custom_fields",description:"Get all custom fields",inputSchema:{type:"object",properties:{}}},
{name:"create_custom_field",description:"Create a custom field",inputSchema:{type:"object",properties:{name:{type:"string"},fieldKey:{type:"string"},dataType:{type:"string",description:"TEXT,LARGE_TEXT,NUMERICAL,PHONE,MONETORY,CHECKBOX,SINGLE_OPTIONS,MULTIPLE_OPTIONS,FLOAT,TIME,DATE"},options:{type:"array",items:{type:"object"}}},required:["name","fieldKey","dataType"]}},
{name:"create_custom_field_folder",description:"Create a folder to group custom fields",inputSchema:{type:"object",properties:{name:{type:"string"}},required:["name"]}},
{name:"delete_custom_field",description:"Delete a custom field by ID",inputSchema:{type:"object",properties:{fieldId:{type:"string"}},required:["fieldId"]}},
{name:"get_tags",description:"Get all tags",inputSchema:{type:"object",properties:{}}},
{name:"create_tag",description:"Create a new tag",inputSchema:{type:"object",properties:{name:{type:"string"}},required:["name"]}},
{name:"delete_tag",description:"Delete a tag by ID",inputSchema:{type:"object",properties:{tagId:{type:"string"}},required:["tagId"]}},
{name:"get_workflows",description:"Get all workflows",inputSchema:{type:"object",properties:{}}},
{name:"get_calendars",description:"Get all calendars",inputSchema:{type:"object",properties:{}}},
{name:"create_calendar",description:"Create a new calendar",inputSchema:{type:"object",properties:{name:{type:"string"},description:{type:"string"}},required:["name"]}},
{name:"search_conversations",description:"Search conversations",inputSchema:{type:"object",properties:{contactId:{type:"string"},query:{type:"string"},limit:{type:"number"}}}},
{name:"send_sms",description:"Send an SMS to a contact",inputSchema:{type:"object",properties:{contactId:{type:"string"},message:{type:"string"}},required:["contactId","message"]}},
{name:"send_email",description:"Send an email to a contact",inputSchema:{type:"object",properties:{contactId:{type:"string"},subject:{type:"string"},body:{type:"string"},emailFrom:{type:"string"}},required:["contactId","subject","body"]}},
{name:"get_forms",description:"Get all forms in the location",inputSchema:{type:"object",properties:{limit:{type:"number"}}}},
{name:"get_form_submissions",description:"Get submissions for a form",inputSchema:{type:"object",properties:{formId:{type:"string"},limit:{type:"number"}},required:["formId"]}},
{name:"get_location",description:"Get current location details",inputSchema:{type:"object",properties:{}}},
{name:"update_location",description:"Update location settings",inputSchema:{type:"object",properties:{website:{type:"string"},timezone:{type:"string"},name:{type:"string"}}}},
{name:"get_snapshots",description:"Get all available snapshots",inputSchema:{type:"object",properties:{}}}
];
async function handleToolCall(name,args){
try{switch(name){
case"get_location":{const r=await ghlRequest('GET',`/locations/${GHL_LOCATION_ID}`);return JSON.stringify(r.data,null,2);}
case"update_location":{const r=await ghlRequest('PUT',`/locations/${GHL_LOCATION_ID}`,args);return JSON.stringify(r.data,null,2);}
case"search_contacts":{const r=await ghlRequest('GET',`/contacts/?locationId=${GHL_LOCATION_ID}&query=${encodeURIComponent(args.query)}&limit=${args.limit||20}`);return JSON.stringify(r.data,null,2);}
case"get_contact":{const r=await ghlRequest('GET',`/contacts/${args.contactId}`);return JSON.stringify(r.data,null,2);}
case"create_contact":{const r=await ghlRequest('POST',`/contacts/`,{...args,locationId:GHL_LOCATION_ID});return JSON.stringify(r.data,null,2);}
case"upsert_contact":{const r=await ghlRequest('POST',`/contacts/upsert`,{...args,locationId:GHL_LOCATION_ID});return JSON.stringify(r.data,null,2);}
case"update_contact":{const{contactId,...d}=args;const r=await ghlRequest('PUT',`/contacts/${contactId}`,d);return JSON.stringify(r.data,null,2);}
case"delete_contact":{const r=await ghlRequest('DELETE',`/contacts/${args.contactId}`);return JSON.stringify(r.data,null,2);}
case"add_tags":{const r=await ghlRequest('POST',`/contacts/${args.contactId}/tags`,{tags:args.tags});return JSON.stringify(r.data,null,2);}
case"remove_tags":{const r=await ghlRequest('DELETE',`/contacts/${args.contactId}/tags`,{tags:args.tags});return JSON.stringify(r.data,null,2);}
case"create_note":{const r=await ghlRequest('POST',`/contacts/${args.contactId}/notes`,{body:args.body,userId:''});return JSON.stringify(r.data,null,2);}
case"create_task":{const r=await ghlRequest('POST',`/contacts/${args.contactId}/tasks`,{title:args.title,dueDate:args.dueDate,description:args.description||''});return JSON.stringify(r.data,null,2);}
case"get_contact_tasks":{const r=await ghlRequest('GET',`/contacts/${args.contactId}/tasks`);return JSON.stringify(r.data,null,2);}
case"add_contact_to_workflow":{const r=await ghlRequest('POST',`/contacts/${args.contactId}/workflow/${args.workflowId}`,{});return JSON.stringify(r.data,null,2);}
case"remove_contact_from_workflow":{const r=await ghlRequest('DELETE',`/contacts/${args.contactId}/workflow/${args.workflowId}`,{});return JSON.stringify(r.data,null,2);}
case"get_pipelines":{const r=await ghlRequest('GET',`/opportunities/pipelines/?locationId=${GHL_LOCATION_ID}`);return JSON.stringify(r.data,null,2);}
case"create_pipeline":{const r=await ghlRequest('POST',`/opportunities/pipelines/`,{name:args.name,locationId:GHL_LOCATION_ID,stages:args.stages||[]});return JSON.stringify(r.data,null,2);}
case"create_opportunity":{const r=await ghlRequest('POST',`/opportunities/`,{...args,locationId:GHL_LOCATION_ID});return JSON.stringify(r.data,null,2);}
case"search_opportunities":{let p=`/opportunities/search/?location_id=${GHL_LOCATION_ID}`;if(args.pipelineId)p+=`&pipeline_id=${args.pipelineId}`;if(args.query)p+=`&query=${encodeURIComponent(args.query)}`;if(args.status)p+=`&status=${args.status}`;if(args.stageId)p+=`&pipeline_stage_id=${args.stageId}`;const r=await ghlRequest('GET',p);return JSON.stringify(r.data,null,2);}
case"update_opportunity_stage":{const b={};if(args.pipelineStageId)b.pipelineStageId=args.pipelineStageId;if(args.status)b.status=args.status;const r=await ghlRequest('PUT',`/opportunities/${args.opportunityId}`,b);return JSON.stringify(r.data,null,2);}
case"delete_opportunity":{const r=await ghlRequest('DELETE',`/opportunities/${args.opportunityId}`);return JSON.stringify(r.data,null,2);}
case"get_custom_fields":{const r=await ghlRequest('GET',`/locations/${GHL_LOCATION_ID}/customFields`);return JSON.stringify(r.data,null,2);}
case"create_custom_field":{const b={name:args.name,fieldKey:args.fieldKey,dataType:args.dataType,locationId:GHL_LOCATION_ID};if(args.options)b.options=args.options;const r=await ghlRequest('POST',`/locations/${GHL_LOCATION_ID}/customFields`,b);return JSON.stringify(r.data,null,2);}
case"create_custom_field_folder":{const r=await ghlRequest('POST',`/locations/${GHL_LOCATION_ID}/customFields/folder`,{name:args.name,locationId:GHL_LOCATION_ID});return JSON.stringify(r.data,null,2);}
case"delete_custom_field":{const r=await ghlRequest('DELETE',`/locations/${GHL_LOCATION_ID}/customFields/${args.fieldId}`);return JSON.stringify(r.data,null,2);}
case"get_tags":{const r=await ghlRequest('GET',`/locations/${GHL_LOCATION_ID}/tags`);return JSON.stringify(r.data,null,2);}
case"create_tag":{const r=await ghlRequest('POST',`/locations/${GHL_LOCATION_ID}/tags`,{name:args.name});return JSON.stringify(r.data,null,2);}
case"delete_tag":{const r=await ghlRequest('DELETE',`/locations/${GHL_LOCATION_ID}/tags/${args.tagId}`);return JSON.stringify(r.data,null,2);}
case"get_workflows":{const r=await ghlRequest('GET',`/workflows/?locationId=${GHL_LOCATION_ID}`);return JSON.stringify(r.data,null,2);}
case"get_calendars":{const r=await ghlRequest('GET',`/calendars/?locationId=${GHL_LOCATION_ID}`);return JSON.stringify(r.data,null,2);}
case"create_calendar":{const r=await ghlRequest('POST',`/calendars/`,{...args,locationId:GHL_LOCATION_ID});return JSON.stringify(r.data,null,2);}
case"search_conversations":{let p=`/conversations/search/?locationId=${GHL_LOCATION_ID}`;if(args.contactId)p+=`&contactId=${args.contactId}`;if(args.query)p+=`&query=${encodeURIComponent(args.query)}`;if(args.limit)p+=`&limit=${args.limit}`;const r=await ghlRequest('GET',p);return JSON.stringify(r.data,null,2);}
case"send_sms":{const c=await ghlRequest('POST',`/conversations/`,{locationId:GHL_LOCATION_ID,contactId:args.contactId});const cid=c.data?.conversation?.id;if(!cid)return`No conversation: ${JSON.stringify(c.data)}`;const r=await ghlRequest('POST',`/conversations/messages`,{type:'SMS',conversationId:cid,message:args.message});return JSON.stringify(r.data,null,2);}
case"send_email":{const c=await ghlRequest('POST',`/conversations/`,{locationId:GHL_LOCATION_ID,contactId:args.contactId});const cid=c.data?.conversation?.id;if(!cid)return`No conversation: ${JSON.stringify(c.data)}`;const r=await ghlRequest('POST',`/conversations/messages`,{type:'Email',conversationId:cid,subject:args.subject,html:args.body,emailFrom:args.emailFrom||'hello@musichabitat.com'});return JSON.stringify(r.data,null,2);}
case"get_forms":{const r=await ghlRequest('GET',`/forms/?locationId=${GHL_LOCATION_ID}&limit=${args.limit||50}`);return JSON.stringify(r.data,null,2);}
case"get_form_submissions":{const r=await ghlRequest('GET',`/forms/submissions?locationId=${GHL_LOCATION_ID}&formId=${args.formId}&limit=${args.limit||20}`);return JSON.stringify(r.data,null,2);}
case"get_snapshots":{const r=await ghlRequest('GET',`/snapshots/?companyId=${GHL_LOCATION_ID}`);return JSON.stringify(r.data,null,2);}
default:return`Unknown tool: ${name}`;
}}catch(err){return`Error: ${err.message}`;}}
function setCORSHeaders(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Accept, Authorization');}
function sendSSE(res,data){try{res.write(`data: ${typeof data==='string'?data:JSON.stringify(data)}\n\n`);}catch(e){}}
module.exports=async(req,res)=>{
setCORSHeaders(res);
if(req.method==='OPTIONS'){res.status(200).end();return;}
if(req.url==='/'||req.url==='/health'){res.status(200).json({status:'healthy',server:'ghl-mcp-server',version:'3.0.0',protocol:MCP_PROTOCOL_VERSION,timestamp:new Date().toISOString(),toolCount:TOOLS.length,tools:TOOLS.map(t=>t.name),endpoint:'/sse',locationId:GHL_LOCATION_ID,hasApiKey:!!GHL_API_KEY});return;}
if(req.url?.includes('favicon')){res.status(404).end();return;}
if(req.url==='/sse'){
res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});
if(req.method==='GET'){sendSSE(res,{jsonrpc:"2.0",method:"notification/initialized",params:{}});setTimeout(()=>sendSSE(res,{jsonrpc:"2.0",method:"notification/tools/list_changed",params:{}}),100);const hb=setInterval(()=>res.write(': heartbeat\n\n'),25000);req.on('close',()=>clearInterval(hb));setTimeout(()=>{clearInterval(hb);res.end();},50000);return;}
if(req.method==='POST'){let body='';req.on('data',chunk=>body+=chunk.toString());req.on('end',async()=>{try{const msg=JSON.parse(body);let response;if(msg.jsonrpc!=='2.0'){response={jsonrpc:"2.0",id:msg.id,error:{code:-32600,message:'Invalid Request'}};}else{switch(msg.method){case'initialize':response={jsonrpc:"2.0",id:msg.id,result:{protocolVersion:MCP_PROTOCOL_VERSION,capabilities:{tools:{}},serverInfo:{name:'ghl-mcp-server',version:'3.0.0'}}};break;case'tools/list':response={jsonrpc:"2.0",id:msg.id,result:{tools:TOOLS}};break;case'tools/call':const result=await handleToolCall(msg.params.name,msg.params.arguments||{});response={jsonrpc:"2.0",id:msg.id,result:{content:[{type:'text',text:result}]}};break;case'ping':response={jsonrpc:"2.0",id:msg.id,result:{}};break;default:response={jsonrpc:"2.0",id:msg.id,error:{code:-32601,message:`Method not found: ${msg.method}`}};}}sendSSE(res,response);setTimeout(()=>res.end(),100);}catch(e){sendSSE(res,{jsonrpc:"2.0",id:null,error:{code:-32700,message:'Parse error'}});res.end();}});return;}}
res.status(404).json({error:'Not found'});};
