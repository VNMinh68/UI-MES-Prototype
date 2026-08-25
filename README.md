# YIC MES — UI Prototype

Bản prototype chạy hoàn toàn **offline, không cần cài gì**. Mọi thư viện (React,
XLSX, QR…) đã nằm sẵn trong `app/vendor/`.

## Chạy thử trên máy

Mở thẳng file:

```
app/index.html
```

bằng Chrome / Edge (double-click là được). Không cần server, không cần internet.

> Nếu trình duyệt chặn `file://`, chạy tạm một server tĩnh trong thư mục `app/`:
> `npx serve` hoặc `python -m http.server 8000` rồi mở `http://localhost:8000`.
> Lưu ý: `file://` và `http://localhost` là **hai kho dữ liệu khác nhau** — dữ liệu
> lưu ở bên này không thấy ở bên kia.

## Menu

| Nhóm | Màn hình |
|---|---|
| TỔNG QUAN | Dashboard sản xuất |
| KẾ HOẠCH SẢN XUẤT | Kế hoạch sản xuất (Gantt) |
| MAY | Kế hoạch may · Sản lượng may hàng ngày |
| HOÀN THIỆN | Nhận hàng hoàn thiện · Tình trạng hoàn thiện · Kế hoạch xuất hàng |

Luồng dữ liệu của nhóm HOÀN THIỆN:

```
Sản lượng may hàng ngày
  └─ phát hành phiếu bàn giao BG-YYYYMMDD-NNN
       └─ Nhận hàng hoàn thiện      ← xác nhận đã nhận từng phiếu
            └─ Tình trạng hoàn thiện ← Ủi → Kiểm cuối → Đóng gói → Nhập kho TP
                 └─ Kế hoạch xuất hàng ← cột SẴN SÀNG = số đã nhập kho TP
```

Mỗi công đoạn không vượt được số của công đoạn liền trước; sửa công đoạn trước
xuống thấp thì các công đoạn sau tự tụt theo.

## Dữ liệu lưu ở đâu

Toàn bộ dữ liệu người dùng nằm trong trình duyệt, đúng 2 chỗ:

| Chỗ | Nội dung |
|---|---|
| `localStorage['yic.sewplan.v2']` | Mọi bảng biểu, cấu hình, sản lượng, phiếu bàn giao… (1 chuỗi JSON) |
| IndexedDB `yic.mes` | store `alertSound` (file âm thanh cảnh báo) + `mlvFile` (file M-level đã nhập) |

Ngoài ra `localStorage['yic.mes.noseed']` là một cờ nội bộ — xem bên dưới.

## Đưa dữ liệu sang máy khác

Trong sidebar (bấm ☰) có mục **DỮ LIỆU LOCAL** với 4 nút:

- **Xuất ảnh chụp** — tải về `state-seed.js` gồm *toàn bộ* localStorage + mọi file
  trong IndexedDB (blob mã hoá base64). Chép đè file đó vào `app/data/state-seed.js`
  rồi gửi nguyên thư mục đi. Máy nào mở app lần đầu (localStorage còn trống) sẽ
  được nạp đúng dữ liệu đó — kể cả file âm thanh và file M-level.
- **Nhập ảnh chụp** — chọn một file `state-seed.js` / `.json` để ghi đè dữ liệu
  đang có (dùng khi không muốn sửa file trong thư mục).
- **Về ảnh chụp gốc** — nạp lại đúng nội dung `app/data/state-seed.js`.
- **Xóa sạch** — xoá dữ liệu đã lưu và đặt cờ `yic.mes.noseed` để lần mở sau
  *không* nạp lại ảnh chụp nữa. Bấm **Về ảnh chụp gốc** để bỏ cờ này.

`app/data/state-seed.js` hiện đang là bản trống (`window.MES_SEED = null`), app
vẫn chạy bình thường bằng dữ liệu mẫu sinh từ `data/psched.js` + `data/khc.js`.

## Cấu trúc thư mục

```
app/
  index.html                    khung trang, nạp vendor → data → script.js
  script.js                     toàn bộ logic (1 React component)
  style.css                     font + style tĩnh
  data/psched.js                kế hoạch sản xuất (nguồn của Gantt & kế hoạch may)
  data/khc.js                   tác nghiệp cắt
  data/state-seed.js            ảnh chụp dữ liệu người dùng (tuỳ chọn)
  vendor/                       react, react-dom, anime, xlsx, qr
```
