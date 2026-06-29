
import { GoogleGenAI } from "@google/genai";
import {
  FileData,
  BenchmarkResult,
  Competitor,
  Source,
  PositioningPoint,
  ProgressFn,
} from "../types";

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

const getApiKey = (): string => {
  const apiKey =
    process.env.API_KEY ||
    (typeof window !== "undefined" ? localStorage.getItem("GEMINI_API_KEY") : null);

  if (!apiKey) {
    throw userError(
      "API Key no configurada. " +
        'Configura localStorage.setItem("GEMINI_API_KEY", "tu_clave") ' +
        "o define API_KEY en .env.local"
    );
  }
  return apiKey;
};

const resolveModel = (): string =>
  process.env.GEMINI_MODEL ||
  (typeof window !== "undefined" ? localStorage.getItem("GEMINI_MODEL") : null) ||
  "gemini-2.5-pro";

// Pista de fuentes por sector (#5). General, con énfasis inmobiliario cuando aplica.
const SECTOR_HINT = `Prioriza FUENTES PRIMARIAS y del sector: sitios oficiales de cada
competidor, portales y directorios especializados. Si el producto es inmobiliario, apóyate
además en portales como Inmuebles24, Lamudi, Propiedades.com y Vivanuncios (precio por m2/lote,
amenidades, ritmo de absorción). Cita siempre de dónde sale cada dato.`;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

// Marca un Error como "apto para mostrar al usuario" (no se reclasifica).
const userError = (message: string): Error => {
  const e = new Error(message);
  (e as any).userFacing = true;
  return e;
};

// Extrae el objeto/arreglo JSON de la respuesta (puede venir con cercas markdown o prosa).
const extractJson = (raw: string): any => {
  let text = (raw || "").trim();

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  if (!text.startsWith("{") && !text.startsWith("[")) {
    const firstObj = text.indexOf("{");
    const firstArr = text.indexOf("[");
    const candidates = [firstObj, firstArr].filter((i) => i !== -1);
    if (candidates.length) {
      const start = Math.min(...candidates);
      const closer = text[start] === "{" ? "}" : "]";
      const end = text.lastIndexOf(closer);
      if (end > start) text = text.slice(start, end + 1);
    }
  }

  try {
    return JSON.parse(text || "{}");
  } catch (parseError) {
    console.error("Gemini JSON Parse Error:", parseError, raw);
    throw userError(
      "La IA respondió en un formato inesperado y no pudimos leer los resultados. " +
        "Vuelve a intentarlo; si persiste, reformula el contexto del negocio."
    );
  }
};

// Convierte cualquier error de la API en un mensaje claro según su causa real.
const classifyError = (error: any): Error => {
  if (error?.userFacing) return error;
  console.error("Gemini API Error:", error);

  const status: number | undefined =
    error?.status ?? error?.code ?? error?.response?.status;
  const rawMessage: string = (
    error?.message ||
    error?.error?.message ||
    String(error ?? "")
  ).toLowerCase();

  if (
    status === 401 ||
    status === 403 ||
    rawMessage.includes("api key not valid") ||
    rawMessage.includes("api_key_invalid") ||
    rawMessage.includes("permission denied") ||
    rawMessage.includes("permission_denied") ||
    rawMessage.includes("unauthenticated")
  ) {
    return userError(
      "La API Key de Gemini no es válida o no tiene permisos. " +
        "Verifica que la clave sea correcta y esté activa en Google AI Studio."
    );
  }

  if (
    status === 404 ||
    rawMessage.includes("not found") ||
    rawMessage.includes("is not supported") ||
    rawMessage.includes("does not exist")
  ) {
    return userError(
      `El modelo "${resolveModel()}" no está disponible para tu cuenta o no existe. ` +
        "Revisa que tu API Key tenga acceso a este modelo."
    );
  }

  if (
    status === 429 ||
    rawMessage.includes("quota") ||
    rawMessage.includes("rate limit") ||
    rawMessage.includes("resource_exhausted") ||
    rawMessage.includes("resource exhausted")
  ) {
    return userError(
      "Se agotó la cuota o superaste el límite de peticiones de la API de Gemini. " +
        "Espera unos minutos o revisa tu plan y facturación en Google AI Studio."
    );
  }

  if (status !== undefined && status >= 500 && status < 600) {
    return userError(
      "El servicio de Gemini tuvo un problema temporal (error del servidor). " +
        "Vuelve a intentarlo en unos momentos."
    );
  }

  if (
    rawMessage.includes("failed to fetch") ||
    rawMessage.includes("network") ||
    rawMessage.includes("etimedout") ||
    rawMessage.includes("timeout")
  ) {
    return userError(
      "No pudimos conectar con el servicio de Gemini. " +
        "Revisa tu conexión a internet e inténtalo de nuevo."
    );
  }

  const detail = error?.message || error?.error?.message;
  return userError(
    "Ocurrió un error al generar la investigación" +
      (detail ? `: ${detail}` : ". Inténtalo de nuevo.")
  );
};

