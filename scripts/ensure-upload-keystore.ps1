# Cree le keystore upload Google Play (une seule fois).
# Fichiers gitignores : android-signing/upload.keystore + signing.properties

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$signingDir = Join-Path $root 'android-signing'
$keystorePath = Join-Path $signingDir 'upload.keystore'
$propsPath = Join-Path $signingDir 'signing.properties'

New-Item -ItemType Directory -Path $signingDir -Force | Out-Null

if ((Test-Path $keystorePath) -and (Test-Path $propsPath)) {
  Write-Host 'Keystore upload deja present.' -ForegroundColor Yellow
  return
}

$keytool = Get-Command keytool -ErrorAction SilentlyContinue
if ($keytool) {
  $keytool = $keytool.Source
}
if (-not $keytool) {
  $candidates = @(
    (Join-Path $env:JAVA_HOME 'bin\keytool.exe'),
    'C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe',
    (Join-Path $env:LOCALAPPDATA 'Android\Sdk\jbr\bin\keytool.exe')
  ) | Where-Object { $_ -and (Test-Path $_) }
  $keytool = $candidates | Select-Object -First 1
}
if (-not $keytool) {
  throw 'keytool introuvable. Installez JDK 17+ ou Android Studio.'
}

function New-RandomPassword {
  param([int]$Length = 24)
  $chars = (48..57) + (65..90) + (97..122)
  -join ($chars | Get-Random -Count $Length | ForEach-Object { [char]$_ })
}

$storePassword = New-RandomPassword
$keyPassword = $storePassword
$alias = 'optiligne-upload'
$dname = 'CN=OptiLigne Mobile, OU=Mobile, O=OptiLigne, L=Metz, ST=Grand Est, C=FR'

Write-Host 'Generation du keystore upload (android-signing/upload.keystore)...' -ForegroundColor Cyan
& $keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore $keystorePath `
  -alias $alias `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000 `
  -storepass $storePassword `
  -keypass $keyPassword `
  -dname $dname

$props = @(
  'OPTILIGNE_UPLOAD_STORE_FILE=../../android-signing/upload.keystore'
  ('OPTILIGNE_UPLOAD_KEY_ALIAS=' + $alias)
  ('OPTILIGNE_UPLOAD_STORE_PASSWORD=' + $storePassword)
  ('OPTILIGNE_UPLOAD_KEY_PASSWORD=' + $keyPassword)
)
Set-Content -Path $propsPath -Value $props -Encoding UTF8

Write-Host ''
Write-Host 'Keystore cree. SAUVEGARDEZ android-signing/ (keystore + signing.properties).' -ForegroundColor Green
Write-Host ('Emplacement : ' + $signingDir)
