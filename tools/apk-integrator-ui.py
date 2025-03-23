#!/usr/bin/env python3
"""
APK Module Integrator - UI Version
Giao diện đồ họa đơn giản cho công cụ tích hợp module APK
"""

import os
import sys
import shutil
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from datetime import datetime

def create_backup(project_dir, module_name):
    """Tạo backup của project trước khi tích hợp module."""
    backup_dir = os.path.join(project_dir, "_backups", datetime.now().strftime("%Y-%m-%d_%H-%M-%S") + "_" + module_name)
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
    
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
        return "smali", []
    
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
    
    return next_folder, smali_folders

def integrate_module(module_path, module_folder_name, project_dir, next_smali_folder, log_func=print):
    """Tích hợp module vào project."""
    source_path = os.path.join(module_path, module_folder_name)
    if not os.path.exists(source_path):
        log_func(f"❌ Không tìm thấy thư mục module: {source_path}")
        return False
    
    target_folder = os.path.join(project_dir, next_smali_folder)
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
    
    target_path = os.path.join(target_folder, module_folder_name)
    
    log_func(f"🔄 Tích hợp module từ: {source_path}")
    log_func(f"➡️ Đến: {target_path}")
    
    # Tạo thư mục đích nếu chưa tồn tại
    if os.path.exists(target_path):
        log_func(f"⚠️ Thư mục đích đã tồn tại, đang xóa để thay thế...")
        shutil.rmtree(target_path)
    
    # Copy module
    shutil.copytree(source_path, target_path)
    
    log_func(f"✅ Tích hợp module thành công!")
    return True

class APKIntegratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("APK Module Integrator")
        self.root.geometry("800x600")
        self.root.minsize(700, 500)
        
        self.create_widgets()
        
    def create_widgets(self):
        # Frame chính
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Tiêu đề
        title_label = ttk.Label(main_frame, text="APK Module Integrator", font=("Arial", 16, "bold"))
        title_label.pack(pady=10)
        
        # Frame cho các input
        input_frame = ttk.LabelFrame(main_frame, text="Cấu hình", padding="10")
        input_frame.pack(fill=tk.X, pady=10)
        
        # Project directory
        ttk.Label(input_frame, text="Thư mục dự án APK đích:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.project_dir_frame = ttk.Frame(input_frame)
        self.project_dir_frame.grid(row=0, column=1, sticky=tk.W+tk.E, pady=5)
        self.project_dir_entry = ttk.Entry(self.project_dir_frame, width=50)
        self.project_dir_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(self.project_dir_frame, text="Chọn...", command=self.browse_project_dir).pack(side=tk.RIGHT, padx=5)
        
        # Module path
        ttk.Label(input_frame, text="Thư mục module nguồn:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.module_path_frame = ttk.Frame(input_frame)
        self.module_path_frame.grid(row=1, column=1, sticky=tk.W+tk.E, pady=5)
        self.module_path_entry = ttk.Entry(self.module_path_frame, width=50)
        self.module_path_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)
        ttk.Button(self.module_path_frame, text="Chọn...", command=self.browse_module_path).pack(side=tk.RIGHT, padx=5)
        
        # Module folder name
        ttk.Label(input_frame, text="Tên thư mục module:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.module_folder_entry = ttk.Entry(input_frame, width=20)
        self.module_folder_entry.grid(row=2, column=1, sticky=tk.W, pady=5)
        
        # Nút Analyze
        ttk.Button(input_frame, text="Phân Tích Cấu Trúc", command=self.analyze_structure).grid(row=3, column=0, pady=10)
        
        # Frame cho kết quả phân tích
        self.analysis_frame = ttk.LabelFrame(main_frame, text="Kết Quả Phân Tích", padding="10")
        self.analysis_frame.pack(fill=tk.X, pady=10)
        
        # Hiển thị smali folders
        ttk.Label(self.analysis_frame, text="Thư mục smali hiện có:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.smali_folders_var = tk.StringVar()
        ttk.Label(self.analysis_frame, textvariable=self.smali_folders_var).grid(row=0, column=1, sticky=tk.W, pady=5)
        
        # Hiển thị next smali folder
        ttk.Label(self.analysis_frame, text="Thư mục đích đề xuất:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.next_folder_var = tk.StringVar()
        self.next_folder_combo = ttk.Combobox(self.analysis_frame, textvariable=self.next_folder_var, width=20)
        self.next_folder_combo.grid(row=1, column=1, sticky=tk.W, pady=5)
        
        # Log area
        log_frame = ttk.LabelFrame(main_frame, text="Log", padding="10")
        log_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.log_text = tk.Text(log_frame, height=10, width=80, wrap=tk.WORD)
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        scrollbar = ttk.Scrollbar(log_frame, command=self.log_text.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=scrollbar.set)
        
        # Nút thực thi
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(button_frame, text="Tích Hợp Module", command=self.integrate).pack(side=tk.RIGHT, padx=5)
        ttk.Button(button_frame, text="Tạo Backup", command=self.create_backup_only).pack(side=tk.RIGHT, padx=5)
        
        # Status bar
        self.status_var = tk.StringVar()
        self.status_var.set("Sẵn sàng")
        status_bar = ttk.Label(self.root, textvariable=self.status_var, relief=tk.SUNKEN, anchor=tk.W)
        status_bar.pack(side=tk.BOTTOM, fill=tk.X)
    
    def log(self, message):
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.root.update_idletasks()
    
    def browse_project_dir(self):
        directory = filedialog.askdirectory(title="Chọn thư mục dự án APK đích")
        if directory:
            self.project_dir_entry.delete(0, tk.END)
            self.project_dir_entry.insert(0, directory)
    
    def browse_module_path(self):
        directory = filedialog.askdirectory(title="Chọn thư mục module nguồn")
        if directory:
            self.module_path_entry.delete(0, tk.END)
            self.module_path_entry.insert(0, directory)
            
            # Tự động tìm các thư mục tiềm năng trong module
            self.suggest_module_folders(directory)
    
    def suggest_module_folders(self, module_path):
        """Gợi ý các thư mục tiềm năng trong module path"""
        if not os.path.exists(module_path):
            return
        
        # Tìm các thư mục smali
        smali_dir = None
        for folder in os.listdir(module_path):
            if folder.startswith("smali"):
                smali_dir = os.path.join(module_path, folder)
                break
        
        if not smali_dir or not os.path.isdir(smali_dir):
            return
        
        # Tìm các package tiềm năng (thư mục con đầu tiên trong smali)
        potential_modules = []
        for item in os.listdir(smali_dir):
            if os.path.isdir(os.path.join(smali_dir, item)) and not item.startswith("."):
                potential_modules.append(item)
        
        if potential_modules:
            # Hiển thị dialog để chọn
            if len(potential_modules) == 1:
                self.module_folder_entry.delete(0, tk.END)
                self.module_folder_entry.insert(0, potential_modules[0])
            else:
                selected = self.show_folder_selection_dialog(potential_modules)
                if selected:
                    self.module_folder_entry.delete(0, tk.END)
                    self.module_folder_entry.insert(0, selected)
    
    def show_folder_selection_dialog(self, folders):
        """Hiển thị dialog để chọn thư mục module"""
        dialog = tk.Toplevel(self.root)
        dialog.title("Chọn thư mục module")
        dialog.geometry("300x300")
        dialog.transient(self.root)
        dialog.grab_set()
        
        ttk.Label(dialog, text="Chọn thư mục module cần tích hợp:").pack(pady=10)
        
        listbox = tk.Listbox(dialog, width=40, height=10)
        listbox.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        for folder in folders:
            listbox.insert(tk.END, folder)
        
        result = [None]  # Sử dụng list để có thể thay đổi giá trị trong hàm callback
        
        def on_select():
            selection = listbox.curselection()
            if selection:
                result[0] = folders[selection[0]]
            dialog.destroy()
        
        ttk.Button(dialog, text="Chọn", command=on_select).pack(pady=10)
        
        self.root.wait_window(dialog)
        return result[0]
    
    def analyze_structure(self):
        project_dir = self.project_dir_entry.get()
        if not project_dir or not os.path.exists(project_dir):
            messagebox.showerror("Lỗi", "Vui lòng chọn thư mục dự án hợp lệ!")
            return
        
        self.log("🔍 Đang phân tích cấu trúc smali trong dự án...")
        
        next_folder, smali_folders = analyze_smali_structure(project_dir)
        
        if not smali_folders:
            self.smali_folders_var.set("Không tìm thấy thư mục smali")
            self.log("⚠️ Không tìm thấy thư mục smali trong dự án!")
        else:
            self.smali_folders_var.set(", ".join(smali_folders))
            self.log(f"📁 Tìm thấy các thư mục: {', '.join(smali_folders)}")
        
        # Cập nhật combo box với các lựa chọn thư mục
        options = [next_folder]
        for i in range(1, 10):
            folder_name = f"smali_classes{i}"
            if folder_name not in smali_folders:
                options.append(folder_name)
        
        self.next_folder_combo["values"] = options
        self.next_folder_var.set(next_folder)
        
        self.log(f"📁 Thư mục đích đề xuất: {next_folder}")
        self.status_var.set(f"Đã phân tích cấu trúc. Thư mục đích đề xuất: {next_folder}")
    
    def create_backup_only(self):
        project_dir = self.project_dir_entry.get()
        module_name = self.module_folder_entry.get() or "manual_backup"
        
        if not project_dir or not os.path.exists(project_dir):
            messagebox.showerror("Lỗi", "Vui lòng chọn thư mục dự án hợp lệ!")
            return
        
        self.log("📦 Đang tạo backup...")
        backup_dir = create_backup(project_dir, module_name)
        self.log(f"✅ Đã tạo backup tại: {backup_dir}")
        self.status_var.set(f"Đã tạo backup tại: {backup_dir}")
    
    def integrate(self):
        project_dir = self.project_dir_entry.get()
        module_path = self.module_path_entry.get()
        module_folder = self.module_folder_entry.get()
        next_folder = self.next_folder_var.get()
        
        if not project_dir or not os.path.exists(project_dir):
            messagebox.showerror("Lỗi", "Vui lòng chọn thư mục dự án hợp lệ!")
            return
        
        if not module_path or not os.path.exists(module_path):
            messagebox.showerror("Lỗi", "Vui lòng chọn thư mục module nguồn hợp lệ!")
            return
        
        if not module_folder:
            messagebox.showerror("Lỗi", "Vui lòng nhập tên thư mục module!")
            return
        
        # Xác nhận trước khi thực hiện
        if not messagebox.askyesno("Xác nhận", f"Bạn có chắc chắn muốn tích hợp module '{module_folder}' vào thư mục '{next_folder}' không?"):
            return
        
        # Tạo backup
        self.log("\n== Bắt đầu quy trình tích hợp ==")
        self.log("📦 Đang tạo backup...")
        backup_dir = create_backup(project_dir, module_folder)
        self.log(f"✅ Đã tạo backup tại: {backup_dir}")
        
        # Tích hợp module
        self.log("\n🔄 Đang tích hợp module...")
        self.status_var.set("Đang tích hợp module...")
        
        success = integrate_module(module_path, module_folder, project_dir, next_folder, self.log)
        
        if success:
            self.log("\n🎉 Tích hợp module hoàn tất!")
            self.log(f"📝 Module {module_folder} đã được tích hợp vào {next_folder}/")
            self.log("\n🔸 Bước tiếp theo:")
            self.log("  1. Kiểm tra tính tương thích của module")
            self.log("  2. Cập nhật AndroidManifest.xml nếu cần")
            self.log("  3. Biên dịch lại APK: apktool b . -o ../upgraded.apk")
            self.log("  4. Ký và tối ưu APK")
            
            self.status_var.set(f"Đã tích hợp module {module_folder} vào {next_folder}/")
            messagebox.showinfo("Thành công", f"Đã tích hợp module {module_folder} vào {next_folder}/")
        else:
            self.log("\n❌ Tích hợp module thất bại!")
            self.status_var.set("Tích hợp thất bại!")
            messagebox.showerror("Lỗi", "Tích hợp module thất bại! Vui lòng kiểm tra log để biết thêm chi tiết.")

def main():
    root = tk.Tk()
    app = APKIntegratorApp(root)
    root.mainloop()

if __name__ == "__main__":
    main() 