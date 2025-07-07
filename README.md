# barcode-scanner

이것은 바코드 스캐너 애플리케이션을 위한 모노레포(monorepo) 프로젝트입니다.

## 🚀 프로젝트 구조

-   `client/`: React (Vite) 프론트엔드 애플리케이션
-   `server/`: NestJS 백엔드 애플리케이션
-   `package.json`: pnpm을 사용한 루트 워크스페이스 설정
-   `pm2.config.js`: 프로덕션 환경을 위한 PM2 설정

## ✅ 사전 준비

-   Node.js (v18 이상 권장)
-   pnpm
-   PM2 (프로덕션 배포 시)

## 🛠️ 시작하기

1.  **의존성 설치**
    프로젝트 루트 디렉토리에서 아래 명령어를 실행하여 모든 워크스페이스의 의존성을 설치합니다.

    ```bash
    pnpm install
    ```

2.  **개발 서버 실행**
    클라이언트와 서버를 동시에 개발 모드로 실행합니다. (Hot-reloading 지원)

    ```bash
    pnpm dev
    ```

    -   React 개발 서버: `http://localhost:5173`
    -   NestJS 개발 서버: `http://localhost:3000`

## 📦 프로덕션

1.  **애플리케이션 빌드**
    `client`와 `server`를 프로덕션용으로 빌드합니다.
    ```bash
    pnpm build
    ```

2.  **PM2로 서버 실행**
    ```bash
    pnpm start
    ```
