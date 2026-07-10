# Stage 1: Build dependencies
FROM python:3.12-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime runner
FROM python:3.12-slim AS runner
WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

# Run scoring engine
CMD ["python", "-m", "scoring.engine"]
