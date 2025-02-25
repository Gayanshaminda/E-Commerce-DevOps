# Use a lightweight Node.js image
FROM node:20.18.2

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (Leverage Docker layer caching)
COPY package.json package-lock.json ./

# Install dependencies (omit dev dependencies if not needed)
RUN npm install 

# Copy the rest of the application code
COPY . .

# Expose the port Vite runs on (default is 5173 for preview mode)
EXPOSE 5173

# Set environment variables for production
ENV NODE_ENV=production

# Build the frontend
RUN npm run build

# Start the frontend using Vite's built-in preview server
CMD ["npm", "run", "preview"]
