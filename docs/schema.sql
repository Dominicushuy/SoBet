/*
==============================================
HỆ THỐNG CƠ SỞ DỮ LIỆU CÁ CƯỢC XỔ SỐ
==============================================

Schema này định nghĩa cấu trúc cơ sở dữ liệu cho ứng dụng cá cược xổ số,
bao gồm các bảng chính:

- users: Quản lý người dùng
- provinces: Quản lý tỉnh/thành phố xổ số
- lottery_schedules: Lịch xổ số hàng tuần
- rules: Các quy tắc cược
- bets: Lưu trữ các lượt cược
- results: Kết quả xổ số
- wallets: Quản lý ví người dùng
- transactions: Lịch sử giao dịch

Được thiết kế cho Supabase với đầy đủ RLS (Row Level Security).
*/

/*============================================
  I. ĐỊNH NGHĨA CÁC BẢNG CHÍNH
============================================*/

-- Bảng users: Quản lý thông tin người dùng
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE, -- Tên tài khoản độc nhất
    email VARCHAR(255) NOT NULL UNIQUE, -- Email đăng nhập
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- Phân quyền: user, admin
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng provinces: Quản lý thông tin tỉnh/thành phố
CREATE TABLE public.provinces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE, -- Tên tỉnh/thành phố
    code VARCHAR(50), -- Mã tỉnh (nếu có)
    region VARCHAR(10) NOT NULL, -- M1 (Miền Nam/Trung) hoặc M2 (Miền Bắc)
    sub_region VARCHAR(50), -- Miền Nam hoặc Miền Trung (cho M1)
    is_active BOOLEAN NOT NULL DEFAULT true, -- Trạng thái hoạt động
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lottery_schedules: Lịch xổ số hàng tuần
CREATE TABLE public.lottery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    province_id UUID NOT NULL REFERENCES public.provinces(id), -- Tham chiếu đến tỉnh/thành phố
    day_of_week INT NOT NULL, -- 0: Chủ nhật, 1-6: Thứ 2 đến Thứ 7
    is_active BOOLEAN NOT NULL DEFAULT true, -- Trạng thái hoạt động
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(province_id, day_of_week) -- Mỗi tỉnh chỉ xổ một lần trong ngày
);

-- Bảng rules: Quản lý các quy tắc cược
CREATE TABLE public.rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- Tên quy tắc (VD: Đầu Đuôi, Xỉu Chủ...)
    description TEXT, -- Mô tả chi tiết
    bet_type VARCHAR(50) NOT NULL, -- Phân loại cược (Đầu Đuôi, Xỉu Chủ, Bao Lô...)
    rule_code VARCHAR(50) NOT NULL, -- Mã quy tắc: dd, xc, b2, b3, b4, b7l, b8l, nt, x, da
    region VARCHAR(10) NOT NULL, -- Miền áp dụng: M1, M2, BOTH
    digits INT, -- Số chữ số cần cho loại cược (2, 3, 4 hoặc NULL)
    rate DECIMAL(10, 2), -- Tỷ lệ thưởng cơ bản
    stake_formula TEXT, -- Công thức tính tiền đóng (nếu phức tạp)
    variants JSONB, -- Các biến thể (dd/dau/duoi, x2/x3/x4...)
    win_logic JSONB, -- Logic xác định thắng/thua
    active BOOLEAN NOT NULL DEFAULT true, -- Trạng thái hoạt động
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng wallets: Quản lý ví tiền của người dùng
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) UNIQUE, -- Mỗi user có 1 ví duy nhất
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Số dư hiện tại
    total_bet DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Tổng tiền đã cược
    total_win DECIMAL(15, 2) NOT NULL DEFAULT 0, -- Tổng tiền đã thắng
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng transactions: Lịch sử giao dịch
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id), -- Người dùng thực hiện giao dịch
    wallet_id UUID NOT NULL REFERENCES public.wallets(id), -- Ví liên quan
    type VARCHAR(50) NOT NULL, -- Loại giao dịch: DEPOSIT, WITHDRAW, BET, WIN
    amount DECIMAL(15, 2) NOT NULL, -- Số tiền giao dịch
    balance_before DECIMAL(15, 2) NOT NULL, -- Số dư trước giao dịch
    balance_after DECIMAL(15, 2) NOT NULL, -- Số dư sau giao dịch
    reference_id UUID, -- ID tham chiếu (bet hoặc giao dịch khác)
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED', -- Trạng thái: PENDING, COMPLETED, FAILED, CANCELED
    notes TEXT, -- Ghi chú thêm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng bets: Lưu trữ thông tin các lượt cược
