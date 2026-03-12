# Captcha Service

Service Python doc lap de giai captcha (CRNN) cho backend `be/`.

## 1) Chuan bi model

- Dat file model vao `captcha-service/model/best_captcha_model.pth`.

## 2) Chay bang Docker

Tu root project:

```bash
docker compose -f be/docker-compose.yml up -d captcha-service
```

## 3) API

- `GET /health`
- `POST /solve`

Body:

```json
{
  "image_base64": "data:image/png;base64,..."
}
```

Header (neu bat key):

```text
x-api-key: <CAPTCHA_API_KEY>
```

Response:

```json
{
  "captcha_text": "AB12C"
}
```
