# Local-to-Global (L2G) Image Retrieval

This repository contains the source code for an Image Retrieval system using the **Local-to-Global (L2G)** approach, complete with a full-stack web application (FastAPI backend and Next.js frontend). 

The AI pipeline combines Local Features and Global Features, then optimizes the results using **Graph Diffusion** on a K-Nearest Neighbors (KNN) graph. Notably, the system has been optimized to run **entirely in Python/PyTorch on GPU** with ultra-lightweight Mini-batching techniques (<1GB VRAM), eliminating the need for complex C++ environment setups like the original version.

---

## ✨ Features

- **Advanced AI Pipeline**: Extracts local and global features using FIRe and CVNet models, optimized with Chamfer distance and Graph diffusion.
- **FastAPI Backend**: A robust backend providing RESTful APIs for user authentication, image retrieval processing, history tracking, and user feedback.
- **Next.js Frontend**: A modern, responsive user interface built with Next.js (React 19), Tailwind CSS 4, and Framer Motion for a seamless user experience.

---

## 📁 Repository Structure

```text
Local-2-Global-Image-Retrieval/
├── backend/                      # FastAPI Backend application
├── frontend/                     # Next.js Frontend web application
├── src/                          # AI Pipeline Scripts
│   ├── offline/                  # Database preparation steps (Stages 1-3)
│   └── online/                   # Real-time search & evaluation (Stages 4-5)
├── fire/                         # FIRe network model & code
├── CVNet/                        # CVNet network model & code
├── google-research/              # Original Google source code (CANN)
├── data/                         # Datasets (e.g., roxford5k)
├── output/                       # Output features and cached results
├── test_client.py                # Python script to test the backend API flow
└── README.md                     # Project documentation
```

---

## 🌐 Running the Web Application

The project includes a complete web application to interact with the image retrieval system visually.

### Backend (FastAPI)
The backend manages the AI pipeline executions and user data.
1. Navigate to the root directory or `backend/`.
2. Install dependencies (e.g., `pip install -r backend/requirements.txt`).
3. Run the server:
   ```bash
   python -m backend.main
   ```

### Frontend (Next.js)
The frontend provides a sleek UI for uploading query images and viewing similar results.
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🚀 AI Pipeline (Step-by-Step)

If you want to run the pipeline manually or prepare new datasets, follow these stages sequentially.

### 🗄️ OFFLINE (Data Preparation)

**Stage 1: Extract Local Features**
- Runs the **FIRe** model. Each image is extracted into 600 vectors x 128 dimensions.
- **Command:**
  ```bash
  python src/offline/stage1_local_extract/extract_local.py
  ```

**Stage 2: Extract Global Features**
- Runs the **CVNet-R101** model. Each image is compressed into a single vector x 2048 dimensions.
- **Command:**
  ```bash
  python src/offline/stage2_global_extract/extract_global.py
  ```

**Stage 3: Build Index**
- Precomputes the Chamfer distance matrix (Sparse Lookup) between images in the Database to save lookup time during actual retrieval.
- **Command:** 
  ```bash
  python src/offline/stage3_build_index/build_index.py --dataset roxford5k --backend auto
  ```

### ⚡ ONLINE (Real-time Search)

**Stage 4: mAP Evaluation**
- Runs through the entire Query set to compute and score mAP (Easy, Medium, Hard).
- **Command:**
  ```bash
  python src/online/stage4_search/search_exact_chamfer.py --backend auto
  ```

**Stage 5: Test Query (Real-world Image)**
- Provide any real-world image, and the system will return the top 20 most similar images in the database, saving visual results to the `output_test/` directory.
- **Command:**
  ```bash
  python src/online/stage5_test_query/test_query.py --image <path_to_image.jpg> --backend auto
  ```

---

## 🛠️ Search Engine Options (Backend Flag)

The most computationally heavy part of the system is the **Base Search** (Coarse filtering). In Stage 3, Stage 4, and Stage 5, you can pass the `--backend` flag to customize execution:

1. `--backend auto` (Default): Smart auto-selection. If CANN (.exe) is found, it uses CANN; otherwise, it automatically falls back to PyTorch GPU.
2. `--backend pytorch`: **Recommended**. Uses PyTorch with **Mini-batching**. Runs 100% accurately on GPU, ultra-lightweight (< 1GB VRAM). Works perfectly for datasets of 5,000-6,000 images.
3. `--backend cann`: Runs using Google's original C++ source code. Requires you to install **Microsoft C++ Build Tools** and **Bazel** to compile the `.exe` file manually.
