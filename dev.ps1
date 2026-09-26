
Clear-Host

$wt = Get-Command wt -ErrorAction SilentlyContinue

if (-not $wt) {
    Write-Host "⨉ Windows Terminal (wt.exe) not found." -ForegroundColor Red
    Write-Host "   Install: https://aka.ms/terminal" -ForegroundColor Yellow
    exit 1
}

$backendDir  = "$PSScriptRoot\app\backend"
$frontendDir = "$PSScriptRoot\app\frontend"

wt -d $backendDir pwsh -NoExit -Command "py Main.py" `; split-pane -H -d $frontendDir pwsh -NoExit -Command "npm run dev" #"npm run build && npx serve -s build/Anfitrion-App-Build"