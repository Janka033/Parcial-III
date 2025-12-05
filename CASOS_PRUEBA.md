# Documentacion de Casos de Prueba E2E

## Tecnicas de Seleccion de Datos Aplicadas

### 1. Particiones de Equivalencia

Se dividieron los datos de entrada en clases equivalentes para reducir el numero de casos de prueba manteniendo cobertura completa:

#### Validacion de Email
- **Clase valida**: Emails con formato correcto (ejemplo@dominio.com)
- **Clase invalida**: Emails sin @ o sin dominio (email-invalido)

#### Validacion de Telefono
- **Clase valida**: Numeros con 8 o mas digitos, pueden incluir +, espacios, guiones
- **Clase invalida**: Menos de 8 digitos (ejemplo: "123")

#### Campos Obligatorios
- **Clase valida**: Campos con contenido
- **Clase invalida**: Campos vacios o solo espacios

### 2. Valores Limite

Se probaron los extremos de los rangos validos:

- **Telefono minimo**: 8 digitos
- **Nombre minimo**: Al menos 1 caracter no vacio
- **Horarios**: Formato HH:MM (00:00 a 23:59)
- **Fechas**: Formato YYYY-MM-DD valido

### 3. Datos Validos e Invalidos

#### Datos Validos
- Emails unicos con formato correcto
- Telefonos con codigo de pais y formato internacional
- Fechas futuras en formato ISO
- Horarios en formato 24 horas

#### Datos Invalidos
- Emails duplicados
- Emails sin formato correcto
- Telefonos muy cortos
- Campos obligatorios vacios

## Casos de Prueba Implementados

### Test Suite 1: Flujo Completo (01-flujo-completo.spec.js)

**CP-01: Registro de paciente y agendamiento de cita exitoso**
- **Objetivo**: Verificar el flujo completo desde el registro hasta la confirmacion de cita
- **Tecnica**: Datos validos
- **Datos de prueba**: 
  - Nombre: "Juan Perez" + timestamp
  - Email: unico con timestamp
  - Telefono: +51987654321
  - Doctor: "Dr. Rodriguez"
  - Fecha: 2025-12-15
  - Hora: 10:00
- **Resultado esperado**: Paciente registrado y cita agendada correctamente

### Test Suite 2: Validaciones (02-validaciones.spec.js)

**CP-02: Validar email invalido**
- **Objetivo**: Verificar rechazo de emails con formato incorrecto
- **Tecnica**: Particion de equivalencia (clase invalida)
- **Datos de prueba**: "email-invalido" (sin @ ni dominio)
- **Resultado esperado**: Error de validacion

**CP-03: Validar campos vacios en registro**
- **Objetivo**: Verificar que campos obligatorios no acepten valores vacios
- **Tecnica**: Valores limite (limite inferior)
- **Datos de prueba**: Strings vacios en todos los campos
- **Resultado esperado**: Validacion HTML5 impide envio

**CP-04: Validar telefono invalido**
- **Objetivo**: Verificar rechazo de telefonos demasiado cortos
- **Tecnica**: Valores limite (por debajo del minimo)
- **Datos de prueba**: "123" (menos de 8 digitos)
- **Resultado esperado**: Error de validacion

**CP-05: Validar email duplicado**
- **Objetivo**: Verificar unicidad de emails en el sistema
- **Tecnica**: Datos invalidos (violacion de constraint)
- **Datos de prueba**: Mismo email usado dos veces
- **Resultado esperado**: Error indicando email ya registrado

**CP-06: Validar campos vacios en agendamiento**
- **Objetivo**: Verificar campos obligatorios en formulario de citas
- **Tecnica**: Valores limite
- **Datos de prueba**: Campos vacios
- **Resultado esperado**: Validacion HTML5 impide envio

### Test Suite 3: Horarios Ocupados (03-horarios-ocupados.spec.js)

**CP-07: Intento de agendar cita en horario ocupado**
- **Objetivo**: Verificar que no se solapen horarios para el mismo doctor
- **Tecnica**: Datos invalidos (conflicto de negocio)
- **Datos de prueba**: 
  - Dos pacientes diferentes
  - Mismo doctor, fecha y hora
- **Resultado esperado**: Segunda cita rechazada con mensaje de horario ocupado

**CP-08: Mismo paciente en diferente horario**
- **Objetivo**: Verificar que un paciente puede tener multiples citas
- **Tecnica**: Datos validos (caso positivo)
- **Datos de prueba**: Mismo paciente, mismo doctor, diferentes horas
- **Resultado esperado**: Ambas citas creadas exitosamente

**CP-09: Diferentes doctores en mismo horario**
- **Objetivo**: Verificar que doctores diferentes pueden tener citas simultaneas
- **Tecnica**: Particion de equivalencia
- **Datos de prueba**: 
  - Dos pacientes
  - Doctores diferentes
  - Mismo horario
- **Resultado esperado**: Ambas citas creadas exitosamente

### Test Suite 4: Cancelacion (04-cancelacion.spec.js)

**CP-10: Cancelar cita exitosamente**
- **Objetivo**: Verificar funcionalidad de cancelacion de citas
- **Tecnica**: Datos validos
- **Datos de prueba**: Cita existente y activa
- **Resultado esperado**: Cita eliminada de la lista de citas activas

**CP-11: Verificar cita cancelada no aparece en lista**
- **Objetivo**: Confirmar que citas canceladas no se muestran como disponibles
- **Tecnica**: Validacion de estado
- **Datos de prueba**: Cita recien cancelada
- **Resultado esperado**: Cita no visible en lista de citas activas

## Justificacion de Casos Seleccionados

1. **Cobertura completa del flujo**: Se cubre desde el registro hasta la cancelacion
2. **Validaciones criticas**: Email, telefono y campos obligatorios son fundamentales
3. **Reglas de negocio**: El no solapamiento de horarios es la regla mas importante
4. **Casos limite**: Se prueban valores minimos y formatos incorrectos
5. **Casos positivos y negativos**: Balance entre caminos felices y manejo de errores

## Estrategia de Datos de Prueba

- **Timestamps**: Se usan para garantizar unicidad de emails en cada ejecucion
- **Datos realistas**: Formatos de telefono, nombres y emails verosimiles
- **Fechas futuras**: Se usan fechas posteriores a la ejecucion para evitar conflictos
- **Limpieza implicita**: Cada test usa datos unicos evitando necesidad de limpieza

## Herramientas Utilizadas

- **Playwright**: Framework de pruebas E2E
- **JavaScript**: Lenguaje para escribir los tests
- **Chromium**: Navegador para ejecutar las pruebas
- **GitHub Actions**: CI/CD para ejecucion automatica
