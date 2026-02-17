

# Plan: Windows Batch File to Run Flask Backend

## Overview

Create a Windows `.bat` file that automatically activates the Python virtual environment and starts the Flask backend server. This file will be placed in the project root so it can be easily executed alongside the Electron desktop app.

## File to Create

### `start-backend.bat` (Project Root)

The batch file will:

1. Change directory to `C:\bright-sight\python_backend`
2. Check if the `venv` folder exists; if not, display an error message prompting the user to create it
3. Activate the virtual environment (`venv\Scripts\activate`)
4. Run `python app.py`
5. Keep the terminal open if there's an error

```bat
@echo off
cd /d C:\bright-sight\python_backend

if not exist venv (
    echo ERROR: Virtual environment not found.
    echo Run: python -m venv venv
    echo Then: venv\Scripts\activate
    echo Then: pip install -r requirements.txt
    pause
    exit /b 1
)

call venv\Scripts\activate
python app.py
pause
```

## How It Works

- Double-click `start-backend.bat` from Explorer or run it from a terminal
- It navigates to the `python_backend` folder, activates the venv, and launches the Flask server on port 5000
- If the venv doesn't exist yet, it tells you the setup commands to run first
- `pause` at the end keeps the window open so you can see any errors

## No Other Files Changed

This is a standalone batch file -- no modifications to existing code.

