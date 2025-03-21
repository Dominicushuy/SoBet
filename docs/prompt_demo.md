# KẾ HOẠCH DEMO DỰ ÁN CÁ CƯỢC XỔ SỐ (2 NGÀY)

## PROMPT ĐẶC BIỆT - CHẠY ĐẦU TIÊN

```
Tôi đang xây dựng ứng dụng cá cược xổ số dựa trên tài liệu sau:

Toàn bộ nội dung tài liệu về luật chơi xổ số và các loại cược đã được cung cấp cho bạn trong file Rules Detailed Document.md.

Hãy phân tích kỹ và tóm tắt các thông tin quan trọng sau:

1. Danh sách tất cả các loại cược có trong tài liệu (đầu đuôi, xỉu chủ, bao lô, v.v.)
2. Cho mỗi loại cược, tóm tắt:
   - Nguyên tắc cơ bản
   - Cách tính tiền đóng
   - Tỷ lệ thắng
   - Áp dụng cho miền nào (M1, M2 hoặc cả hai)
3. Tạo một object JSON chứa thông tin về các loại cược để tôi có thể sử dụng làm dữ liệu mẫu trong database
4. Giải thích ngắn gọn logic đối soát kết quả cho từng loại cược (cách xác định người thắng cuộc)
5. Tạo TypeScript interfaces cho tất cả các đối tượng trong Object JSON (betTypes và numberSelectionMethods)
6. Tạo các utility functions cơ bản cho việc tính toán tiền cược dựa trên các quy tắc

Tôi cần hiểu rõ logic nghiệp vụ để lập trình chính xác form builder đặt cược và tính năng đối soát kết quả. Kết quả của phân tích này sẽ được sử dụng cho các prompt tiếp theo.
```

## NGÀY 1: SETUP DỰ ÁN & ADMIN PANEL

### Task 1: Setup dự án ban đầu

```
Tôi đang xây dựng ứng dụng cá cược xổ số với các loại cược và luật chơi như đã phân tích sau:

Tôi cần khởi tạo nhanh dự án Next.js 15 với Tailwind CSS và Supabase. Hãy cung cấp:

1. Lệnh khởi tạo dự án với Next.js 15 app router và Typescript
2. Danh sách dependencies tối thiểu cần cài đặt (Supabase, react-hook-form, zod, UI components cơ bản)
3. Cấu trúc thư mục cơ bản chỉ tập trung vào 3 tính năng chính:
   - Form builder đặt cược
   - Admin cài đặt quy tắc/luật chơi
   - Đối soát kết quả thủ công
4. Nội dung .env.local với các biến môi trường Supabase
5. Cấu hình tailwind.config.js với theme cơ bản phù hợp cho ứng dụng cá cược xổ số
6. package.json với scripts cần thiết

Chỉ cần đủ để chạy demo, không cần authentication phức tạp hay đầy đủ các tính năng.
```

### Task 2: Thiết lập Supabase & Database Schema

```
Dựa trên phân tích luật chơi xổ số sau:

Kiểm tra kỹ phần JSON object và TypeScript interfaces trong file `Rules Analysis.md` để đảm bảo bạn đã hiểu rõ về các loại cược và luật chơi.

Tôi cần thiết lập database schema trên Supabase cho ứng dụng demo. Hãy cung cấp SQL scripts để tạo các tables sau:

1. `rules`: lưu thông tin về luật chơi và tỷ lệ (bao gồm: id, rule_code, name, description, region, bet_type, rate, active, stake_formula, variants (JSONB))
2. `bets`: lưu thông tin cược (id, user_id, bet_code, rule_id, region, chosen_numbers, amount, total_amount, potential_win, status, draw_date, result, won_amount)
3. `users`: thông tin user đơn giản (id, username, email, role)
4. `results`: lưu kết quả xổ số (id, draw_date, region, winning_numbers (JSONB))

Đảm bảo schema có:
- Khóa ngoại hợp lý giữa các bảng
- Indexes cho các trường thường được query
- Constraints phù hợp cho dữ liệu
- Cấu trúc linh hoạt để lưu trữ tất cả các loại cược

Hãy sử dụng JSON object đã phân tích để tạo INSERT statements cho bảng rules, đảm bảo có đầy đủ các loại cược chính như đầu đuôi, xỉu chủ, bao lô, đá, xiên, nhất to, v.v.

Cung cấp thêm đoạn code khởi tạo Supabase client trong Next.js (cả client-side và server-side).
```

