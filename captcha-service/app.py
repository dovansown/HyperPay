import base64
import io
import os
from typing import Optional

import torch
import torch.nn as nn
from fastapi import FastAPI, Header, HTTPException
from PIL import Image
from pydantic import BaseModel, Field
from torchvision import transforms

CHARS = "-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
NUM_CLASSES = len(CHARS)
IDX_TO_CHAR = {idx: char for idx, char in enumerate(CHARS)}
IMG_WIDTH = 160
IMG_HEIGHT = 32


class CRNN(nn.Module):
    def __init__(self, num_classes: int):
        super().__init__()
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d((4, 1)),
        )
        self.rnn = nn.LSTM(
            input_size=256,
            hidden_size=256,
            num_layers=2,
            bidirectional=True,
            dropout=0.25,
        )
        self.fc = nn.Linear(256 * 2, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        conv = self.cnn(x)
        conv = conv.squeeze(2).permute(2, 0, 1)
        rnn_out, _ = self.rnn(conv)
        return self.fc(rnn_out)


class SolveCaptchaRequest(BaseModel):
    image_base64: str = Field(min_length=1)


class SolveCaptchaResponse(BaseModel):
    captcha_text: str


MODEL_PATH = os.getenv("MODEL_PATH", "/app/model/best_captcha_model.pth")
API_KEY = os.getenv("CAPTCHA_API_KEY", "")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
TRANSFORM = transforms.Compose(
    [
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,)),
    ]
)
MODEL = CRNN(NUM_CLASSES).to(DEVICE)
MODEL_LOADED = False

app = FastAPI(title="HyperPay Captcha Service", version="1.0.0")


def _strip_data_url_prefix(raw: str) -> str:
    if raw.startswith("data:") and "," in raw:
        return raw.split(",", 1)[1]
    return raw


def _decode_predictions(preds: torch.Tensor) -> str:
    _, max_indices = preds.max(2)
    pred = max_indices[:, 0].detach().cpu().numpy()
    result = []
    for idx, value in enumerate(pred):
        if value != 0 and not (idx > 0 and value == pred[idx - 1]):
            result.append(IDX_TO_CHAR[value])
    return "".join(result)


def _preprocess_image(image_bytes: bytes) -> torch.Tensor:
    image = Image.open(io.BytesIO(image_bytes)).convert("L")
    width, height = image.size
    if width < IMG_WIDTH:
        canvas = Image.new("L", (IMG_WIDTH, height), color=255)
        offset = ((IMG_WIDTH - width) // 2, 0)
        canvas.paste(image, offset)
        image = canvas
    image = image.resize((IMG_WIDTH, IMG_HEIGHT))
    return TRANSFORM(image).unsqueeze(0).to(DEVICE)


def _require_api_key(x_api_key: Optional[str]) -> None:
    if not API_KEY:
        return
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid api key")


@app.on_event("startup")
def startup() -> None:
    global MODEL_LOADED
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model file not found: {MODEL_PATH}")
    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
    MODEL.load_state_dict(state_dict)
    MODEL.eval()
    MODEL_LOADED = True


@app.get("/health")
def health() -> dict:
    return {"ok": True, "model_loaded": MODEL_LOADED, "device": str(DEVICE)}


@app.post("/solve", response_model=SolveCaptchaResponse)
def solve(payload: SolveCaptchaRequest, x_api_key: Optional[str] = Header(default=None)) -> SolveCaptchaResponse:
    _require_api_key(x_api_key)
    if not MODEL_LOADED:
        raise HTTPException(status_code=503, detail="Model is not loaded")

    try:
        raw_b64 = _strip_data_url_prefix(payload.image_base64)
        image_bytes = base64.b64decode(raw_b64, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {exc}") from exc

    try:
        image_tensor = _preprocess_image(image_bytes)
        with torch.no_grad():
            preds = MODEL(image_tensor)
        captcha_text = _decode_predictions(preds)
        return SolveCaptchaResponse(captcha_text=captcha_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Captcha solve failed: {exc}") from exc
