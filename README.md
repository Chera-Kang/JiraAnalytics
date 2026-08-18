# 📊 Jira Analytics Dashboard
> **React + Vite 기반 Jira 품질 지표 & 이슈 트래킹 대시보드**

Google Spreadsheet 및 Google Apps Script(GAS)를 데이터베이스 및 동기화 파이프라인으로 연동하여 실시간 이슈 트렌드, 우선순위, 유형, 담당자별 처리 성능을 시각화하는 대시보드입니다.

---

## 📌 주요 기능 (Features)

1. **글로벌 통계 (Global Stats & Trends)**
   - 연도별 전체 생성 이슈, 해결 이슈, 잔여 이슈 요약 카드
   - 월별 이슈 생성/해결 추이 및 잔여 이슈 변동 콤보 차트 (Bar + Line)

2. **세부 통계 (Detailed Breakdown)**
   - 연도별 & 수정버전(FixVersion)별 다차원 필터링 및 상호 리셋 인터랙션
   - 버전 기간(Period) 및 작업 일수(Work Days) 고정형 메타 정보 패널
   - 이슈 우선순위(Priority) & 이슈 유형(Type) 도넛 차트
   - 담당자별 이슈 개수 및 평균 이슈 처리 일수(Work Time) 수평 바 차트

3. **로드맵 및 향후 과제 (Next Milestones)**
   - 프론트엔드 실시간 연산 아키텍처 의사결정 비교
   - 담당자별 맞춤 대시보드 및 타임라인(Gantt) 확장 계획

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: `React 19`, `Vite`
- **Charts**: `Recharts`
- **Icons**: `Lucide React`
- **Data Source**: Google Spreadsheet (GViz API) / Google Apps Script
- **Code Quality**: `Oxlint`

---

## 🚀 시작하기 (Getting Started)

### 설치 및 로컬 실행
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
```

### 빌드 및 배포
```bash
npm run build
```

---

## 🔄 코드 업로드 (GitHub)
- `upload.bat` 파일을 더블클릭하면 자동으로 변경사항을 커밋하고 GitHub `main` 브랜치에 푸시합니다.

