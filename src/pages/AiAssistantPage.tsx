import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { api } from '../api';
import { ChatMessage, RagCitation, SystemHealth } from '../types';

interface AiAssistantPageProps {
  onNavigateToKnowledgeBase: () => void;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  onNavigateToKnowledgeBase,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am ResolveAI Copilot. Ask me questions about your product, API endpoints, return policies, or internal guides. I ground every answer in your uploaded knowledge base documents with exact citations.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    api.getSystemHealth()
      .then(setSystemHealth)
      .catch(() => null);
  }, []);

  const handleSend = async (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const query = promptOverride || input;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        citations: response.citations,
        confidence: response.confidence,
        isFallback: response.isFallback,
        modelUsed: response.modelUsed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: `Error contacting RAG Service: ${err.message}. Please check that the Spring Boot backend is running and configured.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sampleQuestions = [
    'How do I authenticate API requests with Bearer tokens?',
    'What is the ticket escalation SLA policy for Urgent issues?',
    'How do we configure pgvector cosine similarity?',
    'What are the allowed file upload formats and size limits?',
  ];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col rounded-2xl bg-navy-900 border border-navy-800 overflow-hidden shadow-card">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-navy-800 bg-navy-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white shadow-glow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>AI Support Copilot</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono">
                RAG + pgvector
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Grounded retrieval with strict truthfulness & verifiable document citations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'welcome',
                  role: 'assistant',
                  content:
                    'Conversation reset. Ask any question grounded in your documents.',
                  timestamp: new Date().toISOString(),
                },
              ])
            }
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateToKnowledgeBase}
            className="text-xs px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-accent-violet" />
            <span>Manage Knowledge Base</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 max-w-2xl mx-auto"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="leading-relaxed">{msg.content}</div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-2 max-w-2xl">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-navy-850 border border-navy-700/80 text-slate-100 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Fallback Notice */}
                  {msg.isFallback && (
                    <div className="mt-3 pt-2 border-t border-navy-700/60 flex items-center gap-1.5 text-xs text-amber-300">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>
                        AI API key not configured on server. Returned deterministic grounding fallback.
                      </span>
                    </div>
                  )}

                  {/* Copy button & metadata */}
                  {isAi && (
                    <div className="mt-3 pt-2 border-t border-navy-750 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        {msg.confidence !== undefined && (
                          <span className="font-semibold text-emerald-400">
                            Confidence: {Math.round(msg.confidence * 100)}%
                          </span>
                        )}
                        {msg.modelUsed && (
                          <span className="text-slate-400 font-mono">
                            Model: {msg.modelUsed}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="hover:text-white transition flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Citations Box */}
                {isAi && msg.citations && msg.citations.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-navy-950/70 border border-navy-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-accent-violet" />
                      <span>Grounded Document Citations ({msg.citations.length})</span>
                    </div>
                    <div className="space-y-2">
                      {msg.citations.map((citation, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-navy-900 border border-navy-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-brand-300 font-medium truncate max-w-[200px]">
                              {citation.documentTitle}
                            </span>
                            <span className="text-emerald-400 font-semibold">
                              Similarity: {(citation.relevanceScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 italic line-clamp-2">
                            &ldquo;{citation.snippet}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mt-1">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-navy-850 border border-navy-700/80 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              <span>Scanning document vector chunks & synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-6 py-2 bg-navy-950/40 border-t border-navy-800/60 overflow-x-auto flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex-shrink-0">
          Suggestions:
        </span>
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(undefined, q)}
            className="flex-shrink-0 text-xs px-3 py-1 rounded-full bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-700 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => handleSend(e)} className="p-4 bg-navy-950 border-t border-navy-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything grounded in your internal knowledge base..."
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-navy-900 border border-navy-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white transition shadow-glow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
