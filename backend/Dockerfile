# Duka AI Backend — production Docker image
# ------------------------------------------------------------------
# Works on any VPS with Docker installed (DigitalOcean, Linode, a bare
# Ubuntu box, etc.), and can also be used on Render/Railway instead of
# their auto-detected buildpacks if you ever want more control.
#
# Build:  docker build -t duka-ai-backend .
# Run:    docker run -p 3000:3000 --env-file .env duka-ai-backend
# ------------------------------------------------------------------

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (separate layer, so `npm install` only
# re-runs when package.json actually changes, not on every code edit)
COPY package*.json ./
RUN npm install --omit=dev

# Now copy the actual application code
COPY . .

EXPOSE 3000

# Basic container-level health check, mirrors the app's own /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "start"]
