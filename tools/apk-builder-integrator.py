#!/usr/bin/env python3
"""
APK Builder Integrator
Công cụ tự động build project Android và tích hợp vào APK đích
"""

import os
import sys
import shutil
import subprocess
import argparse
import logging
import time
from datetime import datetime

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

def create_timestamp_directory(base_dir):
    """Tạo thư mục với timestamp để lưu trữ kết quả build"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    work_dir = os.path.join(base_dir, f"apk_build_{timestamp}")
    os.makedirs(work_dir, exist_ok=True)
    return work_dir

def run_command(command, cwd=None):
    """Chạy lệnh shell và trả về output"""
    logger.info(f"Đang thực thi lệnh: {command}")
    try:
        process = subprocess.Popen(
            command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            shell=True,
            cwd=cwd,
            text=True
        )
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            logger.error(f"Lỗi khi thực thi lệnh: {command}")
            logger.error(f"STDERR: {stderr}")
            return False, stderr
        
        return True, stdout
    except Exception as e:
        logger.error(f"Ngoại lệ: {str(e)}")
        return False, str(e)

def find_apk_files(directory):
    """Tìm tất cả file APK trong thư mục và các thư mục con"""
    result = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.apk'):
                result.append(os.path.join(root, file))
    return result

def build_android_project(project_path, output_dir):
    """Build project Android và lấy file APK"""
    logger.info(f"Bắt đầu build project tại: {project_path}")
    
    # Kiểm tra xem project_path có tồn tại không
    if not os.path.exists(project_path):
        logger.error(f"Đường dẫn project không tồn tại: {project_path}")
        return None
    
    # Kiểm tra xem có phải là project Android không (có file build.gradle)
    if not os.path.exists(os.path.join(project_path, "build.gradle")):
        logger.error(f"Không phải là project Android (không có file build.gradle): {project_path}")
        return None
    
    # Kiểm tra xem có file gradlew không
    gradlew_path = os.path.join(project_path, "gradlew")
    if not os.path.exists(gradlew_path):
        logger.error(f"Không tìm thấy file gradlew trong project: {project_path}")
        return None
    
    # Đảm bảo gradlew có quyền thực thi
    os.chmod(gradlew_path, 0o755)
    
    # Build project
    logger.info("Đang build project...")
    success, output = run_command(f"./gradlew assembleRelease", cwd=project_path)
    
    if not success:
        logger.error("Build project thất bại")
        return None
    
    logger.info("Build project thành công")
    
    # Tìm file APK trong thư mục build
    apk_files = []
    for module_dir in [d for d in os.listdir(project_path) if os.path.isdir(os.path.join(project_path, d))]:
        module_path = os.path.join(project_path, module_dir)
        # Kiểm tra xem module có build.gradle không
        if os.path.exists(os.path.join(module_path, "build.gradle")):
            # Kiểm tra trong thư mục build/outputs/apk
            build_dir = os.path.join(module_path, "build", "outputs", "apk")
            if os.path.exists(build_dir):
                apk_files.extend(find_apk_files(build_dir))
    
    if not apk_files:
        logger.error("Không tìm thấy file APK sau khi build")
        return None
    
    # Sao chép các file APK vào thư mục output
    for apk_path in apk_files:
        apk_name = os.path.basename(apk_path)
        dest_path = os.path.join(output_dir, apk_name)
        shutil.copy2(apk_path, dest_path)
        logger.info(f"Đã sao chép APK: {apk_path} -> {dest_path}")
    
    return apk_files

def integrate_apk(source_apk, target_apk, package_path):
    """Tích hợp package từ source APK vào target APK"""
    logger.info(f"Bắt đầu tích hợp từ {source_apk} vào {target_apk}")
    
    work_dir = os.path.dirname(source_apk)
    
    # Tạo thư mục để decompile
    source_dir = os.path.join(work_dir, "source_decompiled")
    target_dir = os.path.join(work_dir, "target_decompiled")
    output_dir = os.path.join(work_dir, "output")
    
    os.makedirs(source_dir, exist_ok=True)
    os.makedirs(target_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    
    # Decompile source APK
    logger.info("Đang decompile source APK...")
    success, output = run_command(f"apktool d \"{source_apk}\" -o \"{source_dir}\" -f")
    if not success:
        logger.error("Decompile source APK thất bại")
        return None
    
    # Decompile target APK
    logger.info("Đang decompile target APK...")
    success, output = run_command(f"apktool d \"{target_apk}\" -o \"{target_dir}\" -f")
    if not success:
        logger.error("Decompile target APK thất bại")
        return None
    
    # Tìm package trong source APK
    source_package = None
    for smali_dir in [d for d in os.listdir(source_dir) if d.startswith("smali") or d == "smali"]:
        smali_path = os.path.join(source_dir, smali_dir)
        package_full_path = os.path.join(smali_path, package_path)
        if os.path.exists(package_full_path):
            source_package = (smali_path, package_full_path)
            break
    
    if not source_package:
        logger.error(f"Không tìm thấy package {package_path} trong source APK")
        return None
    
    # Tìm thư mục smali trong target APK
    target_smali_dirs = [d for d in os.listdir(target_dir) if d.startswith("smali") or d == "smali"]
    target_smali_dirs.sort()
    
    if not target_smali_dirs:
        # Nếu không có thư mục smali, tạo một thư mục mới
        target_smali = os.path.join(target_dir, "smali")
        os.makedirs(target_smali, exist_ok=True)
    else:
        # Sử dụng thư mục smali đầu tiên hoặc tạo thư mục smali mới
        if len(target_smali_dirs) == 1 and target_smali_dirs[0] == "smali":
            next_smali = "smali_classes2"
        else:
            max_num = 1
            for d in target_smali_dirs:
                if d != "smali":
                    try:
                        num = int(d.replace("smali_classes", ""))
                        max_num = max(max_num, num)
                    except:
                        pass
            next_smali = f"smali_classes{max_num + 1}"
        
        target_smali = os.path.join(target_dir, next_smali)
        os.makedirs(target_smali, exist_ok=True)
    
    # Copy package vào target APK
    source_smali, source_package_path = source_package
    package_parent_dir = os.path.dirname(os.path.join(target_smali, package_path))
    os.makedirs(package_parent_dir, exist_ok=True)
    
    dest_package_path = os.path.join(target_smali, package_path)
    shutil.copytree(source_package_path, dest_package_path)
    
    logger.info(f"Đã copy package từ {source_package_path} sang {dest_package_path}")
    
    # Kiểm tra AndroidManifest.xml
    package_dot = package_path.replace("/", ".")
    source_manifest = os.path.join(source_dir, "AndroidManifest.xml")
    target_manifest = os.path.join(target_dir, "AndroidManifest.xml")
    
    with open(source_manifest, "r", encoding="utf-8") as f:
        source_manifest_content = f.read()
    
    if package_dot in source_manifest_content:
        logger.warning(f"Package {package_dot} xuất hiện trong AndroidManifest.xml của source APK")
        logger.warning("Bạn cần kiểm tra và cập nhật AndroidManifest.xml của target APK thủ công")
    
    # Build lại target APK
    logger.info("Đang build lại target APK...")
    output_apk = os.path.join(output_dir, "integrated.apk")
    success, output = run_command(f"apktool b \"{target_dir}\" -o \"{output_apk}\"")
    if not success:
        logger.error("Build lại target APK thất bại")
        return None
    
    logger.info(f"Đã build thành công APK đã tích hợp: {output_apk}")
    return output_apk

def main():
    parser = argparse.ArgumentParser(description='APK Builder Integrator')
    parser.add_argument('--project-path', '-p', required=True, help='Đường dẫn đến project Android nguồn cần build')
    parser.add_argument('--target-apk', '-t', help='Đường dẫn đến APK đích cần tích hợp vào')
    parser.add_argument('--package-path', '-pkg', help='Đường dẫn package cần tích hợp (VD: com/example/feature)')
    parser.add_argument('--output-dir', '-o', help='Thư mục để lưu kết quả (mặc định: Thư mục hiện tại)')
    
    args = parser.parse_args()
    
    # Xác định thư mục output
    output_dir = args.output_dir if args.output_dir else os.getcwd()
    work_dir = create_timestamp_directory(output_dir)
    
    logger.info(f"Đã tạo thư mục làm việc: {work_dir}")
    
    # Build project Android
    built_apks = build_android_project(args.project_path, work_dir)
    
    if not built_apks:
        logger.error("Không thể build project Android")
        return 1
    
    logger.info(f"Đã build thành công các APK: {built_apks}")
    
    # Nếu có target APK và package path, tiến hành tích hợp
    if args.target_apk and args.package_path:
        source_apk = built_apks[0]  # Sử dụng APK đầu tiên
        logger.info(f"Sử dụng {source_apk} làm source APK")
        
        integrated_apk = integrate_apk(source_apk, args.target_apk, args.package_path)
        
        if integrated_apk:
            logger.info(f"Quy trình tích hợp hoàn tất. APK đã tích hợp: {integrated_apk}")
            return 0
        else:
            logger.error("Quy trình tích hợp thất bại")
            return 1
    
    logger.info("Quy trình build hoàn tất")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 