### Task 3: UI Component cơ bản

```
Tôi đang xây dựng ứng dụng cá cược xổ số với các loại cược như sau:

[Dán tóm tắt ngắn gọn về các loại cược từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần xây dựng nhanh một số UI components cơ bản phù hợp với chủ đề cá cược xổ số. Hãy cung cấp code đầy đủ cho:

1. components/ui/Button.tsx (các variants: primary, secondary, outline, ghost)
2. components/ui/Input.tsx (text, number với validation)
3. components/ui/Select.tsx (dropdown selection)
4. components/ui/Card.tsx (card container đơn giản)
5. components/ui/Tabs.tsx (tab navigation)
6. components/ui/Form.tsx (form wrapper với validation)
7. components/ui/Table.tsx (table hiển thị dữ liệu)
8. components/ui/Badge.tsx (hiển thị trạng thái cược: pending, won, lost)
9. components/ui/NumberGrid.tsx (grid hiển thị các số 00-99 để chọn)
10. lib/utils.ts (utility functions, bao gồm cn/clsx để combine class names)

Sử dụng Tailwind CSS với màu sắc phù hợp cho ứng dụng cá cược xổ số (tông màu xanh dương/đỏ/vàng).
Đảm bảo components đơn giản, đẹp và dễ sử dụng. Chỉ cần đủ để demo, không cần quá phức tạp.
```

### Task 4: Admin Panel - Quản lý luật chơi

```
Dựa trên phân tích chi tiết về luật chơi xổ số sau:

[Dán TypeScript interfaces và phần tóm tắt về các loại cược từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần xây dựng trang admin quản lý luật chơi xổ số. Hãy cung cấp code đầy đủ cho:

1. app/admin/rules/page.tsx (trang liệt kê tất cả luật chơi)
2. app/admin/rules/new/page.tsx (trang tạo luật chơi mới)
3. app/admin/rules/[id]/page.tsx (trang chỉnh sửa luật chơi)
4. components/admin/RuleForm.tsx (form tạo/sửa luật chơi)
5. components/admin/RulesTable.tsx (bảng hiển thị luật chơi)
6. lib/actions/rules.ts (server actions cho CRUD rules)
7. lib/validators/ruleSchema.ts (Zod validation schema)

Form cần có các field:
- Tên luật chơi
- Mã luật chơi (rule_code, ví dụ: "dd" cho đầu đuôi, "b2" cho bao lô 2, v.v.)
- Loại cược (dropdown với tất cả loại cược đã phân tích)
- Khu vực áp dụng (M1, M2, ALL)
- Tỷ lệ thắng (rate, ví dụ: 75 cho đầu đuôi, 650 cho xỉu chủ)
- Mô tả luật chơi
- Trạng thái (active/inactive)
- Công thức tính tiền cược (stake_formula)
- Biến thể (variants) - có thể thêm nhiều biến thể

Hiển thị phần mô tả cho mỗi loại cược khi được chọn để admin dễ hiểu. Sử dụng Server Components và Server Actions của Next.js 15 để tương tác với Supabase.
```

## NGÀY 2: FORM BUILDER & ĐỐI SOÁT KẾT QUẢ

### Task 5: Form Builder đặt cược

