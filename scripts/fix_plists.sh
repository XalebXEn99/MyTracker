#!/bin/bash
# fix_plists.sh - Diagnose and remediate CocoaPods plist parsing issues
# 
# This script detects malformed or misplaced plist files that cause
# CocoaPods to fail with "Found additional characters after parsing the root plist object"
# 
# Conservative approach: suspicious files are moved to scripts/broken_plists/ for manual review

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BROKEN_DIR="$SCRIPT_DIR/broken_plists"
IOS_DIR="$PROJECT_ROOT/ios"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== CocoaPods Plist Diagnostic and Fix ===${NC}"
echo "iOS directory: $IOS_DIR"
echo "Backup directory: $BROKEN_DIR"
echo ""

# Initialize tracking
ERRORS_FOUND=0
FIXES_APPLIED=0

# Step 1: Search for pbxproj markers in plist files
echo -e "${BLUE}Step 1: Searching for pbxproj markers in plist files...${NC}"
PBXPROJ_IN_PLIST=$(find "$IOS_DIR" -name "*.plist" -type f -exec grep -l "archiveVersion = 1;" {} \; 2>/dev/null || true)
if [ -n "$PBXPROJ_IN_PLIST" ]; then
    echo -e "${RED}ERROR: Found pbxproj content in plist file(s):${NC}"
    echo "$PBXPROJ_IN_PLIST" | while read -r file; do
        echo -e "${RED}  → $file${NC}"
        LINE_NUM=$(grep -n "archiveVersion = 1;" "$file" | head -1 | cut -d: -f1)
        echo -e "${RED}    (line $LINE_NUM)${NC}"
    done
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi

# Step 2: Lint all plist files
echo ""
echo -e "${BLUE}Step 2: Linting all .plist files under ios/...${NC}"
PLIST_FAILURES=""
while IFS= read -r plist_file; do
    if ! plutil -lint "$plist_file" &>/dev/null; then
        echo -e "${RED}FAILED:${NC} $plist_file"
        PLIST_FAILURES="$PLIST_FAILURES$plist_file"$'\n'
        ERRORS_FOUND=$((ERRORS_FOUND + 1))
    else
        echo -e "${GREEN}OK:${NC} $plist_file"
    fi
done < <(find "$IOS_DIR" -name "*.plist" -type f)

# Step 3: Attempt to convert binary plists to XML
echo ""
echo -e "${BLUE}Step 3: Checking for binary plists and converting to XML...${NC}"
BINARY_PLISTS=$(find "$IOS_DIR" -name "*.plist" -type f -exec file {} \; | grep "Apple binary" | cut -d: -f1 || true)
if [ -n "$BINARY_PLISTS" ]; then
    echo "$BINARY_PLISTS" | while read -r file; do
        echo -e "${YELLOW}Converting binary plist:${NC} $file"
        plutil -convert xml1 "$file"
        if plutil -lint "$file" &>/dev/null; then
            echo -e "${GREEN}Conversion successful${NC}"
            FIXES_APPLIED=$((FIXES_APPLIED + 1))
        else
            echo -e "${RED}Conversion failed, moving to broken_plists${NC}"
            mkdir -p "$BROKEN_DIR"
            mv "$file" "$BROKEN_DIR/$(basename "$file")"
            ERRORS_FOUND=$((ERRORS_FOUND + 1))
        fi
    done
fi

# Step 4: Move suspicious files
echo ""
echo -e "${BLUE}Step 4: Moving suspicious files for manual review...${NC}"
if [ -n "$PBXPROJ_IN_PLIST" ]; then
    mkdir -p "$BROKEN_DIR"
    echo "$PBXPROJ_IN_PLIST" | while read -r file; do
        BASENAME=$(basename "$file")
        echo -e "${YELLOW}Moving:${NC} $file → $BROKEN_DIR/$BASENAME"
        mv "$file" "$BROKEN_DIR/$BASENAME"
        FIXES_APPLIED=$((FIXES_APPLIED + 1))
    done
fi

# Step 5: Replace exportOptions.plist with known-good version
echo ""
echo -e "${BLUE}Step 5: Ensuring ios/exportOptions.plist is valid...${NC}"
EXPORT_PLIST="$IOS_DIR/exportOptions.plist"
cat > "$EXPORT_PLIST" << 'EOF'
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
EOF

if plutil -lint "$EXPORT_PLIST" &>/dev/null; then
    echo -e "${GREEN}exportOptions.plist is valid${NC}"
    FIXES_APPLIED=$((FIXES_APPLIED + 1))
else
    echo -e "${RED}Failed to create valid exportOptions.plist${NC}"
    ERRORS_FOUND=$((ERRORS_FOUND + 1))
fi

# Step 6: Final lint of all remaining plists
echo ""
echo -e "${BLUE}Step 6: Final validation of all .plist files...${NC}"
FINAL_FAILURES=0
while IFS= read -r plist_file; do
    if ! plutil -lint "$plist_file" &>/dev/null; then
        echo -e "${RED}FAILED:${NC} $plist_file"
        FINAL_FAILURES=$((FINAL_FAILURES + 1))
    else
        echo -e "${GREEN}OK:${NC} $plist_file"
    fi
done < <(find "$IOS_DIR" -name "*.plist" -type f)

# Summary
echo ""
echo -e "${BLUE}=== Summary ===${NC}"
echo -e "Errors found: ${RED}$ERRORS_FOUND${NC}"
echo -e "Fixes applied: ${GREEN}$FIXES_APPLIED${NC}"
echo -e "Final plist failures: ${RED}$FINAL_FAILURES${NC}"
echo ""

if [ -d "$BROKEN_DIR" ] && [ "$(ls -A $BROKEN_DIR)" ]; then
    echo -e "${YELLOW}⚠️  Suspicious files moved to $BROKEN_DIR${NC}"
    echo "Please review:"
    ls -la "$BROKEN_DIR"
    echo ""
    echo "If these files are legitimate, restore them from git:"
    echo "  git checkout ios/<filename>"
    echo ""
fi

if [ $FINAL_FAILURES -gt 0 ]; then
    echo -e "${RED}❌ Plist validation failed. Do not run pod install yet.${NC}"
    echo "Next steps:"
    echo "  1. Inspect files in $BROKEN_DIR"
    echo "  2. Review ios/exportOptions.plist"
    echo "  3. Run this script again"
    exit 1
fi

if [ $ERRORS_FOUND -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Issues were detected and moved for review.${NC}"
    echo "Next steps:"
    echo "  1. Inspect files in $BROKEN_DIR"
    echo "  2. Restore legitimate files: git checkout ios/<filename>"
    echo "  3. Delete or investigate moved files"
    echo "  4. Run: cd ios && rm -rf Pods Podfile.lock build"
    echo "  5. Run: pod cache clean --all && pod repo update && pod install --repo-update"
    exit 1
fi

echo -e "${GREEN}✅ All plist files are valid. Ready to run pod install.${NC}"
echo ""
echo "Next steps:"
echo "  cd ios"
echo "  rm -rf Pods Podfile.lock build"
echo "  pod cache clean --all"
echo "  pod repo update"
echo "  pod install --repo-update"
exit 0
