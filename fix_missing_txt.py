import os
# Đường dẫn tới thư mục chứa features của bộ dữ liệu
features_dir = r"E:\Pythonfile\Local-2-Global-Image-Retrieval\output\stage1\features\worldcup2026_low\database"
# Đường dẫn file txt đích cần tạo ra
output_txt = r"E:\Pythonfile\Local-2-Global-Image-Retrieval\google-research\cann\worldcup2026_low_database_names.txt"
# Lấy tất cả tên file (bỏ đuôi .npy), sắp xếp theo thứ tự alpha-b
files = sorted([f[:-4] for f in os.listdir(features_dir) if f.endswith('.npy')])
# Ghi ra file text
with open(output_txt, 'w') as f:
    f.write('\n'.join(files) + '\n')
print(f"Đã tạo thành công {len(files)} tên ảnh vào file {output_txt}")