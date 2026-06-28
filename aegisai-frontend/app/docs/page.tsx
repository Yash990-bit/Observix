'use client';

import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';

const DOCS_CONTENT: Record<string, any> = {
  'overview': {
    title: 'Overview',
    subtitle: 'INTRODUCTION',
    description: 'AegisAI is an autonomous, self-healing infrastructure observability platform. It monitors your systems using eBPF, analyzes anomalies with LLMs, and executes runbook automations automatically.',
    code: null,
    note: 'Welcome to the AegisAI documentation. Use the sidebar to navigate topics.'
  },
  'sdk-setup': {
    title: 'SDK Installation & Setup',
    subtitle: 'INTRODUCTION',
    description: 'Integrate AegisAI into your existing infrastructure with minimal overhead. Our Node.js SDK provides automatic instrumentation for Kubernetes, AWS Lambda, and standard Express servers.',
    code: {
      type: 'Terminal',
      content: 'npm install @aegisai/sdk'
    },
    example: {
      title: 'Initialization',
      desc: 'To start AegisAI, you must provide your API Key and Application ID. We recommend using environment variables for security.',
      file: 'index.js',
      lang: 'JAVASCRIPT',
      content: `const Aegis = require('@aegisai/sdk');\n\nconst client = new Aegis({\n  apiKey: process.env.AEGIS_API_KEY,\n  endpoint: 'https://api.aegis.ai', // BACKEND API Gateway URL (Not Frontend!)\n  appId: 'prod-gateway-01',\n  environment: 'production'\n});\n\n// Initialize autonomous monitoring\nclient.start().then(() => {\n  console.log('AegisAI monitoring active');\n});`
    },
    note: 'AegisAI runs as a side-car thread and will not block your main execution loop. It uses gRPC for high-throughput metric streaming.'
  },
  'cli-reference': {
    title: 'Command Line Interface (CLI)',
    subtitle: 'INTRODUCTION',
    description: 'The Aegis CLI lets you manage incidents, deploy policies, and query logs from your terminal.',
    code: {
      type: 'Terminal',
      content: 'aegis login --api-key=$YOUR_API_KEY'
    },
    example: {
      title: 'Common Commands',
      desc: 'Here are some basic commands to get started.',
      file: 'bash',
      lang: 'SHELL',
      content: `aegis incidents list --status active\naegis logs tail --service auth-api\naegis policy apply ./rate-limit.yaml`
    },
    note: 'The CLI automatically respects your RBAC permissions.'
  },
  'service-graphs': {
    title: 'Service Graphs',
    subtitle: 'OBSERVABILITY',
    description: 'Aegis automatically builds real-time dependency graphs by intercepting network traffic via eBPF. No code changes are required.',
    code: null,
    example: null,
    note: 'Graphs update every 5 seconds. Degraded nodes are highlighted in yellow or red depending on error rates.'
  },
  'metric-exporting': {
    title: 'Metric Exporting',
    subtitle: 'OBSERVABILITY',
    description: 'Export Aegis metrics to Prometheus, Datadog, or Grafana via our OpenTelemetry compatible endpoint.',
    code: null,
    example: {
      title: 'Prometheus Configuration',
      desc: 'Add this job to your prometheus.yml to scrape Aegis metrics.',
      file: 'prometheus.yml',
      lang: 'YAML',
      content: `scrape_configs:\n  - job_name: 'aegis_ai'\n    metrics_path: '/metrics'\n    bearer_token: 'YOUR_API_KEY'\n    static_configs:\n      - targets: ['api.aegis.ai']`
    },
    note: 'Metrics are aggregated every 10 seconds.'
  },
  'custom-traces': {
    title: 'Custom Traces',
    subtitle: 'OBSERVABILITY',
    description: 'Manually instrument specific business logic functions using the Aegis span tracer.',
    code: null,
    example: {
      title: 'Creating a custom trace span',
      desc: 'Wrap your critical functions to measure exact execution times.',
      file: 'payment.js',
      lang: 'JAVASCRIPT',
      content: `const span = client.tracer.startSpan('processPayment');\ntry {\n  await stripe.charges.create(payload);\n  span.end({ status: 'success' });\n} catch (e) {\n  span.end({ status: 'error', error: e });\n}`
    },
    note: 'Custom spans are automatically linked to the parent request trace.'
  },
  'create-incident': {
    title: 'Create Incident',
    subtitle: 'API ENDPOINTS',
    description: 'Programmatically declare an incident in the Aegis system.',
    code: {
      type: 'POST /v1/incidents',
      content: 'curl -X POST https://api.aegis.ai/v1/incidents -H "Authorization: Bearer $KEY"'
    },
    example: {
      title: 'Request Payload',
      desc: 'Send a JSON payload with the incident details.',
      file: 'JSON',
      lang: 'JSON',
      content: `{\n  "title": "Database degraded",\n  "severity": "high",\n  "service": "postgres-primary"\n}`
    },
    note: 'Incidents created via API will immediately trigger AI triage workflows.'
  },
  'list-metrics': {
    title: 'List Metrics',
    subtitle: 'API ENDPOINTS',
    description: 'Retrieve time-series data for a specific service.',
    code: {
      type: 'GET /v1/metrics',
      content: 'curl -X GET "https://api.aegis.ai/v1/metrics?service=auth-api&range=1h"'
    },
    example: null,
    note: 'Limits apply: 100 requests per minute.'
  },
  'update-policy': {
    title: 'Update Policy',
    subtitle: 'API ENDPOINTS',
    description: 'Update the autonomous remediation policy for a service.',
    code: {
      type: 'PUT /v1/policies/:id',
      content: 'curl -X PUT "https://api.aegis.ai/v1/policies/pol_123" -H "Authorization: Bearer $KEY"'
    },
    example: {
      title: 'Policy Payload',
      desc: 'Define what the AI is allowed to do autonomously.',
      file: 'JSON',
      lang: 'JSON',
      content: `{\n  "autoScale": true,\n  "maxReplicas": 10,\n  "allowRestart": false\n}`
    },
    note: 'Policy updates take effect within 30 seconds globally.'
  }
};

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'console' | 'network'>('console');
  const [isRunning, setIsRunning] = useState(false);
  const [activeDocKey, setActiveDocKey] = useState('sdk-setup');
  
  const [consoleOutput, setConsoleOutput] = useState([
    { time: '14:22:01', text: 'Connecting to cluster...', type: 'normal' },
    { time: '14:22:01', text: 'Connected to eu-west-1.aegis.ai', type: 'success' },
    { time: '14:22:02', text: 'DATA RECEIVED: 2.4kb', type: 'info' }
  ]);
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setConsoleOutput(prev => [...prev, { time: new Date().toLocaleTimeString().split(' ')[0], text: 'Executing request...', type: 'normal' }]);
    
    setTimeout(() => {
      setConsoleOutput(prev => [...prev, { time: new Date().toLocaleTimeString().split(' ')[0], text: '200 OK - Request successful', type: 'success' }]);
      setIsRunning(false);
    }, 1500);
  };

  const doc = DOCS_CONTENT[activeDocKey];

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex min-w-0 overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0 bg-background relative">
          {/*  TopAppBar  */}
          <header className="h-16 sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur-md bg-surface/80 flex justify-between items-center px-gutter shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-xl group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
                <input className="w-full bg-surface-container-lowest border border-white/10 rounded-lg py-2 pl-10 pr-4 text-body-md focus:outline-none focus:border-primary/50 transition-all" placeholder="Search API documentation..." type="text" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-4">
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">dns</span>
                </button>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">account_circle</span>
                </button>
              </div>
            </div>
          </header>

          {/*  Documentation Content  */}
          <div className="flex flex-1 overflow-hidden">
            {/*  Documentation Tree  */}
            <aside className="w-64 border-r border-white/5 bg-surface-container-lowest/30 p-6 overflow-y-auto hidden lg:block shrink-0 custom-scrollbar">
              <p className="font-label-caps text-label-caps text-outline mb-4 tracking-widest">DOCUMENTATION</p>
              <ul className="space-y-6">
                <li>
                  <p className="font-body-md font-semibold text-primary mb-2">Introduction</p>
                  <ul className="space-y-2 border-l border-white/10 ml-1 pl-4">
                    <li><button onClick={() => setActiveDocKey('overview')} className={`text-body-sm text-left transition-colors ${activeDocKey === 'overview' ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}>Overview</button></li>
                    <li><button onClick={() => setActiveDocKey('sdk-setup')} className={`text-body-sm text-left transition-colors ${activeDocKey === 'sdk-setup' ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}>SDK Setup</button></li>
                    <li><button onClick={() => setActiveDocKey('cli-reference')} className={`text-body-sm text-left transition-colors ${activeDocKey === 'cli-reference' ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}>CLI Reference</button></li>
                  </ul>
                </li>
                <li>
                  <p className="font-body-md font-semibold text-on-surface mb-2">Observability</p>
                  <ul className="space-y-2 border-l border-white/10 ml-1 pl-4">
                    <li><button onClick={() => setActiveDocKey('service-graphs')} className={`text-body-sm text-left transition-colors ${activeDocKey === 'service-graphs' ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}>Service Graphs</button></li>
                    <li><button onClick={() => setActiveDocKey('metric-exporting')} className={`text-body-sm text-left transition-colors ${activeDocKey === 'metric-exporting' ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}>Metric Exporting</button></li>
                    <li><button onClick={() => setActiveDocKey('custom-traces')} className={`text-body-sm text-left transition-colors ${activeDocKey === 'custom-traces' ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}>Custom Traces</button></li>
                  </ul>
                </li>
                <li>
                  <p className="font-body-md font-semibold text-on-surface mb-2">API Endpoints</p>
                  <ul className="space-y-2 border-l border-white/10 ml-1 pl-4">
                    <li><button onClick={() => setActiveDocKey('create-incident')} className={`text-body-sm text-left flex items-center transition-colors ${activeDocKey === 'create-incident' ? 'text-on-surface font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}><span className="text-[10px] font-bold text-tertiary mr-1">POST</span> Create Incident</button></li>
                    <li><button onClick={() => setActiveDocKey('list-metrics')} className={`text-body-sm text-left flex items-center transition-colors ${activeDocKey === 'list-metrics' ? 'text-on-surface font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}><span className="text-[10px] font-bold text-secondary mr-1">GET</span> List Metrics</button></li>
                    <li><button onClick={() => setActiveDocKey('update-policy')} className={`text-body-sm text-left flex items-center transition-colors ${activeDocKey === 'update-policy' ? 'text-on-surface font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}><span className="text-[10px] font-bold text-primary mr-1">PUT</span> Update Policy</button></li>
                  </ul>
                </li>
              </ul>
            </aside>

            {/*  Markdown Content  */}
            <section className="flex-1 overflow-y-auto p-10 bg-surface-container-lowest/10 relative custom-scrollbar">
              <div className="max-w-3xl mx-auto pb-20">
                <nav className="flex items-center gap-2 mb-8 uppercase">
                  <span className="text-label-caps font-label-caps text-on-surface-variant">DOCS</span>
                  <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
                  <span className="text-label-caps font-label-caps text-on-surface-variant">{doc.subtitle}</span>
                  <span className="material-symbols-outlined text-[12px] text-outline">chevron_right</span>
                  <span className="text-label-caps font-label-caps text-primary">{doc.title}</span>
                </nav>
                <h2 className="font-headline-lg text-headline-lg mb-4 text-on-surface">{doc.title}</h2>
                <p className="text-body-md text-on-surface-variant mb-8 leading-relaxed">
                  {doc.description}
                </p>

                {doc.code && (
                  <div className="mb-10 group">
                    <div className="flex justify-between items-center bg-surface-container-high/60 px-4 py-2 rounded-t-lg border-x border-t border-white/10">
                      <span className="font-data-mono text-body-sm text-on-surface-variant">{doc.code.type}</span>
                      <button onClick={handleCopy} className="text-primary hover:text-white transition-colors flex items-center gap-1">
                        {copied ? <span className="text-[10px] font-bold">COPIED</span> : null}
                        <span className="material-symbols-outlined text-[16px]">{copied ? 'check' : 'content_copy'}</span>
                      </button>
                    </div>
                    <div className="bg-[#070708] p-5 rounded-b-lg border border-white/10 font-data-mono text-data-mono overflow-x-auto text-on-surface">
                      {doc.code.content}
                    </div>
                  </div>
                )}

                {doc.example && (
                  <>
                    <h3 className="font-headline-md text-headline-md mb-4 text-on-surface">{doc.example.title}</h3>
                    <p className="text-body-md text-on-surface-variant mb-6 leading-relaxed">
                      {doc.example.desc}
                    </p>

                    <div className="mb-10">
                      <div className="flex justify-between items-center bg-surface-container-high/60 px-4 py-2 rounded-t-lg border-x border-t border-white/10">
                        <span className="font-data-mono text-body-sm text-on-surface-variant">{doc.example.file}</span>
                        <span className="text-on-surface-variant text-[10px] font-label-caps">{doc.example.lang}</span>
                      </div>
                      <div className="bg-[#070708] p-5 rounded-b-lg border border-white/10 font-data-mono text-data-mono leading-relaxed overflow-x-auto whitespace-pre text-on-surface/80">
                        {doc.example.content}
                      </div>
                    </div>
                  </>
                )}

                <div className="p-6 bg-primary/10 border-l-4 border-primary rounded-r-lg mb-12">
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <div>
                      <p className="font-bold text-primary mb-1">Architecture Note</p>
                      <p className="text-body-sm text-on-surface-variant">{doc.note}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/*  Code Playground / Right Sidebar  */}
            <aside className="w-sidebar-ai-width border-l border-white/10 bg-surface-container-highest/30 backdrop-blur-md flex flex-col relative overflow-hidden shrink-0">
              <div className="p-6 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-tertiary animate-pulse-subtle">psychology</span>
                  <span className="font-label-caps text-label-caps text-tertiary tracking-widest">AEGIS INSIGHTS</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Interactive Sandbox</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Live code execution environment</p>
              </div>

              <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar">
                {/*  Code Sandbox  */}
                <div className="bg-surface-container-lowest border border-white/5 rounded-xl overflow-hidden shadow-lg shrink-0">
                  <div className="flex items-center justify-between px-4 py-2 bg-white/5">
                    <span className="font-data-mono text-[11px] text-on-surface-variant">Request Preview</span>
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-tertiary animate-pulse' : 'bg-emerald-400'}`}></span>
                  </div>
                  <div className="p-4 font-data-mono text-[11px] leading-relaxed">
                    <p className="text-on-surface-variant"><span className="text-primary">curl</span> -X POST <span className="text-secondary">"https://api.aegis.ai/v1/metrics"</span> \</p>
                    <p className="text-on-surface-variant pl-4">-H <span className="text-secondary">"Authorization: Bearer $KEY"</span> \</p>
                    <p className="text-on-surface-variant pl-4">-d <span className="text-secondary">{'{ "service": "auth-api" }'}</span></p>
                  </div>
                </div>

                {/*  Live Console  */}
                <div className="flex-1 bg-surface-container-lowest border border-white/5 rounded-xl flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setActiveTab('console')}
                        className={`font-data-mono text-[11px] pb-1 border-b-2 ${activeTab === 'console' ? 'text-tertiary border-tertiary' : 'text-on-surface-variant border-transparent hover:text-white'}`}
                      >
                        Console
                      </button>
                      <button 
                        onClick={() => setActiveTab('network')}
                        className={`font-data-mono text-[11px] pb-1 border-b-2 ${activeTab === 'network' ? 'text-tertiary border-tertiary' : 'text-on-surface-variant border-transparent hover:text-white'}`}
                      >
                        Network
                      </button>
                    </div>
                    <button onClick={() => setConsoleOutput([])} className="p-1 hover:bg-white/5 rounded transition-colors" title="Clear console">
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant">delete</span>
                    </button>
                  </div>
                  
                  <div className="p-4 font-data-mono text-[10px] space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'console' ? (
                      <>
                        {consoleOutput.map((log, i) => (
                          <p key={i} className="text-outline">
                            [{log.time}] <span className={
                              log.type === 'success' ? 'text-primary' : 
                              log.type === 'info' ? 'text-secondary' : 'text-on-surface'
                            }>{log.text}</span>
                          </p>
                        ))}
                        {consoleOutput.length > 0 && (
                          <div className="mt-4 p-2 bg-white/5 rounded border border-white/5">
                            <pre className="text-on-surface">{`{
  "status": "active",
  "ai_health": 0.992,
  "incidents_open": 0,
  "latency_p99": "42ms"
}`}</pre>
                          </div>
                        )}
                        <p className="text-outline animate-pulse">_</p>
                      </>
                    ) : (
                      <div className="text-on-surface-variant">No network activity recorded.</div>
                    )}
                  </div>
                  
                  <div className="mt-auto p-4 border-t border-white/10 flex gap-2 shrink-0">
                    <button 
                      onClick={runCode}
                      disabled={isRunning}
                      className={`flex-1 ${isRunning ? 'bg-primary/50 cursor-wait' : 'bg-primary hover:brightness-110'} text-on-primary py-2 rounded-lg font-bold text-body-sm transition-all flex items-center justify-center gap-2`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{isRunning ? 'hourglass_empty' : 'play_arrow'}</span>
                      {isRunning ? 'EXECUTING...' : 'RUN CODE'}
                    </button>
                    <button className="px-3 bg-white/5 text-on-surface-variant rounded-lg hover:text-white transition-colors border border-transparent hover:border-white/10">
                      <span className="material-symbols-outlined text-[16px]">share</span>
                    </button>
                  </div>
                </div>

                {/*  AI Suggestion Box  */}
                <div className="p-4 rounded-xl border border-tertiary/20 bg-tertiary/5 shrink-0 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">lightbulb</span>
                    <p className="font-bold text-body-sm text-tertiary">Aegis AI Prompt</p>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-normal">
                    Would you like me to generate a <b>Kubernetes Deployment</b> manifest for {doc.title}?
                  </p>
                  <button className="mt-3 text-[11px] font-bold text-tertiary hover:underline">
                    YES, GENERATE MANIFEST →
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
