# Applique la signature release apres expo prebuild (android/ est regenere).
param(
  [string]$Root = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$propsSource = Join-Path $Root 'android-signing\signing.properties'
$buildGradle = Join-Path $Root 'android\app\build.gradle'
$gradleProps = Join-Path $Root 'android\gradle.properties'

if (-not (Test-Path $propsSource)) {
  throw 'android-signing/signing.properties manquant. Lancez scripts/ensure-upload-keystore.ps1'
}
if (-not (Test-Path $buildGradle)) {
  throw 'android/app/build.gradle manquant. Lancez expo prebuild d abord.'
}

$releaseSigning = @"

        release {
            if (project.hasProperty('OPTILIGNE_UPLOAD_STORE_FILE')) {
                storeFile file(OPTILIGNE_UPLOAD_STORE_FILE)
                storePassword OPTILIGNE_UPLOAD_STORE_PASSWORD
                keyAlias OPTILIGNE_UPLOAD_KEY_ALIAS
                keyPassword OPTILIGNE_UPLOAD_KEY_PASSWORD
            }
        }
"@

$content = Get-Content $buildGradle -Raw
if ($content -notmatch 'OPTILIGNE_UPLOAD_STORE_FILE') {
  $content = $content.Replace(
    "            keyPassword 'android'`r`n        }`r`n    }",
    "            keyPassword 'android'`r`n        }$releaseSigning`r`n    }"
  )
  if ($content -notmatch 'OPTILIGNE_UPLOAD_STORE_FILE') {
    $content = $content.Replace(
      "            keyPassword 'android'`n        }`n    }",
      "            keyPassword 'android'`n        }$releaseSigning`n    }"
    )
  }
}
$content = $content -replace '(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug', '$1signingConfig signingConfigs.release'

Set-Content -Path $buildGradle -Value $content -NoNewline

$baseLines = @(Get-Content $gradleProps -ErrorAction SilentlyContinue | Where-Object { $_ -notmatch '^OPTILIGNE_UPLOAD_' })
$signingLines = Get-Content $propsSource
$out = $baseLines + '' + '# OptiLigne upload keystore' + $signingLines
Set-Content -Path $gradleProps -Value $out

Write-Host 'Signature release appliquee.' -ForegroundColor Green
