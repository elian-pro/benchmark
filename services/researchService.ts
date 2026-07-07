
import Anthropic from "@anthropic-ai/sdk";
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
  // El build deja un placeholder que el docker-entrypoint sustituye en runtime.
  // Si sigue sin sustituir (sin env), lo ignoramos y caemos a localStorage.
  const fromEnv = process.env.ANTHROPIC_API_KEY;
  const envKey = fromEnv && !fromEnv.includes("__RUNTIME") ? fromEnv : null;

  const apiKey =
    envKey ||
    (typeof window !== "undefined" ? localStorage.getItem("ANTHROPIC_API_KEY") : null);

  if (!apiKey) {
    throw userError(
      "API Key de Claude no configurada. " +
        'Configura localStorage.setItem("ANTHROPIC_API_KEY", "tu_clave") ' +
        "o define ANTHROPIC_API_KEY en el entorno. La obtienes en console.anthropic.com."
    );
  }
  return apiKey;
};

// Opus 4.8 = máxima capacidad. Cambia a 'claude-sonnet-5' para abaratar.
const resolveModel = (): string =>
  process.env.ANTHROPIC_MODEL ||
  (typeof window !== "undefined" ? localStorage.getItem("ANTHROPIC_MODEL") : null) ||
  "claude-opus-4-8";

const SECTOR_HINT = `Prioriza FUENTES PRIMARIAS y del sector: sitios oficiales de cada
competidor, portales y directorios especializados. Si el producto es inmobiliario, apóyate
además en portales como Inmuebles24, Lamudi, Propiedades.com y Vivanuncios (precio por m2/lote,
amenidades, ritmo de absorción). Cita siempre de dónde sale cada dato.`;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const userError = (message: string): Error => {
  const e = new Error(message);
  (e as any).userFacing = true;
  return e;
};

// Extrae el JSON de un texto (puede venir con cercas markdown o prosa alrededor).
const extractJson = (raw: string): any => {
  let text = (raw || "").trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  if (!text.startsWith("{") && !text.startsWith("[")) {
    const firstObj = text.indexOf("{");
    const firstArr = text.indexOf("[");
    const starts = [firstObj, firstArr].filter((i) => i !== -1);
    if (starts.length) {
      const start = Math.min(...starts);
      const closer = text[start] === "{" ? "}" : "]";
      const end = text.lastIndexOf(closer);
      if (end > start) text = text.slice(start, end + 1);
    }
  }

  try {
    return JSON.parse(text || "{}");
  } catch (parseError) {
    console.error("Claude JSON Parse Error:", parseError, raw);
    throw userError(
      "La IA respondió en un formato inesperado y no pudimos leer los resultados. " +
        "Vuelve a intentarlo; si persiste, reformula el contexto del negocio."
    );
  }
};

const classifyError = (error: any): Error => {
  if (error?.userFacing) return error;
  console.error("Claude API Error:", error);

  const status: number | undefined = error?.status ?? error?.statusCode;
  const raw: string = (error?.message || String(error ?? "")).toLowerCase();

  if (status === 401 || raw.includes("authentication") || raw.includes("invalid x-api-key") || raw.includes("api key")) {
    return userError(
      "La API Key de Claude no es válida. " +
        "Verifica que la clave sea correcta y esté activa en console.anthropic.com."
    );
  }
  if (status === 403 || raw.includes("permission")) {
    return userError("La API Key de Claude no tiene permisos para esta operación o este modelo.");
  }
  if (status === 404 || raw.includes("not found") || raw.includes("model")) {
    return userError(
      `El modelo "${resolveModel()}" no está disponible para tu cuenta. ` +
        "Revisa el identificador del modelo o los permisos de tu clave."
    );
  }
  if (status === 429 || raw.includes("rate limit") || raw.includes("overloaded")) {
    return userError(
      "Se superó el límite de peticiones o la cuota de Claude. " +
        "Espera unos minutos o revisa tu plan y facturación en console.anthropic.com."
    );
  }
  if (status !== undefined && status >= 500) {
    return userError("El servicio de Claude tuvo un problema temporal. Vuelve a intentarlo en unos momentos.");
  }
  if (raw.includes("failed to fetch") || raw.includes("network") || raw.includes("timeout") || raw.includes("connection")) {
    return userError("No pudimos conectar con Claude. Revisa tu conexión a internet e inténtalo de nuevo.");
  }
  return userError("Ocurrió un error al generar la investigación" + (error?.message ? `: ${error.message}` : ". Inténtalo de nuevo."));
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

const clampScore = (n: any): number => {
  const v = Number(n);
  if (!isFinite(v)) return 50;
  return Math.max(0, Math.min(100, Math.round(v)));
};

const textOf = (content: any[]): string =>
  content.filter((b) => b.type === "text").map((b) => b.text).join("\n");

// Recoge las fuentes de los bloques de resultado de web_search.
const sourcesFrom = (content: any[]): Source[] => {
  const out: Source[] = [];
  for (const b of content) {
    if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
      for (const r of b.content) {
        if (r?.type === "web_search_result" && r.url) {
          out.push({ title: r.title || "Referencia de Mercado", url: r.url });
        }
      }
    }
  }
  return out;
};

