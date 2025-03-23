#!/bin/bash

# APK Tools - Script tự động hóa cho quy trình làm việc với APK
# Usage: ./apk-tools.sh [command] [options]

# Thiết lập màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Thiết lập đường dẫn
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="$ROOT_DIR/tools"
INPUT_DIR="$ROOT_DIR/input"
OUTPUT_DIR="$ROOT_DIR/output"
BUILD_DIR="$ROOT_DIR/build"
KEYSTORE_DIR="$ROOT_DIR/keystore"
REPORT_DIR="$ROOT_DIR/reports"
DEX2JAR_DIR="$ROOT_DIR/dex2jar"
AAB_DIR="$ROOT_DIR/aab"
TEMP_BACKUP_DIR="$ROOT_DIR/_temp_backups"

# Tạo các thư mục cần thiết
mkdir -p "$INPUT_DIR" "$OUTPUT_DIR" "$BUILD_DIR" "$KEYSTORE_DIR" "$REPORT_DIR" "$DEX2JAR_DIR" "$AAB_DIR" "$TEMP_BACKUP_DIR"
mkdir -p "$TOOLS_DIR/apktool" "$TOOLS_DIR/bundletool" "$TOOLS_DIR/dex2jar" "$TOOLS_DIR/jadx"

# Kiểm tra và tải công cụ nếu cần
check_tools() {
    echo -e "${BLUE}Kiểm tra công cụ cần thiết...${NC}"
    
    # Kiểm tra apktool
    if [ ! -f "$TOOLS_DIR/apktool/apktool.jar" ]; then
        echo -e "${YELLOW}Đang tải apktool...${NC}"
        curl -L https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.6.1.jar -o "$TOOLS_DIR/apktool/apktool.jar"
        chmod +x "$TOOLS_DIR/apktool/apktool.jar"
    fi
    
    # Kiểm tra dex2jar
    if [ ! -d "$TOOLS_DIR/dex2jar/dex-tools" ]; then
        echo -e "${YELLOW}Đang tải dex2jar...${NC}"
        curl -L https://github.com/pxb1988/dex2jar/releases/download/v2.1/dex-tools-2.1.zip -o "$TOOLS_DIR/dex2jar/dex2jar.zip"
        unzip -q "$TOOLS_DIR/dex2jar/dex2jar.zip" -d "$TOOLS_DIR/dex2jar"
        rm "$TOOLS_DIR/dex2jar/dex2jar.zip"
        chmod +x "$TOOLS_DIR/dex2jar/dex-tools/bin/"*.sh
    fi
    
    # Kiểm tra bundletool
    if [ ! -f "$TOOLS_DIR/bundletool/bundletool.jar" ]; then
        echo -e "${YELLOW}Đang tải bundletool...${NC}"
        curl -L https://github.com/google/bundletool/releases/download/1.11.2/bundletool-all-1.11.2.jar -o "$TOOLS_DIR/bundletool/bundletool.jar"
    fi
    
    echo -e "${GREEN}Kiểm tra công cụ hoàn tất!${NC}"
}

