/* YIC MES — ảnh chụp dữ liệu người dùng (localStorage + IndexedDB).
 * ---------------------------------------------------------------------------
 * File này CHƯA có dữ liệu. Cách tạo:
 *
 *   1. Mở app trên máy đang có dữ liệu muốn giữ (app/index.html).
 *   2. Bấm nút ☰ ở góc trên bên trái để mở sidebar.
 *   3. Kéo xuống cuối sidebar, mục DỮ LIỆU LOCAL → bấm "Xuất ảnh chụp".
 *   4. Trình duyệt tải về state-seed.js. Chép đè file này bằng file vừa tải:
 *        app/data/state-seed.js
 *
 * Sau đó gửi nguyên thư mục đi. Máy nào mở app/index.html lần đầu (localStorage
 * còn trống) sẽ được nạp đúng dữ liệu trong file này — cả bảng biểu lẫn file âm
 * thanh cảnh báo / file M-level nằm trong IndexedDB.
 *
 * Không có file này (hoặc để nguyên như bên dưới) thì app vẫn chạy bình thường,
 * chỉ là khởi động bằng dữ liệu mẫu sinh từ data/psched.js + data/khc.js.
 */
window.MES_SEED = null;
