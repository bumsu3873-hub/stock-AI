# 실시간 주가 데이터 연동 가이드

## 🎯 현재 상태

✅ **완성됨**: 실시간 주가 데이터 시스템

## 📊 아키텍처

```
[프론트엔드 (React)]
        ↓ (WebSocket)
[Express + WebSocket 서버] 
        ↓ (HTTP API)
[Public API 또는 시뮬레이션]
```

## 🚀 시작하기

### 1. 서버 실행
```bash
cd /home/kangbeomsu/stock
npm run dev
```

출력:
```
✅ 서버 실행 중: http://localhost:8080
✅ WebSocket 준비됨: ws://localhost:8080
```

### 2. 웹사이트 접속
```
http://localhost:8080
```

### 3. 실시간 가격 업데이트 확인
- 좌측 종목 버튼을 클릭하여 종목 선택
- 2초마다 자동으로 가격 업데이트됨
- 현재 상황에 따라:
  - ✅ **실제 데이터**: Naver API 사용 (네트워크 가능 시)
  - 📊 **시뮬레이션**: 현실적인 가격 변동

## 📡 WebSocket 통신

### 클라이언트 → 서버
```javascript
// 종목 구독
ws.send(JSON.stringify({
  type: 'SUBSCRIBE',
  codes: ['005930', '000660']
}));

// 구독 해제
ws.send(JSON.stringify({
  type: 'UNSUBSCRIBE',
  codes: ['005930']
}));
```

### 서버 → 클라이언트
```javascript
// 가격 업데이트 (2초마다 자동 전송)
{
  "type": "PRICE_UPDATE",
  "data": [
    {
      "code": "005930",
      "name": "삼성전자",
      "price": 72500,
      "high": 73500,
      "low": 71500,
      "change": 500,
      "changePercent": "0.69",
      "volume": 5000000,
      "timestamp": "2026-01-27T14:15:57.250Z",
      "source": "simulation"
    }
  ],
  "timestamp": "2026-01-27T14:15:57.250Z"
}
```

## 🔧 API 엔드포인트

### HTTP REST API

#### 1. 개별 종목 가격 조회
```
GET /api/stocks/price/:code
```
예: `curl http://localhost:8080/api/stocks/price/005930`

응답:
```json
{
  "code": "005930",
  "name": "삼성전자",
  "price": 72500,
  "change": 500,
  "changePercent": "0.69"
}
```

#### 2. 여러 종목 가격 조회
```
GET /api/stocks/prices?codes=005930,000660,035420
```

#### 3. 종목 검색
```
GET /api/stocks/search?name=삼성
```

#### 4. 상한가 종목 조회
```
GET /api/stocks/limit-up?date=2026-01-27
```

## 🏆 주요 기능

| 기능 | 상태 | 설명 |
|------|------|------|
| 실시간 가격 업데이트 | ✅ | WebSocket 2초 간격 |
| 다중 종목 구독 | ✅ | 여러 종목 동시 추적 |
| 캐싱 (60초) | ✅ | API 요청 최적화 |
| 자동 재연결 | ✅ | 연결 끊김 시 5회 재시도 |
| 종목 선택 UI | ✅ | 프론트에서 종목 전환 |

## 📈 데이터 소스

### 1. Naver 금융 API (권장)
- ✅ 실제 주가 데이터
- ✅ 무료 (API Key 불필요)
- ❌ 네트워크 불가 시 폴백

### 2. 시뮬레이션 (폴백)
- ✅ 항상 작동
- ✅ 현실적인 가격 변동
- ❌ 실제 데이터 아님

## 🔄 다음 단계 (선택사항)

### 한국거래소 API 연동
키움증권 공식 API 대신 더 나은 옵션:
- **한국거래소 Open API**: https://openapi.krx.co.kr
- **장점**: 공식, 안정적, 무료
- **단점**: 신청 필요

### 키움증권 OpenAPI (Windows 전용)
- Windows 환경에서만 실시간 데이터
- 별도 ActiveX 설정 필요
- 문의: Kiwoom OpenAPI 공식 문서

## ✅ 테스트

실시간 WebSocket 테스트:
```bash
cd /home/kangbeomsu/stock
npm run dev &
node test-realtime.js
```

## 📝 추적 종목

현재 추적 중인 종목:
- 005930: 삼성전자
- 000660: SK하이닉스
- 035420: NAVER
- 035720: 카카오
- 005380: 현대차

종목 추가/변경: `/home/kangbeomsu/stock/services/kiwoom-service.js` 편집

## 🐛 트러블슈팅

### WebSocket 연결 실패
```
❌ 연결 실패 (Mock 데이터 사용)
```
→ 서버가 실행 중인지 확인: `curl http://localhost:8080`

### API 응답 느림
→ 캐시 검사: kiwoom-service.js의 `cacheExpiry` 값 조정

### 가격이 변동하지 않음
→ 시뮬레이션 모드 작동 중
→ 실제 API 연동 필요 시 위 "다음 단계" 참조

---

**작성일**: 2026-01-27
**최종 업데이트**: 2026-01-27
