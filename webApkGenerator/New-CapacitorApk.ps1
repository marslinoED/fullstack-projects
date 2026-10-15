param(
    [string]$ProjectPath = (Get-Location).Path,
    [string]$AppName,
    [string]$AppId,
    [string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'
$ProjectPath = [System.IO.Path]::GetFullPath($ProjectPath)
$generatorPath = [System.IO.Path]::GetFullPath($PSScriptRoot)
if ($ProjectPath.TrimEnd('\') -ieq $generatorPath.TrimEnd('\')) {
    throw 'ProjectPath must point to an app folder, not the builder repository.'
}
$webDir = Join-Path $ProjectPath 'build'
if (-not (Test-Path -LiteralPath (Join-Path $webDir 'index.html'))) {
    throw "Required file not found: $(Join-Path $webDir 'index.html')"
}
if ([string]::IsNullOrWhiteSpace($AppName)) { $AppName = Read-Host 'Enter your App Name' }
if ([string]::IsNullOrWhiteSpace($AppName)) { $AppName = 'MyCapApp' }
$AppName = $AppName.Trim()
$slug = ($AppName -replace '[^a-zA-Z0-9]', '').ToLowerInvariant()
if ([string]::IsNullOrWhiteSpace($slug)) { throw 'App name must contain at least one English letter or number.' }
if ($slug -match '^[0-9]') { $slug = "app$slug" }
if ([string]::IsNullOrWhiteSpace($AppId)) { $AppId = "com.generator.$slug" }
if ($AppId -notmatch '^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$') {
    throw "Invalid Android application ID: $AppId"
}
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) { $OutputDirectory = Join-Path $ProjectPath 'dist_apk' }
$OutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)

$generatorBuildDir = Join-Path $generatorPath 'build'
$generatorAssetsDir = Join-Path $generatorPath 'assets'
$hasIcon = Test-Path -LiteralPath (Join-Path $ProjectPath 'assets/icon.png')
$hasSplash = Test-Path -LiteralPath (Join-Path $ProjectPath 'assets/splash.png')
$originalLocation = Get-Location
$backupRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("capacitor-apk-builder-" + [guid]::NewGuid().ToString('N'))
$hadBuild = Test-Path -LiteralPath $generatorBuildDir
$hadAssets = Test-Path -LiteralPath $generatorAssetsDir
New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null

try {
    Set-Location $generatorPath
    if ($hadBuild) { Move-Item -LiteralPath $generatorBuildDir -Destination (Join-Path $backupRoot 'build') }
    if ($hadAssets) { Move-Item -LiteralPath $generatorAssetsDir -Destination (Join-Path $backupRoot 'assets') }
    Copy-Item -Recurse -Force -LiteralPath $webDir -Destination $generatorPath

    if ($hasIcon -or $hasSplash) {
        New-Item -ItemType Directory -Force -Path $generatorAssetsDir | Out-Null
        if ($hasIcon) { Copy-Item -Force (Join-Path $ProjectPath 'assets/icon.png') (Join-Path $generatorAssetsDir 'icon.png') }
        if ($hasSplash) { Copy-Item -Force (Join-Path $ProjectPath 'assets/splash.png') (Join-Path $generatorAssetsDir 'splash.png') }
    }

    $gradlePath = Join-Path $generatorPath 'android/app/build.gradle'
    $gradleText = [System.IO.File]::ReadAllText($gradlePath)
    $appIdPattern = '(?m)(^\s*applicationId\s+)"[^"]+"'
    if ($gradleText -notmatch $appIdPattern) { throw "Could not find applicationId in $gradlePath" }
    $gradleText = [regex]::Replace($gradleText, $appIdPattern, ('$1"' + $AppId + '"'))
    $versionPattern = '(?m)^\s*versionCode\s+\d+'
    $versionMatch = [regex]::Match($gradleText, $versionPattern)
    if (-not $versionMatch.Success) { throw "Could not find versionCode in $gradlePath" }
    $currentVersionCode = [int]([regex]::Match($versionMatch.Value, '\d+').Value)
    $versionCode = $currentVersionCode + 1
    if ($versionCode -gt 2100000000) { throw 'Android versionCode limit reached.' }
    $updatedVersionLine = [regex]::Replace($versionMatch.Value, '\d+', [string]$versionCode)
    $gradleText = $gradleText.Replace($versionMatch.Value, $updatedVersionLine)
    [System.IO.File]::WriteAllText($gradlePath, $gradleText, (New-Object System.Text.UTF8Encoding($false)))

    $stringsPath = Join-Path $generatorPath 'android/app/src/main/res/values/strings.xml'
    [xml]$stringsXml = [System.IO.File]::ReadAllText($stringsPath)
    foreach ($resourceName in @('app_name', 'title_activity_main')) {
        $node = $stringsXml.SelectSingleNode("/resources/string[@name='$resourceName']")
        if ($null -eq $node) { throw "Could not find string resource '$resourceName' in $stringsPath" }
        $node.InnerText = $AppName
    }
    foreach ($resourceName in @('package_name', 'custom_url_scheme')) {
        $node = $stringsXml.SelectSingleNode("/resources/string[@name='$resourceName']")
        if ($null -ne $node) { $node.InnerText = $AppId }
    }
    $stringsXml.Save($stringsPath)

    $configPath = Join-Path $generatorPath 'capacitor.config.json'
    $config = [System.IO.File]::ReadAllText($configPath) | ConvertFrom-Json
    $config.appName = $AppName
    $config.appId = $AppId
    $json = $config | ConvertTo-Json -Depth 20
    [System.IO.File]::WriteAllText($configPath, $json, (New-Object System.Text.UTF8Encoding($false)))

    # Restore baseline image resources before optionally generating this app's custom artwork.
    $templateArchive = Join-Path $generatorPath 'node_modules/@capacitor/cli/assets/android-template.tar.gz'
    if (-not (Test-Path -LiteralPath $templateArchive)) { throw "Capacitor Android template not found: $templateArchive. Run init.bat first." }
    $templateExtractDir = Join-Path $backupRoot 'android-template'
    New-Item -ItemType Directory -Force -Path $templateExtractDir | Out-Null
    & tar.exe -xzf $templateArchive -C $templateExtractDir 'app/src/main/res'
    if ($LASTEXITCODE -ne 0) { throw "Could not extract Capacitor Android template (exit code $LASTEXITCODE)" }
    $resRoot = Join-Path $generatorPath 'android/app/src/main/res'
    $templateResRoot = Join-Path $templateExtractDir 'app/src/main/res'
    Get-ChildItem -LiteralPath $resRoot -Recurse -File |
        Where-Object { $_.Name -eq 'splash.png' -or $_.Name -like 'ic_launcher*' } |
        Remove-Item -Force
    Get-ChildItem -LiteralPath $templateResRoot -Recurse -File |
        Where-Object { $_.Name -eq 'splash.png' -or $_.Name -like 'ic_launcher*' } |
        ForEach-Object {
            $relativePath = $_.FullName.Substring($templateResRoot.Length).TrimStart('\', '/')
            $destination = Join-Path $resRoot $relativePath
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
            Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
        }
    if ($hasIcon -or $hasSplash) {
        & npx.cmd capacitor-assets generate --android
        if ($LASTEXITCODE -ne 0) { throw "Capacitor asset generation failed with exit code $LASTEXITCODE" }
    }

    Remove-Item -Recurse -Force (Join-Path $generatorPath 'android/.gradle') -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force (Join-Path $generatorPath 'android/app/build') -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force (Join-Path $generatorPath 'android/app/src/main/assets') -ErrorAction SilentlyContinue
    & npx.cmd cap sync android
    if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed with exit code $LASTEXITCODE" }
    Set-Location (Join-Path $generatorPath 'android')
    & .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) { throw "Gradle build failed with exit code $LASTEXITCODE" }

    New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
    $sourceApk = Join-Path $generatorPath 'android/app/build/outputs/apk/debug/app-debug.apk'
    if (-not (Test-Path -LiteralPath $sourceApk)) { throw "APK not found at $sourceApk" }
    $timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    $finalApkPath = Join-Path $OutputDirectory ("{0}_{1}.apk" -f $slug, $timestamp)
    Copy-Item -Force $sourceApk $finalApkPath
    Write-Host "APK: $finalApkPath" -ForegroundColor Green
    Write-Host "App: $AppName | ID: $AppId | versionCode: $versionCode" -ForegroundColor Green
}
finally {
    Set-Location $originalLocation
    Remove-Item -Recurse -Force $generatorBuildDir -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force $generatorAssetsDir -ErrorAction SilentlyContinue
    if ($hadBuild -and (Test-Path (Join-Path $backupRoot 'build'))) { Move-Item -LiteralPath (Join-Path $backupRoot 'build') -Destination $generatorBuildDir }
    if ($hadAssets -and (Test-Path (Join-Path $backupRoot 'assets'))) { Move-Item -LiteralPath (Join-Path $backupRoot 'assets') -Destination $generatorAssetsDir }
    Remove-Item -Recurse -Force $backupRoot -ErrorAction SilentlyContinue
}
