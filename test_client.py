import requests
import sys
import os
import json
import base64

API_URL = "http://26.138.141.88:5555/api/v1"

def print_json(data):
    # Rút gọn base64 nếu có để in ra không bị tràn màn hình
    if isinstance(data, dict):
        if "results" in data:
            for res in data["results"]:
                if res.get("image_base64"):
                    res["image_base64"] = res["image_base64"][:40] + "... (truncated)"
    print(json.dumps(data, indent=2, ensure_ascii=False))

def test_full_flow(image_path: str):
    print("="*50)
    print("1. ĐĂNG KÝ / ĐĂNG NHẬP")
    print("="*50)
    
    username = "vinh"
    password = "2"
    
    # Đăng ký
    print(f"[*] Đăng ký tài khoản: {username}")
    reg_res = requests.post(f"{API_URL}/auth/register", json={"username": username, "password": password})
    if reg_res.status_code == 200:
        print("[+] Đăng ký thành công!")
    elif reg_res.status_code == 400:
        print("[!] Tài khoản đã tồn tại, tiếp tục đăng nhập...")
    else:
        print(f"[-] Lỗi đăng ký: {reg_res.text}")
        return

    # Đăng nhập
    print(f"\n[*] Đăng nhập tài khoản: {username}")
    login_res = requests.post(f"{API_URL}/auth/login", data={"username": username, "password": password})
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
        print(f"[+] Đăng nhập thành công! Lấy được Token: {token[:20]}...")
    else:
        print(f"[-] Lỗi đăng nhập: {login_res.text}")
        return
        
    headers = {"Authorization": f"Bearer {token}"}

    print("\n" + "="*50)
    print("2. TRUY VẤN ẢNH (RETRIEVAL)")
    print("="*50)
    
    print(f"[*] Gửi ảnh '{image_path}' lên server...")
    query_id = None
    try:
        with open(image_path, "rb") as f:
            files = {"file": (image_path, f, "image/jpeg")}
            
            # Lưu ý: truyền headers chứa Token
            response = requests.post(f"{API_URL}/retrieval/retrieve", files=files, headers=headers)
            
        if response.status_code == 200:
            print("\n[+] Truy vấn thành công! Server trả về:")
            resp_data = response.json()
            query_id = resp_data.get("query_id")
            print_json(resp_data)
        else:
            print(f"\n[-] Lỗi HTTP {response.status_code}: {response.text}")
            
    except FileNotFoundError:
        print(f"[-] Không tìm thấy file ảnh: {image_path}")
        return
    except Exception as e:
        print(f"[-] Lỗi khi gọi API truy vấn: {e}")
        return
        
    if not query_id:
        print("[-] Không lấy được query_id, bỏ qua các bước sau.")
        return

    print("\n" + "="*50)
    print("3. GỬI ĐÁNH GIÁ (FEEDBACK)")
    print("="*50)
    print(f"[*] Gửi đánh giá 5 sao cho query_id = {query_id}")
    feedback_data = {
        "query_id": query_id,
        "rating": 5,
        "comment": "Kết quả trả về rất chính xác!"
    }
    fb_res = requests.post(f"{API_URL}/feedback/submit", json=feedback_data, headers=headers)
    print(f"[+] Server phản hồi: {fb_res.json() if fb_res.status_code == 200 else fb_res.text}")

    print("\n" + "="*50)
    print("4. XEM LỊCH SỬ TRUY VẤN (HISTORY)")
    print("="*50)
    print("[*] Lấy danh sách lịch sử truy vấn của người dùng...")
    history_res = requests.get(f"{API_URL}/history/", headers=headers)
    if history_res.status_code == 200:
        print("[+] Lịch sử của bạn:")
        print_json(history_res.json())
    else:
        print(f"[-] Lỗi lấy lịch sử: {history_res.text}")

    print("\n" + "="*50)
    print("5. NÂNG CẤP TÀI KHOẢN PRO")
    print("="*50)
    print("[*] Nâng cấp tài khoản hiện tại lên gói Pro (30 ngày)...")
    upgrade_res = requests.post(f"{API_URL}/auth/upgrade-pro", json={"days": 30}, headers=headers)
    if upgrade_res.status_code == 200:
        print("[+] Nâng cấp thành công! Trạng thái tài khoản mới:")
        print(json.dumps(upgrade_res.json(), indent=2))
    else:
        print(f"[-] Lỗi nâng cấp: {upgrade_res.text}")

if __name__ == "__main__":
    test_image = r"E:\Pythonfile\Local-2-Global-Image-Retrieval\data\datasets\roxford5k\jpg\all_souls_000003.jpg"
    if not os.path.exists(test_image):
        with open(test_image, "wb") as temp_img:
            temp_img.write(b"fake image content")
            print(f"[!] Đã tạo file ảnh giả lập '{test_image}'.")
            
    test_full_flow(test_image)
