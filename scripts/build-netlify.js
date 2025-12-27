#!/usr/bin/env node

/**
 * Build script for Netlify deployment
 * Replaces environment variables in environment.ts before building
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get environment variables from Netlify (or fallback to empty)
const apiKey = process.env.TMDB_API_KEY || '';
const apiUrl = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

// Validate API key in production
if (!apiKey && process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: TMDB_API_KEY environment variable is not set!');
  console.error('   Please set TMDB_API_KEY in your Netlify environment variables.');
  process.exit(1);
}

// Paths
const envPath = path.join(__dirname, '..', 'environment.ts');

// Create environment.ts content
const envContent = `export const environment = {
    apiUrl: '${apiUrl}',
    apiKey: '${apiKey}',
};`;

// Write the environment.ts file
try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Environment file created for Netlify build');
  console.log(`   API URL: ${apiUrl}`);
  console.log(`   API Key: ${apiKey ? '***' + apiKey.slice(-4) : 'NOT SET (using empty string)'}`);
} catch (error) {
  console.error('❌ ERROR: Failed to write environment.ts file:', error.message);
  process.exit(1);
}

// Run the Angular build
try {
  console.log('🚀 Starting Angular build...');
  execSync('ng build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ ERROR: Build failed');
  process.exit(1);
}

