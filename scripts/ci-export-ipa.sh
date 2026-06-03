#!/bin/bash
set -e

echo "Running iOS export for unsigned IPA..."
cd "$(dirname "$0")/.."
mkdir -p ios/build/ipa

xcodebuild -workspace ios/MyTracker.xcworkspace -scheme MyTracker -configuration Release -archivePath "$PWD/ios/build/MyTracker.xcarchive" archive CODE_SIGNING_ALLOWED=NO
xcodebuild -exportArchive -archivePath "$PWD/ios/build/MyTracker.xcarchive" -exportOptionsPlist ios/exportOptions.plist -exportPath "$PWD/ios/build/ipa"

echo "Unsigned IPA exported to ios/build/ipa/MyTracker.ipa or similar output path."