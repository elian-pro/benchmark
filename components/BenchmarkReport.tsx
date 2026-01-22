
import React from 'react';
import { BenchmarkResult } from '../types';

interface BenchmarkReportProps {
  report: BenchmarkResult;
}

const BenchmarkReport: React.FC<BenchmarkReportProps> = ({ report }) => {
  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Resumen Ejecutivo */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-black mb-4 flex items-center">
          <span className="bg-black text-white p-2 rounded-xl mr-4 shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          Diagnóstico Estratégico
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed font-medium">{report.summary}</p>
      </section>

      {/* Grid de Competencia Detallado */}
      <section>
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
          <h3 className="text-xl font-black text-slate-900 flex items-center">
            <svg className="w-6 h-6 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Benchmarks de Mercado ({report.competitors.length})
          </h3>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Research Data</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {report.competitors.map((comp, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col hover:border-black transition-all group">
              <div className="p-8 pb-6">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-2xl font-black text-slate-900 group-hover:text-black transition-colors">{comp.name}</h4>
                  {comp.url && (
                    <a href={comp.url} target="_blank" className="p-2.5 bg-slate-100 rounded-xl text-slate-400 hover:text-black hover:bg-slate-200 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200">
                    <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {comp.location}
                  </div>
                  <div className="flex items-center px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                    {comp.pricing}
                  </div>
                </div>

                <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed border-l-2 border-slate-200 pl-4">
                  "{comp.differentiator}"
                </p>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Atributos Clave</p>
                  <ul className="space-y-2.5">
                    {comp.advantages.map((adv, aIdx) => (
                      <li key={aIdx} className="flex items-start text-sm text-slate-800 font-medium">
                        <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-auto bg-slate-50 p-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase">Verified Entry</span>
                <div className="w-12 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-black"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Estrategia: Audiencia y Comunicación */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Perfil de Audiencia
          </h3>
          <div className="text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 font-medium">
            {report.targetAudience}
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-black mb-6 flex items-center">
            <svg className="w-6 h-6 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            Ruta de Comunicación
          </h3>
          <div className="text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 font-medium">
            {report.communicationStrategy}
          </div>
        </section>
      </div>

      {/* Propuesta de Valor Única */}
      <section className="bg-black p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md mr-5 border border-white/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black tracking-tight uppercase tracking-widest">Ventaja Competitiva Final</h3>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-inner">
            <p className="text-2xl font-bold text-slate-100 leading-relaxed tracking-tight">
              {report.userDifferentiator}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.suggestions.map((sug, idx) => (
              <div key={idx} className="flex items-center p-4 bg-white/5 rounded-2xl text-sm font-bold border border-white/5 group-hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4 mr-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {sug}
              </div>
            ))}
          </div>
        </div>
        {/* Decorative elements in grayscale */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 bg-slate-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      </section>

      {/* Análisis Estratégico Completo */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.3em]">Technical Deep Dive</h3>
        <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-loose">
          {report.analysis}
        </div>
      </section>

      {/* Fuentes (Grounding) */}
      {report.sources.length > 0 && (
        <section className="pt-12 border-t border-slate-200">
          <div className="flex items-center justify-between mb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center">
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Intelligence Sources ({report.sources.length})
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {report.sources.map((source, idx) => (
              <a key={idx} href={source.url} target="_blank" className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-600 hover:border-black hover:text-black transition-all shadow-sm hover:shadow-lg truncate max-w-[300px] uppercase tracking-wider">
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
