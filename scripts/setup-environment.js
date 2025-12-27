#!/usr/bin/env node

/**
 * Setup environment.ts file before build
 * Checks for Netlify environment variables or uses existing file
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', 'environment.ts');
const envExamplePath = path.join(__dirname, '..', 'environment.example.ts');

// Check if environment.ts already exists
if (fs.existsSync(envPath)) {
  console.log('✅ environment.ts already exists, skipping generation');
  process.exit(0);
}

// Check for Netlify environment variables
const apiKey = process.env.TMDB_API_KEY || '';
const apiUrl = process.env.TMDB_API_URL || 'https://api.themoviedb.org/3';

// If we have an API key from environment (Netlify), generate the file
if (apiKey) {
  const envContent = `export const environment = {
    apiUrl: '${apiUrl}',
    apiKey: '${apiKey}',
};`;

  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Environment file created from Netlify environment variables');
    console.log(`   API URL: ${apiUrl}`);
    console.log(`   API Key: ***${apiKey.slice(-4)}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR: Failed to write environment.ts file:', error.message);
    process.exit(1);
  }
}

// If no API key and file doesn't exist, check if example exists and copy it
if (fs.existsSync(envExamplePath)) {
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('⚠️  WARNING: environment.ts not found, copied from environment.example.ts');
    console.log('   Please add your TMDB_API_KEY to environment.ts');
    console.log('   Or set TMDB_API_KEY as a Netlify environment variable');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR: Failed to copy environment.example.ts:', error.message);
    process.exit(1);
  }
}

// If nothing works, create a minimal file
const envContent = `export const environment = {
    apiUrl: 'https://api.themoviedb.org/3',
    apiKey: '',
};`;

try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('⚠️  WARNING: Created environment.ts with empty API key');
  console.log('   Please add your TMDB_API_KEY to environment.ts');
  console.log('   Or set TMDB_API_KEY as a Netlify environment variable');
} catch (error) {
  console.error('❌ ERROR: Failed to create environment.ts file:', error.message);
  process.exit(1);
}

