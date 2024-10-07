# FROM node:14

# WORKDIR /app
# COPY package.json /app
# RUN npm install --save react-scripts
# COPY . /app
# EXPOSE 3000
# CMD ["npm", "start"]

# Use the official Node.js image for the frontend
FROM node:14

# Set working directory inside the container
WORKDIR /app

# Copy only the package.json and package-lock.json first
# This allows Docker to cache the npm install step if these files haven't changed
COPY package.json /app
#COPY package-lock.json /app

# Install dependencies
RUN npm install --save react-scripts

# Copy the rest of the application code
COPY . /app

# Expose the port that the React app runs on
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
