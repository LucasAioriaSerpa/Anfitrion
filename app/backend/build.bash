#!/bin/bash

set -e

rm -rf build/linux

echo "Building Main.py..."

./.venv/bin/python -m PyInstaller --icon=assets/favicon.ico --distpath build/linux --workpath build/linux/work -F Main.py

echo "Build complete."
