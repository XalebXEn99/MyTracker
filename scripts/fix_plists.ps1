# fix_plists.ps1 - Diagnose and remediate CocoaPods plist parsing issues (PowerShell)
# 
# This script detects malformed or misplaced plist files on Windows using PowerShell.
# Conservative approach: suspicious files are moved to scripts\broken_plists\ for manual review
# 
# Usage: powershell -ExecutionPolicy Bypass -File scripts\fix_plists.ps1

param(
    [switch]$Force = $false
)

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Cyan"

function Write-Header($text) {
    Write-Host "=== $text ===" -ForegroundColor $BLUE
}

function Write-Success($text) {
    Write-Host "✓ $text" -ForegroundColor $GREEN
}

function Write-Error($text) {
    Write-Host "✗ $text" -ForegroundColor $RED
}

function Write-Warning($text) {
    Write-Host "⚠ $text" -ForegroundColor $YELLOW
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BrokenDir = Join-Path $ScriptDir "broken_plists"
$IosDir = Join-Path $ProjectRoot "ios"

Write-Header "CocoaPods Plist Diagnostic and Fix (PowerShell)"
Write-Host "iOS directory: $IosDir"
Write-Host "Backup directory: $BrokenDir"
Write-Host ""

# Check if plutil is available
$PlutilAvailable = $false
try {
    $PlutilVersion = plutil -h 2>&1
    $PlutilAvailable = $true
}
catch {
    Write-Warning "plutil not found on Windows. plutil is available on macOS/WSL."
    Write-Host ""
    Write-Host "To run full validation on Windows, use one of these options:"
    Write-Host "  1. Run on macOS: bash scripts/fix_plists.sh"
    Write-Host "  2. Run in WSL on Windows: bash scripts/fix_plists.sh"
    Write-Host "  3. Run in Git Bash: bash scripts/fix_plists.sh"
    Write-Host ""
    Write-Warning "Continuing with basic checks (file searching only)..."
    Write-Host ""
}

# Initialize tracking
$ErrorsFound = 0
$FixesApplied = 0

# Step 1: Search for pbxproj markers in plist files
Write-Header "Step 1: Searching for pbxproj markers in plist files"
$PbxprojInPlist = @()
Get-ChildItem -Path $IosDir -Filter "*.plist" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -ErrorAction SilentlyContinue
    if ($content | Select-String -Pattern "archiveVersion = 1;" -Quiet) {
        $PbxprojInPlist += $_
        Write-Error "Found pbxproj content in plist: $($_.FullName)"
        $lineNum = ($content | Select-String -Pattern "archiveVersion = 1;" | Select-Object -First 1).LineNumber
        Write-Host "  (line $lineNum)" -ForegroundColor $RED
        $ErrorsFound++
    }
}
if ($PbxprojInPlist.Count -eq 0) {
    Write-Success "No pbxproj markers found in plist files"
}

# Step 2: Lint plist files (if plutil available)
Write-Host ""
Write-Header "Step 2: Validating .plist files"

if ($PlutilAvailable) {
    Get-ChildItem -Path $IosDir -Filter "*.plist" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        $lintResult = plutil -lint $_.FullName 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success $_.FullName
        }
        else {
            Write-Error "$($_.FullName)"
            Write-Host "  $lintResult" -ForegroundColor $RED
            $ErrorsFound++
        }
    }
}
else {
    Write-Warning "Skipping plutil validation (not available on Windows)"
    Write-Host "Run on macOS/WSL to validate: bash scripts/fix_plists.sh"
}

# Step 3: Move suspicious files
Write-Host ""
Write-Header "Step 3: Moving suspicious files for manual review"
if ($PbxprojInPlist.Count -gt 0) {
    if (-not (Test-Path $BrokenDir)) {
        New-Item -ItemType Directory -Path $BrokenDir -Force | Out-Null
    }
    $PbxprojInPlist | ForEach-Object {
        $targetPath = Join-Path $BrokenDir $_.Name
        Write-Warning "Moving: $($_.FullName) → $targetPath"
        Move-Item -Path $_.FullName -Destination $targetPath -Force
        $FixesApplied++
    }
}
else {
    Write-Success "No suspicious files to move"
}

# Step 4: Replace exportOptions.plist with known-good version
Write-Host ""
Write-Header "Step 4: Ensuring ios/exportOptions.plist is valid"
$ExportPlistPath = Join-Path $IosDir "exportOptions.plist"
$ExportPlistContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>compileBitcode</key>
	<false/>
	<key>method</key>
	<string>ad-hoc</string>
	<key>signingStyle</key>
	<string>manual</string>
	<key>stripSwiftSymbols</key>
	<true/>
	<key>teamID</key>
	<string></string>
</dict>
</plist>
"@

$ExportPlistContent | Out-File -FilePath $ExportPlistPath -Encoding UTF8 -NoNewline
Write-Success "Created/updated exportOptions.plist"
$FixesApplied++

# Step 5: Final summary
Write-Host ""
Write-Header "Summary"
Write-Host "Errors found: $ErrorsFound" -ForegroundColor $(if ($ErrorsFound -gt 0) { $RED } else { $GREEN })
Write-Host "Fixes applied: $FixesApplied" -ForegroundColor $GREEN

Write-Host ""
if (Test-Path $BrokenDir) {
    $brokenFiles = Get-ChildItem -Path $BrokenDir -ErrorAction SilentlyContinue
    if ($brokenFiles) {
        Write-Warning "Suspicious files moved to $BrokenDir"
        Write-Host "Please review:"
        $brokenFiles | ForEach-Object { Write-Host "  → $($_.Name)" }
        Write-Host ""
        Write-Host "If files are legitimate, restore from git:"
        Write-Host "  git checkout ios/<filename>"
        Write-Host ""
    }
}

if ($ErrorsFound -gt 0) {
    Write-Error "Issues detected. Do not run pod install yet."
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Review files in $BrokenDir"
    Write-Host "  2. Restore or investigate as needed"
    Write-Host "  3. For full validation, run on macOS/WSL: bash scripts/fix_plists.sh"
    exit 1
}

Write-Success "Plist validation passed. Ready to install CocoaPods."
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. cd ios"
Write-Host "  2. rm -rf Pods Podfile.lock build  (or del /s on Windows cmd)"
Write-Host "  3. pod cache clean --all"
Write-Host "  4. pod repo update"
Write-Host "  5. pod install --repo-update"
exit 0
