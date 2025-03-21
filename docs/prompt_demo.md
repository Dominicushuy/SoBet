# KẾ HOẠCH DEMO DỰ ÁN CÁ CƯỢC XỔ SỐ (2 NGÀY) - ĐÃ CẬP NHẬT

## PROMPT ĐẶC BIỆT - CHẠY ĐẦU TIÊN

```
Tôi đang xây dựng ứng dụng web cá cược xổ số dựa trên các tài liệu đã cung cấp. Hãy phân tích toàn diện các quy tắc và cấu trúc dữ liệu để tôi có thể triển khai hệ thống chính xác.

### TÀI LIỆU THAM KHẢO
- Luật chơi và các loại cược: `Rules Detailed Document.md`
- Cấu trúc dữ liệu đài xổ số theo ngày: `danh_sach_tinh_theo_ngay.json`
- Phân tích ban đầu: `Rules Analysis.md`

### YÊU CẦU PHÂN TÍCH
1. Danh sách đầy đủ các loại cược (đầu đuôi, xỉu chủ, bao lô, v.v.)
2. Chi tiết cho mỗi loại cược:
   - Nguyên tắc cơ bản & điều kiện thắng
   - Cách tính tiền đóng (công thức cụ thể)
   - Tỷ lệ thưởng (đơn vị thắng)
   - Phạm vi áp dụng (M1, M2 hoặc cả hai)
   - Các subtypes nếu có (như đầu đuôi có subtypes dd, dau, duoi)

3. Cấu trúc JSON mẫu cho:
   - Các loại cược (betTypes)
   - Phương thức chọn số (numberSelectionMethods)
   - Kết quả xổ số (lotteryResults) - cần mẫu JSON cụ thể để đối soát kết quả
   - Cấu trúc dữ liệu đài xổ số theo ngày

4. Logic đối soát chi tiết:
   - Cách xác định trúng thưởng cho từng loại cược
   - Công thức tính tiền thắng
   - Xử lý các trường hợp đặc biệt (nhiều lô trúng, trúng theo tỷ lệ khác nhau)

5. TypeScript interfaces đầy đủ cho:
   - Tất cả các đối tượng trong các JSON mẫu
   - Models cho database
   - Types cho form inputs và validation

6. Utility functions:
   - Tính toán tiền đóng cho từng loại cược
   - Tính toán tiền thắng tiềm năng
   - Tạo số tự động theo các quy tắc (con giáp, đảo số, tài xỉu, v.v.)
   - Helper functions cho việc đối soát kết quả

7. Yêu cầu quản trị:
   - Cấu trúc database để admin có thể thay đổi:
     - Tỷ lệ thưởng cho từng loại cược
     - Ẩn/hiện các loại cược
     - Quản lý kết quả xổ số

### ĐẦU RA MONG MUỐN
- Phân tích kỹ thuật đầy đủ về logic nghiệp vụ
- Cấu trúc JSON mẫu hoàn chỉnh cho tất cả các đối tượng
- TypeScript interfaces và ví dụ cách sử dụng
- Utility functions với giải thích cách hoạt động
- Gợi ý triển khai database schema cho Supabase
- Demo code cho form đặt cược và logic đối soát kết quả

Kết quả của phân tích này sẽ được sử dụng để triển khai các components chính của ứng dụng, bao gồm form builder đặt cược, trang hiển thị kết quả, và backend API services.
```

## TASK 1: SETUP DỰ ÁN (CẬP NHẬT)

```
Dựa trên schema database và các interfaces đã được phân tích, tôi cần khởi tạo dự án Next.js với các tệp cấu hình cần thiết.

Trong phân tích, chúng ta đã có:
- Schema SQL đầy đủ với các bảng users, provinces, lottery_schedules, rules, bets, results, wallets, transactions
- TypeScript interfaces cho các đối tượng dữ liệu
- Logic nghiệp vụ cho tính toán tiền cược và kiểm tra kết quả

Hãy cung cấp:
1. Lệnh khởi tạo dự án Next.js 15 với app router và TypeScript
2. Danh sách dependencies cập nhật (bao gồm các thư viện UI, form validation, state management, đặc biệt là @tanstack/react-query@4)
3. Cấu trúc thư mục chi tiết tương thích với schema và interfaces đã phân tích
4. Cấu hình tailwind.config.js với theme phù hợp cho ứng dụng xổ số (bổ sung các màu: lottery-primary, lottery-secondary, lottery-win, lottery-lose)
5. Cấu hình .env.local template
6. Mẫu global.css cơ bản
7. Ví dụ layout.tsx và page.tsx cơ bản
8. Setup React Query Provider cho toàn bộ ứng dụng

Hãy tạo cấu hình phù hợp với cấu trúc đã phân tích, tập trung vào các chức năng chính: đặt cược, quản lý luật chơi, và đối soát kết quả.
```

