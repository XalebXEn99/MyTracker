# MyTracker

MyTracker is a React Native bare workflow project using TypeScript. It includes a Mapbox-based tracking app with memories, walking and driving sessions, BLE watch scaffolding, SQLite persistence, and an iOS CI pipeline that produces an unsigned .ipa artifact for AltStore.

## Local development

1. Install dependencies:
   - `yarn install`
2. Install iOS pods:
   - `yarn ios:pod-install`
3. Run Metro:
   - `yarn start`
4. Run on a physical device/emulator:
   - `yarn ios`
   - `yarn android`

## Environment

- Copy `.env` and add your Mapbox token:
  - `MAPBOX_TOKEN=your_mapbox_token_here`
- In CI, add `MAPBOX_TOKEN` as a GitHub Secret.

## iOS CI and unsigned IPA

The repository includes `.github/workflows/build-ios.yml` and `scripts/ci-export-ipa.sh`.

Build commands used by CI:

```bash
cd ios
yarn ios:pod-install
xcodebuild -workspace ios/MyTracker.xcworkspace -scheme MyTracker -configuration Release -archivePath $PWD/build/MyTracker.xcarchive archive CODE_SIGNING_ALLOWED=NO CODE_SIGN_STYLE=Manual
xcodebuild -exportArchive -archivePath $PWD/build/MyTracker.xcarchive -exportOptionsPlist ios/exportOptions.plist -exportPath $PWD/build/ipa
```

The workflow uploads `MyTracker-unsigned.ipa` as an artifact.

## GitHub automation

Use the following commands to initialize git and push to GitHub:

```bash
git init
git add .
git commit -m "Initial MyTracker commit"
git remote add origin git@github.com:XalebXen99/MyTracker.git
git push -u origin main
```

If `gh` is authenticated, run:

```bash
gh repo create XalebXen99/MyTracker --public --source=. --remote=origin --push
```

## AltStore sideloading on Windows

1. Install AltServer on your PC.
2. Connect your iPhone via USB or Wi-Fi.
3. Open AltStore on the iPhone.
4. Download the `MyTracker-unsigned.ipa` artifact from GitHub Actions.
5. Use AltServer to install the downloaded IPA.
6. Sign with your Apple ID. Free accounts must re-sign every 7 days.

### Optional persistence options

- Use TrollStore for persistent installs on jailbroken devices.
- Use Apple Developer signing if you want an official provisioning profile.

## Privacy and data

- Local data is stored in SQLite and app sandbox files.
- Telemetry is disabled by default.
- The app includes export and clear-data scaffolding.

## Notes

- The iOS project is configured for manual signing and unsigned IPA export.
- The native modules `CarConnectionManager` and `MapSnapshotHelper` are wired for the iOS target.
- Platform-specific Android support is stubbed in `android/`.
