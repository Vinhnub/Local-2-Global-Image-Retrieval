import os
import argparse
import pickle
from pathlib import Path

def setup_dataset(dataset_name):
    # Paths
    project_root = Path(__file__).parent.resolve()
    dataset_dir = project_root / "data" / "datasets" / dataset_name
    jpg_dir = dataset_dir / "jpg"
    gnd_file = dataset_dir / f"gnd_{dataset_name}.pkl"
    
    if not jpg_dir.exists():
        print(f"Error: Directory {jpg_dir} does not exist.")
        print(f"Please create it and place your .jpg images inside before running this script.")
        return
        
    # Get all .jpg images in the directory and subdirectories
    imlist = []
    for root, dirs, files in os.walk(jpg_dir):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                # We store the basename without extension as expected by the pipeline
                fname = os.path.splitext(f)[0]
                imlist.append(fname)
                
    if not imlist:
        print(f"Warning: No images found in {jpg_dir}")
        return
        
    print(f"Found {len(imlist)} images for dataset '{dataset_name}'.")
    
    # Create the ground truth dictionary
    # The pipeline primarily needs 'imlist' for the database indexing. 
    # 'qimlist' is empty because we are just indexing for a search website, not evaluating.
    gnd_data = {
        'imlist': imlist,
        'qimlist': [], # No queries for indexing
        'gnd': []      # No ground truth for queries
    }
    
    # Save as .pkl
    with open(gnd_file, 'wb') as f:
        pickle.dump(gnd_data, f)
        
    print(f"Successfully created: {gnd_file}")
    
    print("\nNext steps to build the database index:")
    print(f"1. Run stage 1 (Local extraction): python src/offline/stage1_local_extract/extract_local.py --dataset {dataset_name}")
    print(f"2. Run stage 2 (Global extraction): python src/offline/stage2_global_extract/extract_global.py --dataset {dataset_name}")
    print(f"3. Run stage 3 (Build index): python src/offline/stage3_build_index/build_index.py --dataset {dataset_name}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Setup a new dataset for indexing")
    parser.add_argument("dataset_name", type=str, help="Name of your new dataset")
    args = parser.parse_args()
    
    setup_dataset(args.dataset_name)
