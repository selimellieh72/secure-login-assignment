# Step 1: Use an official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (this caches dependencies)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Start the development server
# Using --host to make it accessible from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
