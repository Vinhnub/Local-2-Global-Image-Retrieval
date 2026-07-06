import os
import sys
import shutil
from pathlib import Path
import torch
import numpy as np
import torchvision.transforms as tvf
import pickle
import importlib.util
from fastapi import UploadFile
from backend.core.config import settings
from backend.models.schemas import RetrievalResponse, RetrievedImage

# Thiết lập đường dẫn động (Dynamic Path) để import được thư viện từ dự án gốc
script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
BASE_DIR = script_dir.parent.parent

sys.path.append(str(BASE_DIR / 'src'))
sys.path.append(str(BASE_DIR / 'src' / 'core' / 'SuperGlobal-main'))
sys.path.append(str(BASE_DIR / "google-research" / "asmk"))
sys.path.append(str(BASE_DIR / "fire" / "lib"))
sys.path.append(str(BASE_DIR / "fire" / "lib" / "asmk"))
fire_path = str(BASE_DIR / "fire")
sys.path.insert(0, fire_path)

# Import các modules Deep Learning từ dự án
try:
    import fire_network
    spec = importlib.util.spec_from_file_location("dataset", os.path.join(fire_path, "dataset.py"))
    dataset_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(dataset_module)
    from model.CVNet_Rerank_model import CVNet_Rerank
    from src.online.stage4_search.run_cann_search import cann_search
    from sklearn.manifold import MDS
except ImportError as e:
    print(f"Warning: Không thể import một số thư viện deep learning ({e}). Hãy đảm bảo bạn đã cài đủ requirements.")


