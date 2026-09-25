#!/bin/bash
set -e

rm -rf build/linux

echo "Building Main.py..."
py -m PyInstaller --distpath build/linux --workpath build/linux/work -F Main.py

echo "Build complete."
