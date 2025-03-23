#!/bin/bash

# APK Signing Tool - Script hỗ trợ ký APK với nhiều keystore
# Usage: ./apk-sign.sh [apk_file] [keystore_file] [alias] [store_pass] [key_pass]

# Thiết lập màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Thiết lập đường dẫn
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KEYSTORE_DIR="$ROOT_DIR/keystore"
SIGNED_DIR="$ROOT_DIR/signed"

# Tạo thư mục cho APK đã ký
mkdir -p "$SIGNED_DIR"

# Kiểm tra thông tin keystore
check_keystore_info() {
    local keystore_file="$1"
    local store_pass="$2"
    
    if [ ! -f "$keystore_file" ]; then
        echo -e "${RED}File keystore không tồn tại: $keystore_file${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Thông tin keystore: $(basename "$keystore_file")${NC}"
    
    if [ -z "$store_pass" ]; then
        echo -e "${YELLOW}Mật khẩu keystore không được cung cấp. Sử dụng tương tác.${NC}"
        keytool -list -v -keystore "$keystore_file"
    else
        keytool -list -v -keystore "$keystore_file" -storepass "$store_pass"
    fi
}

# Ký APK
sign_apk() {
    local apk_file="$1"
    local keystore_file="$2"
    local key_alias="$3"
    local store_pass="$4"
    local key_pass="$5"
    
    if [ ! -f "$apk_file" ]; then
        echo -e "${RED}File APK không tồn tại: $apk_file${NC}"
        return 1
    fi
    
    if [ ! -f "$keystore_file" ]; then
        echo -e "${RED}File keystore không tồn tại: $keystore_file${NC}"
        return 1
    fi
    
    # Nếu key_pass không được cung cấp, sử dụng store_pass
    if [ -z "$key_pass" ]; then
        key_pass="$store_pass"
    fi
    
    # Tạo tên file APK đã ký
    local base_name=$(basename "$apk_file" .apk)
    local signed_apk="$SIGNED_DIR/${base_name}_signed.apk"
    
    echo -e "${BLUE}Đang ký APK: $(basename "$apk_file") -> $(basename "$signed_apk")${NC}"
    
    # Ký APK
    if [ -z "$store_pass" ] || [ -z "$key_alias" ]; then
        echo -e "${YELLOW}Thiếu thông tin keystore. Sử dụng tương tác.${NC}"
        apksigner sign --ks "$keystore_file" "$apk_file" --out "$signed_apk"
    else
        apksigner sign --ks "$keystore_file" --ks-pass "pass:$store_pass" --key-pass "pass:$key_pass" --ks-key-alias "$key_alias" "$apk_file" --out "$signed_apk"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Ký APK thành công!${NC}"
        
        # Verify APK
        echo -e "${YELLOW}Đang verify APK...${NC}"
        if apksigner verify --verbose "$signed_apk"; then
            echo -e "${GREEN}Verify thành công! APK đã được ký tại: ${YELLOW}$signed_apk${NC}"
        else
            echo -e "${RED}Verify thất bại! APK có thể không hoạt động đúng.${NC}"
        fi
    else
        echo -e "${RED}Ký APK thất bại!${NC}"
        return 1
    fi
    
    # Trả về đường dẫn đến APK đã ký
    echo "$signed_apk"
}

