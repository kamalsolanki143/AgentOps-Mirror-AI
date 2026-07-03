# Deployment

## Docker (Recommended)

```bash
docker compose build
docker compose up -d
```

## Kubernetes

```bash
kubectl apply -f deployment/kubernetes/
```

## Vercel (Frontend)

```bash
cd frontend
vercel --prod
```

## Render (Backend)

Connect your GitHub repo and Render will auto-deploy using `deployment/render/render.yaml`.

## AMD ROCm Support

See [amd-rocm.md](amd-rocm.md) for GPU-accelerated deployment on AMD hardware.

## Environment Variables

Copy `.env.example` to `.env` and fill in your secrets. Never commit `.env` to version control.
