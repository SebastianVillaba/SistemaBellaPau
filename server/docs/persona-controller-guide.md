# Guía del Controller de Persona

## Descripción General

El controller `insertarPersona` permite registrar nuevas personas en el sistema. Una persona puede ser:
- **Persona Jurídica** (empresa) con opción de ser Proveedor
- **Persona Física** (individual)
- **Cliente** (tanto jurídica como física pueden ser clientes)

## Endpoint

```
POST /api/personas
```

## Estructura del Request Body

### Campos Obligatorios

```typescript
{
  "nombre": string,           // Nombre de la persona o empresa
  "idUsuarioAlta": number,    // ID del usuario que registra
  "tipoPersonaJur": boolean,  // true si es empresa
  "tipoPersonaFis": boolean,  // true si es persona individual
  "tipoPersonaCli": boolean,  // true si es cliente
  "tipoProveedor": boolean    // true si es proveedor (solo para jurídicas)
}
```

### Campos Opcionales

```typescript
{
  "ruc": string,                    // Registro Único de Contribuyente
  "dv": string,                     // Dígito verificador
  "direccion": string,              // Dirección física
  "ciudad": string,                 // Ciudad
  "telefono": string,               // Teléfono fijo
  "celular": string,                // Celular
  "email": string,                  // Email
  "fechaNacimiento": string,        // Formato: DD/MM/YYYY
  "nombreFantasia": string,         // Nombre comercial (requerido si tipoPersonaJur=true)
  "apellido": string,               // Apellido (requerido si tipoPersonaFis=true)
  "codigo": number,                 // Código de cliente (0 = auto-generar)
  "responsableProveedor": string,   // Responsable del proveedor
  "timbrado": string                // Timbrado fiscal
}
```

## Ejemplos de Uso

### Ejemplo 1: Registrar una Persona Física como Cliente

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "ruc": "1234567-8",
  "dv": "9",
  "direccion": "Av. Principal 123",
  "ciudad": "Asunción",
  "telefono": "021-123456",
  "celular": "0981-234567",
  "email": "juan.perez@email.com",
  "fechaNacimiento": "15/05/1985",
  "idUsuarioAlta": 1,
  "codigo": 0,
  "tipoPersonaJur": false,
  "tipoProveedor": false,
  "tipoPersonaFis": true,
  "tipoPersonaCli": true
}
```

### Ejemplo 2: Registrar una Empresa como Proveedor

```json
{
  "nombre": "Distribuidora ABC S.A.",
  "nombreFantasia": "ABC Distribuidora",
  "ruc": "80012345-6",
  "dv": "7",
  "direccion": "Zona Industrial, Lote 45",
  "ciudad": "Asunción",
  "telefono": "021-987654",
  "email": "contacto@abc.com.py",
  "idUsuarioAlta": 1,
  "responsableProveedor": "María González",
  "timbrado": "12345678",
  "tipoPersonaJur": true,
  "tipoProveedor": true,
  "tipoPersonaFis": false,
  "tipoPersonaCli": false
}
```

### Ejemplo 3: Registrar una Empresa como Cliente

```json
{
  "nombre": "Restaurante El Buen Sabor S.R.L.",
  "nombreFantasia": "El Buen Sabor",
  "ruc": "80098765-4",
  "dv": "3",
  "direccion": "Calle Comercial 789",
  "ciudad": "Asunción",
  "telefono": "021-555666",
  "celular": "0985-777888",
  "email": "info@buensabor.com.py",
  "idUsuarioAlta": 1,
  "codigo": 100,
  "tipoPersonaJur": true,
  "tipoProveedor": false,
  "tipoPersonaFis": false,
  "tipoPersonaCli": true
}
```

## Respuestas

### Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "message": "Persona insertada exitosamente",
  "rowsAffected": 1
}
```

### Errores de Validación (400 Bad Request)

#### Campos obligatorios faltantes
```json
{
  "success": false,
  "message": "Los campos 'nombre' e 'idUsuarioAlta' son obligatorios"
}
```

#### RUC duplicado
```json
{
  "success": false,
  "message": "El RUC ingresado ya existe con otra persona!"
}
```

#### Código de cliente duplicado
```json
{
  "success": false,
  "message": "El Codigo Ingresado ya existe con otra persona!"
}
```

#### Tipo de persona no especificado
```json
{
  "success": false,
  "message": "Debe especificar al menos un tipo de persona (Jurídica o Física)"
}
```

#### Persona Jurídica sin nombre de fantasía
```json
{
  "success": false,
  "message": "Las Personas Jurídicas requieren 'nombreFantasia'"
}
```

#### Persona Física sin apellido
```json
{
  "success": false,
  "message": "Las Personas Físicas requieren 'apellido'"
}
```

### Error del Servidor (500 Internal Server Error)

```json
{
  "success": false,
  "message": "Error al insertar la persona en el servidor",
  "error": "Descripción del error técnico"
}
```

## Reglas de Negocio

1. **RUC único**: No se permite duplicar el RUC si ya existe en el sistema (excepto RUC vacío o null)

2. **Código de cliente**: 
   - Si se envía `codigo: 0`, el sistema genera automáticamente el siguiente código disponible
   - Si se envía un código específico, debe ser único en el sistema

3. **Tipos de persona**:
   - Una persona puede ser Jurídica O Física (o ambas, aunque no es común)
   - Solo las Personas Jurídicas pueden ser Proveedores
   - Tanto Jurídicas como Físicas pueden ser Clientes

4. **Transaccionalidad**: 
   - Si alguna inserción falla, se revierten TODAS las operaciones (rollback)
   - Esto garantiza la integridad de los datos

5. **Fecha de nacimiento**: 
   - Formato esperado: DD/MM/YYYY (ejemplo: 25/12/1990)
   - Es opcional

## Flujo de Datos en la Base de Datos

Cuando se ejecuta el stored procedure `sp_insertarPersona`, se realizan las siguientes inserciones:

1. **Siempre**: Tabla `persona` (registro base)

2. **Si tipoPersonaJur = true**: 
   - Tabla `personaJur`
   - Si además `tipoProveedor = true`: Tabla `proveedor`

3. **Si tipoPersonaFis = true**: 
   - Tabla `personaFis`

4. **Si tipoPersonaCli = true**: 
   - Tabla `cliente`

## Notas para Desarrolladores

### Sobre TypeScript

- **Interfaces**: Se definen `InsertarPersonaRequest` e `InsertarPersonaResponse` para tipar correctamente los datos
- **Type Safety**: El uso de `as any` en los inputs es necesario debido a limitaciones de los tipos de `mssql`
- **Async/Await**: El controller es asíncrono y maneja promesas correctamente

### Sobre el Manejo de Errores

- Los errores 50000 y 50001 son errores personalizados del stored procedure
- Otros errores se consideran errores del servidor
- Todos los errores se registran en consola para debugging

### Próximos Pasos

Para usar este controller, necesitas:

1. Crear la ruta en el archivo de rutas (ejemplo: `routes/persona.routes.ts`)
2. Registrar la ruta en el servidor principal
3. Asegurarte de que el stored procedure `sp_insertarPersona` exista en la base de datos

Ejemplo de ruta:

```typescript
import express from 'express';
import { insertarPersona } from '../controllers/persona.controller';

const router = express.Router();

router.post('/personas', insertarPersona);

export default router;
```
