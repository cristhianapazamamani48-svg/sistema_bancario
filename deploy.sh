#!/bin/bash
# =============================================================
# Script de Despliegue - Aether Bank
# Archivo: deploy.sh
# =============================================================
#
# CÓMO USARLO EN TU SERVIDOR UBUNTU:
#   1. Asegurarte que el script tenga permisos de ejecución:
#      chmod +x deploy.sh
#   2. Ejecutar después de cada git pull:
#      ./deploy.sh
# =============================================================

set -e  # Si cualquier comando falla, el script se detiene

echo ""
echo "============================================"
echo "  🚀 AETHER BANK - Iniciando Despliegue"
echo "============================================"
echo ""

# -------------------------------------------------------
# BACKEND
# -------------------------------------------------------
echo "📦 [1/4] Instalando dependencias del Backend..."
cd backend
npm install --production=false

echo ""
echo "🗄️  [2/4] Aplicando migraciones de base de datos..."
npx prisma generate
npx prisma db push

echo ""
echo "🔨 [3/4] Compilando Backend (TypeScript → JavaScript)..."
npm run build

# -------------------------------------------------------
# FRONTEND
# -------------------------------------------------------
echo ""
echo "🎨 [4/4] Compilando Frontend (React → HTML/CSS/JS estático)..."
cd ../frontend
npm install
npm run build

echo ""
echo "============================================"

# -------------------------------------------------------
# REINICIAR BACKEND CON PM2 (si está instalado)
# PM2 mantiene el backend corriendo siempre en segundo plano
# -------------------------------------------------------
if command -v pm2 &> /dev/null; then
    echo "♻️  Reiniciando Backend con PM2..."
    cd ../backend
    
    # Si ya existe el proceso, lo reinicia. Si no, lo crea por primera vez.
    pm2 describe aether-bank &>/dev/null \
        && pm2 restart aether-bank \
        || pm2 start dist/main.js --name aether-bank

    pm2 save
    echo "✅ Backend reiniciado correctamente con PM2"
else
    echo "⚠️  PM2 no está instalado. Para que el backend corra siempre:"
    echo "   sudo npm install -g pm2"
    echo "   Y luego en la carpeta backend:"
    echo "   pm2 start dist/main.js --name aether-bank"
fi

# -------------------------------------------------------
# RECARGAR NGINX
# -------------------------------------------------------
echo ""
if command -v nginx &> /dev/null; then
    echo "🔄 Recargando Nginx para aplicar cambios del frontend..."
    sudo systemctl reload nginx
    echo "✅ Nginx recargado"
fi

echo ""
echo "============================================"
echo "  ✅ ¡Despliegue completado exitosamente!"
echo "============================================"
echo ""
