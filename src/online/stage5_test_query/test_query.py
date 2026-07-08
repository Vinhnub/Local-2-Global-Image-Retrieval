import os
import sys
import torch
import numpy as np
from PIL import Image
import torchvision.transforms as tvf
import time
import argparse
import shutil
from pathlib import Path
import importlib.util

# Set up paths
script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = script_dir.parent.parent.parent
sys.path.append(str(BASE_DIR / 'src'))
sys.path.append(str(BASE_DIR / 'src' / 'core' / 'SuperGlobal-main'))
sys.path.append(str(BASE_DIR / "google-research" / "asmk"))
sys.path.append(str(BASE_DIR / "fire" / "lib"))
sys.path.append(str(BASE_DIR / "fire" / "lib" / "asmk"))
fire_path = str(BASE_DIR / "fire")
sys.path.insert(0, fire_path)

# Fire imports
import fire_network
spec = importlib.util.spec_from_file_location("dataset", os.path.join(fire_path, "dataset.py"))
dataset = importlib.util.module_from_spec(spec)
spec.loader.exec_module(dataset)

# Global Extractor imports
from model.CVNet_Rerank_model import CVNet_Rerank
from model.osnet_extractor import OSNetExtractor

from src.online.stage4_search.run_cann_search import cann_search
import pickle
from sklearn.manifold import MDS

# ---------------------------------------------------------
# CONSTANTS & CONFIG
# ---------------------------------------------------------
DATASET = "worldcup2026_low" # Use roxford5k as default database
k_candidates = 1600
M_sg = 1600
w_local = 0.19
w_global = 0.81
k_sg = 6
beta_sg = 0.31

# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------
def load_feature_file(filepath):
    if not os.path.exists(filepath):
        return None
    try:
        f = np.load(filepath)
        if f.shape[0] == 128:
            f = f.T
        return f
    except Exception:
        return None

def superglobal_reranking_full(features, K=6, beta=0.31):
    Q = features[0:1] # (1, D)
    X = features[1:]  # (M, D)
    M = len(X)
    K = K + 1 
    
    sim = np.dot(X, Q.T) # (M, 1)
    ranks_trans = np.argsort(-sim, axis=0).T # (1, M)
    
    X_tensor = X[ranks_trans[0]] 
    res_ie = np.dot(X_tensor, X_tensor.T) # (M, M)
    
    res_ie_ranks = np.argsort(-res_ie, axis=1)[:, :K] 
    res_ie_ranks_value = -np.sort(-res_ie, axis=1)[:, :K] 
    
    res_ie_ranks_value[:, 1:] *= beta
    res_ie_ranks_value[:, 0] = 1.0
    
    x_dba = np.zeros_like(X_tensor)
    for i in range(M):
        neighbors = X_tensor[res_ie_ranks[i]] 
        weights = res_ie_ranks_value[i, :, None] 
        x_dba[i] = np.sum(neighbors * weights, axis=0) / np.sum(weights)
        
    res_top1000_dba = np.dot(Q, x_dba.T) # (1, M)
    ranks_trans_1000_pre = np.argsort(-res_top1000_dba, axis=1) # (1, M)
    rerank_dba_final = ranks_trans[0][ranks_trans_1000_pre[0]] # (M,)
    return rerank_dba_final

