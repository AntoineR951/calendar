import { put, list } from '@vercel/blob';

const CACHE_FILENAME = 'calendar-cache.json';

export const config = {
  runtime: 'edge',
};

interface CacheData {
  events: unknown[];
  timestamp: string;
}

export default async function handler(request: Request) {
  // GET: Récupérer le cache
  if (request.method === 'GET') {
    try {
      const { blobs } = await list({ prefix: CACHE_FILENAME });
      
      if (blobs.length === 0) {
        return new Response(JSON.stringify({ cached: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const cacheBlob = blobs[0];
      const response = await fetch(cacheBlob.url);
      const cacheData = await response.json() as CacheData;

      return new Response(JSON.stringify({ 
        cached: true, 
        events: cacheData.events,
        timestamp: cacheData.timestamp 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error reading cache:', error);
      return new Response(JSON.stringify({ error: 'Failed to read cache' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // POST: Sauvegarder dans le cache
  if (request.method === 'POST') {
    try {
      const { events } = await request.json() as { events: unknown[] };

      const cacheData: CacheData = {
        events,
        timestamp: new Date().toISOString(),
      };

      await put(CACHE_FILENAME, JSON.stringify(cacheData), {
        access: 'public',
        addRandomSuffix: false,
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error saving cache:', error);
      return new Response(JSON.stringify({ error: 'Failed to save cache' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}
