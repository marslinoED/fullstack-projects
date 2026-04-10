# ---- Script: createRFC.ps1 ----
# Usage: .\createRFC.ps1 <ComponentName1> [ComponentName2 ...
# This script creates a new React Functional Component file for each provided component name.
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$names)
if (-not $names) { Write-Host "Usage: .\createRFC.ps1 <Comp1> <Comp2>"; exit }
$basePath = "src\Components"
if (-not (Test-Path $basePath)) { New-Item -ItemType Directory -Path $basePath -Force | Out-Null }
foreach ($n in $names) {
    $name = $n.Substring(0,1).ToUpper() + $n.Substring(1).ToLower()
    $path = Join-Path $basePath $name
    New-Item -ItemType Directory -Path $path -Force | Out-Null
    @"
import React from 'react'
export default function $name() {
  return (
    <div className='$name-Content'>
        <h2>$name Page</h2>
    </div>
  )
}
"@ | Set-Content "$path\$name.jsx"
    Write-Host "RFC '$name' created."
}
