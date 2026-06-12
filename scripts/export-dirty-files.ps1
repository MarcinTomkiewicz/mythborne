param(
  [string]$OutputDir = ".review-dirty-files"
)

$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel
Set-Location $repoRoot

$allowedExtensions = @(".ts", ".html", ".scss")

$excludedRelativePaths = @(
  "src/app/core/types/database.types.ts"
)

$excludedPrefixes = @(
  "$OutputDir/",
  "node_modules/",
  "dist/",
  ".angular/",
  ".git/"
)

function Normalize-PathForGit([string]$path) {
  return ($path -replace "\\", "/").Trim()
}

function Is-Excluded([string]$relativePath) {
  $normalized = Normalize-PathForGit $relativePath

  if ($excludedRelativePaths -contains $normalized) {
    return $true
  }

  foreach ($prefix in $excludedPrefixes) {
    if ($normalized.StartsWith($prefix)) {
      return $true
    }
  }

  return $false
}

function Ensure-GitignoreEntry([string]$entry) {
  $gitignorePath = Join-Path $repoRoot ".gitignore"
  $normalizedEntry = Normalize-PathForGit $entry

  if (!(Test-Path $gitignorePath)) {
    New-Item -ItemType File -Path $gitignorePath | Out-Null
  }

  $lines = Get-Content $gitignorePath -ErrorAction SilentlyContinue

  if ($lines -notcontains $normalizedEntry) {
    Add-Content -Path $gitignorePath -Value ""
    Add-Content -Path $gitignorePath -Value $normalizedEntry
  }
}

function Safe-FlatFileName([int]$index, [string]$relativePath) {
  $baseName = [System.IO.Path]::GetFileName($relativePath)
  $prefix = "{0:D3}" -f $index

  return "$prefix`__$baseName"
}

if (Test-Path $OutputDir) {
  Remove-Item $OutputDir -Recurse -Force
}

New-Item -ItemType Directory -Path $OutputDir | Out-Null

Ensure-GitignoreEntry "$OutputDir/"

$statusOutput = git status --porcelain=v1 -z
$entries = $statusOutput -split "`0" | Where-Object { $_ -ne "" }

$changedFiles = New-Object System.Collections.Generic.List[string]

for ($i = 0; $i -lt $entries.Count; $i++) {
  $entry = $entries[$i]

  if ($entry.Length -lt 4) {
    continue
  }

  $status = $entry.Substring(0, 2)
  $path = Normalize-PathForGit $entry.Substring(3)

  if ($status.Contains("R") -or $status.Contains("C")) {
    if ($i + 1 -lt $entries.Count) {
      $i++
      $path = Normalize-PathForGit $entries[$i]
    }
  }

  $extension = [System.IO.Path]::GetExtension($path)

  if ($allowedExtensions -notcontains $extension) {
    continue
  }

  if (Is-Excluded $path) {
    continue
  }

  if (!(Test-Path $path -PathType Leaf)) {
    continue
  }

  $changedFiles.Add($path)
}

$uniqueFiles = $changedFiles | Sort-Object -Unique

$manifestPath = Join-Path $OutputDir "_manifest.txt"
$summaryPath = Join-Path $OutputDir "_summary.txt"

"Dirty TS/HTML/SCSS files exported for review" | Set-Content $summaryPath
"Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Add-Content $summaryPath
"Repository: $repoRoot" | Add-Content $summaryPath
"Output: $OutputDir" | Add-Content $summaryPath
"Count: $($uniqueFiles.Count)" | Add-Content $summaryPath
"" | Add-Content $summaryPath

"Copied file -> original path" | Set-Content $manifestPath
"" | Add-Content $manifestPath

$index = 1

foreach ($file in $uniqueFiles) {
  $flatName = Safe-FlatFileName $index $file
  $destination = Join-Path $OutputDir $flatName

  Copy-Item -Path $file -Destination $destination -Force

  "$flatName -> $file" | Add-Content $manifestPath
  "$flatName -> $file" | Add-Content $summaryPath

  $index++
}

Write-Host "Exported $($uniqueFiles.Count) files to $OutputDir"
Write-Host "Manifest: $manifestPath"
Write-Host "Summary: $summaryPath"