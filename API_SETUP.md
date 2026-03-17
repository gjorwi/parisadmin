# API Setup

## Admin CMS

Crea un archivo `.env.local` en `admincms` con:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Server Admin

Copia `serveradmin/.env.example` a `serveradmin/.env` y completa:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Flujo recomendado

1. `serveradmin`: instalar dependencias
2. `serveradmin`: ejecutar seed
3. `serveradmin`: iniciar servidor
4. `admincms`: crear `.env.local`
5. `admincms`: iniciar Next.js

## Credenciales seed por defecto

- Email: `admin@parisboutique.com`
- Password: `Admin123*`
```
