/**
 * Vercel Serverless Function & Proxy for Google Drive Scratch (.sb3) files.
 * Fetches the binary .sb3 from Google Drive and streams it with permissive CORS
 * and explicit Scratch MIME types so Google Drive doesn't force .zip extension
 * and TurboWarp (turbowarp.org) can load and run the Scratch project directly.
 */

export default async function handler(req: any, res: any) {
  // Permissive CORS for TurboWarp and browser clients
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get file ID from query parameter: ?id=FILE_ID or ?url=GOOGLE_DRIVE_URL
  const query = req.query || {};
  let fileId = query.id;

  if (!fileId && query.url) {
    const rawUrl = String(query.url);
    const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) fileId = match[1];
  }

  if (!fileId) {
    return res.status(400).json({ error: 'Missing Google Drive file ID parameter (?id=...)' });
  }

  // Clean filename so it always ends with .sb3, never .zip
  let cleanName = 'project.sb3';
  if (query.name) {
    cleanName = String(query.name).replace(/\.zip$/i, '').replace(/\.sb3$/i, '') + '.sb3';
  } else if (fileId) {
    cleanName = `proyek_${fileId}.sb3`;
  }

  try {
    // 1. Direct download endpoint from Google Drive
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let response = await fetch(directUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // Check if Google Drive returned an HTML virus scan confirmation page for larger files
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const htmlText = await response.text();
      // Look for confirmation token
      const confirmMatch = htmlText.match(/confirm=([a-zA-Z0-9_-]+)/) || htmlText.match(/name="confirm" value="([^"]+)"/);
      if (confirmMatch && confirmMatch[1]) {
        const confirmToken = confirmMatch[1];
        const confirmedUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmToken}`;
        response = await fetch(confirmedUrl, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
      } else {
        // Try alternate lh3 endpoint for Google Drive
        const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}`;
        const altResponse = await fetch(lh3Url, { redirect: 'follow' });
        if (altResponse.ok) {
          response = altResponse;
        }
      }
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: `Google Drive returned status ${response.status}` });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // CRITICAL: Force Scratch .sb3 MIME type and filename so it is never treated as a plain .zip
    res.setHeader('Content-Type', 'application/x.scratch.sb3');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error('Error proxying Google Drive sb3:', error);
    return res.status(500).json({ error: error?.message || 'Failed to proxy Google Drive file' });
  }
}
