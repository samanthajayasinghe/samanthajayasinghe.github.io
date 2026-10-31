---
title: "Hosting Open-Weight Models on a Local CPU Kubernetes Cluster with vLLM"
date: 2026-11-18
description: "You don't need GPUs to self-host an LLM. A practical guide to running open-weight models with vLLM on a local, CPU-only Kubernetes cluster — model sizing, tuning, and staying realistic about throughput."
tags: ["kubernetes", "vllm", "llm", "mlops", "self-hosting", "homelab"]
---

Every guide to self-hosting LLMs starts the same way: "provision a GPU node pool."
But most of us have a homelab, a company VM, or a local cluster full of ordinary
CPUs. The good news: for the right models, CPU inference is genuinely useful —
chatbots, summarization, classification, RAG over modest corpora. The bad news:
you have to be realistic about model size, and you have to tune for CPU instead of
copy-pasting GPU configs.

This post walks through running [vLLM](https://docs.vllm.ai/) in CPU mode on a
local Kubernetes cluster: choosing a model that fits, building/using CPU images,
a Deployment tuned for CPU, health probes, and how to load test so you know what
your hardware actually sustains.

## First: what can CPU inference realistically do?

The rule of thumb is memory. A model in bf16 needs roughly **2 GB of RAM per
billion parameters** — a 7–8B model wants ~16 GB just for weights, plus several GB
of KV cache and activations. On CPU there's no VRAM wall, but there *is* the much
slower memory bandwidth of your system RAM, which is what really caps token
throughput.

Practical targets for a modern homelab node (8–16 cores, 32–64 GB RAM):

| Model size | Feels like | Good for |
|---|---|---|
| 0.5–1B | Snappy, near-instant | Classification, extraction, routing |
| 1–3B | Fine for chat | Assistants, RAG answers, summaries |
| 7–8B | Usable, patient | Best single-user quality |
| 13B+ | Slow | Only if you truly need it |

Two levers make this much better:

- **Quantization**: an GGUF/AWQ/GPTQ-int4 model needs roughly a quarter of the
  memory of bf16. A 7B model in 4-bit is ~4–5 GB. Quality loss is small and often
  irrelevant for the task.
- **Small strong models**: Qwen2.5-1.5B-Instruct, Llama-3.2-1B/3B, and
  Phi-3-mini punch far above their weight. Start here before reaching for 8B.

If your workload is 8B-and-bigger models with concurrent users, CPUs won't keep
up and this post becomes a story about why you need a GPU. For small models and
low concurrency, read on.

## vLLM on CPU

vLLM's CPU backend is less famous than its GPU path but works, and it's built on
llama.cpp-style optimizations (it uses IPEX/oneDNN under the hood on Intel). What
matters operationally:

- You need the **CPU-enabled image or build** — the default `vllm/vllm-openai`
  image targets CUDA. You can pull a CPU build or build one yourself (the vLLM
  docs have a `Dockerfile.cpu` for this).
- Flags like `--gpu-memory-utilization` don't apply; instead you'll set
  `--max-model-len` conservatively and pass `VLLM_CPU_KVCACHE_SPACE` to control
  how much RAM (in GB) the KV cache may use.

Honest alternative worth naming: if vLLM's CPU path fights you, [Ollama](https://ollama.com/)
or plain [llama.cpp server](https://github.com/ggml-org/llama.cpp) with GGUF models
is often the most robust CPU-serving option, and both expose OpenAI-compatible
APIs — everything below (Deployment, probes, Service, HPA) still applies, just with
a different container image and args. This post sticks with vLLM since it keeps
your serving layer identical to what you'd run on GPUs later.

## Where the models come from: Hugging Face

Every model mentioned above lives on the [Hugging Face Hub](https://huggingface.co/models),
which is the default source vLLM fetches from. When you pass `vllm serve
Qwen/Qwen2.5-1.5B-Instruct`, vLLM resolves that repo ID against the Hub, downloads
the weights into `HF_HOME`, and serves them. A few things worth knowing:

**Finding a model.** Filter the Hub by task ("text-generation"), license, and
parameter count, then check the model card for two things: the license (some
"open-weight" models like Llama have community licenses with conditions; Apache
2.0 / MIT models like Qwen are simplest) and the file sizes, so you can sanity-check
that the weights fit your node.

**Gated models need a token.** Models like Llama require you to accept a license
agreement on the Hub before downloading. Once accepted, create a read token in
your [HF settings](https://huggingface.co/settings/tokens) and hand it to the pod:

```bash
kubectl create secret generic hf-token --from-literal=token=hf_xxx
```

```yaml
          env:
            - name: HF_TOKEN
              valueFrom:
                secretKeyRef:
                  name: hf-token
                  key: token
```

Qwen models aren't gated, so the example below runs without it — but wire this in
now if you might swap in Llama later.

**Pre-download instead of pulling at startup.** Downloading at pod start is fine
once, but wasteful on every restart. Beyond the PVC cache shown below, you can
also pin exact revisions (`vllm serve Qwen/Qwen2.5-1.5B-Instruct --revision <sha>`)
so replicas always load the same weights, or use `huggingface-cli download`
inside a custom image build to bake weights straight into the container — the
most reproducible option for a homelab.

## Step 1: Know what your nodes actually have

```bash
kubectl describe node <node> | grep -A 8 "Allocated resources"
```

Note your allocatable CPU and memory. Two planning rules:

- **Pin a CPU count**: inference throughput on CPU scales with cores. Decide how
  many cores one replica gets and stick to it — it makes load-test numbers
  meaningful and stops one pod from starving everything else on a shared node.
- **Budget memory honestly**: weights + KV cache + a generous scratch buffer.
  If the pod gets OOMKilled, Kubernetes will happily restart it into the same
  wall forever.

For a 7B int4 model, a reasonable footprint is 4–6 CPU cores and 12–16 GB memory.

## Step 2: The Deployment

Here's a Deployment serving `Qwen/Qwen2.5-1.5B-Instruct` — a great CPU-sized
starting point — using a CPU vLLM image:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm-qwen-1-5b
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vllm-qwen-1-5b
  template:
    metadata:
      labels:
        app: vllm-qwen-1-5b
    spec:
      containers:
        - name: vllm
          image: <your-registry>/vllm-cpu:latest   # CPU build — see above
          command: ["vllm", "serve"]
          args:
            - Qwen/Qwen2.5-1.5B-Instruct
            - --max-model-len=4096
            - --dtype=bfloat16
            - --enforce-eager
          env:
            - name: VLLM_CPU_KVCACHE_SPACE
              value: "4"                # GB of RAM for the KV cache
            - name: HF_HOME
              value: /data/hf-cache
          ports:
            - containerPort: 8000
          resources:
            requests:
              cpu: "4"
              memory: 8Gi
            limits:
              cpu: "4"
              memory: 10Gi
          volumeMounts:
            - name: hf-cache
              mountPath: /data/hf-cache
          startupProbe:
            httpGet:
              path: /health
              port: 8000
            failureThreshold: 60
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            periodSeconds: 10
          readinessProbe:
              httpGet:
                path: /health
                port: 8000
              periodSeconds: 5
      volumes:
        - name: hf-cache
          persistentVolumeClaim:
            claimName: hf-cache
```

Things worth calling out:

**The startup probe is not optional.** vLLM downloads weights, initializes, and
warms up before serving. On a cold local cluster with slow storage this takes
minutes, and without a generous `startupProbe` (up to 5 minutes here) Kubernetes
will kill the container mid-boot and restart-loop forever. This is the single most
common "why won't my vLLM pod start" issue.

**Cache the weights in a PVC.** Model weights are hundreds of MB to several GB.
Mounting a PersistentVolume at `HF_HOME` means replica restarts and rollouts skip
the download entirely. If you're on a single-node cluster (k3s, kind, minikube),
a `hostPath` volume or `local` PV works fine.

**`--enforce-eager`** skips CUDA-graph-style optimizations that don't help on CPU
and reduces startup time and memory overhead. On the CPU backend this is usually
the right default.

**`--max-model-len`** directly controls KV cache memory per request. 4096 is a
sensible CPU default; don't set the model's maximum unless you need it.

**Resource limits as a fairness mechanism.** On a shared local cluster, `cpu: "4"`
with matching requests (Guaranteed QoS) keeps your inference pod predictable while
leaving room for everything else you run.

Create the cache claim first (single-node example):

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: hf-cache
spec:
  accessModes: ["ReadWriteOnce"]
  resources:
    requests:
      storage: 20Gi
```

## Step 3: Service and testing

```yaml
apiVersion: v1
kind: Service
metadata:
  name: vllm-qwen-1-5b
spec:
  selector:
    app: vllm-qwen-1-5b
  ports:
    - port: 8000
      targetPort: 8000
```

Because vLLM speaks the OpenAI API, your existing client code works with a one-line
change:

```python
from openai import OpenAI

client = OpenAI(base_url="http://vllm-qwen-1-5b:8000/v1", api_key="none")
resp = client.chat.completions.create(
    model="Qwen/Qwen2.5-1.5B-Instruct",
    messages=[{"role": "user", "content": "Say hello in one word."}],
)
print(resp.choices[0].message.content)
```

For access from your laptop, `kubectl port-forward svc/vllm-qwen-1-5b 8000:8000`
is the homelab way. If you want it on your LAN, put an Ingress (Traefik ships
with k3s) in front.

## Step 4: Scaling on CPU

**Scale *up*** is mostly off the table — tensor parallelism is a GPU feature. Your
CPU levers are model choice and quantization, decided up front.

**Scale *out*** works fine: vLLM is a stateless HTTP server, so replicas share load
behind the Service. On a small local cluster you probably don't need an HPA — but
if requests queue up, the pattern is the same as on GPU: scrape `/metrics`, watch
`vllm:num_requests_waiting`, and scale on it:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vllm-qwen-1-5b
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vllm-qwen-1-5b
  minReplicas: 1
  maxReplicas: 3
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

CPU utilization is a reasonable proxy on a local box when you don't want to set up
the Prometheus Adapter for the queue-depth metric — but validate with a load test
first, because a CPU-saturated inference pod is *normal* under load, not a
dysfunction.

## Step 5: Load test before you trust it

```bash
python -m vllm.entrypoints.cli bench serve \
  --model Qwen/Qwen2.5-1.5B-Instruct \
  --endpoint-url http://localhost:8000/v1 \
  --num-prompts 50
```

Watch time-to-first-token (TTFT) and inter-token latency, not just throughput.
On CPU expect single-digit to low-double-digit tokens/second per stream for 1–3B
models — fine for a chat UI, painful for a batch job over 10,000 documents. The
numbers you get here, on your hardware, are the only ones that matter when deciding
what this deployment is allowed to power.

## Gotchas I hit the hard way

- **OOMKilled on startup**: weights + KV cache + activations exceed the memory
  limit. Drop `VLLM_CPU_KVCACHE_SPACE`, lower `--max-model-len`, or use a smaller /
  quantized model.
- **Restart loops**: the startup probe timing out during weight download. The PVC
  cache fixes the recurring version of this.
- **Rolling deploys drop in-flight requests**: add `terminationGracePeriodSeconds:
  120` and a `preStop` sleep so vLLM can finish streaming responses.
- **"It's slow":** the fix is almost never config — it's model size. Step down a
  size class or quantize before you start tuning flags.
- **NUMA / noisy neighbors**: if your node has multiple NUMA nodes or other heavy
  workloads, pinning with CPU manager policies can buy real latency consistency.

## Wrapping up

The recipe is small: a CPU-sized model, a Deployment with a patient startup probe
and a weight-cache volume, a Service, and honest load-test numbers. The real work
is picking the smallest model that does the job — on CPU, that decision is worth
more than any tuning flag. Get it right and a modest local cluster gives you a
private, free, OpenAI-compatible endpoint that's yours entirely.

Code for this post lives in my homelab repo — link in the footer.