def run_search_pipeline(img_tensor_fire, fire_net, global_net, db_local_feats, get_global_feat, sparse_distances, imlist, device, k_candidates=1600, M_sg=1600, w_local=0.19, w_global=0.81, k_sg=6, beta_sg=0.31, backend="auto", k_candidates_local=700, top_k=20):
    """
    Core search pipeline extracted for reuse in backend.
    """
    import torch
    import numpy as np
    from sklearn.manifold import MDS
    from src.online.stage4_search.run_cann_search import cann_search
    
    # A. Extract FIRe Local Features
    scales = [1.0]
    with torch.no_grad():
        local_feats = fire_net.forward_local(
            img_tensor_fire, 
            features_num=600, 
            scales=scales
        )
        q_local_feat = local_feats[0].squeeze(-1).squeeze(0).cpu().numpy()
        if q_local_feat.shape[0] == 128 and q_local_feat.shape[1] != 128:
            q_local_feat = q_local_feat.T
        if q_local_feat.shape[1] == 128 and q_local_feat.shape[0] != 128:
            pass # Already (N, 128)
        else:
            q_local_feat = q_local_feat.reshape(-1, 128)
            
    # B. Extract Global Features
    with torch.no_grad():
        feat = global_net.extract_global_descriptor(img_tensor_fire, True, True, True, 3)
        q_global_feat = feat.cpu().numpy().squeeze()
        norm_val = np.linalg.norm(q_global_feat)
        if norm_val > 1e-6: q_global_feat = q_global_feat / norm_val
        
    # C. Base Search
    ranks = cann_search([q_local_feat], db_local_feats, k_candidates=k_candidates, dim=128, backend=backend)
    all_sorted_indices = ranks[0]
    
    sg_candidate_names = [imlist[i] for i in all_sorted_indices[:M_sg]]
    
    # Pad q_local_feat to 600x128 for stack
    if q_local_feat.shape[0] < 600:
        pad_size = 600 - q_local_feat.shape[0]
        q_local_feat = np.pad(q_local_feat, ((0, pad_size), (0, 0)), mode='constant')
    elif q_local_feat.shape[0] > 600:
        q_local_feat = q_local_feat[:600]
        
    # D. Exact Chamfer Local Matrix
    q_tensor = torch.from_numpy(q_local_feat).unsqueeze(0).to(device).float()
    cand_feats = torch.tensor(np.stack([db_local_feats[idx] for idx in all_sorted_indices[:k_candidates_local]])).to(device).float()
    
    # Compute Chamfer for Query vs Candidates
    q_norm = q_tensor / torch.norm(q_tensor, dim=2, keepdim=True).clamp(min=1e-6)
    cand_norm = cand_feats / torch.norm(cand_feats, dim=2, keepdim=True).clamp(min=1e-6)
    
    dot_products = torch.matmul(q_norm, cand_norm.transpose(1, 2))
    S_q_db = dot_products.max(dim=2).values.mean(dim=1)
    S_db_q = dot_products.max(dim=1).values.mean(dim=1)
    q_cand_sims = ((S_q_db + S_db_q) / 2.0).cpu().numpy()[0]
    
    q_cand_dists = 1.0 - q_cand_sims
    q_cand_dists = np.clip(q_cand_dists, 0.0, 1.0)
    
    # Build Distance Matrix
    D_local = np.ones((k_candidates_local + 1, k_candidates_local + 1))
    np.fill_diagonal(D_local, 0.0)
    
    D_local[0, 1:] = q_cand_dists
    D_local[1:, 0] = q_cand_dists
    
    for i in range(k_candidates_local):
        idx_i = all_sorted_indices[i]
        for j in range(i + 1, k_candidates_local):
            idx_j = all_sorted_indices[j]
            
            dist = 1.0
            if idx_i in sparse_distances and idx_j in sparse_distances[idx_i]:
                dist = sparse_distances[idx_i][idx_j]
            elif idx_j in sparse_distances and idx_i in sparse_distances[idx_j]:
                dist = sparse_distances[idx_j][idx_i]
            
            D_local[i+1, j+1] = dist
            D_local[j+1, i+1] = dist
            
    # Convert distance to similarities
    W_local = 1.0 - D_local
    
    max_sim = np.max(W_local)
    W_norm = W_local / max_sim if max_sim > 0 else W_local
    D_mod = np.power(np.clip(1.0 - W_norm, 0.0, 1.0), 5)
    np.fill_diagonal(D_mod, 0.0)
    
    # E. MDS & Global Fusion
    mds = MDS(n_components=128, dissimilarity="precomputed", random_state=42, max_iter=15, eps=0.1, n_init=1)
    F_mds = mds.fit_transform(D_mod)
    F_mds_norm = F_mds / np.linalg.norm(F_mds, axis=1, keepdims=True).clip(min=1e-6)
    
    F_global = [q_global_feat]
    for img_name in sg_candidate_names:
        glob = get_global_feat(img_name)
        F_global.append(glob)
    F_global = np.array(F_global)
    
    F_mds_full = np.zeros((len(F_global), 128))
    F_mds_full[:len(F_mds_norm)] = F_mds_norm
    F_concat = np.hstack([np.sqrt(w_local) * F_mds_full, np.sqrt(w_global) * F_global])
    
    # F. SuperGlobal Rerank
    final_ranks = superglobal_reranking_full(F_concat, K=k_sg, beta=beta_sg)
    top_k_names = [sg_candidate_names[idx] for idx in final_ranks[:top_k]]
    
    return top_k_names

