# KẾ HOẠCH CHI TIẾT TRIỂN KHAI WEB APP CÁ CƯỢC XỔ SỐ

Dựa trên tài liệu bạn cung cấp và phác thảo ban đầu, tôi sẽ xây dựng kế hoạch chi tiết hơn theo từng sprint với các task cụ thể cho một lập trình viên Fullstack.

## SPRINT 1: SETUP & DATABASE FOUNDATION (1 tuần)

### 1. Khởi tạo dự án Next.js & Cài đặt dependencies cơ bản (1 ngày)

- [ ] Khởi tạo dự án với `create-next-app@latest` sử dụng TypeScript và App Router

```bash
npx create-next-app@latest lode-app --typescript --eslint --tailwind --app
```

- [ ] Cài đặt dependencies cần thiết:

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs react-hook-form zod @hookform/resolvers tailwind-merge clsx lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs date-fns telegraf recharts
```

- [ ] Cấu hình tsconfig.json và .env.local với các biến môi trường
- [ ] Cấu trúc thư mục theo App Router:

```
/app
  /api
  /(auth)
    /login
    /register
  /(dashboard)
    /admin
      /rules
      /users
      /settings
      /reports
    /user
      /bets
      /history
  /layout.tsx
/components
  /ui
  /forms
  /layouts
  /bets
/lib
  /supabase
  /utils
  /validators
  /hooks
  /services
