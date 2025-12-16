# ALARMBER Design System

> Sistema de diseño unificado para la aplicación de alertas y emergencias ALARMBER.
> El diseño transmite urgencia, seguridad y confianza.

---

## 🎨 Paleta de Colores

### Colores Primarios
| Color | Hex | Uso |
|-------|-----|-----|
| 🔴 Rojo Principal | `#D32F2F` | Alertas, CTAs, acciones críticas |
| 🔴 Rojo Oscuro | `#B71C1C` | Gradientes, énfasis |
| ⚫ Negro | `#121212` | Fondo gradiente, contraste |

### Colores Secundarios
| Color | Hex | Uso |
|-------|-----|-----|
| 🔵 Azul | `#1976D2` | Información, usuario autenticado |
| 🟢 Verde | `#4CAF50` | Éxito, validado, en línea |
| 🟠 Naranja | `#FF9800` | Advertencias, en búsqueda |

### Grises
```
Gray 50:  #FAFAFA  (fondos muy claros)
Gray 100: #F5F5F5  (fondo de app)
Gray 200: #EEEEEE  (bordes, cards)
Gray 400: #BDBDBD  (iconos inactivos)
Gray 600: #757575  (texto secundario)
Gray 900: #212121  (texto principal)
```

---

## 🌈 Gradientes

### Gradiente Oficial
```javascript
['#D32F2F', '#B71C1C', '#121212']
```
**Uso:** Login, Welcome, Headers principales

### Gradiente Header
```javascript
['#D32F2F', '#C62828']
```
**Uso:** Headers de sección, barras superiores

---

## 📝 Tipografía

| Estilo | Tamaño | Peso | Uso |
|--------|--------|------|-----|
| Display | 32px | 900 | Títulos principales |
| H1 | 28px | 900 | Nombres, títulos |
| H2 | 24px | 700 | Subtítulos |
| H3 | 20px | 700 | Secciones |
| Body Large | 16px | 400 | Texto principal |
| Body Medium | 14px | 400 | Descripciones |
| Caption | 11px | 600 | Badges, etiquetas |

---

## 🏷️ Estados de Reporte

| Estado | Fondo | Texto | Borde |
|--------|-------|-------|-------|
| **Activo** | `#FFEBEE` | `#D32F2F` | `#FFCDD2` |
| **En Búsqueda** | `#FFF3E0` | `#E65100` | `#FFE0B2` |
| **Resuelto** | `#E8F5E9` | `#2E7D32` | `#C8E6C9` |
| **Cerrado** | `#EEEEEE` | `#757575` | `#E0E0E0` |

---

## 👤 Estados de Actividad

| Estado | Punto | Texto |
|--------|-------|-------|
| 🟢 En línea | `#4CAF50` | `#4CAF50` |
| 🔘 Reciente | `#9E9E9E` | `#757575` |
| ⚪ Inactivo | `#BDBDBD` | `#9E9E9E` |

---

## 📦 Uso en Código

```javascript
import { theme, getStatusColors, getActivityColors } from '../constants/theme';

// Colores
const primaryColor = theme.colors.primary.main;

// Status badge
const statusColors = getStatusColors('active');

// Activity indicator
const activityColors = getActivityColors('online');

// Spacing
const padding = theme.spacing.lg; // 16

// Typography
const titleStyle = theme.typography.h1;

// Shadows
const cardShadow = theme.shadows.card;
```

---

## ⚠️ Reglas de Diseño

1. **Rojo solo para alertar** - No usar para decoración
2. **Legibilidad primero** - Texto oscuro sobre fondos claros
3. **Gradiente limitado** - Solo en Login/Headers
4. **Cards claras** - Fondos blancos con sombra suave
5. **Estados distintos** - Colores diferentes para cada estado
