# Stage 1: Local Feature Extraction (FIRe)

## 📌 What it does
Stage 1 is responsible for extracting **Local Features** from all images in the Database and Query set.
The system uses the **FIRe** model (developed by Facebook AI). For each image, the model scans and extracts 600 local vectors (each 128 dimensions long) representing different detail regions on the image.

## 📥 Input Data
*   Directory containing original images (e.g., `data/datasets/roxford5k/jpg/`).
*   FIRe model weights: `fire/model/model_best.pth.tar`.

## 📤 Output Data
*   Storage directory: `output/stage1/features/roxford5k/`
*   Numpy `.npy` files, each corresponding to one image.
*   The shape of each `.npy` file is `(600, 128)`.

## 🚀 How to run

Navigate to the project root directory and run the following command:

```bash
python src/offline/stage1_local_extract/extract_local.py
```