```
Dựa trên phân tích chi tiết về luật chơi xổ số và logic tính tiền cược sau:

[Dán TypeScript interfaces và utility functions cho việc tính toán tiền cược từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần xây dựng form builder động cho người dùng đặt cược. Hãy cung cấp code đầy đủ cho:

1. lib/context/BetFormContext.tsx (context provider quản lý state của form)
2. lib/hooks/useBetForm.ts (custom hook cho việc quản lý form)
3. lib/utils/betCalculator.ts (utility tính toán tiền cược và tiềm năng thắng)
4. app/bets/new/page.tsx (trang đặt cược mới)
5. components/betting/BetForm.tsx (form đặt cược chính)
6. components/betting/BetTypeSelector.tsx (component chọn loại cược)
7. components/betting/RegionSelector.tsx (component chọn khu vực M1, M2)
8. components/betting/NumberSelection/index.tsx (component quản lý chọn số)
9. components/betting/NumberSelection/DirectInput.tsx (nhập số trực tiếp)
10. components/betting/NumberSelection/NumberGrid.tsx (chọn từ bảng số)
11. components/betting/NumberSelection/ZodiacSelection.tsx (chọn theo 12 con giáp)
12. components/betting/AmountInput.tsx (component nhập số tiền)
13. components/betting/BetSummary.tsx (hiển thị tóm tắt cược)
14. lib/actions/bets.ts (server action tạo cược mới)

Tập trung vào 3 loại form cược quan trọng nhất:
1. Form cho Đầu Đuôi (components/betting/types/DauDuoiBetForm.tsx)
2. Form cho Bao Lô 2/3/4 (components/betting/types/BaoLoBetForm.tsx)
3. Form cho Đá (components/betting/types/DaBetForm.tsx)

Form cần có các tính năng:
- Thay đổi động dựa trên loại cược được chọn
- Validation cho số cược theo từng loại
- Tính toán tự động tổng tiền đóng và tiềm năng thắng
- UI thân thiện và responsive
```

### Task 6: Trang in phiếu cược sau khi đặt cược thành công

```
Dựa trên phân tích về luật chơi xổ số và các loại cược sau:

[Dán tóm tắt ngắn gọn về cách tính tiền đóng và tiềm năng thắng từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần tạo trang in phiếu cược sau khi user đặt cược thành công. Hãy cung cấp code đầy đủ cho:

1. app/bets/[id]/print/page.tsx (trang in phiếu)
2. components/betting/BetTicket.tsx (component hiển thị thông tin phiếu cược)
3. components/betting/QRCode.tsx (component tạo QR code chứa thông tin cược)
4. lib/utils/printUtils.ts (utility functions cho việc in ấn)
5. app/bets/[id]/print/print.css (CSS styles cho việc in phiếu)

Phiếu cược cần có:
- Mã cược duy nhất (bet_code)
- QR code chứa mã cược
- Thông tin chi tiết về loại cược, số tiền, số cược
- Ngày giờ đặt cược và ngày xổ
- Chi tiết cách tính tiền đóng (dựa trên loại cược)
- Thông tin tiềm năng thắng (tỷ lệ thắng × số tiền cược)
- Nút in trực tiếp
- Style phù hợp cho cả hiển thị trên màn hình và khi in ra giấy

Trang này cần hiển thị chính xác thông tin theo từng loại cược, đặc biệt là cách tính tiền đóng dựa trên logic đã phân tích.
```

### Task 7: Đối soát kết quả thủ công

```
Dựa trên phân tích chi tiết về luật chơi xổ số và logic đối soát sau:

[Dán phần giải thích về logic đối soát từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần xây dựng tính năng đối soát kết quả xổ số thủ công. Tôi đã có sẵn code crawler kết quả xổ số dạng file Node.js. Hãy cung cấp code đầy đủ cho:

1. app/admin/results/page.tsx (trang quản lý kết quả và đối soát)
2. components/admin/ResultUploader.tsx (component upload file kết quả đã crawl)
3. components/admin/ProcessResultsButton.tsx (nút trigger đối soát thủ công)
4. components/admin/ResultsTable.tsx (bảng hiển thị kết quả đã xử lý)
5. lib/actions/results.ts (server actions cho xử lý kết quả)
6. lib/actions/process-bets.ts (server actions cho xử lý đối soát cược)
7. lib/matchers/index.ts (utility chứa các matcher functions)
8. lib/matchers/dauDuoiMatcher.ts (matcher cho đầu đuôi)
9. lib/matchers/baoLoMatcher.ts (matcher cho bao lô)
10. lib/matchers/daMatcher.ts (matcher cho đá)

Logic đối soát cần kiểm tra từng loại cược theo đúng quy tắc đã phân tích:
- Kiểm tra đầu đuôi với 2 số cuối giải đặc biệt hoặc giải bảy/tám
- Kiểm tra bao lô với tất cả các lô ở giải tương ứng
- Kiểm tra đá theo quy tắc phức tạp về các cặp số
- Cập nhật trạng thái các cược và tính tiền thắng

Tập trung vào việc hiển thị rõ ràng cách đối soát để demo cho khách hàng hiểu quy trình.
```

