# YIC MES — UI Prototype

Bản prototype chạy hoàn toàn **offline, không cần cài gì**.

App gồm **2 module, mỗi module là một thư mục chạy độc lập**. Gửi *một* thư mục
cho ai đó là họ mở được ngay — không cần file nào bên ngoài, không cần server,
không cần internet:

| Module | Màn hình | Thư mục |
|---|---|---|
| **MAY** | Kế hoạch may · Sản lượng may hàng ngày | `app/sewing/` |
| **HOÀN THIỆN** | Nhận hàng hoàn thiện · Tình trạng hoàn thiện · Kế hoạch xuất hàng | `app/finishing/` |

## Chạy thử

Double-click `index.html` trong thư mục module muốn mở:

```
app/sewing/index.html
app/finishing/index.html
```

> Nếu trình duyệt chặn `file://`, chạy tạm một server tĩnh **trong chính thư mục
> module**: `npx serve` hoặc `python -m http.server 8000`.
> Lưu ý: `file://` và `http://localhost` là **hai kho dữ liệu khác nhau** — dữ liệu
> lưu ở bên này không thấy ở bên kia.

## Trong một thư mục module có gì

```
app/sewing/
  index.html      mở file này
  script.js       nền dùng chung + logic của MAY (1 file, tự chứa)
  seed.js         dữ liệu của MAY
  style.css       font + style tĩnh
  vendor/         react, react-dom, anime, xlsx, xlsx-style

app/finishing/
  index.html
  script.js       nền dùng chung + logic của HOÀN THIỆN
  seed.js         dữ liệu của HOÀN THIỆN
  style.css
  vendor/         react, react-dom, xlsx
```

Không có thư mục `shared/`, không có trang chọn module. Mỗi `script.js` tự chứa cả
phần nền (shell, sidebar, dịch VI/EN, lưu localStorage, ảnh chụp dữ liệu, phiếu
bàn giao) lẫn logic riêng của module — đổi lấy việc thư mục gửi đi là chạy được.

Phần nền nằm giữa các mốc `---8<---` trong `script.js` là **bản copy giống nhau
từng byte** ở cả hai module. Nó do `build/emit.js` sinh ra từ
`build/parts/core-*.js`; sửa tay trong `app/` thì hai bản lệch nhau và
`build/check.js` báo lỗi ngay.

## Module không đọc dữ liệu của nhau

Trước đây mọi màn hình dùng chung một `state`, nên Hoàn thiện đọc thẳng phiếu bàn
giao mà Sản lượng may vừa phát hành. Giờ **liên kết đó bị cắt**:

| | MAY | HOÀN THIỆN |
|---|---|---|
| localStorage | `yic.mes.sewing` | `yic.mes.finishing` |
| Seed | `app/sewing/seed.js` | `app/finishing/seed.js` |

Phiếu bàn giao phát hành ở MAY **nằm lại trong MAY**. Hoàn thiện có sẵn 132 phiếu
đóng băng trong seed của nó (`slips`) làm đầu vào.

Luồng dữ liệu **trong từng module** vẫn nguyên như cũ:

```
MAY
  Kế hoạch may ──────── SL theo ngày ────┐
  Sản lượng may hàng ngày ← chuyền / size / hàng lỗi / M-level
       └─ phát hành phiếu bàn giao SF-YYYYMMDD-NNN

HOÀN THIỆN
  seed.slips ─ Nhận hàng hoàn thiện     ← xác nhận đã nhận từng phiếu
                    └─ Tình trạng hoàn thiện ← Ủi → Kiểm cuối → Đóng gói → Nhập kho TP
                         └─ Kế hoạch xuất hàng ← cột SẴN SÀNG = số đã nhập kho TP
```

Mỗi công đoạn không vượt được số của công đoạn liền trước; sửa công đoạn trước
xuống thấp thì các công đoạn sau tự tụt theo.

## Seed của module

Mỗi module có **đúng 1 file seed** — nguồn dữ liệu duy nhất của nó.

`app/sewing/seed.js` → `window.SEWING_SEED`

| Khóa | Nội dung |
|---|---|
| `lines` | 13 chuyền may, đúng thứ tự kế hoạch sản xuất |
| `orders` | 18 đơn hàng trên các chuyền — Kế hoạch may rải SL theo ngày từ đây |
| `plans` | 19 tác nghiệp cắt (5 upload + 14 sinh thêm), khóa qua `order.planId` — Sản lượng may lấy màu vải + demand theo size từ đây |
| `snapshot` | ảnh chụp dữ liệu người dùng, `null` = chạy bằng dữ liệu gốc |

