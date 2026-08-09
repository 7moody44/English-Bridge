#!/usr/bin/env pwsh

# English Bridge - Master Troubleshooting Script
# Provides comprehensive diagnosis and solutions

Clear-Host

$title = "╔════════════════════════════════════════════╗"
$line = "║"
$end = "╚════════════════════════════════════════════╝"

Write-Host $title -ForegroundColor Cyan
Write-Host "║  English Bridge - Troubleshooting Tool  ║" -ForegroundColor Cyan
Write-Host $end -ForegroundColor Cyan
Write-Host ""

# Helper functions
function Section { param([string]$Title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "  $Title" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
}

function Check { param([string]$Title)
    Write-Host "  ▶ $Title..." -ForegroundColor Cyan -NoNewline
}

function Success { param([string]$Message = "")
    if ($Message) {
        Write-Host " $Message" -ForegroundColor Green
    } else {
        Write-Host " ✅" -ForegroundColor Green
    }
}

function Fail { param([string]$Message = "")
    if ($Message) {
        Write-Host " $Message" -ForegroundColor Red
    } else {
        Write-Host " ❌" -ForegroundColor Red
    }
}

function Warn { param([string]$Message)
    Write-Host "    ⚠️  $Message" -ForegroundColor Yellow
}

function Info { param([string]$Message)
    Write-Host "    ℹ️  $Message" -ForegroundColor Gray
}

function Solution { param([string]$Title, [string[]]$Steps)
    Write-Host ""
    Write-Host "  💡 Solution: $Title" -ForegroundColor Green
    foreach ($step in $Steps) {
        Write-Host "     • $step" -ForegroundColor Yellow
    }
}

# Variables to track issues
$issues = @()

# ============= 1. ENVIRONMENT CHECK =============
Section "1. ENVIRONMENT CHECK"

Check "Node.js installed"
$nodeVersion = node -v 2>$null
if ($nodeVersion) {
    Success "($nodeVersion)"
} else {
    Fail "(NOT FOUND)"
    $issues += "Node.js not installed"
}

Check "npm installed"
$npmVersion = npm -v 2>$null
if ($npmVersion) {
    Success "($npmVersion)"
} else {
    Fail "(NOT FOUND)"
    $issues += "npm not installed"
}

# ============= 2. PROJECT STRUCTURE =============
Section "2. PROJECT STRUCTURE"

$requiredFiles = @(
    ".\.env",
    ".\package.json",
    ".\backend\.env",
    ".\backend\package.json"
)

foreach ($file in $requiredFiles) {
    Check "Checking $file"
    if (Test-Path $file) {
        Success
    } else {
        Fail "(MISSING)"
        $issues += "$file is missing"
    }
}

# ============= 3. DEPENDENCIES =============
Section "3. DEPENDENCIES"

Check "Frontend node_modules"
if (Test-Path ".\node_modules") {
    Success
} else {
    Warn "Not installed"
    Info "Run: npm install"
}

Check "Backend node_modules"
if (Test-Path ".\backend\node_modules") {
    Success
} else {
    Warn "Not installed"
    Info "Run: cd backend && npm install"
}

# ============= 4. CONFIGURATION =============
Section "4. CONFIGURATION"

Check "Frontend .env"
$envFile = Get-Content ".\.env" -ErrorAction SilentlyContinue
if ($envFile) {
    if ($envFile -match "VITE_API_BASE_URL=http://localhost:5000") {
        Success "(Correct)"
    } else {
        Fail "(Incorrect)"
        $issues += "Frontend API URL is not pointing to localhost:5000"
        Warn "Current configuration:"
        $envFile | Select-String "VITE_API_BASE_URL" | ForEach-Object { Info $_.Line }
    }
} else {
    Fail "(NOT FOUND)"
    $issues += ".env file not found"
}

Check "Backend .env"
$backendEnv = Get-Content ".\backend\.env" -ErrorAction SilentlyContinue
if ($backendEnv) {
    if ($backendEnv -match "PORT=5000" -and $backendEnv -match "MONGODB_URI") {
        Success "(Correct)"
    } else {
        Warn "(Incomplete)"
    }
} else {
    Fail "(NOT FOUND)"
    $issues += "backend\.env file not found"
}

# ============= 5. PORT AVAILABILITY =============
Section "5. PORT AVAILABILITY"

$criticalPorts = @(
    @{ Port = 5000; Name = "Backend" },
    @{ Port = 5173; Name = "Frontend" }
)

foreach ($portInfo in $criticalPorts) {
    Check "Port $($portInfo.Port) ($($portInfo.Name))"
    $connection = Test-NetConnection -ComputerName localhost -Port $portInfo.Port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Success "(IN USE)"
        Info "Port $($portInfo.Port) is already being used"
    } else {
        Success "(Available)"
    }
}

# ============= 6. SERVICE STATUS =============
Section "6. SERVICE STATUS"

