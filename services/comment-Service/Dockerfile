# Use official Node.js LTS image (alpine for smaller size)
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the service port
EXPOSE 4002

# Start the service
CMD ["npm", "start"]
