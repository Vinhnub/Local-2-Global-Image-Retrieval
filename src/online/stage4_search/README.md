# Stage 4: Search & Evaluate mAP

## 📌 What it does
Stage 4 is the batch evaluation round. It takes the entire Query image set (e.g., the 55 query images from the Oxford5k set) and inputs them into the L2G system for searching.
The goal is to simulate the actual L2G running flow:
1.  **Base Search:** Compare the Query with the Database to get the top 1600.
2.  **MDS Embedding:** Compress from the Chamfer matrix (using ultra-fast Sparse Lookup from Stage 3) into a vector.
3.  **L2G Fusion & Graph Diffusion:** Merge Local + Global and run the Graph model.
After that, the system automatically compares the result list with the Ground Truth (human-annotated correct answers) to calculate the mAP (Mean Average Precision) score for 3 difficulty levels: Easy, Medium, Hard.

## 📥 Input Data
*   Local & Global features of the entire Query and Database sets (Stages 1 & 2).
*   Sparse Lookup Dictionary: `output/stage3/roxford5k_sparse_sim.pkl` (Required, if Stage 3 hasn't been run, the system will throw an error).

## 📤 Output Data
*   mAP score table printed to the screen.
*   Text log file of results: `output/stage3/roxford5k_final_results.txt`.
*   Ranking file: `output/stage3/roxford5k_ranks.npy`.

## 🚀 How to run

From the project root directory, run the command:

```bash
# Run with Auto Backend (Prioritizes CANN if available, otherwise uses PyTorch)
python src/online/stage4_search/search_exact_chamfer.py --backend auto

# Or force run with PyTorch GPU 
python src/online/stage4_search/search_exact_chamfer.py --backend pytorch
```
