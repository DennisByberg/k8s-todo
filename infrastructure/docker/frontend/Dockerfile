# Use official Node.js runtime as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY frontend/ .

# Expose port 3000
EXPOSE 3000

# Run Next.js development server
CMD ["npm", "run", "dev"]