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
