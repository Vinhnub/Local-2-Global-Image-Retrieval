# Stage 5: Real-time Test Query

## 📌 What it does
Stage 5 is a "real-world" application of the L2G system.
Instead of taking a Query image from the existing Dataset, Stage 5 allows you to input any external `jpg` (or `png`) image.
When you input an image, Stage 5 will:
1.  Instantly initialize 2 models (FIRe and CVNet) to extract Local & Global features for that image.
2.  Run the ultra-fast L2G pipeline using the Sparse Lookup dictionary.
3.  Visualize your Query image alongside the Top 20 most similar images in the Database.

## 📥 Input Data
*   Path to 1 image file (e.g., `my_test_image.jpg`).
*   Model weights files (FIRe and CVNet).
*   Sparse Lookup Dictionary: `output/stage3/roxford5k_sparse_sim.pkl` (Required, if Stage 3 hasn't been run, the system will throw an error).

## 📤 Output Data
*   Search time (processing speed in seconds) printed to the terminal.
*   A visual image file showing the search results saved at: `output_test/result_<query_image_name>.png`.

## 🚀 How to run

From the project root directory, prepare an image and run the command:

```bash
# Syntax
python src/online/stage5_test_query/test_query.py --image <path_to_image> --backend <auto|pytorch|cann>

# Real execution example
python src/online/stage5_test_query/test_query.py --image test.jpg --backend pytorch
```
