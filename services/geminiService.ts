
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FileData, BenchmarkResult } from "../types";

// Extrae el objeto JSON de la respuesta de la IA. El texto puede venir
// envuelto en bloques de código markdown (```json ... ```) o con texto
// adicional antes/después, así que lo limpiamos antes de parsear.
const extractJson = (raw: string): any => {
  let text = raw.trim();

  // Quita las cercas de código markdown si existen.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Como respaldo, recorta a partir de la primera llave hasta la última.
  if (!text.startsWith("{")) {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      text = text.slice(first, last + 1);
    }
  }

  try {
    return JSON.parse(text || "{}");
  } catch (parseError) {
    console.error("Gemini JSON Parse Error:", parseError, raw);
    throw new Error(
      "La IA respondió en un formato inesperado y no pudimos leer los resultados. " +
      "Vuelve a intentarlo; si persiste, reformula el contexto del negocio."
    );
  }
};

export const analyzeBenchmark = async (
  text: string,
  files: FileData[]
): Promise<BenchmarkResult> => {
  // Intenta obtener la API key de process.env o localStorage
  const apiKey = process.env.API_KEY ||
                 (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null);

  if (!apiKey) {
    throw new Error(
      'API Key no configurada. ' +
      'Configura localStorage.setItem("GEMINI_API_KEY", "tu_clave") ' +
      'o define API_KEY en .env.local'
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Permite sobreescribir el modelo vía variable de entorno o localStorage.
  // Por defecto usa un modelo estable y disponible (no un "preview" que puede
  // descontinuarse). Cambia a 'gemini-3-pro' si tu cuenta tiene acceso.
  const modelName =
    process.env.GEMINI_MODEL ||
    (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_MODEL') : null) ||
    'gemini-2.5-pro';
  
  const fileParts = files.map(file => ({
    inlineData: {
      data: file.base64.split(',')[1],
      mimeType: file.type
    }
  }));

  const prompt = `
    Eres un Director de Estrategia Publicitaria y experto en Inteligencia Competitiva. 
    Tu objetivo es realizar una investigación de mercado exhaustiva utilizando Google Search.

    REGLAS CRÍTICAS:
    1. TODA LA RESPUESTA DEBE ESTAR EN ESPAÑOL.
    2. DEBES CONSULTAR Y CITAR AL MENOS 5 COMPETIDORES O REFERENTES DIFERENTES.
    3. Analiza profundamente el producto y la ubicación proporcionada.

    CONTEXTO DEL USUARIO:
    ${text}

    TAREAS PARA CADA COMPETIDOR:
    - Nombre y URL.
    - UBICACIÓN exacta o zona de operación.
    - PRECIOS o modelo de monetización (ej. "Desde $50 USD", "Suscripción mensual", "Gama alta").
    - VENTAJAS específicas (mínimo 3 puntos clave por competidor).
    - DIFERENCIADOR principal que usan en su comunicación.

    OTRAS TAREAS:
    - Define la AUDIENCIA IDEAL detalladamente.
    - Diseña una ESTRATEGIA DE COMUNICACIÓN ganadora.
    - Sugiere un VALOR AGREGADO único para el usuario si no lo tiene.

    FORMATO DE RESPUESTA REQUERIDO (JSON puro):
    {
      "summary": "Resumen ejecutivo del mercado (español)",
      "analysis": "Análisis estratégico detallado (español)",
      "competitors": [
        {
          "name": "Nombre",
          "url": "URL",
          "location": "Ciudad/País o 'Global'",
          "pricing": "Info de precios o modelo",
          "advantages": ["Ventaja 1", "Ventaja 2", "Ventaja 3"],
          "differentiator": "Su gancho principal"
        }
      ],
      "userDifferentiator": "Tu ventaja competitiva actual o sugerida",
      "suggestions": ["Sugerencia 1", "Sugerencia 2"],
      "targetAudience": "Perfil de audiencia (demografía, dolores, deseos)",
      "communicationStrategy": "Guía de comunicación (tono, canales, mensaje central)"
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          ...fileParts,
          { text: prompt }
        ]
      },
      config: {
        // NOTA: googleSearch y responseMimeType:"application/json" son
        // incompatibles en la API de Gemini. Por eso pedimos el JSON dentro
        // del texto y lo extraemos manualmente más abajo.
        tools: [{ googleSearch: {} }]
      }
    });

    const data = extractJson(response.text || "");

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || "Referencia de Mercado",
        url: chunk.web.uri
      }));

    return {
      summary: data.summary || "Investigación completada.",
      analysis: data.analysis || "",
      competitors: data.competitors || [],
      userDifferentiator: data.userDifferentiator || "Estrategia generada.",
      suggestions: data.suggestions || [],
      targetAudience: data.targetAudience || "No definida.",
      communicationStrategy: data.communicationStrategy || "No definida.",
      sources: sources
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    // Si ya lanzamos un mensaje específico (ej. parseo de JSON), respétalo.
    if (error instanceof Error && error.message.startsWith("La IA respondió")) {
      throw error;
    }

    // Reúne toda la información disponible del error para clasificarlo.
    const status: number | undefined =
      error?.status ?? error?.code ?? error?.response?.status;
    const rawMessage: string = (
      error?.message ||
      error?.error?.message ||
      String(error ?? "")
    ).toLowerCase();

    // 1. API Key inválida o sin permisos (401 / 403).
    if (
      status === 401 ||
      status === 403 ||
      rawMessage.includes("api key not valid") ||
      rawMessage.includes("api_key_invalid") ||
      rawMessage.includes("permission denied") ||
      rawMessage.includes("permission_denied") ||
      rawMessage.includes("unauthenticated")
    ) {
      throw new Error(
        "La API Key de Gemini no es válida o no tiene permisos. " +
        "Verifica que la clave sea correcta y esté activa en Google AI Studio."
      );
    }

    // 2. Modelo no encontrado o no disponible para esta clave (404).
    if (
      status === 404 ||
      rawMessage.includes("not found") ||
      rawMessage.includes("is not supported") ||
      rawMessage.includes("does not exist")
    ) {
      throw new Error(
        `El modelo "${modelName}" no está disponible para tu cuenta o no existe. ` +
        "Revisa que tu API Key tenga acceso a este modelo."
      );
    }

    // 3. Cuota agotada o límite de peticiones (429).
    if (
      status === 429 ||
      rawMessage.includes("quota") ||
      rawMessage.includes("rate limit") ||
      rawMessage.includes("resource_exhausted") ||
      rawMessage.includes("resource exhausted")
    ) {
      throw new Error(
        "Se agotó la cuota o superaste el límite de peticiones de la API de Gemini. " +
        "Espera unos minutos o revisa tu plan y facturación en Google AI Studio."
      );
    }

    // 4. Error del servidor de Gemini (5xx).
    if (status !== undefined && status >= 500 && status < 600) {
      throw new Error(
        "El servicio de Gemini tuvo un problema temporal (error del servidor). " +
        "Vuelve a intentarlo en unos momentos."
      );
    }

    // 5. Problemas de red / conexión.
    if (
      rawMessage.includes("failed to fetch") ||
      rawMessage.includes("network") ||
      rawMessage.includes("networkerror") ||
      rawMessage.includes("etimedout") ||
      rawMessage.includes("timeout")
    ) {
      throw new Error(
        "No pudimos conectar con el servicio de Gemini. " +
        "Revisa tu conexión a internet e inténtalo de nuevo."
      );
    }

    // 6. Fallback: muestra el detalle real para facilitar el diagnóstico.
    const detail = error?.message || error?.error?.message;
    throw new Error(
      "Ocurrió un error al generar la investigación" +
      (detail ? `: ${detail}` : ". Inténtalo de nuevo.")
    );
  }
};
