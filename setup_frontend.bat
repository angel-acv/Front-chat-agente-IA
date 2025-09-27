@echo off
REM Setup del Frontend React
REM Usuario: angel-acv
REM Fecha: 2025-08-30 00:06:43 UTC

echo 🚀 Configurando Frontend del Agente de Salud Mental
echo 👤 Usuario: angel-acv
echo 🕒 Fecha: 2025-08-30 00:06:43 UTC
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no encontrado. Instala Node.js 18+ primero.
    echo 📥 Descargar desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado:
node --version

REM Crear proyecto React con Vite
echo.
echo 📦 Creando proyecto React con Vite...
npm create vite@latest mental-health-frontend -- --template react

REM Entrar al directorio
cd mental-health-frontend

REM Instalar dependencias base
echo.
echo 📦 Instalando dependencias base...
npm install

REM Instalar dependencias adicionales
echo.
echo 📦 Instalando dependencias adicionales...
npm install axios lucide-react react-router-dom react-hot-toast

REM Instalar Tailwind CSS
echo.
echo 🎨 Configurando Tailwind CSS...
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

echo.
echo ✅ Frontend configurado correctamente
echo.
echo 📁 Estructura creada:
echo    mental-health-frontend/
echo    ├── src/
echo    ├── public/
echo    ├── package.json
echo    └── vite.config.js
echo.
echo 🚀 Siguiente paso:
echo    1. Copia los archivos de componentes
echo    2. Ejecuta: npm run dev
echo.
pause