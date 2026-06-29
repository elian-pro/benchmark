
import React, { useState, useEffect } from 'react';
import { FileData, BenchmarkResult } from './types';
import FileUploader from './components/FileUploader';
import BenchmarkReport from './components/BenchmarkReport';
import ThemeToggle from './components/ThemeToggle';
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
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
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
    setLiveStatus(null);

    try {
      const result = await analyzeBenchmark(inputText, files, setLiveStatus);
      setReport(result);
    } catch (err: any) {
      setError(err.message || "Error al investigar el mercado.");
    } finally {
      setLoading(false);
      setLiveStatus(null);
    }
  };

  const handleReset = () => {
    setInputText('');
    setFiles([]);
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-bg pb-20 selection:bg-accent selection:text-bg">
      <header className="sticky top-0 z-50 bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] backdrop-blur-xl border-b border-line">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo oficial: se invierte a blanco en dark, nunca se distorsiona (ZR-11, ZR-12) */}
            <img
              src="/assets/logo-zebra.svg"
              alt="Zebra"
              className="h-5 w-auto self-start dark-invert"
            />
            <div className="pl-3 border-l border-line">
              <h1 className="text-lg font-semibold text-text leading-tight tracking-tight">Benchmarking</h1>
              <p className="text-[10px] text-muted font-medium uppercase tracking-[0.2em] font-mono">Intelligence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleReset}
              className="px-5 py-2 text-[10px] font-medium text-muted hover:text-text hover:bg-surface-2 rounded-btn transition-all border border-transparent uppercase tracking-widest font-mono"
            >
              Nuevo Análisis
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-16">
        {!report ? (
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="relative text-center space-y-4">
              {/* Motif Stripes de marca: siempre detrás del contenido, nunca sobre cards (ZR-20) */}
              <span className="zebra-motif" aria-hidden="true"></span>
              <p className="text-[11px] text-muted font-medium uppercase tracking-[0.3em] font-mono">Engine v3.0</p>
              <h2 className="text-5xl font-semibold text-text tracking-tight leading-[1.05]">
                Inteligencia de <br /> Mercado en Tiempo Real
              </h2>
              <p className="text-muted text-lg font-normal max-w-xl mx-auto leading-relaxed">
                Rastreamos precios, ubicaciones y estrategias de tu competencia para encontrar tu ventaja ganadora.
              </p>
            </div>

            {/* Card blanca sobre fondo recesado --surface-2 para que luzca (ZR-08) */}
            <div className="bg-surface p-10 md:p-14 rounded-card shadow-lg border border-line">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-line pb-2">
                    <label className="text-xs font-medium text-text uppercase tracking-[0.2em] font-mono">Contexto del Negocio</label>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ej: Marca de moda sostenible en Madrid. Queremos analizar competidores locales con precios similares..."
                    className="w-full h-44 p-6 bg-surface-2 border border-line rounded-input focus:shadow-[0_0_0_1px_var(--accent)] focus:border-accent transition-all outline-none text-text font-normal placeholder:text-muted leading-relaxed text-base"
                  />
                </div>

                <FileUploader files={files} setFiles={setFiles} />
              </div>

              {error && (
                <div className="mt-10 p-5 bg-surface-2 border border-line text-text rounded-card text-xs font-medium uppercase tracking-widest flex items-center justify-center font-mono">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`mt-12 w-full py-5 rounded-btn font-semibold text-lg transition-all transform active:scale-[0.99] uppercase tracking-[0.1em] ${
                  loading
                    ? 'bg-surface-2 text-muted cursor-not-allowed border border-line'
                    : 'bg-accent text-bg hover:-translate-y-0.5 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-5 h-5 border-2 border-muted border-t-text rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </div>
                    <p className="text-[11px] mt-4 font-medium text-muted tracking-[0.2em] px-8 text-center uppercase font-mono">
                      {liveStatus || LOADING_STEPS[loadingStep]}
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
