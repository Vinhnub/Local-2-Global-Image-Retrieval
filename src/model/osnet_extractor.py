import torch
import torch.nn as nn
import os

class OSNetExtractor(nn.Module):
    def __init__(self, model_name='osnet_x1_0', device='cuda'):
        super(OSNetExtractor, self).__init__()
        self.device = device
        
        try:
            import torchreid
        except ImportError:
            raise ImportError("Please install torchreid by running: pip install torchreid (or deep-person-reid)")
            
        print(f"Loading OSNet Model ({model_name}) with local custom weights...")
        self.model = torchreid.models.build_model(
            name=model_name,
            num_classes=1000,
            loss='softmax',
            pretrained=False 
        )
        
        from pathlib import Path
        import os
        
        script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
        BASE_DIR = script_dir.parent.parent
        weight_path = BASE_DIR / "model_weights" / "model.osnet.pth.tar-10"
        
        if weight_path.exists():
            print(f"Loading custom weights from {weight_path}...")
            # Bypass torchreid loader to explicitly set weights_only=False (fixes PyTorch 2.6+ error)
            checkpoint = torch.load(str(weight_path), map_location='cpu', weights_only=False)
            
            if isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
                state_dict = checkpoint['state_dict']
            else:
                state_dict = checkpoint
                
            # Filter out module. prefix and ignore classifier layer to avoid size mismatch
            new_state_dict = {}
            for k, v in state_dict.items():
                new_key = k[7:] if k.startswith('module.') else k
                if new_key not in ['classifier.weight', 'classifier.bias']:
                    new_state_dict[new_key] = v
            
            self.model.load_state_dict(new_state_dict, strict=False)
        else:
            print(f"Warning: Custom weights not found at {weight_path}. Model is randomly initialized!")
            
        self.model.to(self.device)
        self.model.eval()
        
    def extract_global_descriptor(self, im_q, *args, **kwargs):
        """
        Mimics CVNet_Rerank's extract_global_descriptor interface.
        im_q: tensor of shape (B, C, H, W) normalized for torchvision models
        """
        with torch.no_grad():
            # torchreid models just take the image tensor and return the feature vector (B, D)
            features = self.model(im_q)
        return features

    def forward(self, im_q):
        with torch.no_grad():
            return self.model(im_q)