# Phân tích APK cơ bản
analyze_apk() {
    local apk_file="$1"
    
    if [ ! -f "$apk_file" ]; then
        echo -e "${RED}File APK không tồn tại: $apk_file${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Đang phân tích APK: $(basename "$apk_file")${NC}"
    
    # Tạo thư mục báo cáo
    local report_name="$(basename "$apk_file" .apk)_report"
    local report_dir="$REPORT_DIR/$report_name"
    mkdir -p "$report_dir"
    
    # Bắt đầu phân tích
    echo -e "${YELLOW}Trích xuất thông tin cơ bản...${NC}"
    
    # Sử dụng aapt để lấy thông tin
    local aapt_out="$report_dir/aapt_dump.txt"
    aapt dump badging "$apk_file" > "$aapt_out"
    
    # Trích xuất package name và version
    local package_name=$(grep "package:" "$aapt_out" | awk -F "name='" '{print $2}' | awk -F "'" '{print $1}')
    local version_name=$(grep "package:" "$aapt_out" | awk -F "versionName='" '{print $2}' | awk -F "'" '{print $1}')
    local version_code=$(grep "package:" "$aapt_out" | awk -F "versionCode='" '{print $2}' | awk -F "'" '{print $1}')
    
    # Tạo báo cáo
    local report_file="$report_dir/report.md"
    
    echo "# Báo Cáo Phân Tích APK" > "$report_file"
    echo "" >> "$report_file"
    echo "## Thông Tin Cơ Bản" >> "$report_file"
    echo "" >> "$report_file"
    echo "- **Tên File:** $(basename "$apk_file")" >> "$report_file"
    echo "- **Kích Thước:** $(du -h "$apk_file" | cut -f1)" >> "$report_file"
    echo "- **Package Name:** $package_name" >> "$report_file"
    echo "- **Version Name:** $version_name" >> "$report_file"
    echo "- **Version Code:** $version_code" >> "$report_file"
    echo "" >> "$report_file"
    
    # Trích xuất danh sách permissions
    echo "## Permissions" >> "$report_file"
    echo "" >> "$report_file"
    grep "uses-permission:" "$aapt_out" | while read -r line; do
        permission=$(echo "$line" | awk -F "name='" '{print $2}' | awk -F "'" '{print $1}')
        echo "- $permission" >> "$report_file"
    done
    echo "" >> "$report_file"
    
    # Trích xuất danh sách activities
    echo "## Components" >> "$report_file"
    echo "" >> "$report_file"
    echo "### Activities" >> "$report_file"
    grep "activity:" "$aapt_out" | while read -r line; do
        activity=$(echo "$line" | awk -F "name='" '{print $2}' | awk -F "'" '{print $1}')
        echo "- $activity" >> "$report_file"
    done
    echo "" >> "$report_file"
    
    # Trích xuất danh sách services
    echo "### Services" >> "$report_file"
    grep "service:" "$aapt_out" | while read -r line; do
        service=$(echo "$line" | awk -F "name='" '{print $2}' | awk -F "'" '{print $1}')
        echo "- $service" >> "$report_file"
    done
    echo "" >> "$report_file"
    
    # Trích xuất danh sách receivers
    echo "### Receivers" >> "$report_file"
    grep "receiver:" "$aapt_out" | while read -r line; do
        receiver=$(echo "$line" | awk -F "name='" '{print $2}' | awk -F "'" '{print $1}')
        echo "- $receiver" >> "$report_file"
    done
    echo "" >> "$report_file"
    
    # Kiểm tra chữ ký
    echo "## Thông Tin Chữ Ký" >> "$report_file"
    echo "" >> "$report_file"
    
    local signature_check=$(apksigner verify --verbose "$apk_file" 2>&1)
    if echo "$signature_check" | grep -q "verified"; then
        echo "- **Trạng Thái:** ✅ Đã được ký" >> "$report_file"
    else
        echo "- **Trạng Thái:** ❌ Chưa được ký hoặc chữ ký không hợp lệ" >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "## Thống Kê" >> "$report_file"
    
    # Hiển thị báo cáo
    echo -e "${GREEN}Phân tích hoàn tất! Báo cáo được lưu tại: ${YELLOW}$report_file${NC}"
    echo "Package: $package_name"
    echo "Version: $version_name ($version_code)"
    
    # Trả về package name để sử dụng trong các hàm khác
    echo "$package_name"
}