class RetrievalService:
    def __init__(self):
        # Thiết lập biến khởi tạo
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.dataset_name = "roxford5k"
        self.imlist = []
        # Removed self._load_models_and_databases() here to prevent double loading
        # It will be called via FastAPI lifespan instead.

    def _load_feature_file(self, filepath):
        if not os.path.exists(filepath):
            return None
        try:
            f = np.load(filepath)
            if f.shape[0] == 128:
                f = f.T
            return f
        except Exception:
            return None

    def _load_models_and_databases(self):
        """
        Khởi tạo và load trọng số mô hình (weights) cùng với Index, Database (Local & Global) vào RAM/VRAM.
        Tham khảo từ Stage 5 (test_query.py).
        """
        print("="*50)
        print("INITIALIZING SERVER: LOADING MODELS & DATABASES")
        print("="*50)

        # 1. INIT FIRe (Local Features)
        print("[1/4] Loading FIRe Model (Local)...")
        fire_model_path = BASE_DIR / "fire" / "model" / "fire_SfM_120k.pth"
        if fire_model_path.exists():
            state = torch.load(fire_model_path, map_location=self.device)
            state["net_params"]["pretrained"] = None
            self.fire_net = fire_network.init_network(**state["net_params"])
            self.fire_net.load_state_dict(state["state_dict"])
            self.fire_net.to(self.device)
            self.fire_net.eval()
            self.fire_transform = tvf.Compose([
                tvf.ToTensor(),
                tvf.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        else:
            print("  -> Warning: FIRe model không tồn tại tại", fire_model_path)

        # 2. INIT CVNet (Global Features)
        print("[2/4] Loading CVNet Model (Global)...")
        cvnet_weight_path = BASE_DIR / "model_weights" / "CVPR2022_CVNet_R101.pyth"
        if cvnet_weight_path.exists():
            self.cvnet_net = CVNet_Rerank(RESNET_DEPTH=101, REDUCTION_DIM=2048, relup=False)
            cvnet_state = torch.load(cvnet_weight_path, map_location='cpu')
            if 'model_state' in cvnet_state:
                cvnet_state = cvnet_state['model_state']
            new_state_dict = {k[7:] if k.startswith('module.') else k: v for k, v in cvnet_state.items()}
            self.cvnet_net.load_state_dict(new_state_dict, strict=False)
            self.cvnet_net.to(self.device)
            self.cvnet_net.eval()
        else:
            print("  -> Warning: CVNet model không tồn tại tại", cvnet_weight_path)

        # 3. INIT Database (Local & Global Features)
        print(f"[3/4] Loading Database Features for dataset: {self.dataset_name}...")
        db_list_path = BASE_DIR / "google-research" / "cann" / f"{self.dataset_name}_database_names.txt"
        print(db_list_path)
        self.imlist = []
        self.db_local_feats = []
        self.db_global_feats = {}
        
        if db_list_path.exists():
            with open(db_list_path, "r") as f:
                self.imlist = [line.strip() for line in f if line.strip()]
                
            for idx, img in enumerate(self.imlist):
                # Load Local feat
                local_feat_path = BASE_DIR / "output" / "stage1" / "features" / self.dataset_name / "database" / f"{img}.npy"
                l_feat = self._load_feature_file(local_feat_path)
                if l_feat is None: l_feat = np.zeros((600, 128), dtype=np.float32)
                self.db_local_feats.append(l_feat)
                
                # Load Global feat (chuẩn hoá sẵn để truy vấn nhanh hơn)
                global_feat_path = BASE_DIR / "output" / "stage2" / "features" / self.dataset_name / "database" / f"{img}.npy"
                glob = np.load(global_feat_path) if os.path.exists(global_feat_path) else np.zeros(2048)
                n = np.linalg.norm(glob)
                self.db_global_feats[img] = glob / n if n > 1e-6 else np.zeros(2048)
        else:
             print("  -> Warning: File danh sách database không tồn tại:", db_list_path)

        # 4. INIT Sparse Index (Khoảng cách Chamfer)
        print("[4/4] Loading Sparse Index...")
        sparse_index_path = BASE_DIR / "output" / "stage3" / f"{self.dataset_name}_sparse_sim.pkl"
        self.sparse_distances = {}
        if sparse_index_path.exists():
            with open(sparse_index_path, 'rb') as f:
                self.sparse_distances = pickle.load(f)
        else:
            print("  -> Warning: Sparse index không tìm thấy (Cần chạy stage3 build index trước).")
            
        print("=> ENGINE READY! TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC CACHE TRÊN RAM/VRAM.")

    async def process_image_retrieval(self, file: UploadFile, top_k: int, dataset: str, db, current_user) -> RetrievalResponse:
        import time
        import uuid
        
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        unique_id = f"{int(time.time())}_{str(uuid.uuid4())[:8]}"
        safe_filename = file.filename.replace(" ", "_")
        saved_filename = f"{unique_id}_{safe_filename}"
        file_location = os.path.join(settings.UPLOAD_DIR, saved_filename)   
        
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        
        print(f"[*] Đã lưu ảnh query của người dùng tại: {file_location}")
        
        # --- Lưu lịch sử Query vào DB ---
        from backend.models.domain import QueryHistory, QueryResult
        query_record = QueryHistory(
            user_id=current_user.id,
            image_path=file_location,
            top_k_requested=top_k
        )
        db.add(query_record)
        db.commit()
        db.refresh(query_record)
        
        # ==============================================================================
        # TODO: Cắm luồng xử lý thực tế từ stage5 test_query.py vào đây. 
        # ==============================================================================
        
        import base64
        mock_results = []
        if self.imlist:
            for i in range(min(top_k, len(self.imlist))):
                img_name = self.imlist[i]
                
                img_path = BASE_DIR / "data" / "datasets" / self.dataset_name / "jpg" / f"{img_name}.jpg"
                img_base64 = None
                if img_path.exists():
                    try:
                        with open(img_path, "rb") as image_file:
                            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                            img_base64 = f"data:image/jpeg;base64,{encoded_string}"
                    except Exception as e:
                        print(f"Error reading {img_path}: {e}")
                
                score = round(0.99 - (i * 0.05), 4)
                
                # --- Lưu kết quả vào DB ---
                result_record = QueryResult(
                    query_id=query_record.id,
                    result_image_id=img_name,
                    score=score,
                    rank=i+1
                )
                db.add(result_record)
                
                mock_results.append(
                    RetrievedImage(
                        image_id=img_name, 
                        image_path=f"/static/dataset/{img_name}.jpg", 
                        image_base64=img_base64,
                        score=score
                    )
                )
            db.commit()
        else:
             mock_results.append(RetrievedImage(image_id="dummy", score=0.99))

        return RetrievalResponse(
            query_id=query_record.id,
            query_image_name=file.filename,
            results=mock_results,
            message="Please use the query_id field to submit feedback."
        )

# Khởi tạo singleton. Dữ liệu sẽ load ngay lập tức khi ứng dụng FastAPI khởi động.
retrieval_service = RetrievalService()
