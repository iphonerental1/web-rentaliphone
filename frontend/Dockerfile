# Menggunakan Node.js versi official
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Menyalin file package.json dan package-lock.json
COPY package*.json ./

# Install dependensi
RUN npm install

# Copy seluruh kode sumber frontend
COPY . .

# Expose port yang digunakan frontend (misal: 3000)
EXPOSE 3000

# Perintah untuk menjalankan frontend
CMD ["npm", "run", "dev"]
