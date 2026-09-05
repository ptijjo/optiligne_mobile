# Build Android release (AAB) en local — sans EAS.
# Usage : .\scripts\build-android-release.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$envFile = Join-Path $root '.env'
$prodFile = Join-Path $root '.env.production'
$bakFile = Join-Path $root '.env.development.bak'

if (-not (Test-Path $prodFile)) {
  throw "Fichier manquant : .env.production"
}

$prodEnv = Get-Content $prodFile -Raw
if ($prodEnv -notmatch 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=.+') {
  throw "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY manquante dans .env.production (obligatoire pour la carte Android / Play Store)."
}

$appJson = Get-Content (Join-Path $root 'app.json') -Raw | ConvertFrom-Json
$versionName = $appJson.expo.version
$versionCode = $appJson.expo.android.versionCode

Write-Host '=== OptiLigne — build Android release (local) ===' -ForegroundColor Cyan
Write-Host ('Version : ' + $versionName + ' (versionCode ' + $versionCode + ')')
Write-Host ('Version package.json : ' + (node -p "require('./package.json').version"))

if (Test-Path $envFile) {
  Copy-Item $envFile $bakFile -Force
}
Copy-Item $prodFile $envFile -Force
Write-Host 'Env : .env.production applique pour le build' -ForegroundColor Yellow

$sdkRoot = $env:ANDROID_HOME
if (-not $sdkRoot) {
  $sdkRoot = $env:ANDROID_SDK_ROOT
}
if (-not $sdkRoot) {
  $defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
  if (Test-Path $defaultSdk) {
    $sdkRoot = $defaultSdk
  }
}
if (-not $sdkRoot -or -not (Test-Path $sdkRoot)) {
  throw 'Android SDK introuvable. Definissez ANDROID_HOME ou installez Android SDK.'
}
Write-Host ('Android SDK : ' + $sdkRoot) -ForegroundColor Yellow

try {
  $env:CI = 'true'
  & (Join-Path $root 'scripts\ensure-upload-keystore.ps1')
  npx expo prebuild --platform android --clean --no-install
  $sdkEscaped = ($sdkRoot -replace '\\', '/')
  Set-Content -Path (Join-Path $root 'android\local.properties') -Value "sdk.dir=$sdkEscaped"
  & (Join-Path $root 'scripts\apply-android-signing.ps1') -Root $root
  Set-Location (Join-Path $root 'android')
  .\gradlew.bat bundleRelease
  if ($LASTEXITCODE -ne 0) {
    throw "bundleRelease a echoue (exit $LASTEXITCODE)"
  }
  $aab = Get-ChildItem -Recurse -Filter '*-release.aab' -Path 'app\build\outputs\bundle\release' -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $aab) {
    throw 'AAB introuvable apres bundleRelease'
  }

  $releaseDir = Join-Path $root 'release'
  New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
  $releaseName = $versionName + '-' + $versionCode + '.aab'
  $releasePath = Join-Path $releaseDir $releaseName
  Copy-Item $aab.FullName $releasePath -Force
  Write-Host ''
  Write-Host ('AAB pret : ' + $releasePath) -ForegroundColor Green
} finally {
  Set-Location $root
  if (Test-Path $bakFile) {
    Move-Item $bakFile $envFile -Force
    Write-Host 'Env : .env developpement restaure' -ForegroundColor Yellow
  }
}
