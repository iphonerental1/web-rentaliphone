# Menggunakan Node.js versi official sebagai base image
FROM node:18-alpine

# Set working directory di dalam container
WORKDIR /app

# Menyalin file package.json dan package-lock.json
COPY package*.json ./

# Install dependensi aplikasi
RUN npm install

# Copy seluruh kode sumber backend
COPY . .

# Expose port yang digunakan backend (misal: 5000)
EXPOSE 5000

# Perintah untuk menjalankan backend
CMD ["npm", "start"]