// Recolecta las fuentes (grounding) de una respuesta de Gemini.
const collectSources = (response: any): Source[] => {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks
    .filter((c: any) => c.web?.uri)
    .map((c: any) => ({
      title: c.web.title || "Referencia de Mercado",
      url: c.web.uri,
    }));
};

const dedupeSources = (sources: Source[]): Source[] => {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const s of sources) {
    if (!s.url || seen.has(s.url)) continue;
    seen.add(s.url);
    out.push(s);
  }
  return out;
};

interface ModelCall {
  ai: GoogleGenAI;
  parts: any[];
  search?: boolean; // habilita googleSearch (true por defecto)
}

// Llamada genérica a Gemini: devuelve el JSON parseado y las fuentes encontradas.
const callModel = async ({ ai, parts, search = true }: ModelCall): Promise<{ data: any; sources: Source[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: resolveModel(),
      contents: { parts },
      config: search ? { tools: [{ googleSearch: {} }] } : {},
    });
    return { data: extractJson(response.text || ""), sources: collectSources(response) };
  } catch (error) {
    throw classifyError(error);
  }
};

const clampScore = (n: any): number => {
  const v = Number(n);
  if (!isFinite(v)) return 50;
  return Math.max(0, Math.min(100, Math.round(v)));
};

// ---------------------------------------------------------------------------
// Etapas de la investigación
// ---------------------------------------------------------------------------

// Paso 1 · Identificar competidores reales.
const identifyCompetitors = async (
  ai: GoogleGenAI,
  text: string,
  fileParts: any[]
): Promise<Array<{ name: string; url: string; location: string }>> => {
  const prompt = `
Eres un analista de Inteligencia Competitiva. Usando Google Search, identifica entre 5 y 7
competidores o referentes REALES y verificables para el siguiente negocio. No inventes: si no
estás seguro de que un competidor existe, no lo incluyas. ${SECTOR_HINT}

CONTEXTO DEL NEGOCIO:
${text}

Responde SOLO con JSON puro:
{
  "competitors": [
    { "name": "Nombre real", "url": "URL oficial (o '' si no la encuentras)", "location": "Ciudad/Zona" }
  ]
}`;
  const { data } = await callModel({ ai, parts: [...fileParts, { text: prompt }] });
  const list = Array.isArray(data?.competitors) ? data.competitors : [];
  return list
    .filter((c: any) => c?.name)
    .slice(0, 6)
    .map((c: any) => ({ name: String(c.name), url: String(c.url || ""), location: String(c.location || "") }));
};

