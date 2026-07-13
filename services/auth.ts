// Autenticación con Google (Google Identity Services), restringida por dominio.
// La app es 100% cliente, así que solo se usa el CLIENT ID (público, no secreto).
// El flujo devuelve un JWT (ID token) que decodificamos y validamos por dominio.

export interface AuthSession {
  email: string;
  name: string;
  picture: string;
  exp: number; // epoch en segundos (del ID token)
}

const SESSION_KEY = 'ZEBRA_AUTH';

// Client ID de Google. En build se deja un placeholder que el docker-entrypoint
// sustituye con GOOGLE_CLIENT_ID del entorno; si no, cae a localStorage.
export const getGoogleClientId = (): string => {
  const fromEnv = process.env.GOOGLE_CLIENT_ID;
  const envId = fromEnv && !fromEnv.includes('__RUNTIME') ? fromEnv : null;
  return (
    envId ||
    (typeof window !== 'undefined' ? localStorage.getItem('GOOGLE_CLIENT_ID') : null) ||
    ''
  );
};

// Dominio permitido. Por defecto zebradigital.marketing; overridable por localStorage.
export const allowedDomain = (): string =>
  (typeof window !== 'undefined' ? localStorage.getItem('GOOGLE_ALLOWED_DOMAIN') : null) ||
  'zebradigital.marketing';

const decodeJwt = (token: string): any => {
  const payload = token.split('.')[1];
  const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(b64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
};

// Valida el ID token de Google y devuelve la sesión, o lanza un error legible.
export const verifyCredential = (credential: string): AuthSession => {
  let payload: any;
  try {
    payload = decodeJwt(credential);
  } catch {
    throw new Error('No pudimos leer tu identidad de Google. Inténtalo de nuevo.');
  }

  const email = String(payload.email || '').toLowerCase();
  const domain = allowedDomain().toLowerCase();
  const emailOk = email.endsWith('@' + domain);
  const hdOk = String(payload.hd || '').toLowerCase() === domain;

  if (!emailOk && !hdOk) {
    throw new Error(`Acceso restringido: usa tu cuenta @${domain}.`);
  }
  if (payload.email_verified === false) {
    throw new Error('Tu correo de Google no está verificado.');
  }

  return {
    email,
    name: String(payload.name || email),
    picture: String(payload.picture || ''),
    exp: Number(payload.exp) || 0,
  };
};

export const getSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AuthSession;
    if (!s.exp || s.exp * 1000 <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    // Re-valida el dominio por si cambió la config.
    const domain = allowedDomain().toLowerCase();
    if (!s.email.endsWith('@' + domain)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
};

export const saveSession = (s: AuthSession): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* almacenamiento no disponible */
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* noop */
  }
};
