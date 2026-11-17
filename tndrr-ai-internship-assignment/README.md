# tndrr AI/ML Internship Assignment

Reproducible implementation and empirical evaluation across all three R&D tasks:
1. **Task 1 (`task1-lora-finetuning/`):** LoRA fine-tuning of `Qwen/Qwen2.5-0.5B-Instruct` for strict JSON schema extraction, evaluated on 60 held-out test cases + 7B VRAM derivation.
2. **Task 2 (`task2-rag-from-scratch/`):** Framework-free RAG pipeline using `BAAI/bge-small-en-v1.5`, `FAISS (IndexFlatIP)`, and NumPy across two chunking granularities on a 40+ page public document.
3. **Task 3 (`task3-local-inference/`):** Local `llama.cpp` inference comparison (`F16` vs. `Q4_K_M`) on 10 standardized prompts + KV cache & 24 GB GPU concurrent serving design.

## Summary of Results

| Task | Key Metric | Baseline / Setting A | Improved / Setting B |
| :--- | :--- | :--- | :--- |
| **Task 1: LoRA** | Exact Schema Match (n=60) | `TBD` | `TBD` |
| **Task 2: RAG** | Recall@5 (n=15) | `TBD` (300-char chunks) | `TBD` (1200-char chunks) |
| **Task 3: Inference** | Generation Speed / Memory | `TBD` (`F16`) | `TBD` (`Q4_K_M`) |

## Repository Structure
- `task1-lora-finetuning/` — Training & evaluation notebook, train/test JSONL datasets, and logged metrics.
- `task2-rag-from-scratch/` — Pure NumPy/FAISS RAG notebook, source PDF, 15 ground-truth Q&A pairs, and retrieval logs.
- `task3-local-inference/` — `llama.cpp` throughput/memory benchmark notebook and 10-prompt output logs.
- `report/tndrr_assignment_report.pdf` — Final 4-page technical report.