// Paso 2 · Investigar a fondo un competidor (se ejecuta en paralelo por cada uno).
const researchCompetitor = async (
  ai: GoogleGenAI,
  context: string,
  base: { name: string; url: string; location: string }
): Promise<Competitor> => {
  const prompt = `
Investiga A FONDO al competidor "${base.name}" (${base.location}) usando Google Search.
Es competidor del negocio descrito abajo. ${SECTOR_HINT}

CONTEXTO DEL NEGOCIO (referencia):
${context}

Devuelve SOLO JSON puro:
{
  "name": "${base.name}",
  "url": "URL oficial confirmada (o '${base.url}')",
  "location": "Ubicación exacta o zona de operación",
  "pricing": "Precios o modelo de monetización con cifras si las hay",
  "advantages": ["Ventaja 1", "Ventaja 2", "Ventaja 3"],
  "differentiator": "Su gancho principal de comunicación",
  "priceScore": 0-100 (0 = el más económico del set, 100 = el más premium),
  "valueScore": 0-100 (0 = oferta básica, 100 = oferta más completa y diferenciada),
  "selfConfidence": "alta | media | baja segun cuanta evidencia real encontraste"
}`;
  const { data, sources } = await callModel({ ai, parts: [{ text: prompt }] });
  return {
    name: String(data?.name || base.name),
    url: String(data?.url || base.url || ""),
    location: String(data?.location || base.location || ""),
    pricing: String(data?.pricing || "No disponible"),
    advantages: Array.isArray(data?.advantages) ? data.advantages.map(String) : [],
    differentiator: String(data?.differentiator || ""),
    priceScore: clampScore(data?.priceScore),
    valueScore: clampScore(data?.valueScore),
    confidence: ["alta", "media", "baja"].includes(data?.selfConfidence) ? data.selfConfidence : "media",
    sources: dedupeSources(sources),
  };
};

// Paso 3 · Verificación cruzada e independiente (#3).
const verifyCompetitors = async (
  ai: GoogleGenAI,
  context: string,
  competitors: Competitor[]
): Promise<Competitor[]> => {
  const summary = competitors.map((c, i) => `${i + 1}. ${c.name} — ${c.location} — ${c.pricing} — ${c.url || "sin URL"}`).join("\n");
  const prompt = `
Actúa como verificador ESCÉPTICO. Para cada competidor de la lista, evalúa con Google Search si
es real y si sus datos (precio, ubicación, oferta) son verosímiles y están respaldados. Sé estricto:
si algo huele a inventado o no encuentras evidencia, baja la confianza.

NEGOCIO: ${context}

LISTA:
${summary}

Devuelve SOLO JSON puro:
{
  "verifications": [
    { "name": "Nombre exacto de la lista", "confidence": "alta | media | baja", "note": "1 frase: qué confirmaste o qué duda queda" }
  ]
}`;
  const { data } = await callModel({ ai, parts: [{ text: prompt }] });
  const verifications: any[] = Array.isArray(data?.verifications) ? data.verifications : [];
  const byName = new Map(verifications.map((v) => [String(v?.name || "").toLowerCase(), v]));

  return competitors.map((c) => {
    const v = byName.get(c.name.toLowerCase());
    if (!v) return c;
    return {
      ...c,
      confidence: ["alta", "media", "baja"].includes(v.confidence) ? v.confidence : c.confidence,
      verificationNote: v.note ? String(v.note) : undefined,
    };
  });
};

// Paso 4 · Síntesis estratégica + posicionamiento del usuario + gap analysis (#4).
const synthesize = async (
  ai: GoogleGenAI,
  text: string,
  competitors: Competitor[]
): Promise<{
  summary: string;
  analysis: string;
  targetAudience: string;
  communicationStrategy: string;
  userDifferentiator: string;
  suggestions: string[];
  marketGaps: string[];
  userPosition: { priceScore: number; valueScore: number };
}> => {
  const dossier = competitors
    .map(
      (c) =>
        `- ${c.name} (${c.location}) · precio:${c.priceScore}/100 valor:${c.valueScore}/100 · ${c.pricing} · dif: ${c.differentiator}`
    )
    .join("\n");

  const prompt = `
Eres Director de Estrategia. Con base en el dossier de competidores ya investigado, redacta la
estrategia para el negocio. TODO EN ESPAÑOL. No inventes nuevos competidores.

NEGOCIO:
${text}

DOSSIER DE COMPETIDORES (ya verificado):
${dossier}

Devuelve SOLO JSON puro:
{
  "summary": "Resumen ejecutivo del mercado",
  "analysis": "Análisis estratégico detallado (posición del negocio frente al set)",
  "targetAudience": "Perfil de audiencia ideal (demografía, dolores, deseos)",
  "communicationStrategy": "Guía de comunicación (tono, canales, mensaje central)",
  "userDifferentiator": "La ventaja competitiva del negocio (actual o la que debería construir)",
  "suggestions": ["Acción concreta 1", "Acción concreta 2", "Acción concreta 3"],
  "marketGaps": ["Hueco de mercado 1 que nadie cubre", "Hueco 2"],
  "userPosition": { "priceScore": 0-100, "valueScore": 0-100 }
}`;
  const { data } = await callModel({ ai, parts: [{ text: prompt }], search: false });
  return {
    summary: String(data?.summary || "Investigación completada."),
    analysis: String(data?.analysis || ""),
    targetAudience: String(data?.targetAudience || "No definida."),
    communicationStrategy: String(data?.communicationStrategy || "No definida."),
    userDifferentiator: String(data?.userDifferentiator || "Estrategia generada."),
    suggestions: Array.isArray(data?.suggestions) ? data.suggestions.map(String) : [],
    marketGaps: Array.isArray(data?.marketGaps) ? data.marketGaps.map(String) : [],
    userPosition: {
      priceScore: clampScore(data?.userPosition?.priceScore),
      valueScore: clampScore(data?.userPosition?.valueScore),
    },
  };
};