## TASK 1.5: AUTHENTICATION & AUTHORIZATION

```
Dựa trên schema và các interfaces đã phân tích, tôi cần xây dựng hệ thống xác thực và phân quyền cho ứng dụng, tận dụng Supabase Auth.

Hãy cung cấp code đầy đủ cho:
1. app/login/page.tsx (trang đăng nhập)
2. app/login/components/LoginForm.tsx (form đăng nhập)
3. components/layout/AuthProvider.tsx (context provider cho authentication)
4. lib/utils/auth-utils.ts (utility functions cho authentication)
5. lib/actions/auth-actions.ts (Server Actions cho đăng nhập/đăng xuất)
6. middleware.ts (middleware cho route protection và role-based access)
7. components/layout/Header.tsx (hiển thị thông tin người dùng đã đăng nhập)
8. components/layout/ProtectedRoute.tsx (wrapper cho các route yêu cầu phân quyền)

Hệ thống cần:
- Sử dụng Supabase Auth cho quản lý đăng nhập
- Redirect người dùng chưa đăng nhập về trang login
- Kiểm tra role (admin/user) và điều hướng phù hợp sau khi đăng nhập
- Hiển thị UI phù hợp dựa trên role của người dùng
- Bảo vệ các route admin không cho user thông thường truy cập
- Tích hợp với React Query để quản lý authentication state

Lưu ý là chúng ta sẽ bỏ qua phần đăng ký người dùng vì sẽ tạo thủ công qua Supabase Dashboard.
```

## TASK 2: THIẾT LẬP SUPABASE & DATABASE SCHEMA (CẬP NHẬT)

```
Trong phân tích trước, chúng ta đã có schema SQL đầy đủ với cấu trúc:
- 8 bảng chính: users, provinces, lottery_schedules, rules, bets, results, wallets, transactions
- Các ràng buộc và chỉ mục đã được thiết lập
- Functions và triggers cho tính năng tự động
- Row Level Security (RLS) cho bảo mật
- Dữ liệu mẫu cho provinces, rules và lottery_schedules

Hãy cung cấp:
1. Hướng dẫn triển khai schema đã phân tích vào Supabase thông qua SQL Editor
2. Code TypeScript để thiết lập Supabase Client cho cả client-side và server-side
3. Ví dụ về cách query dữ liệu từ các bảng đã tạo
4. Ví dụ về cách thêm/cập nhật dữ liệu vào các bảng
5. Mẫu về cách triển khai Server Action để tương tác với Supabase
6. Các types/interfaces TypeScript cần thiết cho Supabase

Đảm bảo code tương thích với schema đã phân tích, đặc biệt là cấu trúc provinces và lottery_schedules để hỗ trợ chọn đài xổ số theo ngày.
```

## TASK 3: UI COMPONENTS CƠ BẢN (CẬP NHẬT)

```
Bây giờ cần xây dựng UI components dựa trên schema và interfaces đã phân tích, đặc biệt chú ý đến các loại cược (Đầu Đuôi, Xỉu Chủ, Bao Lô, v.v.) và cấu trúc tỉnh/đài xổ số.

Hãy cung cấp code đầy đủ cho các components cơ bản sau:
1. components/ui/Button.tsx (với các variants: primary, secondary, outline, ghost)
2. components/ui/Card.tsx (với header, content, footer)
3. components/ui/Form.tsx (integrated với react-hook-form và zod)
4. components/ui/Tabs.tsx (component tabs đơn giản)
5. components/ui/Select.tsx (dropdown selection)
6. components/ui/Input.tsx (text, number với validation)
7. components/ui/Table.tsx (hiển thị dữ liệu dạng bảng)
8. components/ui/DataTable.tsx (table nâng cao với sorting, filtering)
9. components/ui/Badge.tsx (hiển thị trạng thái: pending, won, lost)
10. components/lottery/NumberGrid.tsx (grid hiển thị số 00-99 để chọn)
11. components/lottery/ProvinceSelector.tsx (chọn tỉnh theo ngày dựa vào bảng lottery_schedules)
12. components/lottery/RegionSelector.tsx (chọn M1/M2)
13. components/lottery/BetStatusBadge.tsx (hiển thị trạng thái cược)

Đảm bảo các components này được styled bằng Tailwind CSS và có đầy đủ TypeScript type definitions.
Tham khảo logic nghiệp vụ đã được phân tích để thiết kế UI phù hợp với các loại cược và cách tính tiền.
```

