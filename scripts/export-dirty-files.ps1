param(
  [string]$OutputDir = ".review-dirty-files",

  [ValidateSet("unstaged", "staged", "all")]
  [string]$Scope = "unstaged"
)

$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel
Set-Location $repoRoot

$allowedExtensions = @(".ts", ".html", ".scss")

$excludedRelativePaths = @(
  "src/app/core/types/database.types.ts"
)

function Normalize-PathForGit([string]$path) {
  return ($path -replace "\\", "/").Trim()
}

$outputPrefix = (Normalize-PathForGit $OutputDir).TrimEnd("/") + "/"

$excludedPrefixes = @(
  $outputPrefix,
  "node_modules/",
  "dist/",
  ".angular/",
  ".git/"
)

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

function Include-ByScope([string]$status, [string]$scope) {
  if ($status -eq "!!") {
    return $false
  }

  if ($scope -eq "all") {
    return $true
  }

  if ($scope -eq "staged") {
    return ($status[0] -ne " " -and $status[0] -ne "?")
  }

  if ($scope -eq "unstaged") {
    return ($status -eq "??" -or $status[1] -ne " ")
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

Ensure-GitignoreEntry "$outputPrefix"

$statusOutput = git status --porcelain=v1 -z
$entries = $statusOutput -split "`0" | Where-Object { $_ -ne "" }

$changedFiles = New-Object System.Collections.Generic.List[string]
$skippedFiles = New-Object System.Collections.Generic.List[string]

for ($i = 0; $i -lt $entries.Count; $i++) {
  $entry = $entries[$i]

  if ($entry.Length -lt 4) {
    continue
  }

  $status = $entry.Substring(0, 2)
  $path = Normalize-PathForGit $entry.Substring(3)

  # In porcelain -z, rename/copy is: "XY newPath\0oldPath\0".
  # Keep newPath for export and consume oldPath.
  if ($status.Contains("R") -or $status.Contains("C")) {
    if ($i + 1 -lt $entries.Count) {
      $i++
    }
  }

  if (!(Include-ByScope $status $Scope)) {
    continue
  }

  $extension = [System.IO.Path]::GetExtension($path)

  if ($allowedExtensions -notcontains $extension) {
    continue
  }

  if (Is-Excluded $path) {
    continue
  }

  if (!(Test-Path $path -PathType Leaf)) {
    $skippedFiles.Add("$status $path")
    continue
  }

  $changedFiles.Add($path)
}

$uniqueFiles = $changedFiles | Sort-Object -Unique

$manifestPath = Join-Path $OutputDir "_manifest.txt"
$summaryPath = Join-Path $OutputDir "_summary.txt"
$statusPath = Join-Path $OutputDir "_git-status.txt"
$diffPath = Join-Path $OutputDir "_diff.txt"

"Dirty TS/HTML/SCSS files exported for review" | Set-Content $summaryPath -Encoding utf8
"Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Add-Content $summaryPath -Encoding utf8
"Repository: $repoRoot" | Add-Content $summaryPath -Encoding utf8
"Output: $OutputDir" | Add-Content $summaryPath -Encoding utf8
"Scope: $Scope" | Add-Content $summaryPath -Encoding utf8
"Count: $($uniqueFiles.Count)" | Add-Content $summaryPath -Encoding utf8
"" | Add-Content $summaryPath -Encoding utf8

"Copied file -> original path" | Set-Content $manifestPath -Encoding utf8
"" | Add-Content $manifestPath -Encoding utf8

git status --short | Set-Content $statusPath -Encoding utf8

$index = 1

foreach ($file in $uniqueFiles) {
  $flatName = Safe-FlatFileName $index $file
  $destination = Join-Path $OutputDir $flatName

  Copy-Item -Path $file -Destination $destination -Force

  "$flatName -> $file" | Add-Content $manifestPath -Encoding utf8
  "$flatName -> $file" | Add-Content $summaryPath -Encoding utf8

  $index++
}

if ($skippedFiles.Count -gt 0) {
  "" | Add-Content $summaryPath -Encoding utf8
  "Skipped deleted/missing files:" | Add-Content $summaryPath -Encoding utf8
  foreach ($skipped in $skippedFiles) {
    $skipped | Add-Content $summaryPath -Encoding utf8
  }
}

if ($uniqueFiles.Count -gt 0) {
  if ($Scope -eq "staged") {
    & git diff --cached -- $uniqueFiles | Set-Content $diffPath -Encoding utf8
  } elseif ($Scope -eq "unstaged") {
    & git diff -- $uniqueFiles | Set-Content $diffPath -Encoding utf8
  } else {
    & git diff HEAD -- $uniqueFiles | Set-Content $diffPath -Encoding utf8
  }
} else {
  "" | Set-Content $diffPath -Encoding utf8
}

Write-Host "Exported $($uniqueFiles.Count) files to $OutputDir"
Write-Host "Scope: $Scope"
Write-Host "Manifest: $manifestPath"
Write-Host "Summary: $summaryPath"
Write-Host "Status: $statusPath"
Write-Host "Diff: $diffPath"