# GitHub + Vercel otomatik deploy kurulumu
# Kullanım: PowerShell'de proje klasöründen .\scripts\setup-auto-deploy.ps1

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

Write-Host "GitHub oturumu kontrol ediliyor..." -ForegroundColor Cyan
gh auth status
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Once GitHub'a giris yap:" -ForegroundColor Yellow
  Write-Host "  gh auth login --web" -ForegroundColor White
  exit 1
}

$username = gh api user -q .login
$repoName = "aleyna-portfolio"
$repoUrl = "https://github.com/$username/$repoName"

Write-Host "GitHub kullanicisi: $username" -ForegroundColor Green

$remotes = @(git remote)
$hasOrigin = $remotes -contains "origin"

if (-not $hasOrigin) {
  Write-Host "GitHub reposu olusturuluyor: $repoName" -ForegroundColor Cyan
  gh repo create $repoName --public --source=. --remote=origin --push --description "Aleyna Altunsu kisisel portfolyo sitesi"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Repo zaten var olabilir. Remote ekleniyor..." -ForegroundColor Yellow
    git remote add origin $repoUrl
    git push -u origin main
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Push basarisiz. GitHub'da repo durumunu kontrol et." -ForegroundColor Red
      exit 1
    }
  }
} else {
  $remoteUrl = git remote get-url origin
  Write-Host "Remote zaten var: $remoteUrl" -ForegroundColor Green
  Write-Host "Kod GitHub'a gonderiliyor..." -ForegroundColor Cyan
  git push -u origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Push basarisiz." -ForegroundColor Red
    exit 1
  }
}

Write-Host "Vercel GitHub baglantisi kuruluyor..." -ForegroundColor Cyan
npx vercel git connect $repoUrl
if ($LASTEXITCODE -ne 0) {
  Write-Host "Vercel baglantisi CLI ile kurulamadi." -ForegroundColor Yellow
  Write-Host "Manuel: https://vercel.com -> aleyna-portfolio -> Settings -> Git -> Connect" -ForegroundColor White
  exit 1
}

Write-Host ""
Write-Host "Tamamlandi!" -ForegroundColor Green
Write-Host "  GitHub: $repoUrl" -ForegroundColor White
Write-Host "  Vercel: https://aleyna-portfolio.vercel.app" -ForegroundColor White
Write-Host ""
Write-Host "Bundan sonra: git push yaptiginda Vercel otomatik deploy eder." -ForegroundColor Cyan
