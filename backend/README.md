# Alarmber Backend API

Backend API para la aplicación Alarmber - Sistema de Alertas de Personas Desaparecidas.

## 🚀 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **Bcrypt** - Encriptación de contraseñas
- **Multer** - Manejo de archivos

## 📁 Estructura del Proyecto

```
backend/
├── config/           # Configuraciones
│   ├── database.js
│   └── constants.js
├── controllers/      # Lógica de negocio
│   ├── authController.js
│   ├── reportController.js
│   ├── alertController.js
│   └── newsController.js
├── middleware/       # Middleware personalizado
│   ├── auth.js
│   ├── validation.js
│   ├── errorHandler.js
│   └── upload.js
├── models/          # Modelos de MongoDB
│   ├── User.js
│   ├── Report.js
│   ├── Alert.js
│   └── News.js
├── routes/          # Definición de rutas
│   ├── auth.js
│   ├── reports.js
│   ├── alerts.js
│   └── news.js
├── utils/           # Utilidades
│   ├── responseHandler.js
│   └── logger.js
├── uploads/         # Archivos subidos
├── .env.example     # Variables de entorno ejemplo
├── .gitignore
├── package.json
└── server.js        # Punto de entrada
```

## 🔧 Instalación

1. **Navegar al directorio backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

4. **Editar el archivo `.env` con tus configuraciones:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/amber
   JWT_SECRET=tu_clave_secreta_aqui
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   ```

## 🏃‍♂️ Ejecutar el Servidor

**Modo desarrollo (con nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 📡 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/profile` | Obtener perfil | Sí |
| PUT | `/profile` | Actualizar perfil | Sí |
| PUT | `/password` | Cambiar contraseña | Sí |

### Reportes (`/api/reports`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/` | Obtener todos los reportes | No |
| GET | `/:id` | Obtener reporte por ID | No |
| POST | `/` | Crear reporte | Sí |
| PUT | `/:id` | Actualizar reporte | Sí (Owner/Admin) |
| DELETE | `/:id` | Eliminar reporte | Sí (Owner/Admin) |
| PATCH | `/:id/status` | Actualizar estado | Sí (Admin) |
| GET | `/user/my-reports` | Mis reportes | Sí |

### Alertas (`/api/alerts`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/` | Obtener alertas activas | No |
| GET | `/:id` | Obtener alerta por ID | No |
| POST | `/` | Crear alerta | Sí (Admin) |
| PUT | `/:id` | Actualizar alerta | Sí (Admin) |
| DELETE | `/:id` | Eliminar alerta | Sí (Admin) |
| PATCH | `/:id/deactivate` | Desactivar alerta | Sí (Admin) |

### Noticias (`/api/news`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/` | Obtener noticias | No |
| GET | `/:id` | Obtener noticia por ID | No |
| POST | `/` | Crear noticia | Sí (Admin) |
| PUT | `/:id` | Actualizar noticia | Sí (Admin) |
| DELETE | `/:id` | Eliminar noticia | Sí (Admin) |

## 🔐 Autenticación

El API usa JWT (JSON Web Tokens) para autenticación. Para acceder a rutas protegidas:

1. Registrarse o iniciar sesión para obtener un token
2. Incluir el token en el header de las peticiones:
   ```
   Authorization: Bearer <tu_token>
   ```

## 📝 Ejemplo de Uso

### Registrar Usuario
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "phone": "+123456789"
}
```

### Crear Reporte
```bash
POST /api/reports
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "María García",
  "age": "25",
  "lastLocation": "Centro Comercial ABC",
  "description": "Complexión delgada, cabello negro largo",
  "clothing": "Blusa blanca, jeans azules",
  "circumstances": "Desapareció el día 10/12/2025",
  "contactPhone": "+123456789",
  "priority": "high",
  "photo": <archivo_imagen>
}
```

## 🗄️ Modelos de Datos

### User
- name, email, password (hashed)
- role (user/admin)
- profileImage, phone
- isActive, timestamps

### Report
- name, age, lastLocation
- description, clothing, circumstances
- photo, status, priority
- reportedBy, contactPhone/Email
- location (coordinates), views
- timestamps

### Alert
- title, message, type, priority
- relatedReport, image
- isActive, expiresAt
- createdBy, timestamps

### News
- title, content, summary
- image, author, tags, category
- isPublished, publishedAt
- relatedReport, views
- timestamps

## 🛠️ Características

- ✅ Autenticación JWT
- ✅ Validación de datos con express-validator
- ✅ Hash de contraseñas con bcryptjs
- ✅ Upload de imágenes con multer
- ✅ Manejo centralizado de errores
- ✅ Paginación en listados
- ✅ Búsqueda de texto completo
- ✅ Índices geoespaciales para ubicaciones
- ✅ Sistema de roles (User/Admin)
- ✅ CORS habilitado
- ✅ Logging de errores

## 📄 Licencia

ISC
