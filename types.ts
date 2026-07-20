
export interface Source {
  title: string;
  url: string;
}

export type Confidence = 'alta' | 'media' | 'baja';

export interface Competitor {
  name: string;
  url: string;
  location: string;
  pricing: string;
  advantages: string[];
  differentiator: string;
  // Enriquecido por la investigación multi-paso y la verificación
  priceScore?: number;        // 0-100 · 0 = más económico, 100 = más premium
  valueScore?: number;        // 0-100 · 0 = oferta básica, 100 = oferta más completa
  confidence?: Confidence;    // confianza tras la verificación cruzada
  verificationNote?: string;  // por qué se le asignó esa confianza
  sources?: Source[];         // fuentes que respaldan a este competidor
}

export interface PositioningPoint {
  name: string;
  priceScore: number;  // eje X
  valueScore: number;  // eje Y
  isUser?: boolean;    // true para el producto del usuario
}

export interface BenchmarkResult {
  summary: string;
  analysis: string;
  competitors: Competitor[];
  userDifferentiator: string;
  suggestions: string[];
  communicationStrategy: string;
  targetAudience: string;
  marketGaps: string[];              // huecos de mercado detectados (gap analysis)
  positioning: PositioningPoint[];   // puntos del mapa precio vs valor
  sources: Source[];                 // todas las fuentes consultadas (deduplicadas)
  generatedAt: string;               // ISO de cuándo se realizó la investigación
}

export interface FileData {
  name: string;
  base64: string;
  type: string;
}

export interface PreAnalysisQuestion {
  id: string;
  question: string;
  hint: string;
}

// Resultado del pre-análisis de calidad del input (antes de la investigación pesada).
export interface PreAnalysis {
  score: number;              // 0-100 calidad del input
  verdict: string;            // valoración en una frase
  missing: string[];          // qué falta para un mejor análisis
  questions: PreAnalysisQuestion[]; // preguntas para afinar (0-5)
}

// Callback opcional para reportar el avance de cada etapa a la UI.
export type ProgressFn = (message: string) => void;
