
import React from 'react';
import { BenchmarkResult } from '../types';

interface BenchmarkReportProps {
  report: BenchmarkResult;
}

const BenchmarkReport: React.FC<BenchmarkReportProps> = ({ report }) => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Resumen Ejecutivo */}
      <section className="bg-surface p-8 rounded-card shadow-sm border border-line">
        <h2 className="text-2xl font-semibold text-text mb-4 flex items-center">
          <span className="bg-accent text-bg p-2 rounded-control mr-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          Diagnóstico Estratégico
        </h2>
        <p className="text-muted text-lg leading-relaxed font-normal">{report.summary}</p>
      </section>

      {/* Grid de Competencia Detallado */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-line pb-4">
          <h3 className="text-xl font-semibold text-text flex items-center">
            <svg className="w-6 h-6 mr-3 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Benchmarks de Mercado ({report.competitors.length})
          </h3>
          <span className="text-[10px] font-medium text-muted uppercase tracking-[0.2em] font-mono">Live Research Data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {report.competitors.map((comp, idx) => (
            <div key={idx} className="bg-surface rounded-card border border-line shadow-sm overflow-hidden flex flex-col hover:border-accent transition-all group">
              <div className="p-8 pb-6">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-2xl font-semibold text-text">{comp.name}</h4>
                  {comp.url && (
                    <a href={comp.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${comp.name}`} className="p-2.5 bg-surface-2 rounded-control text-muted hover:text-text transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center px-4 py-1.5 bg-surface-2 text-muted rounded-pill text-[10px] font-medium uppercase tracking-wider border border-line font-mono">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {comp.location}
                  </div>
                  <div className="flex items-center px-4 py-1.5 bg-accent text-bg rounded-pill text-[10px] font-medium uppercase tracking-wider font-mono">
                    {comp.pricing}
                  </div>
                </div>

                <p className="text-sm text-muted font-normal mb-8 leading-relaxed border-l border-line pl-4 italic">
                  {comp.differentiator}
                </p>

                <div className="space-y-4">
                  <p className="text-[10px] font-medium text-muted uppercase tracking-[0.2em] font-mono">Atributos Clave</p>
                  <ul className="space-y-2.5">
                    {comp.advantages.map((adv, aIdx) => (
                      <li key={aIdx} className="flex items-start text-sm text-text font-normal">
                        <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-auto bg-surface-2 p-5 border-t border-line flex items-center justify-between">
                <span className="text-[10px] font-medium text-muted uppercase font-mono">Verified Entry</span>
                <div className="w-12 h-1 bg-line rounded-pill overflow-hidden">
                    <div className="w-full h-full bg-accent"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Estrategia: Audiencia y Comunicación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-surface p-8 rounded-card border border-line shadow-sm">
          <h3 className="text-xl font-semibold text-text mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Perfil de Audiencia
          </h3>
          <div className="text-text leading-relaxed bg-surface-2 p-6 rounded-control border border-line font-normal">
            {report.targetAudience}
          </div>
        </section>

        <section className="bg-surface p-8 rounded-card border border-line shadow-sm">
          <h3 className="text-xl font-semibold text-text mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Ruta de Comunicación
          </h3>
          <div className="text-text leading-relaxed bg-surface-2 p-6 rounded-control border border-line font-normal">
            {report.communicationStrategy}
          </div>
        </section>
      </div>

      {/* Propuesta de Valor Única — card de énfasis: invierte light<->dark via tokens (ZR-25b) */}
      <section className="bg-accent p-12 rounded-card text-bg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-[color-mix(in_srgb,var(--bg)_12%,transparent)] rounded-control mr-5 border border-[color-mix(in_srgb,var(--bg)_22%,transparent)]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight uppercase">Ventaja Competitiva Final</h3>
          </div>
          <div className="bg-[color-mix(in_srgb,var(--bg)_8%,transparent)] p-10 rounded-control border border-[color-mix(in_srgb,var(--bg)_12%,transparent)]">
            <p className="text-2xl font-semibold leading-relaxed tracking-tight">
              {report.userDifferentiator}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.suggestions.map((sug, idx) => (
              <div key={idx} className="flex items-center p-4 bg-[color-mix(in_srgb,var(--bg)_8%,transparent)] rounded-control text-sm font-normal border border-[color-mix(in_srgb,var(--bg)_12%,transparent)]">
                <svg className="w-4 h-4 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {sug}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Análisis Estratégico Completo */}
      <section className="bg-surface p-10 rounded-card border border-line shadow-sm">
        <h3 className="text-xs font-medium text-muted mb-6 uppercase tracking-[0.3em] font-mono">Technical Deep Dive</h3>
        <div className="max-w-none text-text font-normal leading-loose whitespace-pre-line">
          {report.analysis}
        </div>
      </section>

      {/* Fuentes (Grounding) */}
      {report.sources.length > 0 && (
        <section className="pt-12 border-t border-line">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] font-medium text-muted uppercase tracking-[0.4em] flex items-center font-mono">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Intelligence Sources ({report.sources.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {report.sources.map((source, idx) => (
              <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-surface border border-line rounded-control text-[10px] font-medium text-muted hover:border-accent hover:text-text transition-all shadow-sm truncate max-w-[300px] uppercase tracking-wider font-mono">
                {source.title}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BenchmarkReport;
