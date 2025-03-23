#!/bin/bash

# APK Hooks - Script để tự động hóa các task liên quan đến backup và cleanup
# Usage: source ./scripts/apk-hooks.sh

# Thiết lập màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Thiết lập đường dẫn
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMP_BACKUP_DIR="$ROOT_DIR/_temp_backups"
EDITOR_CONFIG="$HOME/.apk_hooks_config"

# Tạo file config nếu chưa tồn tại
if [ ! -f "$EDITOR_CONFIG" ]; then
    echo "auto_backup=true" > "$EDITOR_CONFIG"
    echo "cleanup_days=7" >> "$EDITOR_CONFIG"
    echo "notify_backups=true" >> "$EDITOR_CONFIG"
    echo "last_cleanup=$(date +%s)" >> "$EDITOR_CONFIG"
fi

# Load config
source "$EDITOR_CONFIG"

# Hiển thị thông báo chào mừng
echo -e "${BLUE}APK Hooks đã được kích hoạt!${NC}"
echo -e "${BLUE}Auto Backup: ${auto_backup}${NC}"
echo -e "${BLUE}Cleanup Days: ${cleanup_days}${NC}"

# Hook for editor
hook_editor() {
    local file_path="$1"
    
    # Kiểm tra xem file có tồn tại không
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}File không tồn tại: $file_path${NC}"
        return 1
    fi
    
    # Kiểm tra config
    if [ "$auto_backup" = "true" ]; then
        # Tạo thư mục backup dựa trên ngày hiện tại
        local date_str=$(date +%Y%m%d)
        local backup_dir="$TEMP_BACKUP_DIR/$date_str"
        mkdir -p "$backup_dir"
        
        # Tạo tên cho file backup
        local file_name=$(basename "$file_path")
        local file_dir=$(dirname "$file_path")
        local rel_dir=${file_dir#$ROOT_DIR/}
        
        # Đảm bảo đường dẫn tương đối tồn tại trong thư mục backup
        mkdir -p "$backup_dir/$rel_dir"
        
        # Tạo tên file backup với timestamp
        local timestamp=$(date +%H%M%S)
        local backup_file="$backup_dir/$rel_dir/${file_name}.${timestamp}.bak"
        
        # Copy file vào thư mục backup
        cp "$file_path" "$backup_file"
        
        # Tạo file thông tin 
        echo "Auto backup before editing" > "${backup_file}.info"
        
        if [ "$notify_backups" = "true" ]; then
            echo -e "${GREEN}✅ Auto-backup file ${YELLOW}$file_path${GREEN} tại ${YELLOW}$backup_file${NC}"
        fi
    fi
    
    # Kiểm tra thời gian cleanup cuối cùng
    local current_time=$(date +%s)
    local time_diff=$((current_time - last_cleanup))
    local day_seconds=$((60 * 60 * 24))
    
    # Nếu đã qua 7 ngày kể từ lần cleanup cuối cùng
    if [ $time_diff -gt $((day_seconds * 7)) ]; then
        echo -e "${YELLOW}Đang thực hiện dọn dẹp backup tự động...${NC}"
        
        # Thực hiện cleanup
        find "$TEMP_BACKUP_DIR" -type d -name "[0-9]*" -mtime +$cleanup_days | while read -r old_backup_dir; do
            echo -e "${YELLOW}Xóa thư mục backup cũ: $old_backup_dir${NC}"
            rm -rf "$old_backup_dir"
        done
        
        # Cập nhật thời gian cleanup cuối cùng
        sed -i.bak "s/last_cleanup=.*/last_cleanup=$current_time/" "$EDITOR_CONFIG"
        rm -f "${EDITOR_CONFIG}.bak"
        
        echo -e "${GREEN}✅ Đã dọn dẹp các file backup cũ.${NC}"
    fi
    
    # Mở file với editor
    ${EDITOR:-vi} "$file_path"
}

# Cấu hình auto backup
configure_hooks() {
    echo -e "${BLUE}Cấu hình APK Hooks${NC}"
    echo -e "${YELLOW}Bật auto backup? (true/false) [hiện tại: $auto_backup]${NC}"
    read -p "" input_auto_backup
    
    if [ ! -z "$input_auto_backup" ]; then
        if [ "$input_auto_backup" = "true" ] || [ "$input_auto_backup" = "false" ]; then
            auto_backup="$input_auto_backup"
            sed -i.bak "s/auto_backup=.*/auto_backup=$auto_backup/" "$EDITOR_CONFIG"
            rm -f "${EDITOR_CONFIG}.bak"
        else
            echo -e "${RED}Giá trị không hợp lệ. Sử dụng 'true' hoặc 'false'.${NC}"
        fi
    fi
    
    echo -e "${YELLOW}Số ngày giữ backup? [hiện tại: $cleanup_days]${NC}"
    read -p "" input_cleanup_days
    
    if [ ! -z "$input_cleanup_days" ]; then
        if [[ "$input_cleanup_days" =~ ^[0-9]+$ ]]; then
            cleanup_days="$input_cleanup_days"
            sed -i.bak "s/cleanup_days=.*/cleanup_days=$cleanup_days/" "$EDITOR_CONFIG"
            rm -f "${EDITOR_CONFIG}.bak"
        else
            echo -e "${RED}Giá trị không hợp lệ. Sử dụng số nguyên dương.${NC}"
        fi
    fi
    
    echo -e "${YELLOW}Hiển thị thông báo khi backup? (true/false) [hiện tại: $notify_backups]${NC}"
    read -p "" input_notify_backups
    
    if [ ! -z "$input_notify_backups" ]; then
        if [ "$input_notify_backups" = "true" ] || [ "$input_notify_backups" = "false" ]; then
            notify_backups="$input_notify_backups"
            sed -i.bak "s/notify_backups=.*/notify_backups=$notify_backups/" "$EDITOR_CONFIG"
            rm -f "${EDITOR_CONFIG}.bak"
        else
            echo -e "${RED}Giá trị không hợp lệ. Sử dụng 'true' hoặc 'false'.${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Đã lưu cấu hình:${NC}"
    echo -e "${BLUE}Auto Backup: ${auto_backup}${NC}"
    echo -e "${BLUE}Cleanup Days: ${cleanup_days}${NC}"
    echo -e "${BLUE}Notify Backups: ${notify_backups}${NC}"
}

