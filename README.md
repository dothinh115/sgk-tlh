# Thăng Long Hội - Sách Giáo Khoa Anh Hùng Mệnh Thế

Nuxt app dùng Nuxt UI để đọc dữ liệu đội hình mùa Anh Hùng Mệnh Thế từ Google Sheets API và hiển thị thành sách giáo khoa responsive.

## Setup

```bash
yarn install
```

## Development

```bash
yarn dev
```

Mặc định dev server dùng `http://localhost:3000`. Có thể đổi port bằng:

```bash
yarn dev --host 127.0.0.1 --port 4321
```

## Verification

```bash
yarn lint
yarn typecheck
```

## Production

```bash
yarn build
yarn preview
```

Production deploy dùng PM2 với app name `sgk-tlh`, port `3006`, domain `mua18.thanglonghoi.xyz`.

## GitHub Actions Deploy

Workflow `.github/workflows/deploy.yml` cần các repository secrets:

- `VPS_HOST`: IP hoặc hostname VPS.
- `VPS_USER`: user SSH trên VPS.
- `SSH_PRIVATE_KEY`: private key SSH có quyền deploy.

Khi push vào `main`, workflow đồng bộ source lên `/apps/sgk-tlh`, chạy `yarn install`, `yarn build`, restart PM2, cấu hình nginx, và đăng ký HTTPS bằng certbot khi DNS của `mua18.thanglonghoi.xyz` đã trỏ về VPS.
