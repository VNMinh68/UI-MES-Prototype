# YIC MES — UI Prototype

Bản prototype chạy hoàn toàn **offline, không cần cài gì**. Mọi thư viện (React,
XLSX…) đã nằm sẵn trong `app/vendor/`.

App được tách thành **2 module độc lập**, mỗi module là một trang riêng, một kho
dữ liệu riêng và một file seed riêng:

| Module | Màn hình | Mở ở |
|---|---|---|
| **MAY** | Kế hoạch may · Sản lượng may hàng ngày | `app/sewing/index.html` |
| **HOÀN THIỆN** | Nhận hàng hoàn thiện · Tình trạng hoàn thiện · Kế hoạch xuất hàng | `app/finishing/index.html` |

## Chạy thử trên máy

Mở `app/index.html` (trang chọn module) bằng Chrome / Edge — double-click là được.
Không cần server, không cần internet.

> Nếu trình duyệt chặn `file://`, chạy tạm một server tĩnh trong thư mục `app/`:
> `npx serve` hoặc `python -m http.server 8000` rồi mở `http://localhost:8000`.
> Lưu ý: `file://` và `http://localhost` là **hai kho dữ liệu khác nhau** — dữ liệu
> lưu ở bên này không thấy ở bên kia.

## Cấu trúc thư mục

```
app/
  index.html              trang chọn module
  style.css               CSS DÙNG CHUNG cho cả app (font + style tĩnh)
  shared/core.js          nền dùng chung: shell, sidebar, dịch VI/EN, lưu
                          localStorage, ảnh chụp dữ liệu, phiếu bàn giao
  sewing/
    index.html            nạp vendor → seed.js → shared/core.js → script.js
    script.js             logic riêng của MAY
    seed.js               dữ liệu của MAY
  finishing/
    index.html
    script.js             logic riêng của HOÀN THIỆN
    seed.js               dữ liệu của HOÀN THIỆN
  vendor/                 react, react-dom, anime, xlsx, xlsx-style

build/                    bộ sinh — không cần khi chạy app
  data/                   3 bảng sinh từ file Excel gốc (nguồn của seed)
  seeds.js                sinh 2 file seed.js
  emit.js, members.js     bộ tách bản 1 file cũ thành module (chạy 1 lần)
  parts/                  phần viết tay được chèn vào lúc tách
  legacy/script.js        bản 1 file trước khi tách, giữ lại để đối chiếu
  check.js                kiểm tra sau khi tách
```

## Module không đọc dữ liệu của nhau

Trước đây mọi màn hình dùng chung một `state`, nên Hoàn thiện đọc thẳng phiếu bàn
giao mà Sản lượng may vừa phát hành. Sau khi tách, **liên kết đó bị cắt**:

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
  trong IndexedDB (blob mã hoá base64). Chép đè file đó vào
  `app/<module>/seed.js` rồi gửi nguyên thư mục đi. Máy nào mở module lần đầu
  (localStorage còn trống) sẽ được nạp đúng dữ liệu đó.
- **Nhập ảnh chụp** — chọn một file `seed.js` / `.json` để ghi đè dữ liệu đang có.
- **Về ảnh chụp gốc** — nạp lại đúng phần `snapshot` trong `seed.js` (chỉ hiện khi
  seed có snapshot).
- **Xóa sạch** — xoá dữ liệu đã lưu và đặt cờ `noseed` để lần mở sau *không* nạp
  lại ảnh chụp nữa. Bấm **Về ảnh chụp gốc** để bỏ cờ này.

Hai module xuất / nhập độc lập — ảnh chụp của MAY không ảnh hưởng HOÀN THIỆN.

## Sinh lại seed

Sửa bảng Excel gốc → sinh lại 3 file trong `build/data/` → chạy:

```
node build/seeds.js      # -> app/sewing/seed.js + app/finishing/seed.js
```

`build/seeds.js` chứa bản copy nguyên văn các hàm suy diễn của app (tách mã hàng,
đoán thương hiệu, sinh tác nghiệp cắt…), nên số liệu đóng băng trong seed trùng
khớp với số liệu app tính tại chỗ trước khi tách.

## Kiểm tra sau khi sửa

```
node build/check.js
```

Bắt 4 lớp lỗi mà mắt thường dễ bỏ qua khi chia file:

- `this.X` gọi một hàm không có ở module lẫn `shared/core.js`
- `state.X` đọc một khóa mà constructor chưa khởi tạo
- `t('x')` gọi một khóa dịch không có trong `LMOD` lẫn `L`
- lỗi cú pháp của cả 3 file

`build/emit.js` là bộ tách bản 1 file cũ thành module — chỉ cần khi muốn tách lại
từ `build/legacy/script.js`. Sửa app hằng ngày thì sửa thẳng trong `app/`.