# Thực hiện cleanup ngay
force_cleanup() {
    local days="$1"
    
    if [ -z "$days" ]; then
        days="$cleanup_days"  # Sử dụng giá trị từ config
    fi
    
    echo -e "${BLUE}Đang dọn dẹp các file backup cũ hơn $days ngày...${NC}"
    
    # Tìm tất cả các thư mục backup cũ hơn số ngày chỉ định
    find "$TEMP_BACKUP_DIR" -type d -name "[0-9]*" -mtime +$days | while read -r old_backup_dir; do
        echo -e "${YELLOW}Xóa thư mục backup cũ: $old_backup_dir${NC}"
        rm -rf "$old_backup_dir"
    done
    
    # Cập nhật thời gian cleanup cuối cùng
    local current_time=$(date +%s)
    sed -i.bak "s/last_cleanup=.*/last_cleanup=$current_time/" "$EDITOR_CONFIG"
    rm -f "${EDITOR_CONFIG}.bak"
    
    echo -e "${GREEN}✅ Đã dọn dẹp các file backup cũ.${NC}"
}

# Thống kê các backup
backup_stats() {
    echo -e "${BLUE}Thống kê Backup${NC}"
    
    # Kiểm tra tổng số thư mục backup
    local dir_count=$(find "$TEMP_BACKUP_DIR" -type d -name "[0-9]*" | wc -l)
    echo -e "${YELLOW}Tổng số ngày có backup: ${dir_count}${NC}"
    
    # Kiểm tra tổng số file backup
    local file_count=$(find "$TEMP_BACKUP_DIR" -type f -name "*.bak" | wc -l)
    echo -e "${YELLOW}Tổng số file backup: ${file_count}${NC}"
    
    # Kiểm tra kích thước thư mục backup
    local total_size=$(du -sh "$TEMP_BACKUP_DIR" | cut -f1)
    echo -e "${YELLOW}Tổng dung lượng: ${total_size}${NC}"
    
    # Hiển thị 5 ngày có nhiều backup nhất
    echo -e "${BLUE}Những ngày có nhiều backup nhất:${NC}"
    find "$TEMP_BACKUP_DIR" -type d -name "[0-9]*" | while read -r backup_dir; do
        local count=$(find "$backup_dir" -type f -name "*.bak" | wc -l)
        local date_str=$(basename "$backup_dir")
        echo "$date_str $count"
    done | sort -k2 -nr | head -5 | while read -r line; do
        local date_str=$(echo "$line" | cut -d' ' -f1)
        local count=$(echo "$line" | cut -d' ' -f2)
        local formatted_date="${date_str:0:4}-${date_str:4:2}-${date_str:6:2}"
        echo -e "${YELLOW}${formatted_date}: ${count} files${NC}"
    done
    
    # Hiển thị 5 file được backup nhiều nhất
    echo -e "${BLUE}Những file được backup nhiều nhất:${NC}"
    find "$TEMP_BACKUP_DIR" -type f -name "*.bak" | sed 's/\.[0-9]\{6\}\.bak$//' | sort | uniq -c | sort -nr | head -5 | while read -r line; do
        local count=$(echo "$line" | awk '{print $1}')
        local file=$(echo "$line" | cut -d' ' -f2-)
        echo -e "${YELLOW}${file##*/}: ${count} lần${NC}"
    done
}

# Hiển thị trợ giúp
show_hooks_help() {
    cat << EOF
APK Hooks - Các lệnh hỗ trợ tự động backup và cleanup

Sử dụng: 
  edit <file>                   Chỉnh sửa file với auto backup
  config-hooks                  Cấu hình APK Hooks
  force-cleanup [days]          Thực hiện cleanup ngay
  backup-stats                  Hiển thị thống kê về backup

Cấu hình hiện tại:
  Auto Backup: $auto_backup
  Cleanup Days: $cleanup_days
  Notify Backups: $notify_backups
EOF
}

# Export functions
export -f hook_editor
export -f configure_hooks
export -f force_cleanup
export -f backup_stats
export -f show_hooks_help

# Alias
alias edit='hook_editor'
alias config-hooks='configure_hooks'
alias force-cleanup='force_cleanup'
alias backup-stats='backup_stats'
alias hooks-help='show_hooks_help'

# Hiển thị hướng dẫn
echo -e "${YELLOW}Sử dụng 'edit <file>' để chỉnh sửa file với auto backup${NC}"
echo -e "${YELLOW}Sử dụng 'config-hooks' để cấu hình APK Hooks${NC}"
echo -e "${YELLOW}Sử dụng 'hooks-help' để xem tất cả các lệnh${NC}" 