# Decode APK
decode_apk() {
    local apk_file="$1"
    local force_flag="$2"
    
    if [ ! -f "$apk_file" ]; then
        echo -e "${RED}File APK không tồn tại: $apk_file${NC}"
        return 1
    fi
    
    # Phân tích APK để lấy package name
    local package_name=$(analyze_apk "$apk_file")
    local base_name=$(basename "$apk_file" .apk)
    local output_dir="$OUTPUT_DIR/${package_name}"
    
    echo -e "${BLUE}Đang decode APK: $(basename "$apk_file") -> $output_dir${NC}"
    
    # Tạo thư mục đích
    mkdir -p "$output_dir"
    
    # Tạo backup trước
    if [ -d "$output_dir" ] && [ "$(ls -A "$output_dir")" ]; then
        if [ "$force_flag" != "--force" ]; then
            echo -e "${YELLOW}Thư mục đích đã tồn tại. Sử dụng --force để ghi đè.${NC}"
            return 1
        else
            local backup_dir="$ROOT_DIR/_backups/$(date +%Y-%m-%d)/$output_dir"
            mkdir -p "$(dirname "$backup_dir")"
            cp -r "$output_dir" "$backup_dir"
            echo -e "${YELLOW}Đã tạo backup tại: $backup_dir${NC}"
        fi
    fi
    
    # Decode với apktool
    echo -e "${YELLOW}Đang chạy apktool...${NC}"
    if java -jar "$TOOLS_DIR/apktool/apktool.jar" d "$apk_file" -o "$output_dir" --force; then
        echo -e "${GREEN}Decode thành công!${NC}"
        
        # Tự động xóa các file .DS_Store
        echo -e "${YELLOW}Đang dọn dẹp file .DS_Store...${NC}"
        find "$output_dir" -name ".DS_Store" -delete
        
        # Tạo .gitignore
        echo -e "${YELLOW}Đang tạo .gitignore...${NC}"
        cat > "$output_dir/.gitignore" << EOF
# Các file hệ thống
.DS_Store
Thumbs.db

# Các file tạm
*.bak
*.tmp

# Các file log
*.log

# Các thư mục build
build/
dist/
EOF
        
        # Làm sạch AndroidManifest
        echo -e "${YELLOW}Đang làm sạch AndroidManifest.xml...${NC}"
        clean_manifest "$output_dir/AndroidManifest.xml"
        
        echo -e "${GREEN}APK đã được decode tại: ${YELLOW}$output_dir${NC}"
    else
        echo -e "${RED}Decode thất bại!${NC}"
        return 1
    fi
}

# Làm sạch AndroidManifest.xml
clean_manifest() {
    local manifest_file="$1"
    
    if [ ! -f "$manifest_file" ]; then
        echo -e "${RED}File AndroidManifest.xml không tồn tại: $manifest_file${NC}"
        return 1
    fi
    
    # Backup manifest
    cp "$manifest_file" "${manifest_file}.bak"
    
    # Xóa các thuộc tính liên quan đến split APK
    sed -i.tmp -e 's/android:splitName="[^"]*"//g' \
        -e 's/android:splitTypes="[^"]*"//g' \
        -e 's/android:requiredSplitTypes="[^"]*"//g' \
        -e 's/android:isFeatureSplit="[^"]*"//g' \
        -e 's/android:isSplitRequired="[^"]*"//g' "$manifest_file"
    
    # Xóa file tạm
    rm -f "${manifest_file}.tmp"
    
    echo -e "${GREEN}Đã làm sạch AndroidManifest.xml${NC}"
}

# Convert to JAR
convert_to_jar() {
    local apk_file="$1"
    
    if [ ! -f "$apk_file" ]; then
        echo -e "${RED}File APK không tồn tại: $apk_file${NC}"
        return 1
    fi
    
    local base_name=$(basename "$apk_file" .apk)
    local output_jar="$DEX2JAR_DIR/${base_name}.jar"
    
    echo -e "${BLUE}Đang chuyển đổi APK sang JAR: $(basename "$apk_file") -> $(basename "$output_jar")${NC}"
    
    # Sử dụng dex2jar
    if "$TOOLS_DIR/dex2jar/dex-tools/bin/d2j-dex2jar.sh" "$apk_file" -o "$output_jar"; then
        echo -e "${GREEN}Chuyển đổi thành công! JAR được lưu tại: ${YELLOW}$output_jar${NC}"
    else
        echo -e "${RED}Chuyển đổi thất bại!${NC}"
        return 1
    fi
}

