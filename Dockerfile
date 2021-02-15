FROM node:lts

WORKDIR /usr/src/app

# Install program dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Run the program
CMD ["node", "index.js"]
