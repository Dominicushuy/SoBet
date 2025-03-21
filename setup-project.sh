#!/bin/bash

# Script tạo cấu trúc thư mục và file cho dự án xổ số
# Sử dụng: ./setup-project.sh từ thư mục gốc của dự án
# Lưu ý: Script sẽ bỏ qua các file đã tồn tại

# Thiết lập màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Bắt đầu thiết lập cấu trúc dự án ===${NC}\n"

# Sử dụng thư mục hiện tại
PROJECT_DIR="."

# Kiểm tra và tạo thư mục app và các thư mục con
echo -e "${YELLOW}Tạo cấu trúc thư mục app...${NC}"
mkdir -p "$PROJECT_DIR/app/bet/components"
mkdir -p "$PROJECT_DIR/app/admin/bet-types/components"
mkdir -p "$PROJECT_DIR/app/verification/components"

# Kiểm tra và tạo thư mục components và các thư mục con
echo -e "${YELLOW}Tạo cấu trúc thư mục components...${NC}"
mkdir -p "$PROJECT_DIR/components/ui"
mkdir -p "$PROJECT_DIR/components/layout"

# Kiểm tra và tạo thư mục lib và các thư mục con
echo -e "${YELLOW}Tạo cấu trúc thư mục lib...${NC}"
mkdir -p "$PROJECT_DIR/lib/supabase"
mkdir -p "$PROJECT_DIR/lib/validators"
mkdir -p "$PROJECT_DIR/lib/lottery"

# Kiểm tra và tạo thư mục types
echo -e "${YELLOW}Tạo cấu trúc thư mục types...${NC}"
mkdir -p "$PROJECT_DIR/types"

# Hàm tạo file nếu chưa tồn tại
create_file() {
    if [ ! -f "$1" ]; then
        touch "$1"
        echo -e "${GREEN}Đã tạo file: $1${NC}"
    else
        echo -e "${YELLOW}Đã tồn tại file: $1${NC}"
    fi
}

echo -e "\n${YELLOW}Tạo các file trong app...${NC}"
# Tạo các file trong app
create_file "$PROJECT_DIR/app/layout.tsx"
create_file "$PROJECT_DIR/app/page.tsx"

# Tạo các file trong app/bet
create_file "$PROJECT_DIR/app/bet/page.tsx"
create_file "$PROJECT_DIR/app/bet/components/BetForm.tsx"
create_file "$PROJECT_DIR/app/bet/components/RegionSelector.tsx"
create_file "$PROJECT_DIR/app/bet/components/BetTypeSelector.tsx"
create_file "$PROJECT_DIR/app/bet/components/NumbersInput.tsx"
create_file "$PROJECT_DIR/app/bet/components/AmountCalculator.tsx"

# Tạo các file trong app/admin
create_file "$PROJECT_DIR/app/admin/page.tsx"
create_file "$PROJECT_DIR/app/admin/bet-types/page.tsx"
create_file "$PROJECT_DIR/app/admin/bet-types/components/BetTypeEditor.tsx"
create_file "$PROJECT_DIR/app/admin/bet-types/components/PayRateEditor.tsx"

# Tạo các file trong app/verification
create_file "$PROJECT_DIR/app/verification/page.tsx"
create_file "$PROJECT_DIR/app/verification/components/ResultsInput.tsx"
create_file "$PROJECT_DIR/app/verification/components/BetVerifier.tsx"

echo -e "\n${YELLOW}Tạo các file trong components...${NC}"
# Tạo các file trong components/ui
create_file "$PROJECT_DIR/components/ui/button.tsx"
create_file "$PROJECT_DIR/components/ui/input.tsx"
create_file "$PROJECT_DIR/components/ui/select.tsx"
create_file "$PROJECT_DIR/components/ui/form.tsx"
create_file "$PROJECT_DIR/components/ui/card.tsx"

# Tạo các file trong components/layout
create_file "$PROJECT_DIR/components/layout/Header.tsx"
create_file "$PROJECT_DIR/components/layout/Sidebar.tsx"

echo -e "\n${YELLOW}Tạo các file trong lib...${NC}"
# Tạo các file trong lib/supabase
create_file "$PROJECT_DIR/lib/supabase/client.ts"
create_file "$PROJECT_DIR/lib/supabase/types.ts"

# Tạo các file trong lib/validators
create_file "$PROJECT_DIR/lib/validators/bet-form.ts"
create_file "$PROJECT_DIR/lib/validators/result-form.ts"

# Tạo các file trong lib/lottery
create_file "$PROJECT_DIR/lib/lottery/bet-types.ts"
create_file "$PROJECT_DIR/lib/lottery/calculators.ts"
create_file "$PROJECT_DIR/lib/lottery/number-generators.ts"

echo -e "\n${YELLOW}Tạo các file trong types...${NC}"
# Tạo các file trong types
create_file "$PROJECT_DIR/types/bet.ts"
create_file "$PROJECT_DIR/types/result.ts"

echo -e "\n${GREEN}=== Đã hoàn thành thiết lập cấu trúc dự án ===${NC}"
echo -e "${BLUE}Tổng số thư mục đã tạo: $(find "$PROJECT_DIR" -type d | wc -l)${NC}"
echo -e "${BLUE}Tổng số file đã tạo: $(find "$PROJECT_DIR" -type f | wc -l)${NC}"