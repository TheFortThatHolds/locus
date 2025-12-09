# deploy.ps1

# 1. Read the API Key from .env
$envPath = ".env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    foreach ($line in $envContent) {
        if ($line -match "^GEMINI_API_KEY=(.*)$") {
            $apiKey = $matches[1]
            break
        }
    }
}

if (-not $apiKey) {
    Write-Error "GEMINI_API_KEY not found in .env file. Please add it and try again."
    exit 1
}

Write-Host "Deploying Locus to Cloud Run..." -ForegroundColor Cyan

# 2. Deploy using gcloud
# Note: We use --source . to build from source (requires Cloud Build API enabled)
# We pass the API key as an environment variable
gcloud run deploy locus-service `
    --source . `
    --region us-central1 `
    --allow-unauthenticated `
    --set-env-vars GEMINI_API_KEY=$apiKey

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed." -ForegroundColor Red
}
