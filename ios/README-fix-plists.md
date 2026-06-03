# CocoaPods Plist Parsing - Diagnostics and Fix

## Problem

CocoaPods pod install fails with:
```
Nanaimo::Reader::ParseError - [!] Found additional characters after parsing the root plist object
```

This occurs when:
- A plist file contains CRLF line endings instead of LF (common on Windows)
- A pbxproj file is mistakenly committed as a plist
- The plist file is corrupted or binary instead of XML

## Solution Overview

The following scripts diagnose and remediate plist issues:

- **scripts/fix_plists.sh** (bash) - Full diagnostics and fix on macOS/WSL
- **scripts/fix_plists.ps1** (PowerShell) - Windows diagnostics
- **scripts/ci-validate-plists.sh** - Minimal CI validation wrapper

## How to Run

### Option 1: Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -File scripts\fix_plists.ps1
```

If `plutil` is not available on your Windows machine, run on macOS or WSL instead (see below).

### Option 2: macOS or WSL

```bash
bash scripts/fix_plists.sh
```

### What the Scripts Do

1. **Search for pbxproj markers in plist files**
   - Looks for "archiveVersion = 1;" (pbxproj indicator)
   - Moves any found files to `scripts/broken_plists/` for review

2. **Validate all .plist files**
   - Runs `plutil -lint` on each plist
   - Detects binary plists and converts to XML
   - Moves any failing files to `scripts/broken_plists/`

3. **Replace exportOptions.plist**
   - Ensures a known-good version exists
   - Uses minimal, safe configuration for unsigned IPA export

4. **Generate a final report**
   - Lists any files moved to `scripts/broken_plists/`
   - Provides next steps if issues remain

## Manual Steps

After running the script:

### Step 1: Review Moved Files

If any files appear in `scripts/broken_plists/`:

```bash
ls scripts/broken_plists/
```

**If these are legitimate iOS build files:** Restore from git
```bash
git checkout ios/<filename>
```

**If these are corrupted or misplaced files:** Delete them and investigate where they came from.

### Step 2: Clean Pods and Reinstall

```bash
cd ios
rm -rf Pods Podfile.lock build
pod cache clean --all
pod repo update
pod install --repo-update
```

### Step 3: Verify Success

If `pod install` completes without error:

```bash
✅ Plist issues are resolved. You can now build the app.
```

## GitHub Actions Integration

To add plist validation to your CI pipeline, add this step before `pod install`:

```yaml
- name: Validate plists
  run: bash scripts/ci-validate-plists.sh
```

This will fail the job if any plist issues are detected, preventing builds with corrupted files.

## Troubleshooting

### Still seeing "Found additional characters after parsing the root plist object"?

1. Ensure you ran the fix script and all files passed validation
2. Check if `scripts/broken_plists/` contains files that need restoration
3. Run the script again after restoring any files
4. If the error persists, check the exact file name in the error message and run:
   ```bash
   plutil -lint ios/<filename>
   ```
   Then post the output in GitHub Issues.

### plutil not available on Windows

`plutil` is only available on macOS. On Windows, use one of these options:

- **WSL (Windows Subsystem for Linux):**
  ```bash
  wsl bash scripts/fix_plists.sh
  ```

- **Git Bash:**
  ```bash
  bash scripts/fix_plists.sh
  ```

- **macOS or Mac runner in CI/CD**

### PowerShell script fails on Windows

Ensure execution policy allows the script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\fix_plists.ps1
```

If you want to permanently allow it (not recommended for security):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Files Involved

- **scripts/fix_plists.sh** - Bash diagnostics and fix
- **scripts/fix_plists.ps1** - PowerShell diagnostics
- **scripts/ci-validate-plists.sh** - CI wrapper
- **ios/exportOptions.plist** - Known-good xcodebuild export configuration
- **.gitattributes** - Enforces LF line endings for critical files

## Line Ending Enforcement

The `.gitattributes` file now explicitly enforces LF (Unix) line endings for:

- All `.plist` files
- All `.pbxproj` files
- All iOS native code (`.h`, `.m`, `.swift`)
- Podfile
- All TypeScript, JavaScript, and JSON files

This ensures that regardless of your local platform, files are checked out with consistent line endings on the CI runner.

## Next Steps

1. Run the appropriate fix script for your platform
2. Review and restore any files from `scripts/broken_plists/`
3. Run `pod install` from the `ios/` directory
4. Commit the updated `exportOptions.plist` and `.gitattributes` if they were changed
5. Push to GitHub to trigger the CI build
