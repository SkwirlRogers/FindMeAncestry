# FindMeAncestry Production Launch Notes

## Mission
Launch the application as a production-ready monetized product with server-side verification, secure session management, premium access gating, and a clean Fly.io deployment model.

## Product State
- Auth and session management implemented
- User profile sync implemented
- Premium status logic implemented
- Payment verification flow implemented
- Upgrade UI and premium gating added
- Production plans seeded:
  - demo
  - forensic_explorer
  - advocate
  - investigator

## Production Rules
- The backend is the only source of truth for subscription activation.
- Premium access must never be granted by the client alone.
- Payment receipts must be verified server-side.
- Frontend reflects user plan state returned by /api/user/me.
- Premium gates must check verified entitlement before unlocking features.

## Production Environment Variables
APP_ENV=production
DATABASE_URL=postgres://user:password@host:5432/dbname
SESSION_SECRET=replace-with-strong-random-secret
JWT_SECRET=replace-with-strong-random-secret
FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

GOOGLE_PLAY_PACKAGE_NAME=com.findmeancestry.app
GOOGLE_PLAY_API_KEY=your-google-play-api-key
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
APPLE_SHARED_SECRET=your-apple-shared-secret
APPLE_VERIFY_URL=https://buy.itunes.apple.com/verifyReceipt
APPLE_PAY_MERCHANT_ID=your-apple-merchant-id
APPLE_PAY_CERTIFICATE=your-apple-pay-certificate
GOOGLE_PAY_MERCHANT_ID=your-google-pay-merchant-id
GOOGLE_PAY_API_KEY=your-google-pay-api-key
KLARNA_API_KEY=your-klarna-api-key

SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=lax
RATE_LIMITER_ENABLED=true
AUDIT_LOG_ENABLED=true
LOG_LEVEL=info

## Fly.io Deployment Architecture
Recommended production layout:
- findmeancestry-api
- findmeancestry-web
- findmeancestry-db

## Backend Fly.io Configuration
### api/Dockerfile
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
```

### api/fly.toml
```toml
app = "findmeancestry-api"
primary_region = "iad"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 1024
```

### api/.dockerignore
```gitignore
node_modules
npm-debug.log
.env
.env.*
.git
.gitignore
dist
coverage
```

## Frontend Fly.io Configuration
### web/Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### web/fly.toml
```toml
app = "findmeancestry-web"
primary_region = "iad"

[http_service]
  internal_port = 80
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512
```

### web/nginx.conf
```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri /index.html;
  }

  location /api {
    proxy_pass http://findmeancestry-api.internal:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## Fly.io Secrets Setup
```bash
flyctl secrets set \
  APP_ENV=production \
  DATABASE_URL="postgres://..." \
  SESSION_SECRET="your-secret" \
  JWT_SECRET="your-secret" \
  FRONTEND_URL="https://findmeancestry-web.fly.dev" \
  API_BASE_URL="https://findmeancestry-api.fly.dev" \
  CORS_ALLOWED_ORIGINS="https://findmeancestry-web.fly.dev" \
  GOOGLE_PLAY_PACKAGE_NAME="com.findmeancestry.app" \
  GOOGLE_PLAY_API_KEY="..." \
  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' \
  APPLE_SHARED_SECRET="..." \
  APPLE_VERIFY_URL="https://buy.itunes.apple.com/verifyReceipt" \
  APPLE_PAY_MERCHANT_ID="..." \
  APPLE_PAY_CERTIFICATE="..." \
  GOOGLE_PAY_MERCHANT_ID="..." \
  GOOGLE_PAY_API_KEY="..." \
  KLARNA_API_KEY="..." \
  SESSION_COOKIE_SECURE="true" \
  SESSION_COOKIE_HTTP_ONLY="true" \
  SESSION_COOKIE_SAME_SITE="lax" \
  RATE_LIMITER_ENABLED="true" \
  AUDIT_LOG_ENABLED="true" \
  LOG_LEVEL="info"
```

Frontend secrets:
```bash
flyctl secrets set \
  VITE_API_URL="https://findmeancestry-api.fly.dev"
```

## Fly.io Deployment Commands
Backend:
```bash
cd api
flyctl launch --name findmeancestry-api --region iad
flyctl deploy
```

Frontend:
```bash
cd web
flyctl launch --name findmeancestry-web --region iad
flyctl deploy
```

Database on Fly.io:
```bash
flyctl postgres create --name findmeancestry-db --region iad --vm-size shared-cpu-1x --volume-size 10
flyctl postgres attach findmeancestry-db --app findmeancestry-api
```

## Production Launch Checklist
- Env vars configured
- Database online
- Migrations applied
- Plans seeded
- Auth working
- Session working
- /api/user/me returns plan state
- /api/payments/verify validates purchase
- Premium UI works
- Premium gating works
- Sandbox tests pass
- Live provider mode enabled
- Monitoring active
- Rollback plan ready

## Rollback Plan
- Disable live payment provider mode
- Revert frontend to previous build
- Suspend premium upgrades
- Keep current active subscriptions intact
- Restore backend config and secrets
- Re-enable only after verification and validation

## Key Product Rules
- Backend is the source of truth.
- Payments are verified server-side.
- Premium access is granted only with verified entitlement.
- Frontend reflects plan state returned by the API.
- Never allow client-side purchase validation to grant access.

## War Room Status
Status: Production-ready deployment path locked in.
Target deployment model: Fly.io
Target setup: API app + web app + Postgres DB
Launch condition: provider sandbox validation passed, live secrets loaded, premium entitlement enforced server-side.
