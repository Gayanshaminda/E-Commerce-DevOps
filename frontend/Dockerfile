# Node.js image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json 
COPY package.json package-lock.json ./

# Install dependencies 
RUN npm install 

# Copy the application code
COPY . .

# Expose the port 
EXPOSE 5173

# Set environment variables for production
ENV NODE_ENV=production

# Build the frontend with increased heap size
RUN NODE_OPTIONS="--max-old-space-size=1536" npm run build

# Start the frontend 
CMD ["npm", "run", "preview"]