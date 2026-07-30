// Almacenamiento de benchmarks en el navegador (localStorage). Sin backend.
import { BenchmarkResult } from '../types';

export interface StoredBenchmark {
  id: string;
  title: string;
  createdAt: string; // ISO
  context: string;   // input usado (para referencia / re-lanzar)
  result: BenchmarkResult;
}

const KEY = 'ZEBRA_BENCHMARKS';
const MAX = 60; // tope para no reventar la cuota de localStorage

const deriveTitle = (context: string): string => {
  const firstLine = (context || '').split('\n').map((l) => l.trim()).find((l) => l.length > 0) || '';
  const clean = firstLine.replace(/\s+/g, ' ').trim();
  if (!clean) return 'Benchmark sin título';
  return clean.length > 70 ? clean.slice(0, 70) + '…' : clean;
};

export const listBenchmarks = (): StoredBenchmark[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as StoredBenchmark[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const persist = (list: StoredBenchmark[]): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Cuota excedida: conserva solo la mitad más reciente y reintenta.
    try {
      localStorage.setItem(KEY, JSON.stringify(list.slice(0, Math.max(1, Math.floor(list.length / 2)))));
    } catch {
      /* sin remedio: se pierde el guardado */
    }
  }
};

export const saveBenchmark = (context: string, result: BenchmarkResult): StoredBenchmark => {
  const record: StoredBenchmark = {
    id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: deriveTitle(context),
    createdAt: result.generatedAt || new Date().toISOString(),
    context,
    result,
  };
  const list = [record, ...listBenchmarks()].slice(0, MAX);
  persist(list);
  return record;
};

export const deleteBenchmark = (id: string): void => {
  persist(listBenchmarks().filter((b) => b.id !== id));
};

// Suma de costo de todos los benchmarks guardados (USD).
export const totalSpent = (): number =>
  listBenchmarks().reduce((sum, b) => sum + (b.result?.cost?.usd || 0), 0);
