#!/usr/bin/env bash

if ! command -v tmux &>/dev/null; then
    echo "⨉ tmux is not installed."
    echo "   sudo apt install tmux   (Debian/Ubuntu)"
    echo "   sudo dnf install tmux   (Fedora)"
    exit 1
fi

SESSION="flask-react"
BACKEND_DIR="$(dirname "$0")/app/backend"
FRONTEND_DIR="$(dirname "$0")/app/frontend"

tmux kill-session -t "$SESSION" 2>/dev/null

tmux new-session -d -s "$SESSION" -n "flask" -c "$BACKEND_DIR"
tmux send-keys -t "$SESSION:flask" "py Main.py" C-m

tmux split-window -h -t "$SESSION:flask" -c "$FRONTEND_DIR"
tmux send-keys -t "$SESSION:flask.1" "npm run build && npx serve -s build" C-m

tmux attach-session -t "$SESSION"