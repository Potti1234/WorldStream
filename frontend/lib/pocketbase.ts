"use client"

import PocketBase from 'pocketbase';

// Ensure this matches your .env.local or environment configuration
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pocketbase-zko8448os8ksg880o048wkss.lukaspottner.com';

if (!POCKETBASE_URL) {
  console.error('Pocketbase URL is not defined. Please set NEXT_PUBLIC_POCKETBASE_URL in your .env.local file (e.g., NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090).');
  // Depending on your error handling strategy, you might throw an error here
  // or allow the app to continue, and the PocketBase instance will fail on first use.
}

const pb = new PocketBase(POCKETBASE_URL);

export default pb; 