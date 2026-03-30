$ErrorActionPreference = "Stop"

$TOOLS_DIR = "$PSScriptRoot\.tools"
if (-not (Test-Path $TOOLS_DIR)) {
    New-Item -ItemType Directory -Path $TOOLS_DIR | Out-Null
}

$JDK_ZIP = "$TOOLS_DIR\jdk17.zip"
$JDK_DIR = "$TOOLS_DIR\jdk17"
if (-not (Test-Path $JDK_DIR)) {
    Write-Host "Downloading Amazon Corretto JDK 17..."
    Invoke-WebRequest -Uri "https://corretto.aws/downloads/latest/amazon-corretto-17-x64-windows-jdk.zip" -OutFile $JDK_ZIP
    Write-Host "Extracting JDK 17..."
    Expand-Archive -Path $JDK_ZIP -DestinationPath $JDK_DIR -Force
    Remove-Item $JDK_ZIP -Force
}

$MAVEN_ZIP = "$TOOLS_DIR\maven.zip"
$MAVEN_DIR = "$TOOLS_DIR\maven"
if (-not (Test-Path $MAVEN_DIR)) {
    Write-Host "Downloading Maven 3.9.6..."
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip" -OutFile $MAVEN_ZIP
    Write-Host "Extracting Maven..."
    Expand-Archive -Path $MAVEN_ZIP -DestinationPath $MAVEN_DIR -Force
    Remove-Item $MAVEN_ZIP -Force
}

$JDK_HOME = Get-ChildItem -Path $JDK_DIR -Directory | Select-Object -First 1
$MAVEN_HOME = Get-ChildItem -Path $MAVEN_DIR -Directory | Select-Object -First 1

$env:JAVA_HOME = $JDK_HOME.FullName
$env:PATH = "$($MAVEN_HOME.FullName)\bin;$($JDK_HOME.FullName)\bin;$env:PATH"

Write-Host "Starting Spring Boot application on port 8080..."
Set-Location -Path $PSScriptRoot
mvn clean spring-boot:run
