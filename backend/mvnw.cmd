<# : batch portion
@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; $basedir = '%~dp0'; & '%~dp0.mvn\wrapper\mvnw.ps1' %* }"
exit /b %ERRORLEVEL%
#>
