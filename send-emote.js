export default {
  async fetch(request) {
    // 1. Handle CORS (Allow your frontend to access this)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 2. Only allow GET requests
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        }
      });
    }

    try {
      // 3. Parse Parameters from the URL
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams);

      // 4. Validate Required Parameters
      if (!params.server || !params.tc || !params.uid1 || !params.emote_id) {
        return new Response(JSON.stringify({ 
          error: 'Missing required parameters',
          required: ['server', 'tc', 'uid1', 'emote_id']
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          }
        });
      }

      // 5. Construct the Target URL
      const urlParts = [`${params.server}/join?tc=${encodeURIComponent(params.tc)}`];
      
      // Add UIDs (1 to 5)
      for (let i = 1; i <= 5; i++) {
        if (params[`uid${i}`]) {
          urlParts.push(`uid${i}=${encodeURIComponent(params[`uid${i}`])}`);
        }
      }
      urlParts.push(`emote_id=${encodeURIComponent(params.emote_id)}`);
      const apiUrl = urlParts.join('&');

      // 6. Fetch from the External Server
      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'NOVRA-X-Bot/1.0',
          'Accept': '*/*',
          'Connection': 'keep-alive'
        }
      });

      const responseText = await apiResponse.text();

      // 7. Return the Success Response
      return new Response(JSON.stringify({
        success: true,
        status: apiResponse.status,
        message: 'Emote sent successfully',
        data: responseText
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      // 8. Handle Errors
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        }
      });
    }
  }
};