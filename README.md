# Sistema de Reserva de Citas Medicas

Sistema completo de gestion de citas medicas con API REST (FastAPI) y frontend web, incluyendo pruebas E2E automatizadas.

## Estructura del Proyecto

```
Parcial-III/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── tests/
│   ├── e2e/
│   │   ├── 01-flujo-completo.spec.js
│   │   ├── 02-validaciones.spec.js
│   │   ├── 03-horarios-ocupados.spec.js
│   │   └── 04-cancelacion.spec.js
│   ├── package.json
│   └── playwright.config.js
├── .github/
│   └── workflows/
│       └── test.yml
├── CASOS_PRUEBA.md
└── README.md
```

## Caracteristicas

### Backend (FastAPI)
- Registro de pacientes con validacion de email y telefono
- Creacion de citas medicas con validacion de solapamiento de horarios
- Listado de citas activas
- Cancelacion de citas
- Base de datos SQLite

### Frontend (HTML/CSS/JavaScript)
- Formulario de registro de pacientes
- Formulario de agendamiento de citas
- Vista de citas agendadas
- Funcionalidad de cancelacion de citas

### Pruebas E2E (Playwright)
- Flujo completo de registro y agendamiento
- Validacion de datos incorrectos
- Validacion de horarios ocupados
- Pruebas de cancelacion
- Tecnicas aplicadas: particiones de equivalencia, valores limite, datos validos e invalidos

## Instalacion y Ejecucion

### 1. Instalar dependencias del backend

```powershell
cd backend
pip install -r requirements.txt
```

### 2. Iniciar el servidor FastAPI

```powershell
python main.py
```

El servidor estara disponible en `http://localhost:8000`

### 3. Abrir el frontend

Abrir el archivo `frontend/index.html` en un navegador web, o usar Live Server.

### 4. Instalar dependencias de pruebas

```powershell
cd tests
npm install
npx playwright install chromium
```

### 5. Ejecutar pruebas E2E

```powershell
npm test
```

## Endpoints de la API

### Pacientes
- `POST /pacientes` - Registrar nuevo paciente
- `GET /pacientes` - Listar todos los pacientes

### Citas
- `POST /citas` - Crear nueva cita
- `GET /citas` - Listar citas activas
- `DELETE /citas/{id}` - Cancelar cita

## GitHub Actions

El proyecto incluye un workflow de CI/CD que:
1. Instala dependencias
2. Inicia el servidor FastAPI
3. Ejecuta todas las pruebas E2E
4. Imprime "OK" si todas las pruebas pasan
5. Guarda reportes de Playwright

## Validaciones Implementadas

- Email con formato correcto
- Telefono minimo 8 digitos
- Campos obligatorios no vacios
- No solapamiento de horarios para el mismo doctor
- Email unico por paciente

## Tecnologias

- **Backend**: Python, FastAPI, SQLite, Pydantic
- **Frontend**: HTML5, CSS3, JavaScript
- **Testing**: Playwright, Node.js
- **CI/CD**: GitHub Actions
