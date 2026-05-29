# 🏦 Plataforma de Gestión Bancaria Simulada (Core Bancario)

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Un motor bancario transaccional de alto rendimiento diseñado con **TypeScript** y **NestJS**. Implementa características de grado empresarial para garantizar la integridad financiera de los datos bajo escenarios de alta concurrencia.

Este proyecto está diseñado como prueba de nivel de Ingeniería de Software.

## 🚀 Arquitectura y Tecnologías
- **Backend:** NestJS, TypeScript
- **Base de Datos:** PostgreSQL
- **ORM:** Prisma 7
- **Seguridad:** JWT (Passport), Bcrypt, Helmet, Rate Limiting
- **Infraestructura:** Docker & Docker Compose
- **Documentación:** Swagger (OpenAPI)
- **Testing:** Jest

## 🛡️ Características Principales
1. **Transacciones ACID & Pessimistic Locking:** Previene "Race Conditions" en las transferencias utilizando bloqueos a nivel de fila en la DB (`SELECT ... FOR UPDATE`) y ordenamiento determinista para prevenir *deadlocks*.
2. **Double-Entry Bookkeeping:** Cada transacción exitosa genera asientos contables inmutables (`LedgerEntry`) de Débito y Crédito para asegurar integridad del libro mayor.
3. **Observabilidad:** Sistema de `Correlation ID` inyectado en cabeceras para rastreo de peticiones en microservicios, acoplado con un Interceptor de Auditoría Global que registra cada mutación.
4. **Seguridad Robusta:** Autenticación estricta con JWT, encriptación de contraseñas y limitador de velocidad.

## ⚙️ Instalación y Configuración
```bash
# Instalar dependencias
npm install

# Levantar PostgreSQL con Docker (Puerto 5433)
docker-compose up -d

# Generar cliente y preparar base de datos
npx prisma generate
npx prisma db push

# Iniciar servidor
npm run start:dev
```

Una vez iniciado, la documentación visual de la API estará disponible en: `http://localhost:3000/api`
