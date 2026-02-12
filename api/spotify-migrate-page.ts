import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Simple HTML page to trigger Spotify migration
 * Visit /api/spotify-migrate-page to see the UI
 */

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', 'text/html')

  if (req.method === 'GET') {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Migrate Songs to Spotify</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              max-width: 600px;
              width: 100%;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 {
              color: #333;
              margin-bottom: 10px;
              font-size: 28px;
            }
            .subtitle {
              color: #666;
              margin-bottom: 30px;
              line-height: 1.6;
            }
            .btn {
              background: #1DB954;
              color: white;
              border: none;
              padding: 15px 30px;
              font-size: 16px;
              font-weight: 600;
              border-radius: 500px;
              cursor: pointer;
              width: 100%;
              transition: all 0.3s;
              margin-bottom: 20px;
            }
            .btn:hover:not(:disabled) {
              background: #1ed760;
              transform: translateY(-2px);
              box-shadow: 0 5px 15px rgba(29, 185, 84, 0.4);
            }
            .btn:disabled {
              background: #ccc;
              cursor: not-allowed;
              transform: none;
            }
            .result {
              margin-top: 20px;
              padding: 20px;
              border-radius: 10px;
              display: none;
            }
            .result.success {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              color: #155724;
            }
            .result.error {
              background: #f8d7da;
              border: 1px solid #f5c6cb;
              color: #721c24;
            }
            .result.loading {
              background: #d1ecf1;
              border: 1px solid #bee5eb;
              color: #0c5460;
            }
            .result.show {
              display: block;
            }
            .stats {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid rgba(0,0,0,0.1);
            }
            .stat-item {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              font-size: 14px;
            }
            .stat-label {
              color: #666;
            }
            .stat-value {
              font-weight: 600;
              color: #333;
            }
            .failed-songs {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid rgba(0,0,0,0.1);
            }
            .failed-songs h3 {
              font-size: 14px;
              margin-bottom: 10px;
              color: #666;
            }
            .failed-songs ul {
              list-style: none;
              padding-left: 0;
            }
            .failed-songs li {
              padding: 5px 0;
              color: #721c24;
              font-size: 13px;
            }
            .spinner {
              display: inline-block;
              width: 16px;
              height: 16px;
              border: 2px solid rgba(255,255,255,0.3);
              border-top-color: white;
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              margin-right: 8px;
              vertical-align: middle;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎵 Migrate Songs to Spotify</h1>
            <p class="subtitle">
              This will sync all songs from your Notion database (where Attendance = "Yes") 
              to your Spotify playlist.
            </p>
            
            <button class="btn" id="migrateBtn" onclick="startMigration()">
              Start Migration
            </button>
            
            <div id="result" class="result"></div>
          </div>

          <script>
            async function startMigration() {
              const btn = document.getElementById('migrateBtn');
              const result = document.getElementById('result');
              
              console.log('Starting migration...');
              
              // Disable button and show loading
              btn.disabled = true;
              btn.innerHTML = '<span class="spinner"></span> Migrating...';
              result.className = 'result loading show';
              result.innerHTML = '<strong>⏳ Migrating songs...</strong><br>This may take a minute. Please wait.';

              try {
                console.log('Fetching /api/spotify-migrate-notion...');
                const response = await fetch('/api/spotify-migrate-notion', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                console.log('Response status:', response.status);
                
                if (!response.ok) {
                  throw new Error('HTTP error! status: ' + response.status);
                }

                const data = await response.json();
                console.log('Response data:', data);

                if (data.success) {
                  result.className = 'result success show';
                  let html = '<strong>✅ Migration Complete!</strong>';
                  
                  if (data.total !== undefined) {
                    html += '<div class="stats">';
                    html += '<div class="stat-item"><span class="stat-label">Total songs found:</span><span class="stat-value">' + data.total + '</span></div>';
                    html += '<div class="stat-item"><span class="stat-label">Successfully added:</span><span class="stat-value" style="color: #1DB954;">' + data.added + '</span></div>';
                    html += '<div class="stat-item"><span class="stat-label">Failed:</span><span class="stat-value" style="color: #e74c3c;">' + data.failed + '</span></div>';
                    html += '</div>';
                  }

                  if (data.failedSongs && data.failedSongs.length > 0) {
                    html += '<div class="failed-songs">';
                    html += '<h3>Songs that couldn\'t be found:</h3>';
                    html += '<ul>';
                    data.failedSongs.forEach(song => {
                      html += '<li>• ' + song + '</li>';
                    });
                    html += '</ul>';
                    html += '</div>';
                  }

                  html += '<p style="margin-top: 15px; font-size: 14px; color: #666;">Check your <a href="https://open.spotify.com/playlist/3v2Zl4aSJgAPMlkxv9FZzS" target="_blank" style="color: #1DB954;">Spotify playlist</a> to see the added songs!</p>';
                  
                  result.innerHTML = html;
                } else {
                  result.className = 'result error show';
                  result.innerHTML = '<strong>❌ Error:</strong><br>' + (data.error || 'Unknown error occurred');
                }
              } catch (error) {
                console.error('Migration error:', error);
                result.className = 'result error show';
                result.innerHTML = '<strong>❌ Error:</strong><br>' + error.message + '<br><br><small>Check browser console (F12) for details.</small>';
              } finally {
                btn.disabled = false;
                btn.innerHTML = 'Start Migration';
              }
            }
            
            // Show any console errors in the page
            window.addEventListener('error', function(e) {
              const result = document.getElementById('result');
              result.className = 'result error show';
              result.innerHTML = '<strong>❌ JavaScript Error:</strong><br>' + e.message + '<br><br><small>Line: ' + e.lineno + '</small>';
            });
          </script>
        </body>
      </html>
    `)
  }

  return res.status(405).send('Method not allowed')
}
