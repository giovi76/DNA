
export interface SequenceStats {
  length: number;
  gcContent: number;
  counts: {
    A: number;
    T: number;
    C: number;
    G: number;
  };
}

export interface AnalysisResult {
  stats: SequenceStats;
  complement: string;
  reverseComplement: string;
  protein: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
