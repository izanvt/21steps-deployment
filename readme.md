# Proyecto Final

Esta aplicación cuenta con un **Backend** desarrollado en Laravel (PHP) y un **Frontend** desarrollado con React y Vite (JavaScript). 

## Guía de Instalación

Sigue estos pasos para levantar el proyecto en tu entorno local tras clonarlo desde GitHub.

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd projecte-final-2526-grupo_07
```

### 2. Configuración del Backend (Laravel)
En una terminal, dirígete a la carpeta del backend y descarga las dependencias:
```bash
cd backend
composer install
```

Crea tu archivo de entorno y genera la clave de la aplicación:
```bash
cp .env.example .env
php artisan key:generate
```
> **Nota:** Recuerda configurar tus credenciales de base de datos en el archivo `.env` que acabas de crear (por ejemplo, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).

Ejecuta las migraciones (y los seeders si los hay) para preparar la base de datos:
```bash
php artisan migrate
```

Finalmente, levanta el servidor de desarrollo del backend:
```bash
php artisan serve
```

### 3. Configuración del Frontend (React/Vite)
Abre una nueva terminal en la raíz del proyecto, dirígete a la carpeta del frontend y descarga las dependencias:
```bash
cd frontend
npm install
```

Inicia el servidor de desarrollo del frontend:
```bash
npm run dev
```

El frontend estará disponible (normalmente en `http://localhost:5173`) y se comunicará con el backend de Laravel.