# Build APK
build_apk() {
    local input_dir="$1"
    local package_name="$2"
    local version="$3"
    
    if [ ! -d "$input_dir" ]; then
        echo -e "${RED}Thư mục không tồn tại: $input_dir${NC}"
        return 1
    fi
    
    if [ -z "$package_name" ]; then
        # Thử lấy package name từ AndroidManifest.xml
        if [ -f "$input_dir/AndroidManifest.xml" ]; then
            package_name=$(grep -o 'package="[^"]*"' "$input_dir/AndroidManifest.xml" | head -1 | cut -d'"' -f2)
        fi
        
        if [ -z "$package_name" ]; then
            echo -e "${RED}Package name không được cung cấp và không thể tự động phát hiện.${NC}"
            return 1
        fi
    fi
    
    if [ -z "$version" ]; then
        # Thử lấy version từ apktool.yml
        if [ -f "$input_dir/apktool.yml" ]; then
            version=$(grep 'versionName' "$input_dir/apktool.yml" | head -1 | cut -d"'" -f2)
        fi
        
        if [ -z "$version" ]; then
            version="1.0.0"
            echo -e "${YELLOW}Version không được cung cấp và không thể tự động phát hiện. Sử dụng mặc định: $version${NC}"
        fi
    fi
    
    local output_apk="$BUILD_DIR/${package_name}_${version}.apk"
    
    echo -e "${BLUE}Đang build APK: $input_dir -> $(basename "$output_apk")${NC}"
    
    # Xóa các file .DS_Store
    echo -e "${YELLOW}Đang dọn dẹp file .DS_Store...${NC}"
    find "$input_dir" -name ".DS_Store" -delete
    
    # Build với apktool
    echo -e "${YELLOW}Đang chạy apktool build...${NC}"
    if java -jar "$TOOLS_DIR/apktool/apktool.jar" b "$input_dir" -o "$output_apk" --use-aapt2; then
        echo -e "${GREEN}Build thành công!${NC}"
        echo -e "${GREEN}APK đã được build tại: ${YELLOW}$output_apk${NC}"
        
        # Trả về đường dẫn đến APK đã build
        echo "$output_apk"
    else
        echo -e "${RED}Build thất bại!${NC}"
        return 1
    fi
}

# Zipalign APK
zipalign_apk() {
    local input_apk="$1"
    
    if [ ! -f "$input_apk" ]; then
        echo -e "${RED}File APK không tồn tại: $input_apk${NC}"
        return 1
    fi
    
    local output_apk="${input_apk%.apk}_aligned.apk"
    
    echo -e "${BLUE}Đang zipalign APK: $(basename "$input_apk") -> $(basename "$output_apk")${NC}"
    
    # Zipalign
    if zipalign -p -f -v 4 "$input_apk" "$output_apk"; then
        echo -e "${GREEN}Zipalign thành công!${NC}"
        echo -e "${GREEN}APK đã được zipalign tại: ${YELLOW}$output_apk${NC}"
        
        # Trả về đường dẫn đến APK đã zipalign
        echo "$output_apk"
    else
        echo -e "${RED}Zipalign thất bại!${NC}"
        return 1
    fi
}

