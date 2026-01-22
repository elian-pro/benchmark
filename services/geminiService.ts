
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FileData, BenchmarkResult } from "../types";

export const analyzeBenchmark = async (
  text: string,
  files: FileData[]
): Promise<BenchmarkResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = 'gemini-3-pro-preview';
  
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
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || "{}");
    
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
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("No pudimos obtener datos detallados. Revisa que el texto incluya un producto y zona clara.");
  }
};