// ---------------------------------------------------------------------------
// Orquestador
// ---------------------------------------------------------------------------

export const analyzeBenchmark = async (
  text: string,
  files: FileData[],
  onProgress?: ProgressFn
): Promise<BenchmarkResult> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const report = (msg: string) => onProgress?.(msg);

  const fileParts = files.map((file) => ({
    inlineData: { data: file.base64.split(",")[1], mimeType: file.type },
  }));

  // Paso 1 · Identificar
  report("Identificando competidores reales del mercado...");
  const seeds = await identifyCompetitors(ai, text, fileParts);
  if (seeds.length === 0) {
    throw userError(
      "No encontramos competidores claros para este negocio. " +
        "Añade más detalle del producto y la zona, e inténtalo de nuevo."
    );
  }

  // Paso 2 · Investigar a fondo (en paralelo)
  report(`Investigando a fondo ${seeds.length} competidores en paralelo...`);
  const researched = await Promise.allSettled(
    seeds.map((s) => researchCompetitor(ai, text, s))
  );
  let competitors: Competitor[] = researched
    .filter((r): r is PromiseFulfilledResult<Competitor> => r.status === "fulfilled")
    .map((r) => r.value);

  if (competitors.length === 0) {
    // Si la investigación profunda falló en todos, propaga el primer error real.
    const firstRejected = researched.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
    throw firstRejected ? classifyError(firstRejected.reason) : userError("No pudimos investigar a los competidores. Inténtalo de nuevo.");
  }

  // Paso 3 · Verificar
  report("Verificando datos y contrastando fuentes...");
  try {
    competitors = await verifyCompetitors(ai, text, competitors);
  } catch (e) {
    // La verificación es un refuerzo: si falla, seguimos con la confianza autoreportada.
    console.warn("Verificación omitida:", e);
  }

  // Paso 4 · Sintetizar
  report("Sintetizando estrategia y mapa de posicionamiento...");
  const synth = await synthesize(ai, text, competitors);

  // Mapa de posicionamiento: competidores + el punto del negocio del usuario.
  const positioning: PositioningPoint[] = [
    ...competitors.map((c) => ({
      name: c.name,
      priceScore: c.priceScore ?? 50,
      valueScore: c.valueScore ?? 50,
    })),
    { name: "Tu negocio", priceScore: synth.userPosition.priceScore, valueScore: synth.userPosition.valueScore, isUser: true },
  ];

  const allSources = dedupeSources(competitors.flatMap((c) => c.sources || []));

  return {
    summary: synth.summary,
    analysis: synth.analysis,
    competitors,
    userDifferentiator: synth.userDifferentiator,
    suggestions: synth.suggestions,
    communicationStrategy: synth.communicationStrategy,
    targetAudience: synth.targetAudience,
    marketGaps: synth.marketGaps,
    positioning,
    sources: allSources,
  };
};
