$ErrorActionPreference = "Stop"

$projectId = "acxrgywwpzlhuoklpxrn"
$requiredRpc = "get_pvp_action_copy"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outputPath = Join-Path $repoRoot "src/app/core/types/database.types.ts"

$typeLines = & npx supabase gen types typescript --project-id $projectId --schema public

if ($LASTEXITCODE -ne 0) {
  throw "supabase gen types failed with exit code $LASTEXITCODE"
}

$content = ($typeLines -join "`n")
$content = $content.TrimStart([char]0xFEFF).TrimEnd() + "`n"

if ($content -notmatch "export\s+type\s+Database\s*=") {
  throw "Generated output does not contain 'export type Database ='. Refusing to write database.types.ts."
}

if ($content -notmatch [regex]::Escape($requiredRpc)) {
  throw "Generated types do not contain required RPC: $requiredRpc"
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outputPath, $content, $utf8NoBom)

$bytes = [System.IO.File]::ReadAllBytes($outputPath)
$firstBytes = ($bytes[0..([Math]::Min(15, $bytes.Length - 1))] | ForEach-Object { $_.ToString("X2") }) -join " "
$nulCount = (($bytes | Select-Object -First 20000 | Where-Object { $_ -eq 0 }).Count)

Write-Host "Wrote: $outputPath"
Write-Host "first bytes: $firstBytes"
Write-Host "NUL in first 20KB: $nulCount"

if ($nulCount -gt 0) {
  throw "Generated file contains NUL bytes."
}