CREATE TABLE public.bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bet_code VARCHAR(50) NOT NULL UNIQUE, -- Mã cược duy nhất (để dễ tra cứu)
    user_id UUID NOT NULL REFERENCES public.users(id), -- Người đặt cược
    rule_id UUID NOT NULL REFERENCES public.rules(id), -- Quy tắc cược áp dụng
    region VARCHAR(10) NOT NULL, -- Miền: M1, M2
    province VARCHAR(255), -- Tỉnh/thành phố (dạng chuỗi - cho tương thích ngược)
    province_id UUID REFERENCES public.provinces(id), -- Tham chiếu đến bảng provinces
    subtype VARCHAR(50), -- Loại phụ: dd/dau/duoi, x2/x3/x4...
    chosen_numbers TEXT[] NOT NULL, -- Mảng các số đã chọn
    amount DECIMAL(10, 2) NOT NULL, -- Mệnh giá cho mỗi số
    total_amount DECIMAL(15, 2) NOT NULL, -- Tổng tiền đóng
    potential_win DECIMAL(15, 2) NOT NULL, -- Tiềm năng thắng tối đa
    draw_date DATE NOT NULL, -- Ngày xổ
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- Trạng thái: PENDING, VERIFIED, WON, LOST, CANCELLED
    result JSONB, -- Kết quả đối chiếu chi tiết
    won_amount DECIMAL(15, 2), -- Tiền thắng thực tế
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng results: Lưu trữ kết quả xổ số
CREATE TABLE public.results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_date DATE NOT NULL, -- Ngày xổ
    province VARCHAR(255) NOT NULL, -- Tỉnh/thành phố (dạng chuỗi - cho tương thích ngược)
    province_id UUID REFERENCES public.provinces(id), -- Tham chiếu đến bảng provinces
    region VARCHAR(10) NOT NULL, -- Miền: M1, M2
    winning_numbers JSONB NOT NULL, -- Kết quả chi tiết các giải (JSON)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(draw_date, province) -- Mỗi tỉnh chỉ có một kết quả cho một ngày
);

/*============================================
  II. RÀNG BUỘC VÀ CHỈ MỤC
============================================*/

-- Ràng buộc cho bets đảm bảo có thông tin province
ALTER TABLE public.bets ADD CONSTRAINT check_province_info 
CHECK (
    (province IS NOT NULL AND province_id IS NULL) OR 
    (province IS NULL AND province_id IS NOT NULL) OR
    (province IS NOT NULL AND province_id IS NOT NULL)
);

-- Ràng buộc cho results đảm bảo có thông tin province
ALTER TABLE public.results ADD CONSTRAINT check_province_info 
CHECK (
    (province IS NOT NULL AND province_id IS NULL) OR 
    (province IS NULL AND province_id IS NOT NULL) OR
    (province IS NOT NULL AND province_id IS NOT NULL)
);

-- Chỉ mục để tối ưu truy vấn cho bets
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_bets_draw_date ON public.bets(draw_date);
CREATE INDEX idx_bets_status ON public.bets(status);
CREATE INDEX idx_bets_province_id ON public.bets(province_id);

