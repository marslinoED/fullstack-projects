param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$names
)

if (-not $names -or $names.Count -eq 0) {
    Write-Host "Usage: .\createRFC.ps1 <Component1> <Component2> ..."
    exit
}

# Ensure src\Components folder exists
$basePath = "src\Components"
if (-not (Test-Path $basePath)) {
    New-Item -ItemType Directory -Path $basePath -Force | Out-Null
}

foreach ($rawName in $names) {
    # Capitalize first letter, keep rest lowercase
    $name = $rawName.Substring(0,1).ToUpper() + $rawName.Substring(1).ToLower()

    $componentPath = Join-Path $basePath $name

    # Create component folder
    New-Item -ItemType Directory -Path $componentPath -Force | Out-Null

    # Create JSX file
    @"
import React from 'react'

export default function $name() {
  return (
    <div className='$name-Content'>
        <h2>$name Page</h2>
    </div>
  )
}
"@ | Set-Content "$componentPath\$name.jsx"


    Write-Host "RFC '$name' created successfully in $componentPath."
}
