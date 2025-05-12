import { NextRequest, NextResponse } from "next/server";
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Get tokens from code
    const { tokens } = await oauth2Client.getToken(code);
    const refreshToken = tokens.refresh_token;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token received' }, { status: 400 });
    }

    // Return a more detailed HTML response
    return new NextResponse(`
      <html>
        <head>
          <title>Google Calendar Authorization</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 600px;
              margin: 2rem auto;
              padding: 0 1rem;
              line-height: 1.5;
            }
            .container {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 2rem;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .warning {
              color: #dc2626;
              font-weight: bold;
            }
            .token {
              background: #e5e7eb;
              padding: 1rem;
              border-radius: 4px;
              word-break: break-all;
              margin: 1rem 0;
            }
            .steps {
              margin-top: 1.5rem;
            }
            .step {
              margin-bottom: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Google Calendar Authorization Successful!</h1>
            <p class="warning">Important: Save your refresh token securely!</p>
            
            <div class="steps">
              <h2>Follow these steps:</h2>
              
              <div class="step">
                <h3>1. Copy your refresh token:</h3>
                <div class="token">${refreshToken}</div>
              </div>
              
              <div class="step">
                <h3>2. Add to your .env.local file:</h3>
                <div class="token">GOOGLE_REFRESH_TOKEN=${refreshToken}</div>
              </div>
              
              <div class="step">
                <h3>3. Restart your development server</h3>
                <p>After adding the token to your .env.local file, restart your Next.js development server.</p>
              </div>
            </div>

            <p class="warning">Security Notice: Never commit this token to version control or share it with anyone!</p>
          </div>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return NextResponse.json({ error: 'Failed to get refresh token' }, { status: 500 });
  }
} 