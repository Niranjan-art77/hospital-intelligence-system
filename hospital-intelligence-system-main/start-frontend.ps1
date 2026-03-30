$ErrorActionPreference = "Stop"

$TOOLS_DIR = "$PSScriptRoot\.tools"
if (-not (Test-Path $TOOLS_DIR)) {
    New-Item -ItemType Directory -Path $TOOLS_DIR | Out-Null
}

$NODE_ZIP = "$TOOLS_DIR\node.zip"
$NODE_DIR = "$TOOLS_DIR\node"
if (-not (Test-Path $NODE_DIR)) {
    Write-Host "Downloading Node.js..."
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v22.14.0/node-v22.14.0-win-x64.zip" -OutFile $NODE_ZIP
    Write-Host "Extracting Node.js..."
    Expand-Archive -Path $NODE_ZIP -DestinationPath $NODE_DIR -Force
    Remove-Item $NODE_ZIP -Force
}

$NODE_HOME = Get-ChildItem -Path $NODE_DIR -Directory | Select-Object -First 1

$env:PATH = "$($NODE_HOME.FullName);$env:PATH"

Write-Host "Node version: $(node -v)"
Write-Host "NPM version: $(npm -v)"

Write-Host "Installing dependencies..."
Set-Location -Path $PSScriptRoot
npm install

Write-Host "Starting Vite development server..."
npm run dev
