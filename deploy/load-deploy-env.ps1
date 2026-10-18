# Load deploy env vars into current PowerShell process (do not print secrets)
param(
  [string]$Root = (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
)

function Import-DotEnvFile {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) {
      return
    }

    $eq = $line.IndexOf('=')
    if ($eq -lt 1) {
      return
    }

    $key = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1).Trim()
    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    if ($key) {
      [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
  }
}

Import-DotEnvFile (Join-Path $Root '.env.local')
Import-DotEnvFile (Join-Path $Root '.env.tencent.local')
Import-DotEnvFile (Join-Path $Root '.env.production')

if (-not $env:VITE_SITE_URL) {
  $env:VITE_SITE_URL = 'https://helloroamly.com'
}

# Production defaults for deploy builds
$env:VITE_APP_MODE = 'production'
$env:VITE_MAP_DEV_DEMO = '0'
$env:VITE_HOME_LAYOUT = 'launch'
if (-not $env:VITE_INVITE_ENABLED) {
  $env:VITE_INVITE_ENABLED = '1'
}
if (-not $env:VITE_SHARE_ANALYTICS_ENABLED) {
  $env:VITE_SHARE_ANALYTICS_ENABLED = '1'
}
