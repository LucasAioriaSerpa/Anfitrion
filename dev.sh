#!/usr/bin/env bash

# Exit if tmux is missing
if ! command -v tmux &>/dev/null; then
    echo "⨉ tmux is not installed."
    echo "   sudo apt install tmux   (Debian/Ubuntu)"
    echo "   sudo dnf install tmux   (Fedora)"
    exit 1
fi

SESSION="flask-react"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"   
BACKEND_DIR="$SCRIPT_DIR/app/backend"
FRONTEND_DIR="$SCRIPT_DIR/app/frontend"

# Validate directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo "⨉ Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "⨉ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Kill existing session if running
tmux kill-session -t "$SESSION" 2>/dev/null

echo "Starting tmux session: $SESSION..."

# Create session & start backend
tmux new-session -d -s "$SESSION" -n "flask" -c "$BACKEND_DIR"

if [ -f "$BACKEND_DIR/.venv/bin/python" ]; then
    echo "Using backend virtual environment (.venv)"
    tmux send-keys -t "$SESSION:flask" "./.venv/bin/python Main.py" C-m
else
    echo "Warning: .venv not found in backend. Falling back to system python3."
    tmux send-keys -t "$SESSION:flask" "python3 Main.py" C-m
fi

# Split window & start frontend
tmux split-window -h -t "$SESSION:flask" -c "$FRONTEND_DIR"
tmux send-keys -t "$SESSION:flask.1" "npm run build && npx serve -s build" C-m

# Attach to the session
tmux attach-session -t "$SESSION"