Check "Backend API"
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:5000/" -TimeoutSec 2 -ErrorAction Stop
    Success "(Running)"
} catch {
    Fail "(NOT RUNNING)"
    $issues += "Backend API is not running on port 5000"
}

Check "Frontend"
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction Stop
    Success "(Running)"
} catch {
    Fail "(NOT RUNNING)"
    $issues += "Frontend is not running on port 5173"
}

Check "MongoDB Connection"
try {
    $dbStatus = Invoke-WebRequest -Uri "http://localhost:5000/db-status" -TimeoutSec 2 -ErrorAction Stop
    $dbJson = $dbStatus.Content | ConvertFrom-Json
    if ($dbJson.database.status -eq "healthy") {
        Success "(Connected)"
    } else {
        Fail "(Disconnected)"
        $issues += "MongoDB is not connected"
    }
} catch {
    Warn "(Cannot verify - Backend not running)"
}

# ============= 7. API CONNECTIVITY =============
Section "7. API CONNECTIVITY TEST"

if (-not ($issues -contains "Backend API is not running on port 5000")) {
    Check "API Response"
    try {
        $apiResponse = Invoke-WebRequest -Uri "http://localhost:5000/api" -TimeoutSec 2 -ErrorAction Stop
        $apiJson = $apiResponse.Content | ConvertFrom-Json
        Success "($($apiJson.message))"
    } catch {
        Fail "No response from API"
        $issues += "API is not responding correctly"
    }
}

# ============= 8. SUMMARY =============
Section "8. ISSUE SUMMARY"

if ($issues.Count -eq 0) {
    Write-Host ""
    Write-Host "✅ No major issues detected!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your system appears to be configured correctly." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  Found $($issues.Count) issue(s):" -ForegroundColor Red
    Write-Host ""
    for ($i = 0; $i -lt $issues.Count; $i++) {
        Write-Host "  $($i + 1). $($issues[$i])" -ForegroundColor Red
    }
    Write-Host ""
}

# ============= 9. RECOMMENDATIONS =============
Section "9. RECOMMENDATIONS"

Write-Host ""

if ($issues -contains "Node.js not installed") {
    Solution "Install Node.js" @(
        "Download from https://nodejs.org/",
        "Install LTS version (v18+)",
        "Restart terminal after installation"
    )
}

if ($issues -contains "npm not installed") {
    Solution "Install npm" @(
        "npm comes with Node.js",
        "Make sure Node.js was installed correctly",
        "Restart terminal"
    )
}

if ($issues -contains "Frontend node_modules is missing") {
    Solution "Install Frontend Dependencies" @(
        "cd E:\CODING\englishwebsite\EnglishBridge",
        "npm install"
    )
}

if ($issues -contains "Backend node_modules is missing") {
    Solution "Install Backend Dependencies" @(
        "cd E:\CODING\englishwebsite\EnglishBridge\backend",
        "npm install"
    )
}

if ($issues -contains "Backend API is not running on port 5000") {
    Solution "Start Backend Server" @(
        "cd E:\CODING\englishwebsite\EnglishBridge\backend",
        "npm run dev",
        "Wait for 'Server running on port 5000' message"
    )
}

if ($issues -contains "Frontend is not running on port 5173") {
    Solution "Start Frontend Server" @(
        "cd E:\CODING\englishwebsite\EnglishBridge",
        "npm run dev",
        "Wait for 'http://localhost:5173' message"
    )
}

if ($issues -contains "Frontend API URL is not pointing to localhost:5000") {
    Solution "Fix Frontend Configuration" @(
        "Edit .env file in project root",
        "Change VITE_API_BASE_URL to: http://localhost:5000/api",
        "Save and restart frontend: npm run dev"
    )
}

if ($issues -contains "MongoDB is not connected") {
    Solution "Fix MongoDB Connection" @(
        "Check internet connection (MongoDB Atlas is cloud)",
        "Verify .env has correct MONGODB_URI",
        "Check MongoDB Atlas cluster is running",
        "Restart backend server: npm run dev"
    )
}

if ($issues -contains "API is not responding correctly") {
    Solution "Debug API Issues" @(
        "cd backend",
        ".\CHECK_ERRORS.ps1 (Check for TypeScript errors)",
        ".\START_WITH_LOG.ps1 (See detailed error logs)"
    )
}

# ============= 10. QUICK START =============
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "  QUICK START" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "  Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "    cd backend" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "    npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  Then visit:" -ForegroundColor Yellow
Write-Host "    http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

# ============= FOOTER =============
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "  Troubleshooting Complete" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

if ($issues.Count -eq 0) {
    Write-Host "✨ Everything looks good! Ready to run." -ForegroundColor Green
} else {
    Write-Host "📝 Follow the solutions above to fix the issues." -ForegroundColor Yellow
}

Write-Host ""
