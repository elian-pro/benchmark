
import React from 'react';
import { PreAnalysis } from '../types';

interface PreAnalysisPanelProps {
  preAnalysis: PreAnalysis;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onLaunch: () => void;
  onBack: () => void;
}

const scoreLabel = (s: number) => (s >= 75 ? 'Sólido' : s >= 45 ? 'Mejorable' : 'Incompleto');

const PreAnalysisPanel: React.FC<PreAnalysisPanelProps> = ({ preAnalysis, answers, setAnswers, onLaunch, onBack }) => {
  const { score, verdict, missing, questions } = preAnalysis;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Score */}
      <div className="bg-surface rounded-card border border-line shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-muted uppercase tracking-[0.2em] font-mono">Calidad del input</p>
          <p className="text-xs font-medium text-text uppercase tracking-wider font-mono">
            {scoreLabel(score)} · {score}/100
          </p>
        </div>
        <div className="w-full h-1.5 bg-surface-2 rounded-pill overflow-hidden border border-line">
          <div className="h-full bg-accent transition-all duration-700" style={{ width: `${score}%` }} />
        </div>
        {verdict && <p className="mt-4 text-sm text-text font-normal leading-relaxed">{verdict}</p>}

        {missing.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-medium text-muted uppercase tracking-[0.2em] font-mono mb-2">Qué falta</p>
            <ul className="space-y-1.5">
              {missing.map((m, i) => (
                <li key={i} className="flex items-start text-sm text-muted font-normal">
                  <span className="mr-2.5 mt-1.5 w-1 h-1 bg-muted rounded-full flex-shrink-0" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Preguntas para afinar (opcional) */}
      {questions.length > 0 && (
        <div className="bg-surface rounded-card border border-line shadow-sm p-6 md:p-8 space-y-5">
          <div>
            <p className="text-sm font-semibold text-text">Afina tu análisis <span className="text-muted font-normal">(opcional)</span></p>
            <p className="text-xs text-muted font-normal mt-1">Responder mejora la precisión. Puedes lanzar sin responder.</p>
          </div>
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="block text-sm text-text font-medium">{q.question}</label>
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={q.hint}
                className="w-full p-3 bg-surface-2 border border-line rounded-input focus:shadow-[0_0_0_1px_var(--accent)] focus:border-accent transition-all outline-none text-text font-normal placeholder:text-muted text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onLaunch}
          className="flex-1 py-4 rounded-btn font-semibold text-base bg-accent text-bg hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] uppercase tracking-[0.1em]"
        >
          Lanzar Investigación
        </button>
        <button
          onClick={onBack}
          className="py-4 px-6 rounded-btn font-medium text-sm text-muted hover:text-text border border-line hover:bg-surface-2 transition-all uppercase tracking-widest font-mono"
        >
          Editar input
        </button>
      </div>
    </div>
  );
};

export default PreAnalysisPanel;
