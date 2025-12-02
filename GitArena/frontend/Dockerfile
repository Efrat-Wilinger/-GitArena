FROM node:20-alpine as builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ARG VITE_GITHUB_CLIENT_ID
ARG VITE_REDIRECT_URI

# Set as environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID
ENV VITE_REDIRECT_URI=$VITE_REDIRECT_URI

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
