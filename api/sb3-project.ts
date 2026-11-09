/**
 * Serves an .sb3 Scratch 3.0 project file directly to TurboWarp with CORS enabled.
 * Works seamlessly for:
 * 1. Direct uploads stored in Firestore (Base64)
 * 2. Google Drive links (proxies binary with .sb3 MIME type)
 * 3. Direct URLs
 */

export default async function handler(req: any, res: any) {
  // Allow TurboWarp and any cross-origin browser client to fetch the project
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const studentId = query.id;
  const driveId = query.driveId;

  // 1. If driveId is provided directly, proxy from Google Drive
  if (driveId) {
    return await proxyGoogleDriveFile(driveId, query.file || query.name || 'project.sb3', res);
  }

  // 2. If studentId is provided, fetch document from Firestore
  if (!studentId) {
    return res.status(400).json({ error: 'Missing student ID parameter (?id=...)' });
  }

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/eskul-coding-aliks/databases/(default)/documents/students/${studentId}`;
    const fsResponse = await fetch(firestoreUrl);

    if (!fsResponse.ok) {
      return res.status(fsResponse.status).json({ error: `Student not found in Firestore (${fsResponse.status})` });
    }

    const docData = await fsResponse.json();
    const fields = docData.fields || {};
    const sb3Url = fields.sb3FileUrl?.stringValue || '';
    const rawFileName = fields.sb3FileName?.stringValue || 'project.sb3';
    const cleanFileName = rawFileName.replace(/\.zip$/i, '').replace(/\.sb3$/i, '') + '.sb3';

    if (!sb3Url) {
      return res.status(404).json({ error: 'Student does not have an .sb3 project file' });
    }

    // CASE A: Base64 Data URL (Direct file upload)
    if (sb3Url.startsWith('data:')) {
      const base64Data = sb3Url.split(';base64,')[1] || sb3Url;
      const buffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', 'application/x.scratch.sb3');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanFileName}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(buffer);
    }

    // CASE B: Google Drive Link
    if (sb3Url.includes('drive.google.com') || sb3Url.includes('docs.google.com')) {
      const match = sb3Url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || sb3Url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      const fileId = match ? match[1] : '';
      if (fileId) {
        return await proxyGoogleDriveFile(fileId, cleanFileName, res);
      }
    }

    // CASE C: Direct HTTP URL
    if (sb3Url.startsWith('http://') || sb3Url.startsWith('https://')) {
      const fileRes = await fetch(sb3Url, { redirect: 'follow' });
      if (!fileRes.ok) {
        return res.status(fileRes.status).json({ error: 'Failed to fetch direct .sb3 URL' });
      }
      const buffer = Buffer.from(await fileRes.arrayBuffer());
      res.setHeader('Content-Type', 'application/x.scratch.sb3');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanFileName}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(buffer);
    }

    return res.status(400).json({ error: 'Unsupported sb3 URL format' });
  } catch (error: any) {
    console.error('Error serving sb3 project:', error);
    return res.status(500).json({ error: error?.message || 'Server error serving sb3 project' });
  }
}

async function proxyGoogleDriveFile(fileId: string, fileName: string, res: any) {
  try {
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    let response = await fetch(directUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const htmlText = await response.text();
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
        const lh3Url = `https://lh3.googleusercontent.com/d/${fileId}`;
        const altRes = await fetch(lh3Url, { redirect: 'follow' });
        if (altRes.ok) response = altRes;
      }
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to download from Google Drive' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'application/x.scratch.sb3');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Error proxying Drive file' });
  }
}