### Task 8: Trang Dashboard hiển thị kết quả

```
Dựa trên phân tích về luật chơi xổ số và các loại cược sau:

[Dán tóm tắt ngắn gọn về các loại cược từ PROMPT ĐẶC BIỆT vào đây]

Tôi cần tạo trang dashboard đơn giản để hiển thị kết quả cược và thống kê cơ bản. Hãy cung cấp code đầy đủ cho:

1. app/dashboard/page.tsx (trang dashboard chính)
2. components/dashboard/BetSummary.tsx (tóm tắt cược)
3. components/dashboard/RecentResults.tsx (kết quả xổ số gần đây)
4. components/dashboard/WinningBets.tsx (danh sách cược thắng)
5. components/dashboard/BetTypeDistribution.tsx (biểu đồ phân bố theo loại cược)
6. lib/actions/dashboard.ts (server actions lấy dữ liệu cho dashboard)

Trang dashboard cần hiển thị thông tin theo từng loại cược:
- Tổng số cược đặt theo từng loại (đầu đuôi, bao lô, đá, v.v.)
- Tỷ lệ thắng/thua theo từng loại
- Kết quả xổ số gần nhất với các giải quan trọng (đặc biệt, nhất, nhì, v.v.)
- Danh sách cược thắng với thông tin cách thắng (khớp với giải nào)

Giao diện cần trực quan, dễ hiểu cho khách hàng, với biểu đồ hoặc bảng tóm tắt rõ ràng.
```

## THỨ TỰ ƯU TIÊN VÀ LIÊN KẾT

### Thứ tự ưu tiên nếu thời gian bị giới hạn

1. Form Builder đặt cược (tập trung vào Đầu Đuôi, Bao Lô)
2. Admin Panel quản lý luật chơi
3. Đối soát kết quả cơ bản
4. Trang in phiếu và Dashboard

### Hướng dẫn liên kết giữa các task

```
Lưu ý cho tất cả các prompt:
- Luôn tham chiếu đến interfaces và schema từ Prompt đặc biệt và Task 2
- Tái sử dụng UI components từ Task 3
- Đảm bảo nhất quán về naming convention và cấu trúc dữ liệu
- Khi làm task sau, hãy xem xét output của task trước để đảm bảo tính liên tục
- Mỗi phần code phải có comment đầy đủ và rõ ràng
- Đảm bảo code có thể chạy được ngay khi copy/paste
```

### Các ví dụ dữ liệu cần chuẩn bị

1. Ví dụ kết quả xổ số M1 (Miền Nam/Trung)
2. Ví dụ kết quả xổ số M2 (Miền Bắc)
3. Ví dụ các phiếu cược với các loại cược khác nhau
4. Ví dụ kết quả đối soát

## LƯU Ý QUAN TRỌNG

1. **Không cần authentication phức tạp**: Tập trung vào core functionality
2. **Đơn giản hóa UI**: Đủ đẹp để demo nhưng không quá cầu kỳ
3. **Tính năng chính**: Form Builder, Quản lý luật chơi, Đối soát kết quả
4. **Test data**: Cần chuẩn bị sẵn dữ liệu mẫu để demo

---

Khi bạn gặp vấn đề khi follow theo các prompt, hãy điều chỉnh prompt và thêm thông tin chi tiết hơn để Chat Bot hiểu rõ hơn về vấn đề của bạn. Đặc biệt khi làm việc với các logic phức tạp như đối soát kết quả cược Đá hoặc Xiên.