# Tạo keystore mới
create_keystore() {
    local keystore_file="$1"
    local key_alias="$2"
    local store_pass="$3"
    local key_pass="$4"
    local validity="$5"
    local dname="$6"
    
    # Thiết lập giá trị mặc định
    if [ -z "$validity" ]; then
        validity="10000"
    fi
    
    if [ -z "$dname" ]; then
        dname="CN=Unknown, OU=Unknown, O=Unknown, L=Unknown, ST=Unknown, C=Unknown"
    fi
    
    # Kiểm tra xem keystore đã tồn tại chưa
    if [ -f "$keystore_file" ]; then
        echo -e "${YELLOW}Keystore đã tồn tại: $keystore_file${NC}"
        read -p "Bạn có muốn ghi đè không? (y/n): " confirm
        if [ "$confirm" != "y" ]; then
            echo -e "${RED}Đã hủy tạo keystore.${NC}"
            return 1
        fi
    fi
    
    echo -e "${BLUE}Đang tạo keystore mới: $(basename "$keystore_file")${NC}"
    
    # Tạo thư mục cha nếu cần
    mkdir -p "$(dirname "$keystore_file")"
    
    # Tạo keystore
    if [ -z "$store_pass" ] || [ -z "$key_alias" ]; then
        echo -e "${YELLOW}Thiếu thông tin keystore. Sử dụng tương tác.${NC}"
        keytool -genkey -v -keystore "$keystore_file" -keyalg RSA -keysize 2048 -validity "$validity" -dname "$dname"
    else
        if [ -z "$key_pass" ]; then
            key_pass="$store_pass"
        fi
        
        keytool -genkey -v -keystore "$keystore_file" -keyalg RSA -keysize 2048 -validity "$validity" -alias "$key_alias" -storepass "$store_pass" -keypass "$key_pass" -dname "$dname"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Tạo keystore thành công tại: ${YELLOW}$keystore_file${NC}"
    else
        echo -e "${RED}Tạo keystore thất bại!${NC}"
        return 1
    fi
}

# Tạo debug keystore
create_debug_keystore() {
    local keystore_file="$HOME/.android/debug.keystore"
    
    # Kiểm tra xem debug keystore đã tồn tại chưa
    if [ -f "$keystore_file" ]; then
        echo -e "${GREEN}Debug keystore đã tồn tại tại: $keystore_file${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Đang tạo debug keystore...${NC}"
    
    # Tạo thư mục .android nếu cần
    mkdir -p "$HOME/.android"
    
    # Tạo debug keystore
    keytool -genkey -v -keystore "$keystore_file" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Tạo debug keystore thành công tại: ${YELLOW}$keystore_file${NC}"
    else
        echo -e "${RED}Tạo debug keystore thất bại!${NC}"
        return 1
    fi
}

