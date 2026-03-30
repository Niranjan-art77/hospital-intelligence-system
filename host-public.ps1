$ErrorActionPreference = "Stop"
$NODE_DIR = "$PSScriptRoot\.tools\node"
$NODE_HOME = Get-ChildItem -Path $NODE_DIR -Directory | Select-Object -First 1
$env:PATH = "$($NODE_HOME.FullName);$env:PATH"

Write-Host "Installing production dependencies..."
npm install express http-proxy-middleware cors localtunnel

Write-Host "Building React App for production..."
npm run build

Write-Host "Starting production proxy server in the background..."
Start-Process -NoNewWindow node "server.cjs"
Start-Sleep -Seconds 3

Write-Host "Exposing site to the public internet via LocalTunnel..."
npx localtunnel --port 3000 > localtunnel_url.txt
