# Frontend: Vite + React dev server
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json ./
COPY package-lock.json* ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Bind to 0.0.0.0 so the dev server is reachable from the host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