// ---------------------------------------------------------------------------
// Llamadas a Claude
// ---------------------------------------------------------------------------

// Llamada con búsqueda web en vivo. Maneja el bucle de herramientas de servidor (pause_turn).
const runWithSearch = async (
  client: Anthropic,
  userContent: any
): Promise<{ text: string; sources: Source[] }> => {
  const messages: any[] = [{ role: "user", content: userContent }];
  const sources: Source[] = [];
  try {
    for (let i = 0; i < 6; i++) {
      const resp = await client.messages.create({
        model: resolveModel(),
        max_tokens: 6000,
        tools: [{ type: "web_search_20260209", name: "web_search" } as any],
        messages,
      });
      sources.push(...sourcesFrom(resp.content as any[]));
      if (resp.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: resp.content });
        continue;
      }
      return { text: textOf(resp.content as any[]), sources };
    }
    return { text: textOf(messages.flatMap((m) => (Array.isArray(m.content) ? m.content : []))), sources };
  } catch (error) {
    throw classifyError(error);
  }
};

// Llamada sin búsqueda con SALIDA ESTRUCTURADA garantizada (elimina fallos de formato).
const runStructured = async (client: Anthropic, prompt: string, schema: any): Promise<any> => {
  try {
    const resp = await client.messages.create({
      model: resolveModel(),
      max_tokens: 6000,
      output_config: { format: { type: "json_schema", schema } } as any,
      messages: [{ role: "user", content: prompt }],
    });
    return extractJson(textOf(resp.content as any[]));
  } catch (error) {
    throw classifyError(error);
  }
};

// ---------------------------------------------------------------------------
// Etapas de la investigación
// ---------------------------------------------------------------------------

const identifyCompetitors = async (
  client: Anthropic,
  text: string,
  docBlocks: any[]
): Promise<Array<{ name: string; url: string; location: string }>> => {
  const prompt = `Eres un analista de Inteligencia Competitiva. Usando búsqueda web, identifica
entre 5 y 7 competidores o referentes REALES y verificables para el siguiente negocio. No inventes:
si no estás seguro de que un competidor existe, no lo incluyas. ${SECTOR_HINT}

CONTEXTO DEL NEGOCIO:
${text}

Responde SOLO con JSON puro (sin texto adicional):
{"competitors":[{"name":"Nombre real","url":"URL oficial o ''","location":"Ciudad/Zona"}]}`;

  const { text: out } = await runWithSearch(client, [...docBlocks, { type: "text", text: prompt }]);
  const data = extractJson(out);
  const list = Array.isArray(data?.competitors) ? data.competitors : [];
  return list
    .filter((c: any) => c?.name)
    .slice(0, 6)
    .map((c: any) => ({ name: String(c.name), url: String(c.url || ""), location: String(c.location || "") }));
};

