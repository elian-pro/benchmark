# Deployment Guide

## Docker Deployment

### Building the Image

```bash
docker build -t ad-intel-pro .
```

### Running the Container

```bash
docker run -d -p 80:80 --name ad-intel-pro ad-intel-pro
```

### Accessing the Application

Open http://localhost in your browser.

## API Key Configuration

Since this is a static build served by nginx, the API key needs to be configured in the browser:

1. Open the application in your browser
2. Open the browser console (F12)
3. Set the API key:
   ```javascript
   localStorage.setItem('GEMINI_API_KEY', 'your_actual_api_key_here')
   ```
4. Reload the page

**Get your API key:** https://ai.google.dev/gemini-api/docs/api-key

### Alternative: Build-time API Key (Not Recommended for Security)

If you want to bake the API key into the build (not recommended for production):

```bash
docker build --build-arg API_KEY=your_api_key_here -t ad-intel-pro .
```

You'll need to modify the Dockerfile to accept and use this build arg:

```dockerfile
# In builder stage
ARG API_KEY
ENV API_KEY=$API_KEY
```

**Warning:** This embeds the API key in the built files, which is a security risk.

## Easypanel Deployment

For Easypanel deployments:

1. The system will automatically detect the `Dockerfile`
2. Build arguments can be set in the Easypanel dashboard
3. Environment variables should be configured in the Easypanel settings

## Nginx Configuration

The included `nginx.conf` provides:
- SPA routing (all routes redirect to index.html)
- Gzip compression
- Security headers
- Static asset caching
- Health check endpoint at `/health`

## Health Checks

The container includes a health check that verifies nginx is responding:
- Endpoint: `http://localhost/health`
- Interval: 30 seconds
- Timeout: 3 seconds

## Troubleshooting

### Build Fails with npm Error

If the Docker build fails during `npm install`, check:
1. Docker daemon has internet access
2. No firewall blocking npm registry
3. Try using a different npm registry:
   ```dockerfile
   RUN npm config set registry https://registry.npmmirror.com/
   RUN npm install
   ```

### Application Loads but Shows API Key Error

Configure the API key in localStorage as described above.

### Nginx Returns 404 for Routes

This is expected behavior - the nginx.conf handles this by redirecting to index.html.
If you're still seeing 404s, verify:
1. `nginx.conf` was copied correctly
2. The default nginx config was replaced

## Production Recommendations

1. **API Key Management**: Use localStorage or implement a backend proxy
2. **HTTPS**: Use a reverse proxy (e.g., Caddy, Traefik) in front of nginx
3. **Monitoring**: Set up health check monitoring
4. **Logging**: Configure nginx access logs for monitoring
5. **Rate Limiting**: Implement rate limiting for API calls
