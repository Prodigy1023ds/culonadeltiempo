FROM node:24-alpine

# Create app directory
WORKDIR /app

# Install app dependencies (production only)
COPY package.json package-lock.json* ./
RUN npm install --production --silent || true

# Bundle app source
COPY . ./

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
