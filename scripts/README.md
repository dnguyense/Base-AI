# Scripts Directory

This directory contains utility scripts for the Base AI Project.

## Available Scripts

### 1. Telegram Notifier (`telegram_notifier.py`)

A comprehensive notification system that sends work completion reports to Telegram with screenshots.

#### Cấu hình
Telegram Bot hiện sử dụng file cấu hình riêng tại `scripts/config/telegram_config.py` thay vì .env. Điều này giúp bạn có thể tái sử dụng cấu hình giữa các dự án mà không cần cấu hình lại.

Xem thêm chi tiết tại [Config README](./config/README.md).

#### Features
- **SOCKS5 Proxy Support**: Built-in proxy configuration for network access
- **Screenshot Capture**: Automatic desktop screenshots
- **Work Reports**: Formatted project status reports
- **Git Integration**: Branch and commit information
- **Cross-platform**: macOS, Linux, Windows support
- **Auto-fallback**: Direct connection if proxy fails

#### SOCKS5 Proxy Configuration
```
Server: 74.222.17.92:52071
Username: sd08bv8p
Password: YSA9bBs2qpamqyMl
Protocol: SOCKS5
```

#### Usage
```bash
# Basic usage
python3 telegram_notifier.py "Task Name" "completed" "Optional details"

# Without screenshot
python3 telegram_notifier.py "Task Name" "completed" "Details" --no-screenshot

# Different status options
python3 telegram_notifier.py "Setup" "started"
python3 telegram_notifier.py "Development" "in_progress" "50% complete"
python3 telegram_notifier.py "Testing" "failed" "Unit tests failing"
```

#### Dependencies
- Python 3.6+
- requests library
- urllib3 library
- Optional: PySocks for enhanced SOCKS5 support

### 2. Shell Wrapper (`notify.sh`)

Convenience wrapper for the Telegram notifier.

```bash
# Make executable
chmod +x notify.sh

# Usage
./notify.sh "Task completed" completed "All tests passing"
```

### 3. File Management Scripts

#### Backup Script (`backup_file.sh`)
- Creates timestamped backups of files
- Maintains directory structure
- Logs backup operations

#### Restore Script (`restore_file.sh`)
- Restores files from backup directory
- Lists available backups
- Preserves file permissions

#### Cleanup Script (`cleanup_backups.sh`)
- Removes old backup files
- Configurable retention period
- Safe cleanup with confirmation

## Network Configuration

### SOCKS5 Proxy Setup
The Telegram notifier is pre-configured with SOCKS5 proxy settings:

- **Automatic Detection**: Tests proxy connection on startup
- **Graceful Fallback**: Switches to direct connection if proxy fails
- **Error Handling**: Comprehensive error messages and recovery
- **Security**: Credentials are embedded but can be externalized

### Troubleshooting

1. **Proxy Connection Issues**:
   ```bash
   # Test proxy manually
   curl --socks5 sd08bv8p:YSA9bBs2qpamqyMl@74.222.17.92:52071 https://api.telegram.org/bot<token>/getMe
   ```

2. **Missing Dependencies**:
   ```bash
   # Install required packages
   pip3 install --user requests urllib3
   
   # Optional SOCKS5 support
   pip3 install --user PySocks
   ```

3. **Screenshot Issues**:
   - macOS: Ensure screencapture is available
   - Linux: Install gnome-screenshot
   - Windows: PowerShell screenshot method

## Security Notes

- Proxy credentials are currently hardcoded
- Consider using environment variables for production
- Bot token should be rotated regularly
- Screenshots may contain sensitive information

## Integration with Workflows

These scripts are integrated into the project's workflow system:
- Referenced in `.project-identity`
- Documented in `.cursor/rules/telegram-notification-workflow.mdc`
- Used by various development workflows

## Future Enhancements

- [ ] Environment variable configuration
- [ ] Multiple proxy server support
- [ ] Encrypted credential storage
- [ ] Custom notification templates
- [ ] Integration with CI/CD pipelines
