// config/env.js
import 'dotenv/config'; // Or require('dotenv').config(); if not using ES modules for this file



export const {
  PORT,
  MONGO_URI,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;
