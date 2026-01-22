# Solución al Problema de Inicio

## Problema Identificado

El proyecto no puede ejecutarse con `npm run dev` debido a **restricciones de red** que bloquean el acceso al registro de npm:

```
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@google%2fgenai
curl: (56) CONNECT tunnel failed, response 403
x-deny-reason: host_not_allowed
```

## Causa Raíz

- El firewall/proxy del entorno bloquea el acceso a `registry.npmjs.org`
- No se pueden instalar dependencias con `npm install` o `yarn install`
- Vite requiere node_modules para ejecutarse

## Soluciones

### Opción 1: Usar Servidor HTTP Simple (Recomendado para desarrollo local)

El proyecto ya está configurado para cargar dependencias desde CDN (esm.sh) mediante importmap en `index.html`.

Inicia un servidor HTTP simple:

```bash
# Con Python
python3 -m http.server 3000

# Con Node (si http-server está disponible globalmente)
npx -y http-server -p 3000

# Con PHP
php -S localhost:3000
```

Luego abre: http://localhost:3000

**Nota:** Las variables de entorno (API_KEY) no estarán disponibles con este método. Necesitarás modificar el código para usar la clave directamente o desde localStorage.

### Opción 2: Configurar Proxy/Registry Alternativo

Si tienes acceso a configuración de red:

```bash
# Configurar registry alternativo
npm config set registry https://registry.npmmirror.com/

# O usar proxy corporativo
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### Opción 3: Instalar Dependencias en Ambiente Externo

1. En una máquina con acceso a npm:
   ```bash
   npm install
   tar -czf node_modules.tar.gz node_modules package-lock.json
   ```

2. Transferir `node_modules.tar.gz` a este ambiente

3. Extraer:
   ```bash
   tar -xzf node_modules.tar.gz
   npm run dev
   ```

### Opción 4: Usar Docker Build Multi-Stage

Si el ambiente permite builds de Docker:

```dockerfile
FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Configuración de API Key

Edita `.env.local` y agrega tu clave de Gemini:

```env
API_KEY=tu_clave_de_gemini_aqui
```

Obtén una clave en: https://ai.google.dev/gemini-api/docs/api-key

## Estado Actual

- ✅ Archivo `.env.local` creado
- ❌ node_modules no disponible (bloqueado por red)
- ✅ index.html configurado con importmap CDN
- ⚠️ Vite no puede ejecutarse sin node_modules

## Próximos Pasos

1. Contactar al administrador del sistema para:
   - Desbloquear acceso a registry.npmjs.org
   - O configurar un registry mirror interno
   - O habilitar proxy npm adecuado

2. Mientras tanto, usar servidor HTTP simple para desarrollo
