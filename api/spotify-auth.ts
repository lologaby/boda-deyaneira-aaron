import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Spotify OAuth Flow - Get Refresh Token
 * 
 * Step 1: Visit /api/spotify-auth?setup=true to get authorization URL
 * Step 2: Visit that URL and authorize
 * Step 3: You'll be redirected back with a code
 * Step 4: Visit /api/spotify-auth?code=YOUR_CODE to exchange for refresh token
 */

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'e9f1bea3e7eb4e2fb8c6d153617f355f'
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'cb18e60a4a084916a14f5095ae0f74da'
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'https://bodaenelsunset.com/api/spotify-auth'

const SCOPES = [
  'playlist-modify-public',
  'playlist-modify-private',
  'playlist-read-private',
].join(' ')

interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  scope: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { setup, code } = req.query

  // Step 1: Generate authorization URL
  if (setup === 'true') {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      show_dialog: 'true',
    })

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Setup</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 700px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            .btn {
              display: inline-block;
              background: #1DB954;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 500px;
              font-weight: 600;
              margin: 20px 0;
            }
            code {
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 14px;
            }
            .warning-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .uri-box {
              background: #e7f3ff;
              border-left: 4px solid #2196F3;
              padding: 15px;
              margin: 15px 0;
              word-break: break-all;
              font-family: monospace;
              font-size: 13px;
            }
            .steps {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .steps ol {
              margin: 10px 0;
              padding-left: 20px;
            }
            .steps li {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <h1>🎵 Spotify Playlist Setup</h1>
          
          <div class="warning-box">
            <strong>⚠️ IMPORTANT:</strong> Before clicking "Authorize Spotify", you MUST add this redirect URI to your Spotify app settings:
          </div>
          
          <div class="uri-box">
            ${REDIRECT_URI}
          </div>
          
          <div class="steps">
            <h3>Steps to fix "INVALID_CLIENT: Invalid redirect URI":</h3>
            <ol>
              <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank">Spotify Developer Dashboard</a></li>
              <li>Click on your app (Client ID: <code>${SPOTIFY_CLIENT_ID}</code>)</li>
              <li>Click <strong>"Edit Settings"</strong></li>
              <li>Scroll to <strong>"Redirect URIs"</strong></li>
              <li>Click <strong>"Add URI"</strong></li>
              <li>Paste exactly: <code>${REDIRECT_URI}</code></li>
              <li>Click <strong>"Add"</strong> and then <strong>"Save"</strong></li>
              <li>Come back here and click the button below</li>
            </ol>
          </div>
          
          <p>Once you've added the redirect URI above, click the button below:</p>
          <a href="${authUrl}" class="btn">Authorize Spotify</a>
          
          <p><strong>After authorizing:</strong></p>
          <ol>
            <li>You'll be redirected back here with a code in the URL</li>
            <li>The refresh token will be displayed - save it to <code>SPOTIFY_REFRESH_TOKEN</code> in Vercel environment variables</li>
          </ol>
        </body>
      </html>
    `)
  }

  // Step 2: Exchange code for tokens
  if (code && typeof code === 'string') {
    try {
      const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basic}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = errorText
        let isRedirectError = false
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error_description || errorJson.error || errorText
          isRedirectError = errorMessage.includes('redirect_uri') || errorMessage.includes('INVALID_CLIENT')
        } catch {
          // Not JSON, use as-is
          isRedirectError = errorText.includes('redirect_uri') || errorText.includes('INVALID_CLIENT')
        }

        return res.status(500).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: system-ui, -apple-system, sans-serif;
                  max-width: 700px;
                  margin: 50px auto;
                  padding: 20px;
                  line-height: 1.6;
                }
                .error-box {
                  background: #fee;
                  border-left: 4px solid #f00;
                  padding: 15px;
                  margin: 15px 0;
                }
                .uri-box {
                  background: #e7f3ff;
                  border-left: 4px solid #2196F3;
                  padding: 15px;
                  margin: 15px 0;
                  word-break: break-all;
                  font-family: monospace;
                  font-size: 13px;
                }
                .steps {
                  background: #f8f9fa;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 15px 0;
                }
                code {
                  background: #f4f4f4;
                  padding: 2px 6px;
                  border-radius: 3px;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <h1>❌ Error</h1>
              <div class="error-box">
                <strong>Error from Spotify:</strong><br>
                ${errorMessage}
              </div>
              
              ${isRedirectError ? `
                <h2>🔧 How to Fix Redirect URI Error:</h2>
                <div class="uri-box">
                  <strong>Add this exact URI to your Spotify app:</strong><br>
                  ${REDIRECT_URI}
                </div>
                <div class="steps">
                  <ol>
                    <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank">Spotify Developer Dashboard</a></li>
                    <li>Click on your app (Client ID: <code>${SPOTIFY_CLIENT_ID}</code>)</li>
                    <li>Click <strong>"Edit Settings"</strong></li>
                    <li>Scroll to <strong>"Redirect URIs"</strong></li>
                    <li>Click <strong>"Add URI"</strong></li>
                    <li>Paste exactly: <code>${REDIRECT_URI}</code></li>
                    <li>Click <strong>"Add"</strong> and then <strong>"Save"</strong></li>
                    <li>Try again: <a href="?setup=true">Start Setup Again</a></li>
                  </ol>
                </div>
              ` : `
                <p>Full error details:</p>
                <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto;">${errorText}</pre>
              `}
            </body>
          </html>
        `)
      }

      const data: SpotifyTokenResponse = await response.json()

      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spotify Tokens</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                line-height: 1.6;
              }
              .token-box {
                background: #f4f4f4;
                padding: 15px;
                border-radius: 5px;
                margin: 15px 0;
                word-break: break-all;
                font-family: monospace;
                font-size: 14px;
              }
              .success {
                color: #1DB954;
                font-weight: 600;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <h1 class="success">✅ Success!</h1>
            <p>Save this <strong>REFRESH TOKEN</strong> to your Vercel environment variables as <code>SPOTIFY_REFRESH_TOKEN</code>:</p>
            <div class="token-box">${data.refresh_token || 'No refresh token received (this is unusual)'}</div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> Save this token immediately! You won't be able to see it again.
            </div>

            <h3>Environment Variables to Set in Vercel:</h3>
            <ul>
              <li><code>SPOTIFY_CLIENT_ID</code> = e9f1bea3e7eb4e2fb8c6d153617f355f</li>
              <li><code>SPOTIFY_CLIENT_SECRET</code> = cb18e60a4a084916a14f5095ae0f74da</li>
              <li><code>SPOTIFY_REFRESH_TOKEN</code> = ${data.refresh_token}</li>
              <li><code>SPOTIFY_PLAYLIST_ID</code> = 3v2Zl4aSJgAPMlkxv9FZzS</li>
            </ul>

            <p>After setting these variables, redeploy your app and the playlist integration will work!</p>
          </body>
        </html>
      `)
    } catch (error: any) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <body style="font-family: system-ui; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h1>❌ Error</h1>
            <p>${error.message || 'Unknown error occurred'}</p>
          </body>
        </html>
      `)
    }
  }

  // Default: Show instructions
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Spotify Setup</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
          }
          .btn {
            display: inline-block;
            background: #1DB954;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 500px;
            font-weight: 600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <h1>🎵 Spotify Playlist Integration</h1>
        <p>To set up automatic song addition to your playlist, click below:</p>
        <a href="?setup=true" class="btn">Start Setup</a>
      </body>
    </html>
  `)
}
