# 📊 Jira Analytics Dashboard

Jira 이슈 데이터와 스프린트 품질 지표를 직관적으로 분석하고 추적하기 위한 대시보드 웹 애플리케이션입니다.  
Google Spreadsheet(GViz API)를 데이터 소스로 활용하여 별도의 복잡한 백엔드 서버 없이 프론트엔드에서 실시간 다차원 집계 및 시각화를 제공합니다.

---

## 📌 주요 기능

### 1. 📈 프로젝트 전체 통계 (Overview)
- **연도별 종합 지표**: 전체 생성 이슈, 해결 완료, 잔여 이슈, 해결률 요약
- **월별 이슈 트렌드**: 월별 이슈 생성/해결량 및 누적 잔여 이슈 추이 콤보 차트 (Bar + Line)
- **핵심 분포 차트**: 우선순위 및 이슈 유형별 비율 도넛 차트, 담당자별 처리량 수평 바 차트

### 2. 🔍 세부 통계 심층 분석 (Detailed Breakdown)
- **5종 다차원 검색 필터**: 연도, 수정버전(Sprint/Release), 담당자, 이슈 유형, 상태별 상호 연동 필터링
- **핵심 품질 KPI**: 총 이슈, 해결 완료, 평균 개발 소요일수, Reopen Rate 요약
- **버전/담당자 콤보 차트**: 수정버전별 또는 담당자별 처리 건수 및 평균 소요일수 교차 비교
- **이슈 탐색기 & 모달**: 검색창, 20건 페이징, 이슈별 소요일수 표출 및 클릭 시 세부 정보(설명, Linked Issues, 타임라인) 모달 제공

### 3. 👤 개인별 맞춤 대시보드 (Personal Report)
- **팀 기여도 벤치마크**: 전체 팀 내 이슈 처리 순위 및 점유율(Share), 릴리즈 버전 참석률
- **개인 4대 KPI & 팀 대비 비교**: 평균 소요일수 및 Reopen Rate에 대해 팀 평균 대비 격차(예: `팀 대비 -0.6일 빠름`) 뱃지 표출
- **주력 업무 포지션 분석**: 기획/디자인/스토리/작업/하위작업/버그 등 개인의 롤 비중 도넛 차트
- **버전별 처리량 추이**: 참여한 릴리즈 버전별 작업량 및 소요일수 변화 그래프

---

## 🛠️ 기술 스택

- **Frontend**: React 19, Vite
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Data Source**: Google Spreadsheet (GViz Public JSON API)
- **Linter / Formatter**: Oxlint

---

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 연동할 Google Spreadsheet ID를 입력합니다.
```bash
cp .env.example .env
```

```ini
# .env
VITE_SHEET_ID=your_google_spreadsheet_id_here
```

### 3. 로컬 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
```
