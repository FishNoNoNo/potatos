param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ArgsList
)

$root = Split-Path -Parent $PSScriptRoot
$tauriDir = Join-Path $root "src-tauri"

Push-Location $tauriDir
try {
  cargo run --quiet --bin potatos-cli -- @ArgsList
}
finally {
  Pop-Location
}
