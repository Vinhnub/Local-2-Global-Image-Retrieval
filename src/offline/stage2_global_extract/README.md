# Stage 2: Global Feature Extraction (CVNet)

## 📌 What it does
Stage 2 is responsible for extracting **Global Features** for all images.
Using the **CVNet-R101** (ResNet-101) model, each image will have its entire information (context, colors, large shapes) compressed into a single vector.

## 📥 Input Data
*   Directory containing original images (`data/datasets/roxford5k/jpg/`).
*   CVNet model weights: `CVNet/weights/CVNet-R101.pth`.

## 📤 Output Data
*   Storage directory: `output/stage2/features/roxford5k/`
*   Numpy `.npy` files.
*   The shape of each `.npy` file is `(2048,)` (A 2048-dimensional vector).

## 🚀 How to run

From the project root directory, run the command:

```bash
python src/offline/stage2_global_extract/extract_global.py
```
