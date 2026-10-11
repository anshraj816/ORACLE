@echo off
echo ===================================================
echo   Starting ORACLE: Full Stack (Python + React Vite)
echo ===================================================
echo.

set PATH=C:\Users\pc\AppData\Roaming\dyad\managed-tools\node\v24.18.0;C:\Users\pc\AppData\Roaming\npm;C:\Program Files\Python314;C:\Program Files\Python314\Scripts;%PATH%

echo [1/2] Launching Python Pandas Analytics Backend on http://localhost:5000 ...
start "ORACLE Python Backend" cmd /k "python python_backend/server.py"

echo [2/2] Launching React Vite Frontend on http://localhost:5173 ...
start "ORACLE Web Application" cmd /k "npm run dev"

echo.
echo Both services are starting!
echo Access ORACLE in your browser at: http://localhost:5173
echo.
pause
