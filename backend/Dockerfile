
# Use the exact Node.js version as local environment
FROM node:20.18.2

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (Leverage Docker layer caching)
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install 

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Set environment variables for production
ENV NODE_ENV=production

# Start the application directly (avoid using nodemon in production)
CMD ["npm", "start"]