# ---------------------------------------------------------
# MAIN INFERENCE PIPELINE
# ---------------------------------------------------------
def main(query_image_path, backend="auto", global_model_name="cvnet"):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print("="*50)
    print("INITIALIZING REAL-TIME SEARCH ENGINE (L2G)")
    print(f"BACKEND: {backend}")
    print("="*50)
    
    # 1. INIT FIRe (Local)
    print("Loading FIRe Model (Local)...")
    fire_model_path = BASE_DIR / "fire" / "model" / "fire_SfM_120k.pth"
    state = torch.load(fire_model_path, map_location=device)
    state["net_params"]["pretrained"] = None
    fire_net = fire_network.init_network(**state["net_params"])
    fire_net.load_state_dict(state["state_dict"])
    fire_net.to(device)
    fire_net.eval()
    
    fire_transform = tvf.Compose([
        tvf.ToTensor(),
        tvf.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    # 2. INIT Global Extractor
    print(f"Loading Global Model ({global_model_name})...")
    if global_model_name == "cvnet":
        global_net = CVNet_Rerank(RESNET_DEPTH=101, REDUCTION_DIM=2048, relup=False)
        cvnet_weight_path = BASE_DIR / "model_weights" / "CVPR2022_CVNet_R101.pyth"
        cvnet_state = torch.load(cvnet_weight_path, map_location='cpu')
        if 'model_state' in cvnet_state:
            cvnet_state = cvnet_state['model_state']
        new_state_dict = {k[7:] if k.startswith('module.') else k: v for k, v in cvnet_state.items()}
        global_net.load_state_dict(new_state_dict, strict=False)
    else:
        global_net = OSNetExtractor(model_name='osnet_x1_0', device=device)
        
    global_net.to(device)
    global_net.eval()
    
    # 3. INIT Index & Database Features
    print("Loading Index & Database...")
    db_list_path = BASE_DIR / "google-research" / "cann" / f"{DATASET}_database_names.txt"
    with open(db_list_path, "r") as f:
        imlist = [line.strip() for line in f if line.strip()]
        
    db_local_feats = []
    db_imids = []
    for idx, img in enumerate(imlist):
        feat_path = BASE_DIR / "output" / "stage1" / "features" / DATASET / "database" / f"{img}.npy"
        feat = load_feature_file(feat_path)
        if feat is None: feat = np.zeros((600, 128), dtype=np.float32)
        db_local_feats.append(feat)
        db_imids.append(np.full(600, idx, dtype=np.int32))
        
    vecs = np.vstack(db_local_feats).astype(np.float32)
    imids = np.hstack(db_imids).astype(np.int32)
    
    print("Loading Sparse Index...")
    sparse_index_path = BASE_DIR / "output" / "stage3" / f"{DATASET}_sparse_sim.pkl"
    if not sparse_index_path.exists():
        raise FileNotFoundError(f"Sparse index not found at {sparse_index_path}. Please run stage3 build_index first.")
    with open(sparse_index_path, 'rb') as f:
        sparse_distances = pickle.load(f)
    
    print("Engine Ready!")
    
    # ---------------------------------------------------------
    # QUERY EXECUTION
    # ---------------------------------------------------------
    print("="*50)
    print(f"PROCESSING QUERY IMAGE: {query_image_path}")
    
    t_start = time.time()
    img = Image.open(query_image_path).convert('RGB')
    
    def get_global_feat(img_name):
        dim = 512 if global_model_name == "osnet" else 2048
        feat_path = BASE_DIR / "output" / "stage2" / "features" / DATASET / "database" / f"{img_name}.npy"
        glob = np.load(feat_path) if os.path.exists(feat_path) else np.zeros(dim)
        n = np.linalg.norm(glob)
        return glob / n if n > 1e-6 else np.zeros(dim)

    img_tensor_fire = fire_transform(img).unsqueeze(0).to(device)
    
    print(f"Running Base Search (Backend: {backend})...")
    print("Computing Chamfer Distances (with Sparse Lookup)...")
    
    top_20_names = run_search_pipeline(
        img_tensor_fire=img_tensor_fire,
        fire_net=fire_net,
        global_net=global_net,
        db_local_feats=db_local_feats,
        get_global_feat=get_global_feat,
        sparse_distances=sparse_distances,
        imlist=imlist,
        device=device,
        k_candidates=k_candidates,
        M_sg=M_sg,
        w_local=w_local,
        w_global=w_global,
        k_sg=k_sg,
        beta_sg=beta_sg,
        backend=backend,
        k_candidates_local=700,
        top_k=20
    )
    
    t_end = time.time()
    print(f"SEARCH COMPLETED IN {t_end - t_start:.2f}s!")
    
    # ---------------------------------------------------------
    # OUTPUT VISUALIZATION
    # ---------------------------------------------------------
    out_dir = BASE_DIR / "output_test"
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    shutil.copy(query_image_path, out_dir / "00_QUERY.jpg")
    
    print("\nTop 20 Matches:")
    for i, name in enumerate(top_20_names):
        print(f"  {i+1:02d}. {name}")
        src_img = BASE_DIR / "data" / "datasets" / DATASET / "jpg" / f"{name}.jpg"
        if src_img.exists():
            shutil.copy(src_img, out_dir / f"rank_{i+1:02d}_{name}.jpg")
            
    print(f"\nResults saved to {out_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--image', type=str, required=True, help="Path to query image")
    parser.add_argument('--backend', type=str, choices=['auto', 'cann', 'pytorch'], default='auto', help="Backend tool for Base Search")
    parser.add_argument('--global_model', type=str, choices=['cvnet', 'osnet'], default='cvnet', help="Global feature extractor")
    args = parser.parse_args()
    main(args.image, args.backend, args.global_model)