`app/finishing/seed.js` → `window.FINISHING_SEED`

| Khóa | Nội dung |
|---|---|
| `ordered` | 33 mục "SL đơn hàng" theo (chuyền \| mã hàng \| PO \| màu) |
| `orders` | 15 dòng (mã hàng \| PO) — Phụ liệu hoàn thiện + Kế hoạch xuất hàng |
| `slips` | 132 phiếu bàn giao May → Hoàn thiện, đầu vào duy nhất của module |
| `mlist` | danh mục phụ liệu (MATERIALS LIST) |
| `snapshot` | ảnh chụp dữ liệu người dùng |

## Dữ liệu người dùng lưu ở đâu

| Chỗ | Nội dung |
|---|---|
| `localStorage['yic.mes.sewing']` | mọi thay đổi trong module MAY (1 chuỗi JSON) |
| `localStorage['yic.mes.finishing']` | mọi thay đổi trong module HOÀN THIỆN |
| IndexedDB `yic.mes` | store `alertSound` (âm thanh cảnh báo) + `mlvFile` (file M-level) |

Ngoài ra `localStorage['yic.mes.<module>.noseed']` là cờ nội bộ — xem bên dưới.

## Đưa dữ liệu sang máy khác

Trong sidebar (bấm ☰) có mục **DỮ LIỆU LOCAL** với 4 nút:

- **Xuất ảnh chụp** — tải về `seed.js` của chính module đang mở: giữ nguyên phần
  dữ liệu nghiệp vụ, thay phần `snapshot` bằng toàn bộ localStorage + mọi file
  trong IndexedDB (blob mã hoá base64). Chép đè lên `seed.js` **cùng thư mục** rồi
  gửi cả thư mục đi. Máy nào mở lần đầu (localStorage còn trống) sẽ được nạp đúng
  dữ liệu đó.
- **Nhập ảnh chụp** — chọn một file `seed.js` / `.json` để ghi đè dữ liệu đang có.
- **Về ảnh chụp gốc** — nạp lại đúng phần `snapshot` trong `seed.js` (chỉ hiện khi
  seed có snapshot).
- **Xóa sạch** — xoá dữ liệu đã lưu và đặt cờ `noseed` để lần mở sau *không* nạp
  lại ảnh chụp nữa. Bấm **Về ảnh chụp gốc** để bỏ cờ này.

Hai module xuất / nhập độc lập — ảnh chụp của MAY không ảnh hưởng HOÀN THIỆN.

## Bộ sinh (`build/`) — không cần khi chạy app

```
build/
  assets/           NGUỒN của style.css + vendor; emit.js copy vào từng module
  data/             3 bảng sinh từ file Excel gốc — nguồn của seed
  parts/core-*.js   phần nền dùng chung, chèn vào cả hai script.js
  parts/sew-*.js    phần viết tay của MAY (MOD, constructor, hàm đọc seed…)
  parts/fin-*.js    phần viết tay của HOÀN THIỆN
  emit.js           dựng 2 thư mục module (script.js + style.css + vendor)
  seeds.js          sinh 2 file seed.js
  members.js        bản đồ thành viên của bản 1 file cũ
  legacy/script.js  bản 1 file trước khi tách, giữ lại để đối chiếu
  check.js          kiểm tra sau khi sinh
```

Sửa app:

| Muốn sửa | Sửa ở | Rồi chạy |
|---|---|---|
| logic riêng 1 module | `app/<module>/script.js` (ngoài mốc `---8<---`) | — |
| phần nền dùng chung | `build/parts/core-*.js` | `node build/emit.js` |
| `style.css` / `vendor/` | `build/assets/` | `node build/emit.js` |
| dữ liệu | bảng Excel → `build/data/` | `node build/seeds.js` |
| `index.html` | `app/<module>/index.html` (file viết tay) | — |

## Kiểm tra sau khi sửa

```
node build/check.js
```

Bắt 6 lớp lỗi mà mắt thường dễ bỏ qua:

- thư mục module thiếu file → gửi đi là người khác mở không lên
- `index.html` trỏ ra ngoài thư mục (`src="../…"`) → hết độc lập
- `this.X` gọi một hàm không có trong file
- `state.X` đọc một khóa mà constructor chưa khởi tạo
- `t('x')` gọi một khóa dịch không có trong `LMOD` lẫn `L`
- phần nền dùng chung / `style.css` / `vendor/` của hai module lệch nhau

cộng lỗi cú pháp của cả hai `script.js`.
