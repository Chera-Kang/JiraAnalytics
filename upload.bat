@echo off
:: 한글 깨짐 방지
chcp 65001 > nul

echo ========================================
echo   Jira Analytics 코드 GitHub 업로드 시작
echo ========================================

:: 1. Git 저장소 초기화 확인
if not exist .git (
    echo [Git 저장소 초기화 중...]
    git init
    git branch -M main
)

:: 2. 변경사항 등록
echo [변경사항 등록 중 (git add)...]
git add .

:: 3. 커밋 생성
set currenttime=%time:~0,5%
set datetime=%date% %currenttime%

echo [커밋 생성 중...]
git commit -m "update: Jira Analytics dashboard (%datetime%)"

:: 4. 원격 저장소 푸시
echo.
echo [GitHub 서버로 업로드 중 (git push)...]
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo ----------------------------------------------------
    echo [안내] 만약 원격 저장소(remote origin)가 등록되지 않았다면:
    echo   git remote add origin ^<GitHub_레포지토리_URL^>
    echo 명령어를 1회 실행한 후 다시 이 배치파일을 실행해주세요.
    echo ----------------------------------------------------
) else (
    echo.
    echo ========================================
    echo   업데이트가 성공적으로 완료되었습니다!
    echo ========================================
)

pause