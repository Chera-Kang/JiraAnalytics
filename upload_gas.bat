@echo off
:: 한글 깨짐 방지
chcp 65001 > nul

echo ========================================
echo   Google Apps Script (GAS) 코드 업로드
echo ========================================

echo.
echo [Google 클라우드로 업로드 중 (clasp push)...]
call npx @google/clasp push -f

if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------------------
    echo [에러] 업로드에 실패했습니다.
    echo clasp login 인증이 만료되었거나 권한을 확인해주세요.
    echo ----------------------------------------------------
) else (
    echo.
    echo ========================================
    echo   GAS 코드가 성공적으로 배포되었습니다!
    echo ========================================
)

pause
