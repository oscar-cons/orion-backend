# DarkWeb Insights - Studio

Este proyecto es una plataforma de monitoreo del ecosistema criminal web, compuesta por un frontend en Next.js y un backend en FastAPI, utilizando PostgreSQL como base de datos.

## Estructura del Proyecto

- **frontend/**: Aplicación Next.js (React, ShadCN, Tailwind CSS)
- **backend-fastapi/**: API REST construida con FastAPI
- **postgresql_data/**: Carpeta para los datos de la base de datos PostgreSQL

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v20 o superior recomendado)
- [npm](https://www.npmjs.com/)
- [Python 3.10+](https://www.python.org/)
- [PostgreSQL](https://www.postgresql.org/) (o usar el script incluido)

## 1. Instalación de Dependencias

### Frontend
```bash
cd frontend
npm install
```

### Backend
```bash
cd backend-fastapi
pip install -r requirements.txt
```

## 2. Configuración de la Base de Datos

Asegúrate de tener PostgreSQL corriendo. Puedes usar el script `postgres_control.bat` para iniciar el servicio en Windows, o configurar tu propia instancia.

Configura las variables de entorno necesarias en el backend para la conexión a la base de datos (verifica el archivo `backend-fastapi/app/database.py`).

## 3. Ejecución de los Servidores

### Iniciar el Backend (FastAPI)
```bash
cd backend-fastapi
uvicorn app.main:app --reload
```
Por defecto, estará disponible en [http://localhost:8000](http://localhost:8000)

### Iniciar el Frontend (Next.js)
```bash
cd frontend
npm run dev
```
Por defecto, estará disponible en [http://localhost:3000](http://localhost:3000)

## 4. Notas Adicionales

- Personaliza las variables de entorno según tu entorno local.
- Consulta la carpeta `docs/` para documentación adicional sobre la arquitectura y el flujo de datos.



