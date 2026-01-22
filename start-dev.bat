@echo off
echo =========================================
echo   Ad Intel Pro - Servidor de Desarrollo
echo =========================================
echo.
echo WARNING: Usando servidor HTTP simple (sin Vite)
echo Configura tu API_KEY en la consola del navegador:
echo    localStorage.setItem('GEMINI_API_KEY', 'tu_api_key_aqui')
echo.
echo Servidor en http://localhost:3000
echo.
echo Presiona Ctrl+C para detener
echo =========================================
echo.

python -m http.server 3000
