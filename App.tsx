
import React, { useState, useEffect } from 'react';
import { FileData, BenchmarkResult } from './types';
import FileUploader from './components/FileUploader';
import BenchmarkReport from './components/BenchmarkReport';
import { analyzeBenchmark } from './services/geminiService';

const LOADING_STEPS = [
  "Iniciando rastreo de fuentes globales...",
  "Mapeando competidores en el área de influencia...",
  "Extrayendo datos de ubicación y geografía...",
  "Escaneando estructuras de precios y modelos de negocio...",
  "Decodificando estrategias publicitarias vigentes...",
  "Modelando el perfil psicográfico de la audiencia...",
  "Identificando vacíos operativos en el mercado...",
  "Diseñando la arquitectura de comunicación...",
  "Validando propuestas de valor únicas...",
  "Finalizando reporte de inteligencia estratégica..."
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<BenchmarkResult | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % LOADING_STEPS.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!inputText && files.length === 0) {
      setError("Por favor, introduce detalles del negocio o sube un documento PDF.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const result = await analyzeBenchmark(inputText, files);
      setReport(result);
    } catch (err: any) {
      setError(err.message || "Error al investigar el mercado.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setFiles([]);
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 selection:bg-black selection:text-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-2xl">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-black leading-tight tracking-tight uppercase">Ad Intel Pro</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Black Edition</p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="px-5 py-2 text-[10px] font-black text-slate-500 hover:text-black hover:bg-slate-100 rounded-xl transition-all border border-transparent uppercase tracking-widest"
          >
            Nuevo Análisis
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-16">
        {!report ? (
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-black text-black tracking-tighter uppercase leading-[0.9]">
                Inteligencia de <br /> Mercado Real-Time
              </h2>
              <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                Rastreamos precios, ubicaciones y estrategias de tu competencia para encontrar tu ventaja ganadora.
              </p>
            </div>

            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                    <label className="text-xs font-black text-black uppercase tracking-[0.2em]">Contexto del Negocio</label>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">Engine v3.0</span>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ej: Marca de moda sostenible en Madrid. Queremos analizar competidores locales con precios similares..."
                    className="w-full h-44 p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:ring-8 focus:ring-slate-100 focus:border-black transition-all outline-none text-slate-800 font-medium placeholder:text-slate-300 leading-relaxed text-lg"
                  />
                </div>

                <FileUploader files={files} setFiles={setFiles} />
              </div>

              {error && (
                <div className="mt-10 p-5 bg-slate-50 border border-slate-200 text-black rounded-3xl text-xs font-black uppercase tracking-widest flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`mt-12 w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-2xl transition-all transform hover:-translate-y-1 active:scale-[0.98] uppercase tracking-[0.1em] ${
                  loading 
                    ? 'bg-slate-200 cursor-not-allowed shadow-none' 
                    : 'bg-black hover:bg-slate-900 shadow-slate-400/20'
                }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 border-4 border-slate-400 border-t-white rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </div>
                    <p className="text-[11px] mt-4 font-black text-slate-400 animate-pulse tracking-[0.2em] px-8 text-center uppercase">
                      {LOADING_STEPS[loadingStep]}
                    </p>
                  </div>
                ) : (
                  'Lanzar Investigación'
                )}
              </button>
            </div>
          </div>
        ) : (
          <BenchmarkReport report={report} />
        )}
      </main>
    </div>
  );
};

export default App;
