# YIC MES — UI Prototype

Bản prototype chạy hoàn toàn **offline, không cần cài gì**.

App gồm **3 module, mỗi module là một thư mục chạy độc lập**. Gửi *một* thư mục
cho ai đó là họ mở được ngay — không cần file nào bên ngoài, không cần server,
không cần internet:

| Module | Màn hình | Thư mục |
|---|---|---|
| **MAY** | Kế hoạch may · Sản lượng may hàng ngày | `app/sewing/` |
| **HOÀN THIỆN** | Nhận hàng hoàn thiện · Tình trạng hoàn thiện · Kế hoạch xuất hàng | `app/finishing/` |
| **XUẤT NPL** | Xuất vải · Xuất phụ liệu | `app/material-out/` |

## Chạy thử

Double-click `index.html` trong thư mục module muốn mở:

```
app/sewing/index.html
app/finishing/index.html
app/material-out/index.html
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

app/material-out/
  index.html
  script.js       nền dùng chung + logic của XUẤT NPL
  seed.js         dữ liệu của XUẤT NPL
  style.css
  vendor/         react, react-dom, xlsx
```

Không có thư mục `shared/`, không có trang chọn module. Mỗi `script.js` tự chứa cả
phần nền (shell, sidebar, dịch VI/EN, lưu localStorage, ảnh chụp dữ liệu, phiếu
bàn giao) lẫn logic riêng của module — đổi lấy việc thư mục gửi đi là chạy được.

Phần nền nằm giữa các mốc `---8<---` trong `script.js` là **bản copy giống nhau
từng byte** ở cả ba module. Nó do `build/emit.js` sinh ra từ
`build/parts/core-*.js`; sửa tay trong `app/` thì các bản lệch nhau và
`build/check.js` báo lỗi ngay.

## Module không đọc dữ liệu của nhau

Trước đây mọi màn hình dùng chung một `state`, nên Hoàn thiện đọc thẳng phiếu bàn
giao mà Sản lượng may vừa phát hành. Giờ **liên kết đó bị cắt**:

| | MAY | HOÀN THIỆN | XUẤT NPL |
|---|---|---|---|
| localStorage | `yic.mes.sewing` | `yic.mes.finishing` | `yic.mes.material` |
| Seed | `app/sewing/seed.js` | `app/finishing/seed.js` | `app/material-out/seed.js` |

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

XUẤT NPL
  seed.fabric ─ Xuất vải   ← 1 dòng = 1 lượt cắt trong 1 ngày
       │  SỐ YARD CẦN CẤP = SL sản phẩm của lượt × định mức + đầu bàn
       ├─ kho gõ thẳng vào dòng: SỐ YARD THỰC CẤP · LOT VẢI · SỐ CÂY
       └─ bấm Cấp vải → chọn cuộn trong seed.rolls → phiếu WC-yyyymmdd-index
             Balance = Length − Issued; cấp xong 3 cột trên tự điền
  seed.trims  ─ Xuất phụ liệu   ← cùng khuôn: SL CẦN = định mức × SL × hao
       └─ bấm Xuất kho → chọn kiện trong seed.packs → phiếu WS-yyyymmdd-index
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

`app/material-out/seed.js` → `window.MATERIAL_SEED`

| Khóa | Nội dung |
|---|---|
| `fabric` | 99 lượt cắt (01/08 → 24/09/2026), rải từ tác nghiệp cắt theo tiến độ chuyền — màn Xuất vải |
| `rolls` | 903 cuộn vải trong kho (`length` / `issued`, Balance = hiệu hai số) — hộp chọn cuộn để cấp |
| `trims` | 141 dòng phụ liệu theo (mã hàng \| PO \| mã phụ liệu) — màn Xuất phụ liệu |
| `packs` | 562 kiện phụ liệu trong kho (`qty` / `issued`) — hộp chọn kiện để xuất |
| `snapshot` | ảnh chụp dữ liệu người dùng |

## Dữ liệu người dùng lưu ở đâu

| Chỗ | Nội dung |
|---|---|
| `localStorage['yic.mes.sewing']` | mọi thay đổi trong module MAY (1 chuỗi JSON) |
| `localStorage['yic.mes.finishing']` | mọi thay đổi trong module HOÀN THIỆN |
| `localStorage['yic.mes.material']` | mọi thay đổi trong module XUẤT NPL |
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

Ba module xuất / nhập độc lập — ảnh chụp của MAY không ảnh hưởng HOÀN THIỆN hay
XUẤT NPL.

## Bộ sinh (`build/`) — không cần khi chạy app

```
build/
  assets/           NGUỒN của style.css + vendor; emit.js copy vào từng module
  data/             3 bảng sinh từ file Excel gốc — nguồn của seed
  parts/core-*.js   phần nền dùng chung, chèn vào cả ba script.js
  parts/sew-*.js    phần viết tay của MAY (MOD, constructor, hàm đọc seed…)
  parts/fin-*.js    phần viết tay của HOÀN THIỆN
  parts/mat-*.js    TOÀN BỘ module XUẤT NPL (kể cả bảng dịch mat-lang.js)
  emit.js           dựng 3 thư mục module (script.js + style.css + vendor)
  seeds.js          sinh 3 file seed.js
  members.js        bản đồ thành viên của bản 1 file cũ
  legacy/script.js  bản 1 file trước khi tách, giữ lại để đối chiếu
  check.js          kiểm tra sau khi sinh
```

Sửa app:

MAY và HOÀN THIỆN được **cắt ra** từ `build/legacy/script.js`; XUẤT NPL không có
trong bản 1 file cũ nên nằm trọn trong `build/parts/mat-*.js`.

| Muốn sửa | Sửa ở | Rồi chạy |
|---|---|---|
| logic MAY / HOÀN THIỆN | `app/<module>/script.js` (ngoài mốc `---8<---`) | — |
| logic XUẤT NPL | `build/parts/mat-glue.js` · `mat-lang.js` | `node build/emit.js` |
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
- phần nền dùng chung / `style.css` / `vendor/` của các module lệch nhau

cộng lỗi cú pháp của cả ba `script.js`.