# Kiểm tra resource ID
check_resource_ids() {
    local original_dir="$1"
    local modified_dir="$2"
    
    if [ ! -d "$original_dir" ] || [ ! -d "$modified_dir" ]; then
        echo -e "${RED}Thư mục không tồn tại!${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Đang kiểm tra Resource IDs...${NC}"
    
    # Kiểm tra AndroidManifest.xml
    echo -e "${YELLOW}Kiểm tra AndroidManifest.xml...${NC}"
    
    # Tạo thư mục báo cáo
    local report_dir="$REPORT_DIR/resource_check_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$report_dir"
    local report_file="$report_dir/resource_check.md"
    
    echo "# Báo Cáo Kiểm Tra Resource ID" > "$report_file"
    echo "" >> "$report_file"
    echo "## Thời gian kiểm tra: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    # Kiểm tra layout IDs
    echo -e "${YELLOW}Kiểm tra Layout IDs...${NC}"
    echo "## Layout IDs" >> "$report_file"
    echo "" >> "$report_file"
    
    local diff_found=false
    
    # Tìm tất cả các layout XML
    find "$original_dir/res" -name "*.xml" -path "*/layout*/*" | while read -r layout_file; do
        rel_path=${layout_file#$original_dir/}
        modified_layout="$modified_dir/$rel_path"
        
        if [ ! -f "$modified_layout" ]; then
            echo -e "${RED}Layout không tồn tại trong thư mục chỉnh sửa: $rel_path${NC}"
            echo "- ❌ $rel_path: Không tồn tại trong thư mục chỉnh sửa" >> "$report_file"
            diff_found=true
            continue
        fi
        
        # Trích xuất tất cả android:id từ file gốc
        original_ids=$(grep -o 'android:id="[^"]*"' "$layout_file" | sort)
        modified_ids=$(grep -o 'android:id="[^"]*"' "$modified_layout" | sort)
        
        if [ "$original_ids" != "$modified_ids" ]; then
            echo -e "${RED}Phát hiện thay đổi ID trong: $rel_path${NC}"
            echo "- ❌ $rel_path: Có sự khác biệt về ID" >> "$report_file"
            echo "  <details>" >> "$report_file"
            echo "  <summary>Chi tiết khác biệt</summary>" >> "$report_file"
            echo "" >> "$report_file"
            echo "  ```diff" >> "$report_file"
            diff <(echo "$original_ids") <(echo "$modified_ids") >> "$report_file" || true
            echo "  ```" >> "$report_file"
            echo "  </details>" >> "$report_file"
            diff_found=true
        else
            echo -e "${GREEN}Layout OK: $rel_path${NC}"
            echo "- ✅ $rel_path: Không có thay đổi ID" >> "$report_file"
        fi
    done
    
    # Kiểm tra tên file drawable
    echo -e "${YELLOW}Kiểm tra Drawable Resources...${NC}"
    echo "" >> "$report_file"
    echo "## Drawable Resources" >> "$report_file"
    echo "" >> "$report_file"
    
    # Lấy danh sách tất cả drawable
    original_drawables=$(find "$original_dir/res" -path "*/drawable*/*" -type f | sort)
    
    echo "$original_drawables" | while read -r drawable_file; do
        rel_path=${drawable_file#$original_dir/}
        base_name=$(basename "$drawable_file")
        dir_name=$(dirname "$rel_path")
        
        # Kiểm tra xem drawable có tồn tại trong thư mục chỉnh sửa không
        if [ ! -f "$modified_dir/$rel_path" ]; then
            # Kiểm tra xem tên file có bị đổi không
            found=false
            find "$modified_dir/$dir_name" -type f -name "*" | while read -r mod_file; do
                # So sánh MD5 để kiểm tra xem nội dung có giống nhau không
                if [ "$(md5sum "$drawable_file" | cut -d' ' -f1)" = "$(md5sum "$mod_file" | cut -d' ' -f1)" ]; then
                    mod_base=$(basename "$mod_file")
                    echo -e "${RED}Drawable có thể đã bị đổi tên: $base_name -> $mod_base${NC}"
                    echo "- ❌ $rel_path: Có thể đã bị đổi tên thành $(basename "$mod_file")" >> "$report_file"
                    found=true
                    diff_found=true
                    break
                fi
            done
            
            if [ "$found" = false ]; then
                echo -e "${RED}Drawable bị xóa: $rel_path${NC}"
                echo "- ❌ $rel_path: Không tồn tại trong thư mục chỉnh sửa (có thể đã bị xóa)" >> "$report_file"
                diff_found=true
            fi
        else
            echo -e "${GREEN}Drawable OK: $rel_path${NC}"
            echo "- ✅ $rel_path: Tồn tại" >> "$report_file"
        fi
    done
    
    # Kiểm tra strings.xml
    echo -e "${YELLOW}Kiểm tra String Resources...${NC}"
    echo "" >> "$report_file"
    echo "## String Resources" >> "$report_file"
    echo "" >> "$report_file"
    
    find "$original_dir/res" -name "strings.xml" | while read -r strings_file; do
        rel_path=${strings_file#$original_dir/}
        modified_strings="$modified_dir/$rel_path"
        
        if [ ! -f "$modified_strings" ]; then
            echo -e "${RED}File strings.xml không tồn tại trong thư mục chỉnh sửa: $rel_path${NC}"
            echo "- ❌ $rel_path: Không tồn tại trong thư mục chỉnh sửa" >> "$report_file"
            diff_found=true
            continue
        fi
        
        # Trích xuất tất cả string name
        original_names=$(grep -o 'name="[^"]*"' "$strings_file" | sort)
        modified_names=$(grep -o 'name="[^"]*"' "$modified_strings" | sort)
        
        if [ "$original_names" != "$modified_names" ]; then
            echo -e "${RED}Phát hiện thay đổi string name trong: $rel_path${NC}"
            echo "- ❌ $rel_path: Có sự khác biệt về string name" >> "$report_file"
            echo "  <details>" >> "$report_file"
            echo "  <summary>Chi tiết khác biệt</summary>" >> "$report_file"
            echo "" >> "$report_file"
            echo "  ```diff" >> "$report_file"
            diff <(echo "$original_names") <(echo "$modified_names") >> "$report_file" || true
            echo "  ```" >> "$report_file"
            echo "  </details>" >> "$report_file"
            diff_found=true
        else
            echo -e "${GREEN}Strings OK: $rel_path${NC}"
            echo "- ✅ $rel_path: Không có thay đổi string name" >> "$report_file"
        fi
    done
    
    # Kết luận
    echo "" >> "$report_file"
    echo "## Kết Luận" >> "$report_file"
    
    if [ "$diff_found" = true ]; then
        echo -e "${RED}⚠️ Phát hiện thay đổi Resource ID. Vui lòng kiểm tra lại!${NC}"
        echo "⚠️ **Phát hiện thay đổi Resource ID hoặc Resources. Cần xem xét lại các thay đổi để tránh lỗi ứng dụng.**" >> "$report_file"
    else
        echo -e "${GREEN}✅ Không phát hiện thay đổi Resource ID. Mọi thứ đều OK!${NC}"
        echo "✅ **Không phát hiện thay đổi Resource ID. Mọi thư đều OK!**" >> "$report_file"
    fi
    
    echo -e "${GREEN}Báo cáo kiểm tra được lưu tại: ${YELLOW}$report_file${NC}"
    return 0
}

# Quick backup file
quick_backup() {
    local file_path="$1"
    local comment="$2"
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}File không tồn tại: $file_path${NC}"
        return 1
    fi
    
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
    
    # Tạo file thông tin nếu có comment
    if [ ! -z "$comment" ]; then
        echo "$comment" > "${backup_file}.info"
    fi
    
    echo -e "${GREEN}✅ Đã backup file ${YELLOW}$file_path${GREEN} tại ${YELLOW}$backup_file${NC}"
    
    # Trả về đường dẫn đến file backup để có thể sử dụng sau này
    echo "$backup_file"
}

# Restore từ quick backup
restore_from_backup() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}File backup không tồn tại: $backup_file${NC}"
        return 1
    fi
    
    # Xác định file gốc từ tên file backup
    local backup_name=$(basename "$backup_file")
    local original_name=${backup_name%.*.*} # Loại bỏ .timestamp.bak
    local backup_dir=$(dirname "$backup_file")
    local rel_dir=${backup_dir#$TEMP_BACKUP_DIR/*/}
    
    local original_file="$ROOT_DIR/$rel_dir/$original_name"
    
    # Kiểm tra xem file gốc có tồn tại không
    if [ ! -f "$original_file" ]; then
        echo -e "${YELLOW}Cảnh báo: File gốc không tồn tại: $original_file${NC}"
        echo -e "${YELLOW}Bạn có muốn khôi phục file này không? (y/n)${NC}"
        read -p "" answer
        if [ "$answer" != "y" ]; then
            echo -e "${YELLOW}Hủy khôi phục.${NC}"
            return 0
        fi
    else
        # Hỏi xác nhận trước khi ghi đè
        echo -e "${YELLOW}Bạn có chắc muốn khôi phục file ${RED}$original_file${YELLOW} từ backup? (y/n)${NC}"
        read -p "" answer
        if [ "$answer" != "y" ]; then
            echo -e "${YELLOW}Hủy khôi phục.${NC}"
            return 0
        fi
    fi
    
    # Tạo thư mục mục tiêu nếu cần
    mkdir -p "$(dirname "$original_file")"
    
    # Copy từ backup về file gốc
    cp "$backup_file" "$original_file"
    
    echo -e "${GREEN}✅ Đã khôi phục file từ ${YELLOW}$backup_file${GREEN} về ${YELLOW}$original_file${NC}"
    return 0
}

# Liệt kê tất cả các backup của một file
list_backups() {
    local original_file="$1"
    
    if [ ! -f "$original_file" ]; then
        echo -e "${RED}File không tồn tại: $original_file${NC}"
        return 1
    fi
    
    local file_name=$(basename "$original_file")
    local file_dir=$(dirname "$original_file")
    local rel_dir=${file_dir#$ROOT_DIR/}
    
    echo -e "${BLUE}Danh sách các bản backup của file: ${YELLOW}$original_file${NC}"
    echo ""
    echo -e "${BLUE}ID\tThời gian\t\tKích thước\tGhi chú${NC}"
    echo -e "${BLUE}--\t---------\t\t---------\t------${NC}"
    
    local count=0
    local backup_files=()
    
    # Tìm tất cả các file backup có thể có trong các thư mục theo ngày
    find "$TEMP_BACKUP_DIR" -type f -path "*/$rel_dir/$file_name.*.bak" | sort | while read -r backup_file; do
        local timestamp=$(echo "$backup_file" | grep -o '[0-9]\{6\}\.bak' | cut -d'.' -f1)
        local date_dir=$(echo "$backup_file" | grep -o "$TEMP_BACKUP_DIR/[0-9]\{8\}")
        local date_str=${date_dir##*/}
        
        local datetime="${date_str:0:4}-${date_str:4:2}-${date_str:6:2} ${timestamp:0:2}:${timestamp:2:2}:${timestamp:4:2}"
        local size=$(du -h "$backup_file" | cut -f1)
        
        local note=""
        if [ -f "${backup_file}.info" ]; then
            note=$(cat "${backup_file}.info" | head -1)
        fi
        
        count=$((count+1))
        backup_files+=("$backup_file")
        
        echo -e "${count}\t${datetime}\t${size}\t${note}"
    done
    
    # Kiểm tra xem có backups hay không
    if [ ${#backup_files[@]} -eq 0 ]; then
        echo -e "${YELLOW}Không tìm thấy bản backup nào cho file này.${NC}"
        return 0
    fi
    
    echo ""
    echo -e "${YELLOW}Bạn có muốn khôi phục từ một bản backup? (Nhập ID để khôi phục, hoặc 0 để thoát)${NC}"
    read -p "" backup_id
    
    if [ "$backup_id" -gt 0 ] && [ "$backup_id" -le ${#backup_files[@]} ]; then
        local selected_backup="${backup_files[$((backup_id-1))}"
        restore_from_backup "$selected_backup"
    elif [ "$backup_id" -ne 0 ]; then
        echo -e "${RED}ID không hợp lệ.${NC}"
    fi
    
    return 0
}

# Dọn dẹp các file backup cũ
cleanup_backups() {
    local days="$1"
    
    if [ -z "$days" ]; then
        days=7  # Mặc định xóa các file backup cũ hơn 7 ngày
    fi
    
    echo -e "${BLUE}Đang dọn dẹp các file backup cũ hơn $days ngày...${NC}"
    
    # Tìm tất cả các thư mục backup cũ hơn số ngày chỉ định
    find "$TEMP_BACKUP_DIR" -type d -name "[0-9]*" -mtime +$days | while read -r old_backup_dir; do
        echo -e "${YELLOW}Xóa thư mục backup cũ: $old_backup_dir${NC}"
        rm -rf "$old_backup_dir"
    done
    
    echo -e "${GREEN}✅ Đã dọn dẹp các file backup cũ.${NC}"
    return 0
}

# File editor mở file để chỉnh sửa và tự động backup
edit_file() {
    local file_path="$1"
    local comment="$2"
    local editor="${EDITOR:-vi}"  # Sử dụng editor mặc định hoặc vi
    
    if [ ! -f "$file_path" ]; then
        echo -e "${RED}File không tồn tại: $file_path${NC}"
        return 1
    fi
    
    # Backup file trước khi chỉnh sửa
    quick_backup "$file_path" "$comment" > /dev/null
    
    # Mở file với editor
    $editor "$file_path"
    
    # Hiển thị thông báo
    echo -e "${GREEN}✅ Đã chỉnh sửa file ${YELLOW}$file_path${NC}"
    echo -e "${BLUE}Lưu ý: File đã được backup tự động trước khi chỉnh sửa.${NC}"
    
    return 0
}

# Hiển thị trợ giúp
show_help() {
    cat << EOF
APK Tools - Script tự động hóa cho quy trình làm việc với APK

Sử dụng: $(basename "$0") [command] [options]

Các lệnh:
  analyze <apk_file>                     Phân tích APK và tạo báo cáo
  decode <apk_file> [--force]            Decode APK với apktool
  build <input_dir> [package] [version]  Build APK từ thư mục đã decode
  sign <apk_file> [keystore]             Ký APK với keystore
  zipalign <apk_file>                    Zipalign APK
  jar <apk_file>                         Chuyển đổi APK sang JAR
  install <apk_file>                     Cài đặt APK lên thiết bị đã kết nối
  check-res <original_dir> <modified_dir> Kiểm tra thay đổi resource ID
  
  backup <file_path> [comment]           Tạo backup nhanh cho một file
  restore <backup_file>                  Khôi phục file từ backup
  list-backups <original_file>           Liệt kê tất cả các backup của một file
  cleanup-backups [days]                 Dọn dẹp các file backup cũ (mặc định: 7 ngày)
  edit <file_path> [comment]             Mở file để chỉnh sửa với backup tự động
  
  help                                   Hiển thị trợ giúp này

Ví dụ:
  $(basename "$0") analyze input/app.apk
  $(basename "$0") decode input/app.apk --force
  $(basename "$0") build output/com.example.app 
  $(basename "$0") sign build/com.example.app_1.0.apk keystore/debug.keystore
  $(basename "$0") jar input/app.apk
  $(basename "$0") check-res output/original output/modified
  
  $(basename "$0") backup output/com.example.app/AndroidManifest.xml "Trước khi thêm activity mới"
  $(basename "$0") list-backups output/com.example.app/AndroidManifest.xml
  $(basename "$0") cleanup-backups 14
  $(basename "$0") edit output/com.example.app/AndroidManifest.xml "Chỉnh sửa manifest"
EOF
}

# Main
main() {
    # Kiểm tra tham số
    if [ $# -lt 1 ]; then
        show_help
        exit 1
    fi
    
    # Kiểm tra công cụ
    case "$1" in
        analyze|decode|build|zipalign|jar|check-res)
            # Chỉ kiểm tra công cụ cho các lệnh cần công cụ bên ngoài
            check_tools
            ;;
    esac
    
    # Xử lý lệnh
    case "$1" in
        analyze)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: apk_file${NC}"
                show_help
                exit 1
            fi
            analyze_apk "$2"
            ;;
        decode)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: apk_file${NC}"
                show_help
                exit 1
            fi
            decode_apk "$2" "$3"
            ;;
        build)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: input_dir${NC}"
                show_help
                exit 1
            fi
            build_apk "$2" "$3" "$4"
            ;;
        zipalign)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: apk_file${NC}"
                show_help
                exit 1
            fi
            zipalign_apk "$2"
            ;;
        jar)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: apk_file${NC}"
                show_help
                exit 1
            fi
            convert_to_jar "$2"
            ;;
        check-res)
            if [ -z "$2" ] || [ -z "$3" ]; then
                echo -e "${RED}Thiếu tham số: original_dir hoặc modified_dir${NC}"
                show_help
                exit 1
            fi
            check_resource_ids "$2" "$3"
            ;;
        backup)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: file_path${NC}"
                show_help
                exit 1
            fi
            quick_backup "$2" "$3"
            ;;
        restore)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: backup_file${NC}"
                show_help
                exit 1
            fi
            restore_from_backup "$2"
            ;;
        list-backups)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: original_file${NC}"
                show_help
                exit 1
            fi
            list_backups "$2"
            ;;
        cleanup-backups)
            cleanup_backups "$2"
            ;;
        edit)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: file_path${NC}"
                show_help
                exit 1
            fi
            edit_file "$2" "$3"
            ;;
        help)
            show_help
            ;;
        *)
            echo -e "${RED}Lệnh không hợp lệ: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Chạy main
main "$@" 