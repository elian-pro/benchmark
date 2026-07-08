<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Zebra Benchmarking

Plataforma de inteligencia competitiva impulsada por **Claude**: investiga a tu competencia en
internet y genera una estrategia lista para descargar como PDF.

📐 **¿Cómo funciona?** Lee [ARCHITECTURE.md](ARCHITECTURE.md) — incluye el paso a paso en lenguaje
natural y el detalle del framework de investigación.

## Run Locally

**Prerequisites:**  Node.js o Python 3

### Método 1: Con npm (Requiere acceso a npm registry)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Define tu clave de Claude (Anthropic) en el entorno:
   ```env
   ANTHROPIC_API_KEY=tu_clave_de_claude
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
   localStorage.setItem('ANTHROPIC_API_KEY', 'tu_clave_de_claude_aqui')
   ```

4. Recarga la página

**Obtén tu API key:** https://console.anthropic.com

## Deploy with Docker

**Prerequisites:** Docker

### Build and Run

```bash
# Build the image
docker build -t zebra-benchmarking .

# Run with API key (recommended)
docker run -d -p 80:80 \
  -e ANTHROPIC_API_KEY=your_claude_api_key_here \
  --name zebra-benchmarking \
  zebra-benchmarking
```

The application will automatically use the API key from the environment variable.

### Alternative: Configure API Key via Browser

If you run without the `-e ANTHROPIC_API_KEY` flag:

1. Open http://localhost in your browser
2. Open browser console (F12)
3. Set your API key:
   ```javascript
   localStorage.setItem('ANTHROPIC_API_KEY', 'your_api_key_here')
   ```
4. Reload the page

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Solución de Problemas

Si encuentras errores de inicio, consulta [STARTUP_FIX.md](STARTUP_FIX.md) para:
- Problemas de red con npm registry
- Configuración de proxies
- Métodos alternativos de instalación