## TASK 4: ADMIN PANEL - QUẢN LÝ LUẬT CHƠI (CẬP NHẬT)

```
Từ phân tích đã có về luật chơi và schema database, giờ tôi cần xây dựng Admin Panel để quản lý quy tắc cược và đài xổ số.

Trong phần schema, chúng ta đã có:
- Bảng rules để quản lý luật chơi với các trường như rule_code, bet_type, region, rate, variants (JSONB)
- Bảng provinces và lottery_schedules để quản lý đài xổ số và lịch

Hãy cung cấp code đầy đủ cho:
1. app/admin/page.tsx (trang admin dashboard)
2. app/admin/bet-types/page.tsx (trang quản lý luật chơi)
3. app/admin/bet-types/components/BetTypeEditor.tsx (form chỉnh sửa luật chơi)
4. app/admin/bet-types/components/PayRateEditor.tsx (điều chỉnh tỷ lệ thưởng)
5. lib/validators/bet-type-form.ts (Zod schema cho form)
6. lib/actions/bet-types.ts (Server Actions cho CRUD luật chơi)

Trang quản lý luật chơi cần cho phép:
- Xem danh sách các luật chơi hiện tại
- Thêm/sửa/xóa luật chơi
- Điều chỉnh tỷ lệ thưởng
- Kích hoạt/vô hiệu hóa luật chơi
- Quản lý biến thể (variants) của luật chơi

Tận dụng các interfaces và schema đã được phân tích để thiết kế form phù hợp.
```

## TASK 5: FORM BUILDER ĐẶT CƯỢC (CẬP NHẬT)

```
Dựa trên schema database và logic đặt cược đã phân tích, giờ tôi cần xây dựng form đặt cược động cho người dùng.

Chúng ta đã có:
- Schema bets với các trường cần thiết
- Logic tính toán tiền cược và tiềm năng thắng
- Cấu trúc provinces và lottery_schedules cho chọn đài

Hãy cung cấp code đầy đủ cho:
1. app/bet/page.tsx (trang đặt cược chính)
2. app/bet/components/BetForm.tsx (form đặt cược chính)
3. app/bet/components/BetTypeSelector.tsx (chọn loại cược)
4. app/bet/components/RegionSelector.tsx (chọn miền M1/M2)
5. app/bet/components/NumbersInput.tsx (nhập số cược)
6. app/bet/components/AmountCalculator.tsx (tính toán tiền cược và tiềm năng thắng)
7. lib/validators/bet-form.ts (validation schema)
8. lib/lottery/calculators.ts (tính toán tiền cược dựa trên các quy tắc)
9. lib/lottery/number-generators.ts (sinh số theo các phương pháp: con giáp, đảo số, tài xỉu)
10. lib/actions/bets.ts (Server Actions lưu thông tin cược)

Form cần có khả năng:
- Chọn miền (M1/M2) và đài xổ số theo ngày
- Chọn loại cược (Đầu Đuôi, Xỉu Chủ, Bao Lô, v.v.)
- Chọn số cược với nhiều cách chọn: nhập trực tiếp, chọn từ bảng, theo con giáp, đảo số
- Tính toán tự động tổng tiền đặt và tiềm năng thắng theo logic đã phân tích
- Tạo mã cược duy nhất và lưu vào database

Tận dụng các utility functions và interfaces đã có trong phân tích.
```

## TASK 6: ĐỐI SOÁT KẾT QUẢ (CẬP NHẬT)

