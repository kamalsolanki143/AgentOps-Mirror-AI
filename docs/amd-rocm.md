# AMD ROCm Support

AgentOps Mirror AI supports AMD GPU acceleration via ROCm.

## Requirements

- AMD GPU with ROCm 6.0+
- Docker with `--device=/dev/kfd --device=/dev/dri`

## Docker

Use the `deployment/amd/docker-compose.rocm.yml` override:

```bash
docker compose -f docker-compose.yml -f deployment/amd/docker-compose.rocm.yml up
```

## Performance

AMD MI250 and MI300X GPUs are supported for local LLM inference with vLLM or Ollama.

## Configuration

Set `AMD_ROCM_ENABLED=true` in `.env` and configure your model path in `ai/models/config.yml`.
