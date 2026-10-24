import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Headphones,
  CheckCircle2,
  FileText,
  BarChart2,
  Lock,
  ChevronRight,
  Database,
  Search,
  MessageSquare,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [demoQuery, setDemoQuery] = useState('How do I configure custom webhook endpoints in ResolveAI?');
  const [demoAnswer, setDemoAnswer] = useState<string | null>(null);
  const [demoThinking, setDemoThinking] = useState(false);

  const runDemoSim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoQuery.trim()) return;
    setDemoThinking(true);
    setDemoAnswer(null);

    setTimeout(() => {
      setDemoAnswer(
        "According to 'ResolveAI Integration Guide §3.4', webhooks can be registered via Settings > Webhooks or via API at POST /api/v1/webhooks. ResolveAI signs all outgoing payloads with your tenant HMAC secret (X-ResolveAI-Signature) and provides automated retry policies with exponential backoff."
      );
      setDemoThinking(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center shadow-glow-sm">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Resolve<span className="text-brand-400">AI</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#rag" className="hover:text-white transition">RAG Engine</a>
            <a href="#demo" className="hover:text-white transition">Live Demo</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-navy-800/80 transition"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-glow-sm transition"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden bg-grid-pattern">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-accent-violet" />
            <span>Next-Gen Enterprise Customer Support with RAG & pgvector</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Resolve Customer Tickets{' '}
            <span className="text-gradient">in Seconds</span>, Not Hours
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            ResolveAI bridges your customer support team with intelligent RAG-driven copilots.
            Automatically ground AI answers in your exact internal documents with verifiable citations,
            reduce ticket deflection by 65%, and delight customers 24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-base font-semibold shadow-glow flex items-center justify-center gap-2 transition group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-navy-800/80 hover:bg-navy-800 border border-navy-700 text-slate-200 text-base font-semibold transition"
            >
              Sign In to Dashboard
            </button>
          </div>

          {/* Metrics bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 border-t border-navy-800/80">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">99.4%</p>
              <p className="text-xs text-slate-400 mt-1">Grounded Accuracy</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-400">65%</p>
              <p className="text-xs text-slate-400 mt-1">Ticket Deflection</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 1.2s</p>
              <p className="text-xs text-slate-400 mt-1">Average AI Latency</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-accent-violet">Zero</p>
              <p className="text-xs text-slate-400 mt-1">Fabricated Citations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demo Simulation Section */}
      <section id="demo" className="py-20 bg-navy-900/60 border-y border-navy-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">Interactive Preview</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Test the Grounded RAG Engine</h2>
            <p className="text-sm text-slate-400 mt-2">See how ResolveAI retrieves citations from uploaded documentation.</p>
          </div>

          <div className="rounded-2xl bg-navy-850 border border-navy-700/80 p-6 shadow-2xl">
            <form onSubmit={runDemoSim} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  value={demoQuery}
                  onChange={(e) => setDemoQuery(e.target.value)}
                  placeholder="Ask a customer support or API documentation question..."
                  className="w-full bg-navy-900 border border-navy-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={demoThinking}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 transition"
              >
                {demoThinking ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Retrieve</span>
              </button>
            </form>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-navy-900/80 border border-navy-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                  <span>Customer Inquiry</span>
                </div>
                <p className="text-sm text-slate-200">{demoQuery}</p>
              </div>

              {demoAnswer && (
                <div className="p-4 rounded-xl bg-brand-950/20 border border-brand-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-400">
                      <Bot className="w-4 h-4" />
                      <span>ResolveAI Verified Response</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Cosine Match: 0.94
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed mb-3">{demoAnswer}</p>
                  <div className="pt-2 border-t border-navy-800 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-accent-violet" />
                    <span className="text-xs text-slate-400 font-mono">
                      Source: ResolveAI_Integration_Guide.pdf (Chunk #12)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Built for Scale</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Engineered for Modern Support Operations
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mt-3">
            Every layer is designed with strict enterprise security, fast response times, and verifiable truthfulness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 hover:border-brand-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-5 group-hover:scale-105 transition">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Document RAG & pgvector</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload PDF manuals, Markdown specs, or TXT guides. Our backend parses, chunks, and creates vector embeddings stored directly in PostgreSQL with pgvector.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 hover:border-brand-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center text-accent-violet mb-5 group-hover:scale-105 transition">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Ticketing Pipeline</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Manage incoming tickets with priorities, statuses, SLA tracking, customer/agent comments, and automated assignment routing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 hover:border-brand-500/40 transition group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Enterprise RBAC & Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Strict role-based access control (CUSTOMER, AGENT, ADMIN). BCrypt password encryption, stateless JWT tokens, and centralized exception safety.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-navy-900/40 border-t border-navy-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Transparent Pricing</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Choose the Plan for Your Team</h2>
            <p className="text-slate-400 mt-2">From seed startups to global support operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">For growing startups</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$49</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 3 Agents</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1,000 AI Queries / mo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 20 Knowledge Documents</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Standard Email Support</li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="mt-8 w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-medium text-sm transition"
              >
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl bg-navy-850 border-2 border-brand-500 p-8 flex flex-col justify-between shadow-glow">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-500 text-white text-xs font-semibold">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Growth & Scale</h3>
                <p className="text-xs text-slate-400 mt-1">For established customer service teams</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$149</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 15 Agents</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 15,000 AI Queries / mo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Documents & RAG</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom LLM / API Keys</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SLA & Resolution Analytics</li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="mt-8 w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition shadow-glow-sm"
              >
                Upgrade to Pro
              </button>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">For high-volume compliance needs</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Agents</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Self-hosted / Dedicated DB</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom Vector Embeddings</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> SSO & SAML Authentication</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 24/7 Dedicated Support</li>
                </ul>
              </div>
              <button
                onClick={onGetStarted}
                className="mt-8 w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-medium text-sm transition"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-navy-800 bg-navy-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-brand-400" />
            <span className="font-semibold text-white">ResolveAI</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-200">Architecture</a>
            <a href="#" className="hover:text-slate-200">Security & Privacy</a>
            <a href="#" className="hover:text-slate-200">API Documentation</a>
            <a href="#" className="hover:text-slate-200">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
