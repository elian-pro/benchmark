<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1doHzP3Udu7aB_Jri2_ihSwtJhtDXUlna

## Run Locally

**Prerequisites:**  Node.js o Python 3

### Método 1: Con npm (Requiere acceso a npm registry)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `API_KEY` in [.env.local](.env.local) to your Gemini API key:
   ```env
   API_KEY=tu_clave_de_gemini
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

### Método 2: Servidor Simple (Sin npm install)

Si `npm install` falla por restricciones de red, usa el servidor HTTP simple:

1. Ejecuta el script de inicio:
   ```bash
   # Linux/Mac
   ./start-dev.sh

   # Windows
   start-dev.bat

   # O manualmente con Python
   python3 -m http.server 3000
   ```

2. Abre http://localhost:3000

3. En la consola del navegador, configura tu API key:
   ```javascript
   localStorage.setItem('GEMINI_API_KEY', 'tu_clave_de_gemini_aqui')
   ```

4. Recarga la página

**Obtén tu API key:** https://ai.google.dev/gemini-api/docs/api-key

### Solución de Problemas

Si encuentras errores de inicio, consulta [STARTUP_FIX.md](STARTUP_FIX.md) para:
- Problemas de red con npm registry
- Configuración de proxies
- Métodos alternativos de instalación
