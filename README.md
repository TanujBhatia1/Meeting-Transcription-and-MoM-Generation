# Meeting-Transcription-and-MoM-Generation

A real-time AI Meeting Assistant built with **FastAPI**, **React**, **Faster-Whisper**, **Silero VAD**, **Speaker Diarization**, **Resemblyzer**, **PostgreSQL + pgvector**, and **Redis**.

The assistant provides:

* 🎤 Live Speech-to-Text
* 👥 Speaker Diarization
* 🧑 Speaker Identification
* 📝 Incremental Meeting Summary
* 📄 Final Minutes of Meeting (MoM)

---

# Project Structure

```
meeting-assistant/
│
├── backend/
│   ├── app.py
│   ├── routers/
│   ├── services/
│   ├── utils/
│   ├── models/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── docker-compose.yml
├── init_db.sql
└── README.md
```

---

# Tech Stack

## Backend

* Python 3.11
* FastAPI
* Uvicorn
* Faster-Whisper
* Silero VAD
* Resemblyzer
* PostgreSQL
* pgvector
* Redis

## Frontend

* React
* WebSocket
* MediaRecorder API

---

# System Requirements

Minimum

* Python 3.11+
* Node.js 18+
* PostgreSQL 15+
* Redis 7+
* FFmpeg
* Docker Desktop (optional)

Recommended

* 16 GB RAM
* 8 CPU cores
* Ubuntu 22.04 / Windows WSL2

---

# Running Locally

## 1. Clone Repository

```bash
git clone <repository-url>
cd meeting-assistant
```

---

## 2. Create Python Virtual Environment

Windows

```powershell
python -m venv .venv

.venv\Scripts\activate
```

Linux

```bash
python3 -m venv .venv

source .venv/bin/activate
```

---

## 3. Install Backend Dependencies

```bash
cd backend

pip install -r requirements.txt
```

---

## 4. Install FFmpeg

### Windows

Download FFmpeg

https://www.gyan.dev/ffmpeg/builds/

Add

```
ffmpeg/bin
```

to PATH.

Verify

```bash
ffmpeg -version
```

---

### Ubuntu

```bash
sudo apt update

sudo apt install ffmpeg
```

---

## 5. Install PostgreSQL

Create database

```
meetings
```

Run

```bash
psql -U postgres -d meetings -f init_db.sql
```

---

## 6. Install Redis

Windows

Run Redis using Docker or WSL.

Ubuntu

```bash
sudo apt install redis-server

sudo systemctl start redis
```

Verify

```bash
redis-cli ping
```

Expected

```
PONG
```

---

## 7. Configure Environment Variables

Create

```
backend/.env
```

Example

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/meetings

REDIS_URL=redis://localhost:6379/0

LLAMA_MODEL_PATH=models/mistral.gguf

OPENAI_API_KEY=
```

---

## 8. Start Backend

```bash
cd backend

uvicorn app:app --reload
```

Backend

```
http://localhost:8000
```

Swagger

```
http://localhost:8000/docs
```

---

## 9. Install Frontend

```bash
cd frontend

npm install
```

---

## 10. Start React

```bash
npm start
```

Frontend

```
http://localhost:3000
```

---

# Running with Docker Compose

## Requirements

Docker Desktop

Docker Compose

---

## Build

```bash
docker compose build
```

---

## Start

```bash
docker compose up
```

or

```bash
docker compose up --build
```

Detached mode

```bash
docker compose up -d
```

---

## Stop

```bash
docker compose down
```

Remove volumes

```bash
docker compose down -v
```

---

# Docker Services

| Service    | Port |
| ---------- | ---- |
| Backend    | 8000 |
| Frontend   | 3000 |
| PostgreSQL | 5432 |
| Redis      | 6379 |

---

# Initialize Database

After PostgreSQL starts

```bash
docker exec -it meeting-postgres psql \
-U postgres \
-d meetings \
-f /docker-entrypoint-initdb.d/init_db.sql
```

---

# Logs

Backend

```bash
docker compose logs -f backend
```

Frontend

```bash
docker compose logs -f frontend
```

Postgres

```bash
docker compose logs -f postgres
```

Redis

```bash
docker compose logs -f redis
```

---

# API Endpoints

## Health

```
GET /
```

---

## Swagger

```
GET /docs
```

---

## Live Transcription

```
WS /api/ws/asr
```

---

# Speaker Enrollment

```
python scripts/enroll_speaker.py 1 alice.wav

python scripts/enroll_speaker.py 2 bob.wav
```

---

# Database Tables

```
meetings

transcripts

speakers
```

---

# Models Used

| Component         | Model                    |
| ----------------- | ------------------------ |
| ASR               | Faster Whisper Small     |
| VAD               | Silero VAD               |
| Speaker Embedding | Resemblyzer              |
| Diarization       | FoxNoseTech Diarize      |
| Vector Search     | pgvector                 |
| Summary           | Llama CPP / Mistral GGUF |

---

# Useful Commands

Install Python packages

```bash
pip install -r requirements.txt
```

Freeze packages

```bash
pip freeze > requirements.txt
```

Build Docker

```bash
docker compose build
```

Run containers

```bash
docker compose up
```

Run in background

```bash
docker compose up -d
```

View containers

```bash
docker ps
```

View logs

```bash
docker compose logs -f
```

Restart backend

```bash
docker compose restart backend
```

Remove everything

```bash
docker compose down -v
```

---

# Development Workflow

```
Frontend

↓

WebSocket

↓

FastAPI

↓

Silero VAD

↓

Faster Whisper

↓

Speaker Diarization

↓

Speaker Identification

↓

Transcript Buffer

↓

LLM Summarizer

↓

Live Summary

↓

Final Minutes of Meeting
```

---

# Future Improvements

* JWT Authentication
* OAuth Login
* Meeting Recording
* Kafka Streaming
* Kubernetes Deployment
* GPU Support
* Multi-language ASR
* RAG for Meeting Context
* Calendar Integration
* Email MoM Delivery

---

# License

MIT License