const researchCompetitor = async (
  client: Anthropic,
  context: string,
  base: { name: string; url: string; location: string }
): Promise<Competitor> => {
  const prompt = `Investiga A FONDO al competidor "${base.name}" (${base.location}) usando búsqueda web.
Es competidor del negocio descrito abajo. ${SECTOR_HINT}

CONTEXTO DEL NEGOCIO:
${context}

Responde SOLO con JSON puro:
{"name":"${base.name}","url":"URL confirmada o '${base.url}'","location":"Ubicación exacta",
"pricing":"Precios o modelo con cifras si las hay","advantages":["Ventaja 1","Ventaja 2","Ventaja 3"],
"differentiator":"Su gancho principal","priceScore":0-100,"valueScore":0-100,
"selfConfidence":"alta|media|baja"}`;

  const { text: out, sources } = await runWithSearch(client, [{ type: "text", text: prompt }]);
  const data = extractJson(out);
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

const verifyCompetitors = async (
  client: Anthropic,
  context: string,
  competitors: Competitor[]
): Promise<Competitor[]> => {
  const summary = competitors
    .map((c, i) => `${i + 1}. ${c.name} — ${c.location} — ${c.pricing} — ${c.url || "sin URL"}`)
    .join("\n");
  const prompt = `Actúa como verificador ESCÉPTICO. Para cada competidor de la lista, evalúa con
búsqueda web si es real y si sus datos (precio, ubicación, oferta) son verosímiles y están
respaldados. Sé estricto: si algo huele a inventado o no encuentras evidencia, baja la confianza.

NEGOCIO: ${context}

LISTA:
${summary}

Responde SOLO con JSON puro:
{"verifications":[{"name":"Nombre exacto de la lista","confidence":"alta|media|baja","note":"1 frase"}]}`;

  const { text: out } = await runWithSearch(client, [{ type: "text", text: prompt }]);
  const data = extractJson(out);
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

const SYNTH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    analysis: { type: "string" },
    targetAudience: { type: "string" },
    communicationStrategy: { type: "string" },
    userDifferentiator: { type: "string" },
    suggestions: { type: "array", items: { type: "string" } },
    marketGaps: { type: "array", items: { type: "string" } },
    userPosition: {
      type: "object",
      additionalProperties: false,
      properties: { priceScore: { type: "integer" }, valueScore: { type: "integer" } },
      required: ["priceScore", "valueScore"],
    },
  },
  required: [
    "summary",
    "analysis",
    "targetAudience",
    "communicationStrategy",
    "userDifferentiator",
    "suggestions",
    "marketGaps",
    "userPosition",
  ],
};

const synthesize = async (
  client: Anthropic,
  text: string,
  competitors: Competitor[]
): Promise<any> => {
  const dossier = competitors
    .map((c) => `- ${c.name} (${c.location}) · precio:${c.priceScore}/100 valor:${c.valueScore}/100 · ${c.pricing} · dif: ${c.differentiator}`)
    .join("\n");

  const prompt = `Eres Director de Estrategia. Con base en el dossier de competidores ya investigado,
redacta la estrategia para el negocio. TODO EN ESPAÑOL. No inventes nuevos competidores.

NEGOCIO:
${text}

DOSSIER DE COMPETIDORES (ya verificado):
${dossier}

Devuelve summary, analysis, targetAudience, communicationStrategy, userDifferentiator,
suggestions (3), marketGaps (2+) y userPosition {priceScore 0-100, valueScore 0-100}.`;

  const data = await runStructured(client, prompt, SYNTH_SCHEMA);
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
  const client = new Anthropic({ apiKey: getApiKey(), dangerouslyAllowBrowser: true });
  const report = (msg: string) => onProgress?.(msg);

  const docBlocks = files.map((file) => ({
    type: "document",
    source: { type: "base64", media_type: file.type, data: file.base64.split(",")[1] },
  }));

  // Paso 1 · Identificar
  report("Identificando competidores reales del mercado...");
  const seeds = await identifyCompetitors(client, text, docBlocks);
  if (seeds.length === 0) {
    throw userError(
      "No encontramos competidores claros para este negocio. " +
        "Añade más detalle del producto y la zona, e inténtalo de nuevo."
    );
  }

  // Paso 2 · Investigar a fondo (en paralelo)
  report(`Investigando a fondo ${seeds.length} competidores en paralelo...`);
  const researched = await Promise.allSettled(seeds.map((s) => researchCompetitor(client, text, s)));
  let competitors: Competitor[] = researched
    .filter((r): r is PromiseFulfilledResult<Competitor> => r.status === "fulfilled")
    .map((r) => r.value);

  if (competitors.length === 0) {
    const firstRejected = researched.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
    throw firstRejected ? classifyError(firstRejected.reason) : userError("No pudimos investigar a los competidores. Inténtalo de nuevo.");
  }

  // Paso 3 · Verificar
  report("Verificando datos y contrastando fuentes...");
  try {
    competitors = await verifyCompetitors(client, text, competitors);
  } catch (e) {
    console.warn("Verificación omitida:", e);
  }

  // Paso 4 · Sintetizar (salida estructurada)
  report("Sintetizando estrategia y mapa de posicionamiento...");
  const synth = await synthesize(client, text, competitors);

  const positioning: PositioningPoint[] = [
    ...competitors.map((c) => ({ name: c.name, priceScore: c.priceScore ?? 50, valueScore: c.valueScore ?? 50 })),
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
