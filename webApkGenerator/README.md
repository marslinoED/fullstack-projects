# Capacitor APK Builder

A Windows-based starter project for packaging a web app as an Android APK with Capacitor.

## Requirements

- Windows 10 or 11
- Node.js 20 or newer
- Java JDK 21
- Android SDK (Android Studio can install it)

## First-time setup

Run `init.bat` from this repository. It installs the locked npm packages, creates a starter `build/index.html` if needed, adds the Android platform if it is missing, and syncs Capacitor.

## Build an APK from a web app

Your app folder must contain `build/index.html`. Optional custom artwork goes in `assets/icon.png` and/or `assets/splash.png`.

From PowerShell:

```powershell
.\New-CapacitorApk.ps1 -ProjectPath 'D:\MyWebApp' -AppName 'My App'
```

The APK is written to `D:\MyWebApp\dist_apk`. The default Android package ID is `com.generator.myapp`. Pass `-AppId 'com.example.myapp'` to choose a package ID explicitly.

For subsequent installs to update the same Android app, keep the same app name or explicit app ID and use the same signing key. The builder increments `versionCode` for each build.

## Shell alias

The reusable build logic lives in `New-CapacitorApk.ps1`. A PowerShell alias script can call it with the current directory as the app project. Set `CAPACITOR_APK_BUILDER_HOME` to this repository’s path, then call:

```powershell
& (Join-Path $env:CAPACITOR_APK_BUILDER_HOME 'New-CapacitorApk.ps1') -ProjectPath (Get-Location).Path
```

The builder restores default Android icon and splash resources before generating custom assets, so artwork from a previous app does not carry into a build with no assets.