-- Chỉ mục để tối ưu truy vấn cho results
CREATE INDEX idx_results_draw_date ON public.results(draw_date);
CREATE INDEX idx_results_province ON public.results(province);
CREATE INDEX idx_results_province_id ON public.results(province_id);

-- Chỉ mục cho các bảng khác
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_lottery_schedules_day ON public.lottery_schedules(day_of_week);
CREATE INDEX idx_provinces_region ON public.provinces(region);

/*============================================
  III. FUNCTIONS VÀ TRIGGERS
============================================*/

-- Function cập nhật thời gian chỉnh sửa
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function lấy danh sách tỉnh xổ theo ngày trong tuần
CREATE OR REPLACE FUNCTION get_provinces_by_day_of_week(day INT)
RETURNS TABLE (
    province_id UUID,
    province_name VARCHAR(255),
    region VARCHAR(10),
    sub_region VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.region, p.sub_region
    FROM public.provinces p
    JOIN public.lottery_schedules ls ON p.id = ls.province_id
    WHERE ls.day_of_week = day AND ls.is_active = true AND p.is_active = true
    ORDER BY p.region, p.sub_region, p.name;
END;
$$ LANGUAGE plpgsql;

-- Function lấy kết quả xổ số mới nhất cho một tỉnh
CREATE OR REPLACE FUNCTION get_latest_result_for_province(province_id_param UUID)
RETURNS TABLE (
    result_id UUID,
    draw_date DATE,
    winning_numbers JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.draw_date, r.winning_numbers
    FROM public.results r
    WHERE r.province_id = province_id_param
    ORDER BY r.draw_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function tạo ví mới cho user
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Đăng ký trigger cập nhật timestamp cho tất cả bảng
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_provinces
BEFORE UPDATE ON public.provinces
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_lottery_schedules
BEFORE UPDATE ON public.lottery_schedules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_rules
BEFORE UPDATE ON public.rules
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_wallets
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_transactions
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_bets
BEFORE UPDATE ON public.bets
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_results
BEFORE UPDATE ON public.results
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Trigger tự động tạo ví khi tạo user mới
CREATE TRIGGER on_user_created
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION create_wallet_for_new_user();

/*============================================
  IV. ROW LEVEL SECURITY (RLS)
============================================*/

-- Bật RLS cho tất cả bảng
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Policy cho users
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can do anything with users" ON public.users
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy cho provinces (ai cũng xem được, chỉ admin thêm/sửa/xóa)
CREATE POLICY "Anyone can view provinces" ON public.provinces
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage provinces" ON public.provinces
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy cho lottery_schedules (lịch xổ)
CREATE POLICY "Anyone can view lottery schedules" ON public.lottery_schedules
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage lottery schedules" ON public.lottery_schedules
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy cho rules (quy tắc cược)
CREATE POLICY "Anyone can view active rules" ON public.rules
    FOR SELECT
    USING (active = true OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can do anything with rules" ON public.rules
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy cho wallets (ví)
CREATE POLICY "Users can view their own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage wallets" ON public.wallets
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy cho transactions (giao dịch)
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage transactions" ON public.transactions
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy cho bets (lượt cược)
CREATE POLICY "Users can view their own bets" ON public.bets
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bets" ON public.bets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do anything with bets" ON public.bets
    USING (auth.jwt() ->> 'role' = 'admin');

-- Policy cho results (kết quả xổ số)
CREATE POLICY "Anyone can view results" ON public.results
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can do anything with results" ON public.results
    USING (auth.jwt() ->> 'role' = 'admin');

/*============================================
  V. DỮ LIỆU MẪU
============================================*/

-- Dữ liệu mẫu cho quy tắc cược
INSERT INTO public.rules (name, description, bet_type, rule_code, region, digits, rate, variants, win_logic, active)
VALUES 
(
    'Đầu Đuôi', 
    'Cá cược số 2 chữ số với đầu (giải 8/7) hoặc đuôi (giải đặc biệt)', 
    'ĐẦU ĐUÔI', 
    'dd', 
    'BOTH', 
    2, 
    75,
    '[{"code": "dd", "name": "Đầu Đuôi Toàn Phần"}, {"code": "dau", "name": "Chỉ Đầu"}, {"code": "duoi", "name": "Chỉ Đuôi"}]'::jsonb,
    '{"type": "SIMPLE", "prizes": {"M1": ["G8", "DB"], "M2": ["G7", "DB"]}, "digitPosition": "LAST", "digitCount": 2}'::jsonb,
    true
),
(
    'Xỉu Chủ', 
    'Cá cược số 3 chữ số với đầu (giải 7/6) hoặc đuôi (giải đặc biệt)', 
    'XỈU CHỦ', 
    'xc', 
    'BOTH', 
    3, 
    650,
    '[{"code": "xc", "name": "Xỉu Chủ Toàn Phần"}, {"code": "dau", "name": "Chỉ Đầu"}, {"code": "duoi", "name": "Chỉ Đuôi"}]'::jsonb,
    '{"type": "SIMPLE", "prizes": {"M1": ["G7", "DB"], "M2": ["G6", "DB"]}, "digitPosition": "LAST", "digitCount": 3}'::jsonb,
    true
),
(
    'Bao Lô 2', 
    'Bao lô 2 chữ số, trúng với bất kỳ 2 số cuối của lô nào', 
    'BAO LÔ', 
    'b2', 
    'BOTH', 
    2, 
    75,
    null,
    '{"type": "SIMPLE", "prizes": {"M1": ["ALL"], "M2": ["ALL"]}, "digitPosition": "LAST", "digitCount": 2}'::jsonb,
    true
),
(
    'Bao Lô 3', 
    'Bao lô 3 chữ số, trúng với bất kỳ 3 số cuối của lô nào', 
    'BAO LÔ', 
    'b3', 
    'BOTH', 
    3, 
    650,
    null,
    '{"type": "SIMPLE", "prizes": {"M1": ["ALL"], "M2": ["ALL"]}, "digitPosition": "LAST", "digitCount": 3}'::jsonb,
    true
),
(
    'Bao Lô 4', 
    'Bao lô 4 chữ số, trúng với bất kỳ 4 số cuối của lô nào', 
    'BAO LÔ', 
    'b4', 
    'BOTH', 
    4, 
    5500,
    null,
    '{"type": "SIMPLE", "prizes": {"M1": ["ALL"], "M2": ["ALL"]}, "digitPosition": "LAST", "digitCount": 4}'::jsonb,
    true
);

-- Dữ liệu mẫu cho provinces
INSERT INTO public.provinces (name, code, region, sub_region, is_active)
VALUES
-- Miền Bắc (M2)
('Hà Nội', 'HN', 'M2', NULL, true),
('Quảng Ninh', 'QN', 'M2', NULL, true),
('Bắc Ninh', 'BN', 'M2', NULL, true),
('Hải Phòng', 'HP', 'M2', NULL, true),
('Nam Định', 'ND', 'M2', NULL, true),
('Thái Bình', 'TB', 'M2', NULL, true),

-- Miền Trung (M1)
('Đà Nẵng', 'DNG', 'M1', 'Miền Trung', true),
('Khánh Hòa', 'KH', 'M1', 'Miền Trung', true),
('Thừa Thiên Huế', 'TTH', 'M1', 'Miền Trung', true),
('Quảng Nam', 'QNM', 'M1', 'Miền Trung', true),
('Quảng Bình', 'QB', 'M1', 'Miền Trung', true),
('Quảng Trị', 'QT', 'M1', 'Miền Trung', true),
('Bình Định', 'BDI', 'M1', 'Miền Trung', true),
('Phú Yên', 'PY', 'M1', 'Miền Trung', true),
('Gia Lai', 'GL', 'M1', 'Miền Trung', true),
('Ninh Thuận', 'NT', 'M1', 'Miền Trung', true),
('Quảng Ngãi', 'QNG', 'M1', 'Miền Trung', true),
('Đắk Lắk', 'DLK', 'M1', 'Miền Trung', true),
('Đắk Nông', 'DNO', 'M1', 'Miền Trung', true),
('Kon Tum', 'KT', 'M1', 'Miền Trung', true),

-- Miền Nam (M1)
('TP. HCM', 'HCM', 'M1', 'Miền Nam', true),
('Đồng Nai', 'DN', 'M1', 'Miền Nam', true),
('Cần Thơ', 'CT', 'M1', 'Miền Nam', true),
('Đồng Tháp', 'DT', 'M1', 'Miền Nam', true),
('Cà Mau', 'CM', 'M1', 'Miền Nam', true),
('Bến Tre', 'BTR', 'M1', 'Miền Nam', true),
('Vũng Tàu', 'VT', 'M1', 'Miền Nam', true),
('Bạc Liêu', 'BL', 'M1', 'Miền Nam', true),
('Sóc Trăng', 'ST', 'M1', 'Miền Nam', true),
('Tây Ninh', 'TN', 'M1', 'Miền Nam', true),
('An Giang', 'AG', 'M1', 'Miền Nam', true),
('Bình Thuận', 'BTH', 'M1', 'Miền Nam', true),
('Vĩnh Long', 'VL', 'M1', 'Miền Nam', true),
('Bình Dương', 'BD', 'M1', 'Miền Nam', true),
('Trà Vinh', 'TV', 'M1', 'Miền Nam', true),
('Long An', 'LA', 'M1', 'Miền Nam', true),
('Bình Phước', 'BP', 'M1', 'Miền Nam', true),
('Hậu Giang', 'HG', 'M1', 'Miền Nam', true),
('Tiền Giang', 'TG', 'M1', 'Miền Nam', true),
('Kiên Giang', 'KG', 'M1', 'Miền Nam', true),
('Đà Lạt', 'DL', 'M1', 'Miền Nam', true);

-- Dữ liệu mẫu cho lottery_schedules (Lịch xổ số hàng tuần)
-- Đây chỉ là một số ví dụ, cần cập nhật đầy đủ theo lịch xổ số thực tế
-- Miền Bắc
INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 1 FROM public.provinces WHERE name = 'Hà Nội'; -- Thứ 2

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 2 FROM public.provinces WHERE name = 'Quảng Ninh'; -- Thứ 3

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 3 FROM public.provinces WHERE name = 'Bắc Ninh'; -- Thứ 4

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 4 FROM public.provinces WHERE name = 'Hà Nội'; -- Thứ 5

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 5 FROM public.provinces WHERE name = 'Hải Phòng'; -- Thứ 6

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 6 FROM public.provinces WHERE name = 'Nam Định'; -- Thứ 7

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 0 FROM public.provinces WHERE name = 'Thái Bình'; -- Chủ nhật

-- Miền Trung (chỉ một số ví dụ)
INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 1 FROM public.provinces WHERE name = 'Thừa Thiên Huế'; -- Thứ 2

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 1 FROM public.provinces WHERE name = 'Phú Yên'; -- Thứ 2

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 2 FROM public.provinces WHERE name = 'Đắk Lắk'; -- Thứ 3

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 2 FROM public.provinces WHERE name = 'Quảng Nam'; -- Thứ 3

-- Miền Nam (chỉ một số ví dụ)
INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 1 FROM public.provinces WHERE name = 'TP. HCM'; -- Thứ 2

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 1 FROM public.provinces WHERE name = 'Đồng Tháp'; -- Thứ 2

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 1 FROM public.provinces WHERE name = 'Cà Mau'; -- Thứ 2

INSERT INTO public.lottery_schedules (province_id, day_of_week)
SELECT id, 2 FROM public.provinces WHERE name = 'Bến Tre'; -- Thứ 3