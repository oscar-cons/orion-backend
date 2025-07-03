@echo off
REM ------------------------------------------------------------------------------
REM Script to START and STOP a custom PostgreSQL instance on Windows
REM Usage:
REM   postgres_control.bat start  → Starts the PostgreSQL instance
REM   postgres_control.bat stop   → Stops the PostgreSQL instance
REM ------------------------------------------------------------------------------
REM CONFIGURATION SECTION - ADJUST THESE VALUES TO YOUR INSTALLATION

set "PGDATA=C:\Users\OscarGranados\Desktop\studio\postgresql_data"
set "PGBIN=C:\Program Files\PostgreSQL\17\bin"
set "PORT=5433"
set "LOGFILE=%PGDATA%\server.log"

REM ------------------------------------------------------------------------------
if "%1"=="start" (
    echo Starting PostgreSQL at %PGDATA% on port %PORT%...
    "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -o "-p %PORT%" -l "%LOGFILE%" start
    goto :eof
)

if "%1"=="stop" (
    echo Stopping PostgreSQL at %PGDATA%...
    "%PGBIN%\pg_ctl.exe" -D "%PGDATA%" stop
    goto :eof
)

echo Usage: %~nx0 [start^|stop]
