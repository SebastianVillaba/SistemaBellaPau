import sql, {
  config as SqlConfig,
  ISqlType,
  IResult,
  ISqlTypeFactoryWithNoParams,
  ISqlTypeFactoryWithLength,
  ISqlTypeFactoryWithScale,
  ISqlTypeFactoryWithPrecisionScale,
} from "mssql";
import dotenv from "dotenv";
import path from "path";

// Cargar el archivo .env según el entorno (NODE_ENV)
const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

// Usar process.cwd() para obtener la raíz del proyecto (funciona en ESM y CommonJS)
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Mostrar a qué entorno y servidor se está conectando
const environment = process.env.NODE_ENV || 'development';
console.log(`🔧 Entorno: ${environment.toUpperCase()}`);
console.log(`🗄️  Conectando a DB Server: ${process.env.DB_SERVER || 'localhost'}`);

const config: SqlConfig = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "curcuma",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

console.log(process.env.DB_SERVER);
console.log(process.env.DB_NAME);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);


// Aceptar tanto instancias de tipo (ISqlType) como fábricas (sql.Int, sql.VarChar, etc.)
type SqlParamType =
  | ISqlType
  | ISqlTypeFactoryWithNoParams
  | ISqlTypeFactoryWithLength
  | ISqlTypeFactoryWithScale
  | ISqlTypeFactoryWithPrecisionScale;

interface InputParameter {
  name: string;
  type: SqlParamType;
  value: any;
}

interface OutputParameter {
  name: string;
  type: SqlParamType;
}

interface ExecuteRequestParams {
  query: string;
  inputs?: InputParameter[];
  outputs?: OutputParameter[];
  isStoredProcedure?: boolean;
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log("Conectado a la base de datos");
        return pool;
      })
      .catch((err) => {
        console.error("Error al conectar a la base de datos:", err);
        poolPromise = null; // Reset para permitir reintentos
        throw err;
      });
  }
  return poolPromise;
}

export async function executeRequest({
  query,
  inputs = [],
  outputs = [],
  isStoredProcedure = false,
}: ExecuteRequestParams): Promise<IResult<any>> {
  //console.log("Parámetros enviados al SP:", inputs); <--  PARA VER QUE INPUTS ESTOY ENVIANDO
  try {
    const pool = await getPool();
    const request = pool.request();

    // Agregar parámetros de entrada
    inputs.forEach(({ name, type, value }) => {
      request.input(name, type, value);
    });

    // Agregar parámetros de salida
    outputs.forEach(({ name, type }) => {
      request.output(name, type);
    });

    const result = isStoredProcedure
      ? await request.execute(query)
      : await request.query(query);

    return result;
  } catch (error) {
    console.error("Error en executeRequest:", error);
    throw error;
  }
}

export { sql };
