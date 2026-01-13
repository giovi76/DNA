
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Dna, 
  Search, 
  Terminal, 
  Activity, 
  Info, 
  Microscope, 
  Trash2, 
  Copy,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { COMPLEMENT_MAP, GENETIC_CODE } from './constants';
import { AnalysisResult, SequenceStats, ChatMessage } from './types';
import { analyzeSequenceAI, getGeneralInsight } from './services/geminiService';
import DNAHelix from './components/DNAHelix';
import SequenceStatsChart from './components/SequenceStatsChart';

const App: React.FC = () => {
  const [sequence, setSequence] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Core Analysis Logic
  const analysis: AnalysisResult | null = useMemo(() => {
    const cleanSeq = sequence.toUpperCase().replace(/[^ATCGN]/g, '');
    if (!cleanSeq) return null;

    const counts = { A: 0, T: 0, C: 0, G: 0 };
    for (const char of cleanSeq) {
      if (char in counts) counts[char as keyof typeof counts]++;
    }

    const length = cleanSeq.length;
    const gcContent = length > 0 ? ((counts.G + counts.C) / length) * 100 : 0;

    // Complement
    const complement = cleanSeq.split('').map(b => COMPLEMENT_MAP[b] || 'N').join('');
    const reverseComplement = complement.split('').reverse().join('');

    // Translation (simplistic forward frame 1)
    let protein = '';
    for (let i = 0; i <= cleanSeq.length - 3; i += 3) {
      const codon = cleanSeq.substring(i, i + 3);
      protein += GENETIC_CODE[codon] || '?';
    }

    const stats: SequenceStats = { length, gcContent, counts };
    return { stats, complement, reverseComplement, protein };
  }, [sequence]);

  // Handle AI Analysis
  const handleAISubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!sequence || !chatPrompt.trim()) return;

    setAiLoading(true);
    const userMsg: ChatMessage = { role: 'user', content: chatPrompt };
    setChatHistory(prev => [...prev, userMsg]);
    const currentPrompt = chatPrompt;
    setChatPrompt('');

    try {
      const result = await analyzeSequenceAI(sequence, currentPrompt);
      setChatHistory(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error during analysis." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Automated insight on sequence change
  useEffect(() => {
    if (sequence.length > 20) {
      const timer = setTimeout(async () => {
        const insight = await getGeneralInsight(sequence);
        setAiInsight(insight || '');
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setAiInsight('');
    }
  }, [sequence]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Controls */}
      <aside className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'w-full md:w-96' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 h-full flex flex-col space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Dna className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Studio del DNA</h1>
              <p className="text-xs text-slate-400 font-medium">GENOMIC ANALYSIS SUITE</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Sequence Input</label>
              <button 
                onClick={() => setSequence('')}
                className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
            <textarea
              className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 text-emerald-400 mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="Paste DNA sequence (A, T, C, G)..."
              value={sequence}
              onChange={(e) => setSequence(e.target.value.toUpperCase().replace(/[^ATCGN\s]/g, ''))}
            />
          </div>

          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
             {analysis ? (
               <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Length</p>
                      <p className="text-2xl font-bold text-white mono">{analysis.stats.length.toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">GC Content</p>
                      <p className="text-2xl font-bold text-indigo-400 mono">{analysis.stats.gcContent.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
                      <Activity size={16} /> Base Composition
                    </h3>
                    <SequenceStatsChart stats={analysis.stats} />
                  </div>

                  {aiInsight && (
                    <div className="bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/20">
                      <div className="flex items-center gap-2 mb-2 text-indigo-400">
                        <Sparkles size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Quick Insight</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300 italic">
                        "{aiInsight}"
                      </p>
                    </div>
                  )}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                 <Microscope size={48} className="text-slate-600" />
                 <p className="text-sm text-slate-500">Input a DNA sequence to begin real-time genomic analysis.</p>
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-grow relative flex flex-col h-screen">
        {/* Toggle Sidebar Button (Mobile) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 p-1 rounded-full z-10 hover:bg-indigo-600 transition-colors hidden md:block"
        >
          <ChevronRight size={16} className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Dashboard Header */}
          <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Analysis</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Info size={20} />
              </button>
            </div>
          </header>

          {/* Scrolling Content Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {analysis ? (
              <>
                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Sequences Card */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                      <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Terminal size={18} className="text-indigo-400" /> Molecular Components
                      </h2>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500 uppercase">Complementary Strand</label>
                          <button onClick={() => copyToClipboard(analysis.complement)} className="p-1 text-slate-500 hover:text-white"><Copy size={14}/></button>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg mono text-xs break-all border border-slate-800 text-indigo-300 max-h-24 overflow-y-auto">
                          {analysis.complement}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500 uppercase">Reverse Complement</label>
                          <button onClick={() => copyToClipboard(analysis.reverseComplement)} className="p-1 text-slate-500 hover:text-white"><Copy size={14}/></button>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg mono text-xs break-all border border-slate-800 text-cyan-300 max-h-24 overflow-y-auto">
                          {analysis.reverseComplement}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-500 uppercase">Protein Translation (F1)</label>
                          <button onClick={() => copyToClipboard(analysis.protein)} className="p-1 text-slate-500 hover:text-white"><Copy size={14}/></button>
                        </div>
                        <div className="p-3 bg-slate-950 rounded-lg mono text-xs break-all border border-slate-800 text-emerald-300 max-h-24 overflow-y-auto">
                          {analysis.protein}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Card */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[500px]">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
                      <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare size={18} className="text-indigo-400" /> Gemini DNA Intelligence
                      </h2>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {chatHistory.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                          <Sparkles size={40} className="text-indigo-400" />
                          <p className="text-sm max-w-xs">Ask anything about this sequence: mutations, promoter motifs, gene search, or structural predictions.</p>
                        </div>
                      ) : (
                        chatHistory.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none prose prose-invert'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))
                      )}
                      {aiLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 animate-pulse flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleAISubmit} className="p-4 border-t border-slate-800 bg-slate-950/30">
                      <div className="relative">
                        <input 
                          type="text"
                          value={chatPrompt}
                          onChange={(e) => setChatPrompt(e.target.value)}
                          placeholder="Ask Gemini about this sequence..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                        <button 
                          disabled={aiLoading || !chatPrompt.trim()}
                          type="submit"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </form>
                  </div>
                </section>

                <section className="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col md:flex-row items-center gap-12">
                   <div className="flex-1 space-y-4">
                     <h2 className="text-2xl font-bold text-white">Visual Structure</h2>
                     <p className="text-slate-400 leading-relaxed">
                       Genetic information is stored in the double helix of DNA. This tool provides 
                       computational insights into the building blocks of life. Every sequence 
                       reveals biological functions that can be mapped to health, traits, and evolution.
                     </p>
                     <div className="flex gap-4 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-cyan-400" />
                          <span className="text-xs font-bold text-slate-500 uppercase">Purines</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-indigo-500" />
                          <span className="text-xs font-bold text-slate-500 uppercase">Pyrimidines</span>
                        </div>
                     </div>
                   </div>
                   <div className="shrink-0 p-8 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                     <div className="animate-helix">
                       <DNAHelix />
                     </div>
                   </div>
                </section>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
                <div className="p-6 bg-slate-900 rounded-full border border-slate-800 shadow-2xl">
                   <Dna size={80} className="text-indigo-500" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">Awaiting sequence data</h2>
                  <p className="text-slate-500 max-w-sm mx-auto">Paste a FASTA or raw nucleotide sequence in the sidebar to start the extraction and analysis process.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Global styles for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};

export default App;