# Hiển thị danh sách keystore
list_keystores() {
    echo -e "${BLUE}Danh sách keystore trong thư mục: $KEYSTORE_DIR${NC}"
    
    if [ ! -d "$KEYSTORE_DIR" ] || [ -z "$(ls -A "$KEYSTORE_DIR")" ]; then
        echo -e "${YELLOW}Không có keystore nào trong thư mục.${NC}"
        return 1
    fi
    
    local i=1
    for ks in "$KEYSTORE_DIR"/*.{jks,keystore}; do
        if [ -f "$ks" ]; then
            echo -e "${GREEN}$i. $(basename "$ks")${NC}"
            i=$((i+1))
        fi
    done
}

# Cài đặt APK
install_apk() {
    local apk_file="$1"
    
    if [ ! -f "$apk_file" ]; then
        echo -e "${RED}File APK không tồn tại: $apk_file${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Đang cài đặt APK: $(basename "$apk_file")${NC}"
    
    # Kiểm tra thiết bị đã kết nối
    local devices=$(adb devices | grep -v "List" | grep -v "^$" | wc -l)
    if [ "$devices" -eq 0 ]; then
        echo -e "${RED}Không có thiết bị Android nào được kết nối.${NC}"
        return 1
    elif [ "$devices" -gt 1 ]; then
        echo -e "${YELLOW}Có nhiều thiết bị được kết nối. Vui lòng chọn một thiết bị:${NC}"
        adb devices -l
        read -p "Nhập serial number của thiết bị: " device_serial
        
        # Cài đặt APK lên thiết bị đã chọn
        echo -e "${YELLOW}Đang cài đặt lên thiết bị: $device_serial${NC}"
        if adb -s "$device_serial" install -r "$apk_file"; then
            echo -e "${GREEN}Cài đặt thành công!${NC}"
            
            # Lấy package name
            local package_name=$(aapt dump badging "$apk_file" | grep package | awk -F "name='" '{print $2}' | awk -F "'" '{print $1}')
            
            # Hỏi xem có muốn khởi chạy ứng dụng không
            read -p "Bạn có muốn khởi chạy ứng dụng không? (y/n): " launch
            if [ "$launch" = "y" ]; then
                echo -e "${YELLOW}Đang khởi chạy ứng dụng: $package_name${NC}"
                adb -s "$device_serial" shell monkey -p "$package_name" -c android.intent.category.LAUNCHER 1
            fi
        else
            echo -e "${RED}Cài đặt thất bại!${NC}"
            return 1
        fi
    else
        # Cài đặt APK
        echo -e "${YELLOW}Đang cài đặt...${NC}"
        if adb install -r "$apk_file"; then
            echo -e "${GREEN}Cài đặt thành công!${NC}"
            
            # Lấy package name
            local package_name=$(aapt dump badging "$apk_file" | grep package | awk -F "name='" '{print $2}' | awk -F "'" '{print $1}')
            
            # Hỏi xem có muốn khởi chạy ứng dụng không
            read -p "Bạn có muốn khởi chạy ứng dụng không? (y/n): " launch
            if [ "$launch" = "y" ]; then
                echo -e "${YELLOW}Đang khởi chạy ứng dụng: $package_name${NC}"
                adb shell monkey -p "$package_name" -c android.intent.category.LAUNCHER 1
            fi
        else
            echo -e "${RED}Cài đặt thất bại!${NC}"
            return 1
        fi
    fi
}

# Hiển thị trợ giúp
show_help() {
    cat << EOF
APK Signing Tool - Script hỗ trợ ký APK với nhiều keystore

Sử dụng: $(basename "$0") [command] [options]

Các lệnh:
  sign <apk_file> <keystore_file> [alias] [store_pass] [key_pass]
                                      Ký APK với keystore
  create <keystore_file> <alias> <store_pass> [key_pass] [validity] [dname]
                                      Tạo keystore mới
  debug                               Tạo debug keystore
  list                                Hiển thị danh sách keystore
  info <keystore_file> [store_pass]   Hiển thị thông tin keystore
  install <apk_file>                  Cài đặt APK lên thiết bị
  help                                Hiển thị trợ giúp này

Ví dụ:
  $(basename "$0") sign build/app.apk keystore/release.jks my-alias my-password
  $(basename "$0") create keystore/my-key.jks my-alias my-password
  $(basename "$0") debug
  $(basename "$0") list
  $(basename "$0") info keystore/release.jks my-password
EOF
}

# Main
main() {
    # Kiểm tra tham số
    if [ $# -lt 1 ]; then
        show_help
        exit 1
    fi
    
    # Xử lý lệnh
    case "$1" in
        sign)
            if [ -z "$2" ] || [ -z "$3" ]; then
                echo -e "${RED}Thiếu tham số: apk_file hoặc keystore_file${NC}"
                show_help
                exit 1
            fi
            sign_apk "$2" "$3" "$4" "$5" "$6"
            ;;
        create)
            if [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ]; then
                echo -e "${RED}Thiếu tham số: keystore_file, alias hoặc store_pass${NC}"
                show_help
                exit 1
            fi
            create_keystore "$2" "$3" "$4" "$5" "$6" "$7"
            ;;
        debug)
            create_debug_keystore
            ;;
        list)
            list_keystores
            ;;
        info)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: keystore_file${NC}"
                show_help
                exit 1
            fi
            check_keystore_info "$2" "$3"
            ;;
        install)
            if [ -z "$2" ]; then
                echo -e "${RED}Thiếu tham số: apk_file${NC}"
                show_help
                exit 1
            fi
            install_apk "$2"
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