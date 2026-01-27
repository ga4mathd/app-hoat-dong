

## Kế hoạch xây dựng Admin Analytics Dashboard

### Tổng quan
Xây dựng hệ thống theo dõi và phân tích lượt truy cập, số người dùng hằng ngày, và thời gian sử dụng app dành riêng cho Admin.

---

### Phần 1: Tạo Database Schema (Migration)

**Bảng `page_views`** - Theo dõi lượt xem trang:
```text
+------------------+----------------------------+
| Column           | Type                       |
+------------------+----------------------------+
| id               | uuid (primary key)         |
| user_id          | uuid (nullable - for guests)|
| page_path        | text                       |
| session_id       | text                       |
| created_at       | timestamptz                |
| user_agent       | text (nullable)            |
+------------------+----------------------------+
```

**Bảng `user_sessions`** - Theo dõi phiên làm việc:
```text
+------------------+----------------------------+
| Column           | Type                       |
+------------------+----------------------------+
| id               | uuid (primary key)         |
| user_id          | uuid (nullable)            |
| session_id       | text (unique)              |
| started_at       | timestamptz                |
| ended_at         | timestamptz (nullable)     |
| last_activity_at | timestamptz                |
| duration_seconds | integer (nullable)         |
+------------------+----------------------------+
```

**RLS Policies:**
- Chỉ Admin có quyền SELECT trên cả 2 bảng
- INSERT được cho phép với mọi người (để tracking hoạt động)
- UPDATE chỉ cho phép trên session của chính mình

---

### Phần 2: Tạo RPC Functions cho Admin

**`admin_get_daily_analytics(p_days integer)`**
Trả về thống kê theo ngày trong N ngày gần nhất:
- Ngày
- Số lượt truy cập (page views)
- Số người dùng unique
- Số phiên làm việc
- Thời gian trung bình trên app

**`admin_get_realtime_stats()`**
Trả về thống kê realtime:
- Số người đang online (sessions hoạt động trong 5 phút qua)
- Tổng lượt truy cập hôm nay
- Số người dùng unique hôm nay
- Thời gian trung bình hôm nay

**`admin_get_popular_pages(p_days integer)`**
Trả về các trang được truy cập nhiều nhất:
- Đường dẫn trang
- Số lượt xem
- Số người dùng unique

---

### Phần 3: Tạo Session Tracking Hook

**File: `src/hooks/useSessionTracking.tsx`**

Chức năng:
- Tạo session ID duy nhất khi mở app
- Ghi nhận page view mỗi khi chuyển trang
- Cập nhật `last_activity_at` định kỳ (mỗi 30 giây)
- Tính toán `duration_seconds` khi kết thúc session
- Xử lý sự kiện `beforeunload` để ghi nhận kết thúc session

---

### Phần 4: Tích hợp Tracking vào App

**File: `src/App.tsx`**

Thêm `useSessionTracking` hook vào component App để tự động tracking trên toàn bộ ứng dụng.

---

### Phần 5: Tạo Analytics Dashboard Component

**File: `src/components/admin/AnalyticsDashboard.tsx`**

Giao diện bao gồm:

**A. Realtime Stats Cards (4 thẻ)**
- Đang online (số người active trong 5 phút)
- Lượt truy cập hôm nay
- Người dùng unique hôm nay  
- Thời gian TB trên app

**B. Biểu đồ xu hướng (Line Chart)**
- Hiển thị 7/14/30 ngày gần nhất
- 2 đường: Lượt truy cập và Người dùng unique
- Sử dụng Recharts (đã có sẵn)

**C. Bảng trang phổ biến**
- Top 10 trang được xem nhiều nhất
- Hiển thị: Tên trang, số lượt xem, số người xem

**D. Bộ lọc thời gian**
- Dropdown chọn: 7 ngày / 14 ngày / 30 ngày
- Nút refresh để cập nhật dữ liệu

---

### Phần 6: Tích hợp vào Admin Page

**File: `src/pages/Admin.tsx`**

Thêm tab "Analytics" mới với icon BarChart3:
- Chỉ hiển thị cho Admin (không hiển thị cho Expert)
- Import và render AnalyticsDashboard component
- Thêm state và fetch logic cho analytics data

---

### Thứ tự triển khai

1. Tạo database migration (bảng + RPC functions)
2. Tạo hook useSessionTracking
3. Tích hợp hook vào App.tsx
4. Tạo AnalyticsDashboard component
5. Thêm tab Analytics vào Admin page

---

### Chi tiết kỹ thuật

**Recharts Configuration:**
```text
LineChart với:
- XAxis: Ngày (dd/MM)
- YAxis: Số lượng
- 2 Line: pageViews (màu primary), uniqueUsers (màu secondary)
- Tooltip với format tiếng Việt
```

**Session Tracking Logic:**
```text
1. Khi app load:
   - Tạo session_id = uuid
   - INSERT vào user_sessions
   - Lưu session_id vào sessionStorage

2. Mỗi khi route thay đổi:
   - INSERT vào page_views

3. Mỗi 30 giây:
   - UPDATE last_activity_at

4. Khi đóng tab/app:
   - UPDATE ended_at và tính duration_seconds
```

**Performance Considerations:**
- Sử dụng `maybeSingle()` thay vì `single()` 
- Debounce các update operations
- Batch insert nếu cần
- Index trên các cột thường query (created_at, session_id)

