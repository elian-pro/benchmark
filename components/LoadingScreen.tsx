
import React from 'react';

interface LoadingScreenProps {
  status: string | null;   // mensaje de avance en vivo del motor
  fallback: string;        // mensaje rotativo de respaldo
}

// Fases reales del motor. El orden y las palabras clave coinciden con los
// mensajes de onProgress emitidos por researchService.
const PHASES = [
  { key: 'identify', label: 'Identificando competidores', match: 'Identificando' },
  { key: 'research', label: 'Investigando a fondo', match: 'Investigando' },
  { key: 'verify', label: 'Verificando y contrastando', match: 'Verificando' },
  { key: 'synth', label: 'Sintetizando estrategia', match: 'Sintetizando' },
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ status, fallback }) => {
  const currentIdx = (() => {
    if (!status) return 0;
    const i = PHASES.findIndex((p) => status.includes(p.match));
    return i === -1 ? 0 : i;
  })();

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-surface rounded-card border border-line shadow-lg p-8 md:p-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-6 h-6 border-2 border-line border-t-accent rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-text">Investigando el mercado</p>
            <p className="text-xs text-muted font-normal">{status || fallback}</p>
          </div>
        </div>

        <ol className="space-y-3">
          {PHASES.map((phase, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <li key={phase.key} className="flex items-center gap-3">
                <span
                  className={`flex items-center justify-center w-5 h-5 rounded-full border text-[10px] flex-shrink-0 ${
                    done
                      ? 'bg-accent border-accent text-bg'
                      : active
                        ? 'border-accent text-accent'
                        : 'border-line text-muted'
                  }`}
                >
                  {done ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span
                  className={`text-sm font-mono uppercase tracking-wider ${
                    active ? 'text-text font-medium' : done ? 'text-muted' : 'text-muted opacity-60'
                  }`}
                >
                  {phase.label}
                  {active && <span className="ml-1 animate-pulse">…</span>}
                </span>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-[11px] text-muted font-normal leading-relaxed border-t border-line pt-4">
          La investigación profunda con búsqueda web toma un momento. Estamos consultando fuentes
          reales para cada competidor.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
