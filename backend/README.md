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

## 🔧 Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

### 3. Configurar MongoDB Atlas (Recomendado para Producción)

#### Crear Cluster en MongoDB Atlas:

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Crea una cuenta (gratuita) o inicia sesión
3. Crea un nuevo cluster (tier M0 es gratuito)
4. Espera a que el cluster se inicialice (~5 minutos)

#### Configurar Database Access:

1. **Database Access** → **+ ADD NEW DATABASE USER**
2. Configura:
   - Username: `alarmber-admin` (o el nombre que prefieras)
   - Password: Genera una contraseña segura (sin caracteres especiales para evitar problemas)
   - Database User Privileges: **"Read and write to any database"**
3. Click **"Add User"**

#### Configurar Network Access:

1. **Network Access** → **+ ADD IP ADDRESS**
2. Para desarrollo: Click **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
   - ⚠️ Para producción: Especifica IPs específicas de tu servidor
3. Click **"Confirm"**

#### Obtener Connection String:

1. **Clusters** → **Connect** (botón en tu cluster)
2. Selecciona **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copia el connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
5. Modifica el string:
   - Reemplaza `<username>` con tu usuario
   - Reemplaza `<password>` con tu contraseña
   - Agrega `/alarmber` antes del `?` para especificar la base de datos

Ejemplo final:
```
mongodb+srv://alarmber-admin:MyPass123@alarmber.abc123.mongodb.net/alarmber?retryWrites=true&w=majority
```

### 4. Configurar archivo `.env`

**Mínima configuración requerida:**

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://alarmber-admin:YOUR_PASSWORD@alarmber.xxxxx.mongodb.net/alarmber?retryWrites=true&w=majority

# JWT Secret (genera uno seguro)
JWT_SECRET=<generar con comando abajo>

# Server
PORT=5000
NODE_ENV=development
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> ⚠️ **IMPORTANTE:** Si tu password contiene caracteres especiales (#, @, %, etc.), debes URL-encodearlos:
> - `#` → `%23`
> - `@` → `%40`
> - `%` → `%25`

## 🏃‍♂️ Ejecutar el Servidor

**Modo desarrollo (con nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

### ✅ Conexión Exitosa

Si todo está configurado correctamente, verás:

```
[timestamp] INFO: 🔍 Validating environment variables...
[timestamp] INFO: ✅ Environment variables validated
[timestamp] INFO: 🔌 Connecting to MongoDB...
[timestamp] INFO: ✅ MongoDB Connected Successfully
[timestamp] INFO: 📡 Host: alarmber.xxxxx.mongodb.net
[timestamp] INFO: 📊 Database: alarmber
[timestamp] INFO: 🌿 Mongoose v9.0.1
[timestamp] INFO: ═══════════════════════════════════════
[timestamp] INFO: 🚀 Server running successfully
[timestamp] INFO: 📍 Environment: development
[timestamp] INFO: 📡 HTTP Server: http://localhost:5000
[timestamp] INFO: 📱 Mobile access: http://192.168.0.3:5000
[timestamp] INFO: 🔌 WebSocket: ws://localhost:5001
[timestamp] INFO: ═══════════════════════════════════════
```

### ❌ Errores Comunes

**"MONGODB_URI is not defined"**
- Verifica que tu archivo `.env` existe y contiene `MONGODB_URI`
- Asegúrate de estar en el directorio `backend/`

**"bad auth: authentication failed"**
- Verifica username y password en el connection string
- Si la password tiene caracteres especiales, URL-encódealos

**"IP not whitelisted"**
- Ve a MongoDB Atlas → Network Access
- Agrega tu IP actual o permite 0.0.0.0/0 para desarrollo

**"Invalid scheme"**
- Verifica que el connection string empiece con `mongodb+srv://`
- No uses comillas alrededor de la URI en `.env`

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
