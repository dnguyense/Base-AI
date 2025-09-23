import dotenv from 'dotenv';
import path from 'path';

type NodeEnv = 'development' | 'production' | 'test';

const detectedEnv = (process.env.NODE_ENV as NodeEnv | undefined) || 'development';

if (detectedEnv === 'test') {
  dotenv.config({ path: path.join(__dirname, '../../.env.test') });
} else {
  dotenv.config();
}

type GetEnvOptions = {
  defaultValue?: string;
  required?: boolean;
  requiredInProduction?: boolean;
  sanitize?: (value: string) => string;
};

const missingVariables: string[] = [];

const getEnv = (key: string, options: GetEnvOptions = {}): string => {
  const rawValue = process.env[key];
  const hasValue = typeof rawValue === 'string' && rawValue.trim() !== '';

  if (hasValue) {
    return options.sanitize ? options.sanitize(rawValue!) : rawValue!;
  }

  if (options.defaultValue !== undefined && detectedEnv !== 'production') {
    return options.defaultValue;
  }

  const mustExist = options.required || (options.requiredInProduction && detectedEnv === 'production');
  if (mustExist) {
    missingVariables.push(key);
  }

  return '';
};

const toNumber = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: detectedEnv,
  isProduction: detectedEnv === 'production',
  isTest: detectedEnv === 'test',
  app: {
    port: toNumber(getEnv('PORT', { defaultValue: detectedEnv === 'production' ? '8000' : '5000' }), detectedEnv === 'production' ? 8000 : 5000),
    clientUrl: getEnv('CLIENT_URL', {
      defaultValue: 'http://localhost:3000',
      requiredInProduction: true,
    }),
    corsOrigin: getEnv('FRONTEND_URL', {
      defaultValue: 'http://localhost:3000',
      requiredInProduction: true,
    }),
  },
  database: {
    url: getEnv('DATABASE_URL'),
    host: getEnv('DB_HOST', { defaultValue: 'localhost', requiredInProduction: true }),
    port: toNumber(getEnv('DB_PORT', { defaultValue: '5432' }), 5432),
    name: getEnv('DB_NAME', { defaultValue: 'pdf_compressor_pro', requiredInProduction: true }),
    user: getEnv('DB_USER', { defaultValue: 'postgres', requiredInProduction: true }),
    password: getEnv('DB_PASSWORD', { requiredInProduction: true }),
  },
  jwt: {
    secret: getEnv('JWT_SECRET', { required: true }),
    expiresIn: getEnv('JWT_EXPIRES_IN', { defaultValue: '24h' }),
    refreshSecret: getEnv('JWT_REFRESH_SECRET', { required: true }),
    refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', { defaultValue: '7d' }),
  },
  email: {
    host: getEnv('EMAIL_HOST', { defaultValue: 'smtp.gmail.com', requiredInProduction: true }),
    port: toNumber(getEnv('EMAIL_PORT', { defaultValue: '587' }), 587),
    user: getEnv('EMAIL_USER', { requiredInProduction: true }),
    pass: getEnv('EMAIL_PASS', { requiredInProduction: true }),
    from: getEnv('EMAIL_FROM', { defaultValue: 'noreply@pdfcompressor.pro', requiredInProduction: true }),
  },
  stripe: {
    secretKey: getEnv('STRIPE_SECRET_KEY', { requiredInProduction: true }),
    webhookSecret: getEnv('STRIPE_WEBHOOK_SECRET', { requiredInProduction: true }),
    priceIds: {
      basicMonthly: getEnv('STRIPE_BASIC_MONTHLY_PRICE_ID'),
      basicYearly: getEnv('STRIPE_BASIC_YEARLY_PRICE_ID'),
      proMonthly: getEnv('STRIPE_PRO_MONTHLY_PRICE_ID'),
      proYearly: getEnv('STRIPE_PRO_YEARLY_PRICE_ID'),
      enterpriseMonthly: getEnv('STRIPE_ENTERPRISE_MONTHLY_PRICE_ID'),
      enterpriseYearly: getEnv('STRIPE_ENTERPRISE_YEARLY_PRICE_ID'),
    },
  },
  rateLimit: {
    windowMs: toNumber(getEnv('RATE_LIMIT_WINDOW', { defaultValue: '900000' }), 15 * 60 * 1000),
    max: toNumber(getEnv('RATE_LIMIT_MAX', { defaultValue: '1000' }), 1000),
  },
  logging: {
    level: getEnv('LOG_LEVEL', { defaultValue: 'info' }),
  },
};

if (missingVariables.length > 0) {
  console.error('\n❌ Missing required environment variables:', missingVariables.join(', '));
  console.error('Set them in your environment or corresponding .env file before starting the server.');
  process.exit(1);
}

const isWeakSecret = (secret: string): boolean => {
  if (!secret) return true;
  const normalized = secret.toLowerCase();
  const blacklist = ['test', 'secret', 'changeme', 'default'];
  return secret.length < 32 || blacklist.some(term => normalized.includes(term));
};

const secretChecks = [
  { key: 'JWT_SECRET', value: env.jwt.secret },
  { key: 'JWT_REFRESH_SECRET', value: env.jwt.refreshSecret },
];

secretChecks.forEach(({ key, value }) => {
  if (env.isProduction && isWeakSecret(value)) {
    console.error(`\n❌ ${key} must be at least 32 characters and not use common placeholder values.`);
    process.exit(1);
  }

  if (!env.isProduction && !env.isTest && isWeakSecret(value)) {
    console.warn(`⚠️  ${key} appears weak. Use at least 32 characters with mixed complexity before deploying.`);
  }
});

export type AppConfig = typeof env;
