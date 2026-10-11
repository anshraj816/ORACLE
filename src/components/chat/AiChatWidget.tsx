import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  CornerDownLeft,
  Cpu,
  HelpCircle,
  MessageSquare,
  Minus,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateMoneyMetrics } from '../../utils/moneyCalculations';
import { calculateTimeMetrics } from '../../utils/timeCalculations';
import { askOracleAi, checkPythonBackendHealth, ChatMessage, PythonHealthStatus } from '../../utils/pythonApi';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const AiChatWidget: React.FC = () => {
  const { activeTab, moneyInputs, timeInputs, currency, parsedCsv } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your **ORACLE AI Co-Pilot**. I can analyze your financial numbers, optimize your study routine without touching your sleep, and answer questions about your CSV data (like empty rows, duplicates, or stats). How can I assist you today?",
      engine: 'Free Local Engine',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [pythonStatus, setPythonStatus] = useState<PythonHealthStatus>({ isAvailable: false });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Poll Python backend status
  useEffect(() => {
    checkPythonBackendHealth().then(setPythonStatus);
    const interval = setInterval(() => {
      checkPythonBackendHealth().then(setPythonStatus);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Build active context snapshot
  const moneyMetrics = calculateMoneyMetrics(moneyInputs);
  const timeMetrics = calculateTimeMetrics(timeInputs);

  const contextData = {
    money: {
      monthlyIncome: moneyInputs.monthlyIncome,
      rent: moneyInputs.rent,
      food: moneyInputs.food,
      transport: moneyInputs.transport,
      entertainment: moneyInputs.entertainment,
      other: moneyInputs.other,
      savingsTarget: moneyInputs.savingsTarget,
      surplus: moneyMetrics.monthlySurplus,
      currency,
    },
    time: {
      sleep: timeInputs.sleep,
      collegeWork: timeInputs.collegeWork,
      travel: timeInputs.travel,
      study: timeInputs.study,
      entertainment: timeInputs.entertainment,
      mealsPersonal: timeInputs.mealsPersonal,
      other: timeInputs.other,
      studyTargetDaily: timeInputs.studyTargetDaily,
      semesterWeeks: timeInputs.semesterWeeks,
      selectedDaysPerWeek: timeInputs.selectedDaysPerWeek,
      totalAllocated: timeMetrics.totalAllocated,
      unallocated: timeMetrics.unallocated,
    },
    csv: parsedCsv
      ? {
          fileName: parsedCsv.fileName,
          totalRows: parsedCsv.overview.totalDataRows,
          totalCols: parsedCsv.overview.totalColumns,
          totalCells: parsedCsv.overview.totalCells,
          missingCells: parsedCsv.overview.missingCells,
          missingPercentage: parsedCsv.overview.missingPercentage,
          duplicateRows: parsedCsv.overview.duplicateRowsCount,
          emptyRows: parsedCsv.overview.emptyRowsCount,
          columns: parsedCsv.headers,
          columnTypes: parsedCsv.columnProfiles.map((cp) => ({
            name: cp.name,
            type: cp.inferredType,
            missing: cp.missingCount,
            unique: cp.uniqueCount,
            mean: cp.stats?.mean,
            min: cp.stats?.min,
            max: cp.stats?.max,
          })),
        }
      : null,
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const { reply, engine } = await askOracleAi(text, activeTab, contextData, messages);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        engine,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'Unable to reach intelligence server. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'How can I increase study time without cutting sleep?',
    'How many rows are empty or missing in my CSV?',
    'Is there any duplicate data in this CSV?',
    'How can I optimize my largest monthly expense?',
  ];

  return (
    <>
      {/* Floating Launcher Button - positioned above mobile bottom bar */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2.5 px-3.5 py-2.5 md:px-4 md:py-3 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-2xl shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20 group"
          aria-label="Open AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-wide">AI Advisor</span>
            <span className="text-[10px] text-indigo-200 hidden sm:inline">100% Free • Decision Co-Pilot</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal / Drawer - Full sheet on mobile, floating box on desktop */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-8 sm:top-auto sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[460px] sm:h-[600px] z-50 bg-[#0c0e18]/98 backdrop-blur-2xl border border-white/[0.12] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#141829] to-[#0f111f] border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0b0c14] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">ORACLE AI Co-Pilot</h3>
                  <Badge variant="emerald" size="sm">FREE</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {pythonStatus.isAvailable
                      ? `Python Engine Online (${pythonStatus.ollamaAvailable ? 'Ollama AI' : 'Pandas'})`
                      : 'Client Engine Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Context Banner */}
          <div className="px-4 py-2 bg-[#121526]/80 border-b border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Active Scope: <strong className="text-white capitalize">{activeTab}</strong>
            </span>
            <span className="text-[10px] text-indigo-300 font-mono truncate max-w-[200px]">
              {activeTab === 'time'
                ? `Sleep: ${timeInputs.sleep}h | Study: ${timeInputs.study}h`
                : activeTab === 'money'
                ? `Surplus: ${currency} ${moneyMetrics.monthlySurplus.toLocaleString()}`
                : parsedCsv
                ? `${parsedCsv.fileName} (${parsedCsv.overview.totalDataRows}r, ${parsedCsv.overview.missingCells} null)`
                : 'No CSV loaded'}
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAi ? 'items-start' : 'items-end justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed relative group ${
                      isAi
                        ? 'bg-[#15192c] border border-white/[0.08] text-slate-200'
                        : 'bg-indigo-600 text-white ml-auto'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.06] text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {isAi && (
                        <div className="flex items-center gap-2">
                          {msg.engine && (
                            <span className="text-indigo-300 font-mono text-[9px]">{msg.engine}</span>
                          )}
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="p-0.5 text-slate-400 hover:text-white"
                            title="Copy reply"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                <span>ORACLE AI is analyzing your data and constraints...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-[#0a0c14] border-t border-white/[0.04] overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickPrompts.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#181c30] hover:bg-[#252b48] text-slate-300 border border-white/[0.06] whitespace-nowrap cursor-pointer transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#0f111a] border-t border-white/[0.08] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything (e.g. increase study time without cutting sleep)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-[#141829] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              aria-label="Send query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