/public
```

### 2. Thiết lập Tailwind CSS & UI Components (1 ngày)

- [ ] Cấu hình theme và tùy chỉnh colors, typography trong tailwind.config.js

```javascript
const config = {
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
        // Các màu chính của ứng dụng
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

- [ ] Tạo component library cơ bản trong `/components/ui`:
  - Button.tsx (các loại button: primary, secondary, outline, ghost)
  - Input.tsx (text, number, password)
  - Card.tsx, Tabs.tsx, Modal.tsx
  - Select.tsx (dropdown selection)
  - Form.tsx (form base components)
  - Notification.tsx (toast/alert)
- [ ] Tạo layout components: Navbar.tsx, Sidebar.tsx, Dashboard.tsx

### 3. Thiết lập Supabase & Database Schema (2 ngày)

- [ ] Tạo dự án mới trên Supabase Dashboard
- [ ] Cấu hình Authentication trong Supabase (Email, Password)
- [ ] Tạo các tables với SQL scripts (không dùng Supabase UI để đảm bảo version control):

```sql
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  telegram_id TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policy cho users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Rules table
CREATE TABLE rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  region TEXT NOT NULL CHECK (region IN ('M1', 'M2', 'ALL')),
  bet_type TEXT NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bets table
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  bet_code TEXT UNIQUE NOT NULL,
  rule_id UUID REFERENCES rules(id) NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('M1', 'M2')),
  chosen_numbers TEXT[] NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  potential_win DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  draw_date DATE NOT NULL,
  result TEXT[],
  won_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Results table
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_date DATE NOT NULL,
  region TEXT NOT NULL CHECK (region IN ('M1', 'M2')),
  province TEXT,
  winning_numbers JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER rules_updated_at
BEFORE UPDATE ON rules
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER bets_updated_at
BEFORE UPDATE ON bets
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
```

- [ ] Tạo các functions trong Supabase cho các thao tác phức tạp (tính toán tiền thắng, đối soát kết quả,...)

### 4. Thiết lập Supabase Client & Hooks (1 ngày)

- [ ] Tạo lib/supabase/client.ts cho client-side

```typescript
import { createBrowserClient } from "@supabase/supabase-js";

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

- [ ] Tạo lib/supabase/server.ts cho server-side

```typescript
import { createServerClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
};
```

- [ ] Tạo custom hooks cho data fetching:
  - useUser.ts (lấy và quản lý thông tin user)
  - useRules.ts (lấy thông tin luật chơi)
  - useBets.ts (quản lý cược)

### 5. Thiết lập Authentication & Middleware (1 ngày)

- [ ] Tạo AuthProvider và middleware cho route protection
- [ ] Tạo form đăng nhập và đăng ký sử dụng react-hook-form và zod validation
- [ ] Thiết lập trang admin và user routes với route protection

## SPRINT 2: ADMIN DASHBOARD (2 tuần)

### 1. Tạo Layout cho Admin Dashboard (1 ngày)

- [ ] Tạo app/(dashboard)/admin/layout.tsx với sidebar navigation
- [ ] Tạo components/layouts/AdminSidebar.tsx với các menu items:
  - Dashboard (tổng quan)
  - Quản lý luật chơi
  - Quản lý người dùng
  - Cài đặt hệ thống
  - Báo cáo
- [ ] Tạo AdminHeader.tsx với thông tin admin và actions

### 2. Admin Dashboard Overview (1 ngày)

- [ ] Tạo trang dashboard overview (app/(dashboard)/admin/page.tsx)
- [ ] Thêm các widget hiển thị:
  - Tổng số cược đang chờ xử lý
  - Tổng tiền cược trong ngày/tuần/tháng
  - Tỷ lệ thắng/thua
  - Danh sách cược mới nhất

### 3. Admin Rules Management (3 ngày)

- [ ] Tạo đầy đủ CRUD cho quản lý luật chơi:
  - app/(dashboard)/admin/rules/page.tsx (danh sách luật)
  - app/(dashboard)/admin/rules/[id]/page.tsx (chi tiết/sửa luật)
  - app/(dashboard)/admin/rules/new/page.tsx (tạo mới luật)
- [ ] Tạo API routes cho rules:
  - app/api/rules/route.ts (GET, POST)
  - app/api/rules/[id]/route.ts (GET, PUT, DELETE)
- [ ] Tạo forms với validation cho các loại luật chơi (dựa trên docs.md):
  - Đầu đuôi
  - Xỉu chủ
  - Bao lô 2, 3, 4
  - Bao 7 lô, Bao 8 lô
  - Đá, Xiên, Nhất to
- [ ] Tạo data service cho rules:

```typescript
// lib/services/ruleService.ts
import { supabase } from "../supabase/client";

export async function getRules() {
  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRuleById(id: string) {
  const { data, error } = await supabase
    .from("rules")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// Additional functions for create, update, delete
```

### 4. Admin User Management (2 ngày)

- [ ] Tạo trang quản lý người dùng:
  - app/(dashboard)/admin/users/page.tsx (danh sách users)
  - app/(dashboard)/admin/users/[id]/page.tsx (chi tiết/sửa user)
  - app/(dashboard)/admin/users/new/page.tsx (tạo user mới)
- [ ] Tạo API routes cho users:
  - app/api/users/route.ts (GET, POST)
  - app/api/users/[id]/route.ts (GET, PUT, DELETE)
- [ ] Tạo form quản lý người dùng với các fields:
  - Username, Email, Full Name
  - Telegram ID
  - Role (admin/user)
  - Balance
- [ ] Tạo bảng hiển thị lịch sử cược của user

### 5. Settings Management (1 ngày)

- [ ] Tạo trang cài đặt hệ thống:
  - app/(dashboard)/admin/settings/page.tsx
- [ ] Tạo API route cho settings:
  - app/api/settings/route.ts
- [ ] Tạo form cài đặt hệ thống với các fields:
  - Telegram Bot Token
  - Thời gian đóng cược
  - Thời gian crawler chạy
  - Cài đặt hệ thống khác

### 6. Crawler Integration (2 ngày)

- [ ] Tích hợp crawler vào hệ thống:
  - Tạo lib/services/crawlerService.ts
  - Tạo app/api/crawler/route.ts để trigger crawler
  - Tạo cron job sử dụng Supabase Edge Functions

```typescript
// supabase/functions/daily-crawler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Crawler logic here
  // 1. Call crawler API
  // 2. Process results
  // 3. Store in Supabase

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

- [ ] Tạo giao diện quản lý và theo dõi crawler trong admin dashboard

## SPRINT 3: USER INTERFACE & BETTING (2 tuần)

### 1. User Dashboard Layout (1 ngày)

- [ ] Tạo app/(dashboard)/user/layout.tsx
- [ ] Tạo UserSidebar.tsx với các menu items:
  - Dashboard
  - Đặt cược mới
  - Lịch sử cược
  - Thông tin cá nhân

### 2. Form Builder cho Betting (5 ngày)

- [ ] Tạo components/forms/BetForm.tsx sử dụng React Hook Form
- [ ] Tạo dynamic form fields dựa trên loại cược được chọn:

```typescript
// components/forms/BetForm.tsx
const BetForm = ({ rules }) => {
  const [selectedRule, setSelectedRule] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(betSchema),
  });

  // Watch for rule changes to update form fields
  useEffect(() => {
    if (selectedRule) {
      // Update form based on selected rule
    }
  }, [selectedRule]);

  // Calculate total amount based on rules
  const calculateTotal = () => {
    // Logic tính toán dựa vào rule và số lượng cược
  };

  // Rest of form implementation
};
```

- [ ] Tạo các form fields cho từng loại cược (dựa trên docs.md):
  - Chọn loại cược (đầu đuôi, xỉu chủ, bao lô, đá, xiên,...)
  - Chọn đài (M1, M2)
  - Nhập số (với validation theo từng loại cược)
  - Nhập số tiền cược
  - Hiển thị tổng tiền phải đóng (tính tự động)
- [ ] Tạo preview của phiếu cược và confirm modal trước khi submit
- [ ] Tạo BetAPI service để submit cược:

```typescript
// lib/services/betService.ts
import { supabase } from "../supabase/client";

export async function createBet(betData) {
  const { data, error } = await supabase
    .from("bets")
    .insert([betData])
    .select();

  if (error) throw error;
  return data;
}
```

### 3. Trang In Phiếu Cược (2 ngày)

- [ ] Tạo app/(dashboard)/user/bets/[id]/print/page.tsx
- [ ] Thiết kế giao diện in phiếu với:
  - Mã cược dạng QR Code
  - Thông tin chi tiết cược (loại cược, số cược, tiền cược)
  - Thời gian cược và thời gian công bố kết quả
- [ ] Tạo nút in trực tiếp từ trình duyệt
- [ ] Tạo chức năng gửi phiếu cược qua Telegram

### 4. Trang Lịch Sử Cược (1 ngày)

- [ ] Tạo app/(dashboard)/user/history/page.tsx
- [ ] Thiết kế giao diện hiển thị lịch sử cược với:
  - Bảng danh sách cược với phân trang
  - Bộ lọc theo trạng thái, loại cược, thời gian
  - Chi tiết kết quả và tiền thắng/thua

### 5. Trang Chi tiết Cược (1 ngày)

- [ ] Tạo app/(dashboard)/user/bets/[id]/page.tsx
- [ ] Thiết kế giao diện hiển thị chi tiết cược:
  - Thông tin cược
  - Kết quả xổ số liên quan
  - Trạng thái và tiền thắng/thua

## SPRINT 4: RESULT PROCESSING & NOTIFICATIONS (1 tuần)

### 1. Đối Soát Kết Quả (3 ngày)

- [ ] Tạo lib/services/resultService.ts để xử lý logic đối soát

```typescript
// lib/services/resultService.ts
import { supabase } from "../supabase/client";

export async function processResults(drawDate: string, region: string) {
  // 1. Get results for the specific date and region
  const { data: results } = await supabase
    .from("results")
    .select("*")
    .eq("draw_date", drawDate)
    .eq("region", region)
    .single();

  if (!results) throw new Error("No results found");

  // 2. Get all pending bets for the date and region
  const { data: bets } = await supabase
    .from("bets")
    .select("*")
    .eq("draw_date", drawDate)
    .eq("region", region)
    .eq("status", "pending");

  if (!bets || bets.length === 0) return { processed: 0 };

  // 3. Process each bet against results
  let processed = 0;

  for (const bet of bets) {
    // Logic kiểm tra kết quả dựa trên loại cược
    // Mỗi loại cược sẽ có logic riêng
    const wonAmount = calculateWinning(bet, results);

    // Update bet status and won_amount
    await supabase
      .from("bets")
      .update({
        status: wonAmount > 0 ? "won" : "lost",
        result: results.winning_numbers,
        won_amount: wonAmount,
      })
      .eq("id", bet.id);

    processed++;
  }

  return { processed };
}

function calculateWinning(bet, results) {
  // Logic tính toán tiền thắng dựa vào loại cược
  // Implementation for each bet type...
}
```

- [ ] Tạo API endpoint để trigger đối soát:
  - app/api/results/process/route.ts
- [ ] Tạo Supabase Edge Function để tự động đối soát sau khi crawler chạy
- [ ] Tạo giao diện admin để kiểm tra và theo dõi quá trình đối soát

### 2. Telegram Notification Integration (2 ngày)

- [ ] Tạo lib/services/telegramService.ts:

```typescript
// lib/services/telegramService.ts
import { Telegraf } from "telegraf";

export async function sendWinningNotification(
  userId: string,
  betId: string,
  wonAmount: number
) {
  try {
    const supabase = createServerSupabaseClient();

    // Get user information
    const { data: user } = await supabase
      .from("users")
      .select("telegram_id, username")
      .eq("id", userId)
      .single();

    if (!user?.telegram_id) return { success: false, error: "No Telegram ID" };

    // Get bet details
    const { data: bet } = await supabase
      .from("bets")
      .select("*, rules(name)")
      .eq("id", betId)
      .single();

    // Get bot token from settings
    const { data: settings } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "telegram_bot_token")
      .single();

    if (!settings?.value) return { success: false, error: "No bot token" };

    // Create bot instance
    const bot = new Telegraf(settings.value);

    // Send notification
    await bot.telegram.sendMessage(
      user.telegram_id,
      `🎉 Chúc mừng ${user.username}!\n\n` +
        `Bạn đã thắng ${wonAmount.toLocaleString()}đ với mã cược: ${
          bet.bet_code
        }\n` +
        `Loại cược: ${bet.rules.name}\n` +
        `Số cược: ${bet.chosen_numbers.join(", ")}\n\n` +
        `Vui lòng liên hệ admin để nhận thưởng!`
    );

    return { success: true };
  } catch (error) {
    console.error("Telegram notification error:", error);
    return { success: false, error: error.message };
  }
}
```

- [ ] Tạo API endpoint để gửi thông báo:
  - app/api/telegram/notify/route.ts
- [ ] Tích hợp chức năng gửi thông báo vào quy trình đối soát kết quả

## SPRINT 5: REPORTS & FINISHING (1 tuần)

### 1. Báo Cáo Admin (2 ngày)

- [ ] Tạo trang báo cáo trong admin:
  - app/(dashboard)/admin/reports/page.tsx
- [ ] Tạo các components báo cáo:
  - DailyRevenueChart.tsx
  - UserBetDistribution.tsx
  - WinLossRatio.tsx
  - TopWinners.tsx
- [ ] Tạo API routes cho báo cáo:
  - app/api/reports/revenue/route.ts
  - app/api/reports/users/route.ts
  - app/api/reports/bets/route.ts
- [ ] Tạo chức năng xuất báo cáo sang Excel/CSV

### 2. Admin Actions & Batch Operations (1 ngày)

- [ ] Tạo trang batch operations để admin thực hiện các hành động hàng loạt:
  - Hủy cược hàng loạt
  - Đánh dấu đã thanh toán
  - Khóa/mở tài khoản người dùng

### 3. Testing & Debugging (1 ngày)

- [ ] Viết unit tests cho các logic phức tạp:
  - Tính toán tiền cược
  - Đối soát kết quả
  - Tính toán thống kê
- [ ] Kiểm tra toàn bộ luồng từ đặt cược → crawler → đối soát → thông báo

### 4. Documentation & Deployment (1 ngày)

- [ ] Viết API documentation với Swagger hoặc tương tự
- [ ] Cấu hình CI/CD với GitHub Actions
- [ ] Deploy lên Vercel và Supabase Production

## SPRINT 6: POLISH & ENHANCEMENTS (1 tuần)

### 1. UX Enhancements (2 ngày)

- [ ] Thêm loading states và error handling
- [ ] Tối ưu responsive design trên mobile
- [ ] Thêm animations và transitions

### 2. Performance Optimization (1 ngày)

- [ ] Tối ưu database queries (indexes, caching)
- [ ] Tối ưu Next.js với ISR/SSG khi có thể
- [ ] Lazy loading components

### 3. Security Enhancements (1 ngày)

- [ ] Thêm rate limiting cho API routes
- [ ] Audit các security vulnerabilities
- [ ] Bổ sung validation cho tất cả inputs

### 4. Final Testing & Launch (1 ngày)

- [ ] End-to-end testing
- [ ] Stress testing
- [ ] Chuẩn bị launch checklist và monitoring

## KẾT LUẬN

Kế hoạch trên chia nhỏ công việc thành các sprint hợp lý, với mỗi task được mô tả chi tiết và có deliverable cụ thể. Với một lập trình viên Fullstack làm full-time, dự án này có thể hoàn thành trong khoảng 8-10 tuần.

Các yếu tố quan trọng cần lưu ý:

1. Hiểu rõ logic cá cược xổ số theo tài liệu docs.md để implement chính xác
2. Đảm bảo tính toán chính xác giữa tiền cược, tỉ lệ thắng và tiền thưởng
3. Xử lý đúng luồng đối soát kết quả và thông báo
4. Thiết kế database tối ưu để hỗ trợ truy vấn nhanh và scale khi cần
