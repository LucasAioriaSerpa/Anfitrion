$ErrorActionPreference = "Stop"

Write-Host "Building Main.py..."
py -m PyInstaller --distpath build/windows11 --workpath build/windows11/work -F Main.py

if ($LASTEXITCODE -ne 0) {
    throw "PyInstaller build failed with exit code $LASTEXITCODE"
}
Write-Host "Build complete."
