/**
 * Tipos comunes utilizados en todo el framework Pubflow
 */

/**
 * Tipo de usuario genérico
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  userType: string;
  [key: string]: any;
}

/**
 * Configuración de instancia de Pubflow
 */
export interface PubflowInstanceConfig {
  /** Identificador único para esta instancia */
  id: string;
  
  /** URL base para la API */
  baseUrl: string;
  
  /** Ruta base personalizada para la API Bridge (predeterminado: '/bridge') */
  bridgeBasePath?: string;
  
  /** Ruta base personalizada para la API Auth (predeterminado: '/auth') */
  authBasePath?: string;
  
  /** Tiempo de espera predeterminado para solicitudes API en milisegundos */
  timeout?: number;
  
  /** Si se debe usar almacenamiento seguro para tokens de sesión (si está disponible) */
  useSecureStorage?: boolean;
  
  /** Configuración de sesión */
  sessionConfig?: SessionConfig;
  
  /** Configuración de almacenamiento */
  storageConfig?: StorageConfig;
  
  /** Cabeceras personalizadas para incluir en todas las solicitudes API */
  headers?: Record<string, string>;
}

/**
 * Configuración de sesión
 */
export interface SessionConfig {
  /** Intervalo de validación de sesión en milisegundos */
  validationInterval?: number;
  
  /** Endpoint personalizado para validación de sesión */
  validationEndpoint?: string;
  
  /** Si se debe validar automáticamente la sesión */
  autoValidate?: boolean;
  
  /** Si se debe validar la sesión al iniciar la aplicación */
  validateOnStartup?: boolean;
  
  /** Si se debe validar la sesión antes de solicitudes importantes */
  validateBeforeRequests?: boolean;
  
  /** Umbral para renovar la sesión (en milisegundos antes de expirar) */
  refreshThreshold?: number;
  
  /** Callback cuando la sesión expira */
  onSessionExpired?: () => void;
  
  /** Callback cuando la sesión se renueva */
  onSessionRefreshed?: () => void;
}

/**
 * Configuración de almacenamiento
 */
export interface StorageConfig {
  /** Prefijo para claves de almacenamiento */
  prefix?: string;
  
  /** Nombre personalizado para la clave de sesión */
  sessionKey?: string;
}

/**
 * Resultado de operación genérico
 */
export interface OperationResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Metadatos de paginación
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

/**
 * Opciones de ordenación
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