```
Từ phân tích về logic đối soát kết quả và schema database, giờ tôi cần xây dựng tính năng đối soát kết quả xổ số.

Chúng ta đã có:
- Schema results để lưu kết quả xổ số
- Logic đối soát chi tiết cho từng loại cược
- Cấu trúc dữ liệu winning_numbers

Hãy cung cấp code đầy đủ cho:
1. app/verification/page.tsx (trang đối soát kết quả)
2. app/verification/components/BetVerifier.tsx (component xử lý đối soát cược)
3. app/verification/components/ResultsInput.tsx (form nhập kết quả xổ số)
4. lib/validators/result-form.ts (validation schema cho kết quả)
5. lib/lottery/result-verifier.ts (logic đối soát cược với kết quả)
6. lib/actions/results.ts (Server Actions quản lý kết quả xổ số)
7. lib/actions/verify-bets.ts (Server Actions xử lý đối soát cược)

Tính năng đối soát cần:
- Cho phép nhập kết quả xổ số theo từng đài
- Thực hiện đối soát tự động với các cược đã đặt
- Cập nhật trạng thái cược (WON/LOST) dựa trên kết quả
- Tính toán tiền thắng dựa trên quy tắc đã phân tích
- Hiển thị chi tiết kết quả đối soát

Cần sử dụng logic đối soát đã được phân tích chi tiết trong prompt đặc biệt.
```

## TASK 7: TRANG DASHBOARD & BÁO CÁO (CẬP NHẬT)

```
Dựa trên schema database và logic đã phân tích, tôi cần xây dựng dashboard hiển thị thông tin cược và kết quả.

Hãy cung cấp code đầy đủ cho:
1. app/dashboard/page.tsx (trang dashboard chính)
2. app/dashboard/components/BetStatistics.tsx (thống kê cược)
3. app/dashboard/components/WinningBets.tsx (danh sách cược thắng)
4. app/dashboard/components/ResultHistory.tsx (lịch sử kết quả theo đài)
5. app/dashboard/components/DistributionChart.tsx (biểu đồ phân bố cược)
6. lib/actions/statistics.ts (Server Actions lấy dữ liệu thống kê)

Dashboard cần hiển thị:
- Thống kê tổng số cược theo loại và trạng thái
- Phân bố cược theo đài xổ số
- Danh sách cược gần đây với kết quả đối soát
- Lịch sử kết quả xổ số theo đài
- Biểu đồ tỷ lệ thắng/thua theo loại cược

Sử dụng Recharts hoặc thư viện biểu đồ phù hợp để hiển thị dữ liệu trực quan.
```

## TASK 8: IN PHIẾU & EXPORT DỮ LIỆU (CẬP NHẬT)

```
Từ schema database và logic đã phân tích, tôi cần xây dựng tính năng in phiếu cược và export dữ liệu.

Hãy cung cấp code đầy đủ cho:
1. app/bet/[id]/print/page.tsx (trang in phiếu cược)
2. app/bet/[id]/print/components/BetTicket.tsx (component hiển thị phiếu cược)
3. app/admin/exports/page.tsx (trang export dữ liệu cược)
4. lib/utils/print-utils.ts (utilities cho việc in ấn)
5. lib/utils/export-utils.ts (utilities cho việc export data)
6. lib/actions/exports.ts (Server Actions cho export)

Tính năng in phiếu cần:
- Hiển thị thông tin cược đầy đủ, bao gồm đài xổ số, số cược, mệnh giá
- Hiển thị mã cược và QR code để kiểm tra
- Có thể in trực tiếp từ trình duyệt
- Có style phù hợp cho việc in ấn

Tính năng export dữ liệu cần:
- Cho phép export danh sách cược theo ngày, đài xổ số, trạng thái
- Export kết quả đối soát chi tiết
- Hỗ trợ format CSV và Excel
```

## CẬP NHẬT THỨ TỰ ƯU TIÊN

1. **Task 1-2**: Setup dự án và Database ⭐⭐⭐⭐⭐
2. **Task 3-4**: UI Components và Admin Panel ⭐⭐⭐⭐
3. **Task 5**: Form Builder đặt cược ⭐⭐⭐⭐⭐
4. **Task 6**: Đối soát kết quả ⭐⭐⭐⭐
5. **Task 7-8**: Dashboard và In phiếu ⭐⭐⭐

## LƯU Ý ĐẶC BIỆT

1. **Xây dựng dần dần**: Mỗi task sẽ xây dựng trên output của task trước đó
2. **Schema database**: Đã có đầy đủ và chi tiết, sử dụng làm nền tảng cho tất cả các task
3. **TypeScript interfaces**: Đảm bảo sử dụng nhất quán các interfaces đã định nghĩa
4. **Logic nghiệp vụ**: Tập trung vào triển khai đúng logic đặt cược và đối soát kết quả theo phân tích
5. **Tính năng đài xổ số**: Cần tích hợp đúng cấu trúc provinces và lottery_schedules đã thiết kế

Với những cập nhật này, kế hoạch prompt sẽ đảm bảo xây dựng ứng dụng nhất quán dựa trên phân tích và schema đã có.
