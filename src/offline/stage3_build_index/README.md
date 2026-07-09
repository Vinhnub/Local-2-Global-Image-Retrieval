# Stage 3: Build Index (Distance Dictionary Construction)

## 📌 What it does
Stage 3 is the final preparation step (Offline) before the system can perform searches.
Since calculating the Chamfer Distance (the distance between 600 vectors of 2 images) is extremely expensive, Stage 3 precomputes all internal distances between images in the Database and saves them into a dictionary (Sparse Lookup).
When a Query image comes in (in Stages 4 and 5), we only need to compute the Chamfer distance for the Query image. The distances between Database images are retrieved from this Dictionary, reducing the runtime from "hours" to "seconds".

## 📥 Input Data
*   Local features directory (Stage 1): `output/stage1/features/.../database/`

## 📤 Output Data
*   Dictionary in pickle format: `output/stage3/roxford5k_sparse_sim.pkl` (or rparis6k_sparse_sim.pkl).

## 🚀 How to run

From the project root directory, run the command:

```bash
# Run with Auto Backend (Prioritizes CANN if available, otherwise uses PyTorch)
python src/offline/stage3_build_index/build_index.py --dataset roxford5k --backend auto

# Or force run with PyTorch GPU (Mini-batching 200 images/time)
python src/offline/stage3_build_index/build_index.py --dataset roxford5k --backend pytorch
```
