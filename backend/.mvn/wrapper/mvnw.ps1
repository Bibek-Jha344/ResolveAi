# ResolveAI Maven Wrapper PowerShell Runner
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$MvnArgs
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent (Split-Path -Parent $scriptDir)

$propsFile = Join-Path $scriptDir "maven-wrapper.properties"
$distributionUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"

if (Test-Path $propsFile) {
    Get-Content $propsFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -match "^distributionUrl=(.+)$") {
            $distributionUrl = $matches[1]
        }
    }
}

$userHome = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::UserProfile)
$m2WrapperDir = Join-Path $userHome ".m2\wrapper\dists"
$mavenDir = Join-Path $m2WrapperDir "apache-maven-3.9.9"
$mvnCmd = Join-Path $mavenDir "bin\mvn.cmd"

if (-not (Test-Path $mvnCmd)) {
    Write-Host "[ResolveAI] Downloading Maven from $distributionUrl..."
    $tempZip = Join-Path $env:TEMP "apache-maven-3.9.9-bin.zip"
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $distributionUrl -OutFile $tempZip
    
    Write-Host "[ResolveAI] Extracting Maven..."
    New-Item -ItemType Directory -Force -Path $m2WrapperDir | Out-Null
    Expand-Archive -Path $tempZip -DestinationPath $m2WrapperDir -Force
    Remove-Item -Force $tempZip
}

if (-not (Test-Path $mvnCmd)) {
    # Check if extracted subfolder has different name
    $candidate = Get-ChildItem -Path $m2WrapperDir -Filter "mvn.cmd" -Recurse | Select-Object -First 1
    if ($candidate) {
        $mvnCmd = $candidate.FullName
    }
}

Write-Host "[ResolveAI] Executing: $mvnCmd $MvnArgs"
& $mvnCmd @MvnArgs
exit $LASTEXITCODE
