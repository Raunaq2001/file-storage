// Serverless function to exchange OAuth code for access token
// This avoids CORS issues because the token exchange happens server-side

export default async function handler(req, res) {
    // Enable CORS (for GitHub Pages frontend)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, code_verifier, redirect_uri } = req.body;

    if (!code || !code_verifier || !redirect_uri) {
        return res.status(400).json({ error: 'Missing required fields: code, code_verifier, redirect_uri' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('Missing credentials:', { clientId: !!clientId, clientSecret: !!clientSecret });
        return res.status(500).json({ error: 'Server configuration error: missing credentials' });
    }

    try {
        console.log('Exchanging code for token...');
        const response = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirect_uri,
                code_verifier: code_verifier
            })
        });

        const data = await response.json();

        if (response.status !== 200 || data.error) {
            console.error('GitHub token error:', data);
            return res.status(response.status).json({
                error: data.error_description || data.error || 'Token exchange failed'
            });
        }

        // Return the access token
        return res.status(200).json({
            access_token: data.access_token,
            token_type: data.token_type,
            scope: data.scope
        });

    } catch (error) {
        console.error('Token exchange error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
