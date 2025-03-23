#!/usr/bin/env python3
"""
APK Module Integrator
Công cụ đơn giản để tích hợp module từ APK đã decompile vào project hiện tại.
"""

import os
import sys
import shutil
import argparse
from datetime import datetime

def create_backup(project_dir, module_name):
    """Tạo backup của project trước khi tích hợp module."""
    backup_dir = os.path.join(project_dir, "_backups", datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + "_" + module_name)
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
    print(f"📦 Đang tạo backup tại: {backup_dir}")
    # Backup các file quan trọng (mở rộng khi cần)
    for folder in [f for f in os.listdir(project_dir) if f.startswith("smali")]:
        src = os.path.join(project_dir, folder)
        dst = os.path.join(backup_dir, folder)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
    
    # Backup AndroidManifest.xml
    manifest_file = os.path.join(project_dir, "AndroidManifest.xml")
    if os.path.exists(manifest_file):
        shutil.copy2(manifest_file, os.path.join(backup_dir, "AndroidManifest.xml"))
    
    return backup_dir

def analyze_smali_structure(project_dir):
    """Phân tích cấu trúc smali_classes trong project."""
    smali_folders = [folder for folder in os.listdir(project_dir) 
                    if folder.startswith("smali_classes") or folder == "smali"]
    smali_folders.sort()
    
    if not smali_folders:
        print("⚠️ Không tìm thấy thư mục smali trong project!")
        return "smali"
    
    # Xác định thư mục smali tiếp theo
    if len(smali_folders) == 1 and smali_folders[0] == "smali":
        next_folder = "smali_classes2"
    else:
        # Tìm số lớn nhất trong các thư mục smali_classes
        max_number = 1
        for folder in smali_folders:
            if folder != "smali":
                try:
                    number = int(folder.replace("smali_classes", ""))
                    max_number = max(max_number, number)
                except ValueError:
                    continue
        next_folder = f"smali_classes{max_number + 1}"
    
    print(f"🔍 Phân tích cấu trúc smali: {smali_folders}")
    print(f"📁 Thư mục smali tiếp theo: {next_folder}")
    return next_folder

def integrate_module(module_path, module_folder_name, project_dir, next_smali_folder):
    """Tích hợp module vào project."""
    source_path = os.path.join(module_path, module_folder_name)
    if not os.path.exists(source_path):
        print(f"❌ Không tìm thấy thư mục module: {source_path}")
        return False
    
    target_folder = os.path.join(project_dir, next_smali_folder)
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
    
    target_path = os.path.join(target_folder, module_folder_name)
    
    print(f"🔄 Tích hợp module từ: {source_path}")
    print(f"➡️ Đến: {target_path}")
    
    # Tạo thư mục đích nếu chưa tồn tại
    if os.path.exists(target_path):
        print(f"⚠️ Thư mục đích đã tồn tại, đang xóa để thay thế...")
        shutil.rmtree(target_path)
    
    # Copy module
    shutil.copytree(source_path, target_path)
    
    print(f"✅ Tích hợp module thành công!")
    return True

def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Tích hợp module smali vào project APK")
    parser.add_argument("--module-path", "-m", required=True, help="Đường dẫn đến thư mục smali của module đã decompile")
    parser.add_argument("--module-folder", "-f", required=True, help="Tên thư mục chứa code của module (ví dụ: miui)")
    parser.add_argument("--project-dir", "-p", default=".", help="Đường dẫn đến project APK (mặc định: thư mục hiện tại)")
    
    args = parser.parse_args()
    
    print("=== APK Module Integrator ===")
    print(f"🔹 Module path: {args.module_path}")
    print(f"🔹 Module folder: {args.module_folder}")
    print(f"🔹 Project directory: {args.project_dir}")
    
    # Kiểm tra thư mục dự án
    if not os.path.exists(args.project_dir):
        print(f"❌ Không tìm thấy thư mục dự án: {args.project_dir}")
        return 1
    
    # Tạo backup
    create_backup(args.project_dir, args.module_folder)
    
    # Phân tích cấu trúc smali
    next_smali_folder = analyze_smali_structure(args.project_dir)
    
    # Tích hợp module
    if integrate_module(args.module_path, args.module_folder, args.project_dir, next_smali_folder):
        print("\n🎉 Tích hợp module hoàn tất!")
        print(f"📝 Module {args.module_folder} đã được tích hợp vào {next_smali_folder}/")
        print("\n🔸 Bước tiếp theo:")
        print("  1. Kiểm tra tính tương thích của module")
        print("  2. Cập nhật AndroidManifest.xml nếu cần")
        print("  3. Biên dịch lại APK: apktool b . -o ../upgraded.apk")
        print("  4. Ký và tối ưu APK")
    else:
        print("\n❌ Tích hợp module thất bại!")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main()) 