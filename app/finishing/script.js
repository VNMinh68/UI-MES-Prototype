/* YIC MES · HOAN THIEN (FINISHING) — logic rieng cua module.
 * ---------------------------------------------------------------------------
 * Ba man hinh:
 *   Nhan hang hoan thien     (page 'finIn')  — 2 tab: hang may / phu lieu
 *   Tinh trang hoan thien    (page 'finSt')  — Ui -> Kiem cuoi -> Dong goi -> Nhap kho TP
 *   Ke hoach xuat hang       (page 'fgShip') — lo xuat theo ma hang · PO
 *
 * Du lieu vao: app/finishing/seed.js (window.FINISHING_SEED). Phieu ban giao
 * BG-… nam san trong seed (`slips`) — module KHONG doc state cua module MAY nua.
 *
 *   slips  -> xac nhan nhan tung to        (state.finRecv)
 *          -> 4 cong doan                  (state.finStage)
 *          -> lo xuat theo ma hang · PO    (state.fgRows)
 *
 * Moi cong doan khong vuot duoc so cua cong doan lien truoc; sua cong doan truoc
 * xuong thap thi cac cong doan sau tu tut theo.
 *
 * Nap sau app/shared/core.js (xem index.html).
 */
(function () {
  'use strict';

  var RT = window.MESRuntime;
  if (!RT || !window.MESCore) { throw new Error('shared/core.js must load before finishing/script.js'); }
  var React = RT.React, RD = RT.RD;

  var SEED = window.FINISHING_SEED || {};
  window.MES_SEED_DATA = SEED;                 // nguon cho nut "Xuat anh chup"
  window.MES_SEED = SEED.snapshot || null;     // anh chup du lieu nguoi dung (co the null)

class Finishing extends window.MESCore {

  LMOD = {
    vi:{
      fiTitle:'Nhận Hàng Sang Hoàn Thiện',
      fiPanel:'Phiếu Bàn Giao Từ May',
      fiSub:'Mỗi phiếu bàn giao phát hành ở Sản lượng may hàng ngày về đây để hoàn thiện xác nhận đã nhận hàng',
      fiK1:'CHỜ NHẬN',
      fiK1s:'phiếu bàn giao chưa xác nhận',
      fiK2:'SL CHỜ NHẬN',
      fiK2s:'pcs đang trên đường sang hoàn thiện',
      fiK3:'NHẬN HÔM NAY',
      fiK3s:'pcs đã nhận trong ngày',
      fiK4:'TỔNG ĐÃ NHẬN',
      fiK4s:'pcs đã vào hoàn thiện',
      fiNo:'SỐ PHIẾU',
      fiWhen:'PHÁT HÀNH LÚC',
      fiLine:'CHUYỀN',
      fiStyle:'MÃ HÀNG',
      fiPo:'PO',
      fiColor:'MÀU',
      fiSizes:'SIZE',
      fiQty:'SL (PCS)',
      fiSt:'TRẠNG THÁI',
      fiBy:'NGƯỜI NHẬN',
      fiAct:'HÀNH ĐỘNG',
      fiWait:'Chờ nhận',
      fiDone:'Đã nhận',
      fiRecv:'Nhận',
      fiUnrecv:'Bỏ nhận',
      fiView:'Xem phiếu',
      fiRecvAll:'Nhận tất cả',
      fiByTip:'Lấy từ ô "Người nhận (Hoàn thiện)" trên phiếu bàn giao',
      fiCount:'phiếu bàn giao',
      fiGPanel:'Hàng May Nhận Vào',
      fiGSub:'Một dòng cho mỗi chuyền · mã hàng · PO · màu — bấm 1 dòng để xem các phiếu bàn giao và xác nhận nhận hàng',
      fiOrd:'SL ĐƠN HÀNG',
      fiRecvd:'ĐÃ NHẬN',
      fiHand:'ĐÃ BÀN GIAO',
      fiRowTip:'Bấm để xem các phiếu bàn giao của dòng này',
      fiDetail:'Chi tiết',
      fiGCount:'dòng',
      fiGSearch:'Tìm chuyền, mã hàng, PO, màu…',
      fiGNoHit:'Không có dòng nào khớp từ khóa',
      fiGEmpty:'Chưa có dòng nào — seed của module chưa có phiếu bàn giao nào.',
      fiMdEmpty:'Dòng này chưa có phiếu bàn giao nào — sang MAY · Sản lượng may hàng ngày để phát hành phiếu.',
      fiShortTip:'Còn thiếu so với SL đơn hàng',
      fiOverTip:'Nhận vượt SL đơn hàng',
      fiTab1:'Hàng may',
      fiTab2:'Phụ liệu hoàn thiện',
      ftPanel:'Phụ Liệu Hoàn Thiện Nhận Vào',
      ftSub:'Một dòng cho mỗi mã hàng · PO — SL đơn hàng là tổng SL cần của phụ liệu loại TRIMS trong danh mục, SL thực nhận gõ trong chính danh mục đó khi phụ liệu về kho',
      ftK1:'SL ĐƠN HÀNG',
      ftK1s:'pcs phụ liệu theo đơn',
      ftK2:'THỰC NHẬN',
      ftK2s:'pcs phụ liệu đã nhận',
      ftK3:'CÒN THIẾU',
      ftK3s:'pcs chưa nhận đủ',
      ftK4:'ĐỦ HÀNG',
      ftK4s:'dòng đã nhận đủ SL đơn',
      ftBrand:'THƯƠNG HIỆU',
      ftStyle:'MÃ HÀNG',
      ftPo:'PO#',
      ftQtyO:'SL ĐƠN HÀNG',
      ftQtyA:'SL THỰC NHẬN',
      ftCount:'dòng phụ liệu',
      ftSearch:'Tìm thương hiệu, mã hàng, PO…',
      ftNoHit:'Không có dòng nào khớp từ khóa',
      ftEmpty:'Chưa có dòng phụ liệu nào — bấm Gieo lại từ kế hoạch để lấy đơn hàng về.',
      ftReseed:'Gieo lại từ seed',
      ftReseedAsk:'Gieo lại bảng phụ liệu từ seed của module? Mọi SL thực nhận đã nhập sẽ mất.',
      ftShortTip:'Còn thiếu so với SL đơn hàng',
      ftOverTip:'Nhận vượt SL đơn hàng',
      ftPickTip:'Bấm để gõ SL nhận cho từng phụ liệu trong danh mục',
      ftOrdTip:'Tổng SL cần của mọi phụ liệu loại TRIMS trong danh mục phụ liệu',
      ftPickSub:'Danh mục phụ liệu · đã lọc loại TRIMS',
      ftPickCellTip:'Gõ SL nhận của phụ liệu này — Xác nhận thì tổng bay ra ô SL THỰC NHẬN',
      ftPickLn:'dòng',
      ftPickFoot:'Tổng',
      ftPickT:'Phụ Liệu Nhận Vào',
      ftPickQty:'TỔNG SL NHẬN',
      ftPickQtyS:'sẽ vào ô SL THỰC NHẬN',
      ftPickOrd:'SL ĐƠN HÀNG',
      ftPickOrdS:'tổng SL cần của phụ liệu TRIMS',
      ftPickDif:'CHÊNH LỆCH',
      ftPickDifS:'so với SL đơn hàng',
      ftPickMix:'Đang gộp nhiều đơn vị:',
      ftPickEmpty:'Danh mục phụ liệu chưa có dòng nào loại TRIMS — kiểm tra data/mlist.js.',
      ftPickOk:'Xác nhận',
      ftPickSrc:'Nguồn:',
      mlKind:'LOẠI',
      mlItem:'ITEM#',
      mlDesc:'MÔ TẢ PHỤ LIỆU',
      mlSize:'KHỔ / SIZE',
      mlColor:'MÀU PHỤ LIỆU',
      mlUnit:'ĐVỊ',
      mlNeed:'SL CẦN',
      mlShipQ:'ĐÃ GỬI',
      mlArr:'NGÀY VỀ KHO',
      mlSup:'NCC',
      mlRecv:'SL NHẬN',
      mlBal:'CHÊNH LỆCH',
      fsTitle:'Tình Trạng Hoàn Thiện',
      fsPanel:'Tình Trạng Đóng Gói · Xuất Hàng',
      fsSub:'Hàng đã nhận vào hoàn thiện — đã đóng gói, chưa đóng gói, đã xuất và tồn kho. SL đơn · Đã xuất · Tồn kho lọc theo đúng mã hàng · PO · màu bên Kế hoạch xuất hàng',
      fsK1:'ĐÃ NHẬN',
      fsK1s:'pcs hoàn thiện đã nhận',
      fsK2:'CHƯA ĐÓNG GÓI',
      fsK2s:'pcs đã nhận nhưng chưa đóng gói',
      fsK3:'ĐÃ ĐÓNG GÓI',
      fsK3s:'pcs qua công đoạn đóng gói',
      fsK4:'TỒN KHO',
      fsK4s:'pcs đã đóng gói chưa xuất',
      fsCLine:'CHUYỀN',
      fsCBrand:'KHÁCH HÀNG',
      fsCStyle:'MÃ HÀNG',
      fsCPo:'PO#',
      fsCColor:'MÀU',
      fsCOrder:'SL ĐƠN',
      fsCPacked:'ĐÃ ĐÓNG GÓI',
      fsCUnpack:'CHƯA ĐÓNG GÓI',
      fsCPackY:'HÔM QUA',
      fsCPackT:'HÔM NAY',
      fsCPackC:'TỔNG LŨY KẾ',
      fsCOrderC:'SL THÙNG ĐƠN HÀNG',
      fsCPackedC:'THÙNG ĐÃ ĐÓNG',
      fsCUnpackC:'THÙNG CHƯA ĐÓNG',
      fsCShip:'ĐÃ XUẤT',
      fsCStock:'TỒN KHO',
      fsCRemark:'GHI CHÚ',
      fsPoTip:'Lấy ở dòng Kế hoạch xuất hàng khớp cả mã hàng · PO · màu — mấy màu dùng chung một dòng thì chỉ hiện ở dòng đầu',
      fsNoFgTip:'Chưa có dòng Kế hoạch xuất hàng nào khớp mã hàng · PO · màu này — sang Kế hoạch xuất hàng thêm dòng, hoặc bấm Nạp lại từ seed',
      fsPackAuto:'Tự sinh từ số thùng đã đóng —',
      fsPcsCtn:'cái/thùng (tỷ lệ tạm)',
      fsPackYTip:'Tự sinh từ số thùng đóng hôm qua — ngày đã chốt',
      fsPackCTip:'Tự sinh từ tổng số thùng đã đóng',
      fsPackOverTip:'Vượt số đã nhận về hoàn thiện — tỷ lệ cái/thùng đang sai, hoặc số thùng ghi nhầm',
      fsCtnOrdTip:'Số thùng theo đơn hàng của mã hàng · PO · màu này — nhập tay, không suy ra được từ dữ liệu nào khác',
      fsCtnTip:'Số thùng đóng hôm nay — sửa được',
      fsCtnCap:'còn',
      fsCtnYTip:'Số thùng đóng hôm qua — ngày đã chốt, không sửa ở đây',
      fsCtnCTip:'Cộng số thùng của mọi ngày đã ghi',
      fsCtnUTip:'SL thùng đơn hàng trừ số thùng đã đóng — chưa nhập SL thùng đơn hàng thì để trống',
      fsCtnOverTip:'Đã đóng vượt SL thùng đơn hàng — sửa lại SL thùng đơn hàng hoặc số thùng của từng ngày',
      fsCAct:'HÀNH ĐỘNG',
      fsScanBtn:'Quét mã',
      fsScanTip:'Quét mã vạch từng thùng — đối chiếu với danh sách barcode đã nhập ở Kế hoạch xuất hàng',
      fsScanNoBc:'Lô xuất của dòng này chưa có danh sách barcode — sang Kế hoạch xuất hàng nhập packing list rồi nhập barcode',
      fsScanTitle:'QUÉT MÃ VẠCH ĐÓNG THÙNG',
      fsScanPh:'Quét hoặc gõ mã vạch rồi Enter…',
      fsScanDone:'thùng đã quét',
      fsScanOk:'Đã ghi',
      fsScanDup:'Mã này đã quét lúc',
      fsScanBad:'Mã không có trong danh sách barcode của lô xuất này',
      fsScanLogL:'Đã quét ở dòng này',
      fsScanNone:'Chưa quét mã nào',
      fsScanUndo:'Bỏ lần quét này',
      fsScanHint:'Máy quét gõ xong tự Enter — cứ quét liên tục, ô nhập tự xóa sau mỗi mã',
      fsCtnScanT:'thùng từ quét mã',
      fsCtnManT:'thùng gõ tay',
      fsRemarkPh:'Ghi chú…',
      fsIron:'ỦI',
      fsQc:'KIỂM CUỐI',
      fsPack:'ĐÓNG GÓI',
      fsFg:'NHẬP KHO TP',
      fsCount:'nhóm hàng',
      fsSearch:'Tìm mã hàng, PO, màu, chuyền…',
      fsNoHit:'Không có dòng nào khớp từ khóa',
      fsEmpty:'Chưa nhận hàng nào — sang Nhận hàng hoàn thiện để xác nhận phiếu bàn giao.',
      fgTitle:'Kế Hoạch Xuất Hàng Thành Phẩm',
      fgPanel:'Lô Xuất Theo Mã Hàng · PO',
      fgSub:'1 dòng cho mỗi mã hàng · PO — cột MÀU gom mọi màu của lô, lấy ở BẢNG TỔNG THEO MÀU của tác nghiệp cắt; SL đã xuất, ngày đóng hàng, phương thức, điểm đến và CBM nhập tay',
      fgK1:'TỔNG ĐƠN',
      fgK1s:'pcs theo kế hoạch xuất',
      fgK2:'SẴN SÀNG',
      fgK2s:'pcs thành phẩm đã nhập kho',
      fgK3:'ĐÃ XUẤT',
      fgK3s:'pcs đã lên container',
      fgK4:'TRỄ ETD',
      fgK4s:'lô đã quá ngày xuất dự kiến',
      fgNo:'STT',
      fgBrand:'THƯƠNG HIỆU',
      fgSeason:'MÙA',
      fgFactory:'NHÀ MÁY',
      fgStyle:'MÃ HÀNG',
      fgPo:'PO#',
      fgColor:'MÀU',
      fgQty:'SL ĐƠN HÀNG',
      fgShipped:'SL ĐÃ XUẤT',
      fgBal:'SL CÂN ĐỐI',
      fgLoad:'NGÀY ĐÓNG HÀNG',
      fgEtd:'ETD',
      fgMode:'PHƯƠNG THỨC',
      fgDest:'ĐIỂM ĐẾN',
      fgCbm:'CBM',
      fgNote:'GHI CHÚ',
      fgAdd:'Thêm lô xuất',
      fgCount:'lô xuất',
      fgReseed:'Nạp lại từ seed',
      fgReseedAsk:'Nạp lại toàn bộ lô xuất từ seed của module? Mọi chỉnh sửa tay ở bảng này sẽ mất.',
      fgPkImp:'Packing list',
      fgPkTip:'Nhập packing list (.xlsx/.xls/.csv) của lô này — lấy tổng số thùng, đổ sang cột SL THÙNG ĐƠN HÀNG ở Tình trạng hoàn thiện',
      fgPkHas:'Đã có packing list — bấm để nhập file khác',
      fgPkClr:'Bỏ packing list (bỏ luôn barcode của lô này)',
      fgPkOk:'Đã nhập packing list —',
      fgPkCtn:'thùng',
      fgPkNone:'Không tìm thấy số thùng trong file. Cần có cột SỐ THÙNG / CARTON NO, hoặc cột SL THÙNG, hoặc ô TỔNG SỐ THÙNG.',
      fgBcImp:'Barcode',
      fgBcTip:'Nhập file barcode đóng thùng (.xlsx/.xls/.csv) — danh sách mã lưu lại cho bảng Tình trạng hoàn thiện',
      fgBcHas:'Đã có barcode — bấm để nhập file khác',
      fgBcClr:'Bỏ danh sách barcode của lô này',
      fgBcNeed:'Phải nhập packing list trước rồi mới nhập được barcode',
      fgBcOk:'Đã nhập barcode —',
      fgBcN:'mã',
      fgBcCut:'mã (đã cắt bớt phần vượt)',
      fgBcNone:'Không tìm thấy mã barcode nào trong file. Cần có cột BARCODE / MÃ VẠCH / UPC / EAN.',
      fgMdPanel:'Chi Tiết Lô Xuất',
      fgMdSub:'Thông tin lô xuất + packing list bung ra theo từng thùng',
      fgMdOpen:'Bấm vào dòng để mở chi tiết lô xuất',
      fgPkFile:'FILE PACKING LIST',
      fgBcFile:'FILE BARCODE',
      fgNoFile:'chưa nhập',
      fgPkLn:'dòng packing list',
      fgPkPcs:'TỔNG PCS',
      fgPkGw:'TỔNG GW (KG)',
      fgPkNw:'TỔNG NW (KG)',
      fgPkCbm:'TỔNG CBM',
      fgPkCtnN:'TỔNG THÙNG',
      fgDCtn:'SỐ THÙNG',
      fgDSize:'SIZE / TRỌNG LƯỢNG',
      fgDQc:"SL PCS/THÙNG",
      fgDGw:'GW/THÙNG (KG)',
      fgDNw:'NW/THÙNG (KG)',
      fgDBox:'KÍCH THƯỚC THÙNG (CM)',
      fgDCbm:'CBM/THÙNG',
      fgDBc:'BARCODE',
      fgDEmpty:'Chưa có packing list — bấm nút Packing list ở trên để nhập file.',
      fgDNone:'Không đọc được chi tiết đóng thùng trong file. Cần hàng tiêu đề có SỐ THÙNG (FIRST BOX ~ LAST BOX / BOX QUANTITY) và cột SL PCS/THÙNG.',
      fgPgPrev:'‹ Trước',
      fgPgNext:'Sau ›',
      fgPgOf:'trên',
      fgPgSize:'thùng/trang',
      fgPgShow:'Đang xem',
      fgPgPage:'Trang',
      fsCtnOrdPk:'Lấy từ packing list',
      fsCtnBcTip:'Số barcode đã nhập cho lô xuất này',
      fgSearch:'Tìm thương hiệu, mã hàng, PO, màu, điểm đến, ETD…',
      fgNoHit:'Không có lô nào khớp từ khóa',
      fgEmpty:'Chưa có lô xuất nào — bấm Nạp lại từ seed hoặc Thêm lô xuất.' },
    en:{
      fiTitle:'Finishing In — Receiving',
      fiPanel:'Handover Slips From Sewing',
      fiSub:'Every handover slip issued in Daily Sewing Output lands here for finishing to confirm receipt',
      fiK1:'AWAITING',
      fiK1s:'slips not confirmed yet',
      fiK2:'QTY AWAITING',
      fiK2s:'pcs on the way to finishing',
      fiK3:'RECEIVED TODAY',
      fiK3s:'pcs received today',
      fiK4:'TOTAL RECEIVED',
      fiK4s:'pcs taken into finishing',
      fiNo:'SLIP NO.',
      fiWhen:'ISSUED AT',
      fiLine:'LINE',
      fiStyle:'STYLE #',
      fiPo:'PO',
      fiColor:'COLOUR',
      fiSizes:'SIZES',
      fiQty:'QTY (PCS)',
      fiSt:'STATUS',
      fiBy:'RECEIVED BY',
      fiAct:'ACTIONS',
      fiWait:'Awaiting',
      fiDone:'Received',
      fiRecv:'Receive',
      fiUnrecv:'Un-receive',
      fiView:'View slip',
      fiRecvAll:'Receive all',
      fiByTip:'Taken from the "Received by (Finishing)" field on the handover slip',
      fiCount:'handover slips',
      fiGPanel:'Garment Received From Sewing',
      fiGSub:'One row per line · style · PO · colour — tap a row to see its handover slips and confirm receipt',
      fiOrd:'ORDERED',
      fiRecvd:'RECEIVED',
      fiHand:'HANDED OVER',
      fiRowTip:'Tap to see the handover slips of this row',
      fiDetail:'Detail',
      fiGCount:'rows',
      fiGSearch:'Search line, style, PO, colour…',
      fiGNoHit:'No row matches the search',
      fiGEmpty:'No row yet — the module seed has no handover slip.',
      fiMdEmpty:'No handover slip on this row yet — go to SEWING · Daily Sewing Output to issue one.',
      fiShortTip:'Short against the ordered quantity',
      fiOverTip:'Received over the ordered quantity',
      fiTab1:'Garment',
      fiTab2:'Finishing trims',
      ftPanel:'Finishing Trims Received',
      ftSub:'One row per style · PO — order quantity is the total need of every TRIMS item on the materials list; actual quantity is keyed into that same list as the trims arrive',
      ftK1:'ORDER QTY',
      ftK1s:'pcs of trims on order',
      ftK2:'ACTUAL QTY',
      ftK2s:'pcs of trims received',
      ftK3:'SHORT',
      ftK3s:'pcs still outstanding',
      ftK4:'COMPLETE',
      ftK4s:'rows received in full',
      ftBrand:'BRAND',
      ftStyle:'STYLE',
      ftPo:'PO#',
      ftQtyO:'ORDER QTY',
      ftQtyA:'ACTUAL QTY',
      ftCount:'trim rows',
      ftSearch:'Search brand, style, PO…',
      ftNoHit:'No row matches the search',
      ftEmpty:'No trim row yet — hit Reseed from plan to pull the orders in.',
      ftReseed:'Reseed from seed',
      ftReseedAsk:'Reseed the trims table from the module seed? Every actual quantity keyed in will be lost.',
      ftShortTip:'Short against the order quantity',
      ftOverTip:'Received over the order quantity',
      ftPickTip:'Click to key in the received qty of each trim on the materials list',
      ftOrdTip:'Total need of every TRIMS item on the materials list',
      ftPickSub:'Materials list · filtered to TYPE = TRIMS',
      ftPickCellTip:'Key in the received qty of this trim — Confirm sends the total to the ACTUAL QTY cell',
      ftPickLn:'rows',
      ftPickFoot:'Total',
      ftPickT:'Trims Received',
      ftPickQty:'TOTAL RECEIVED',
      ftPickQtyS:'goes into the ACTUAL QTY cell',
      ftPickOrd:'ORDER QTY',
      ftPickOrdS:'total need of the TRIMS items',
      ftPickDif:'DIFFERENCE',
      ftPickDifS:'against the order quantity',
      ftPickMix:'Mixing units:',
      ftPickEmpty:'No TRIMS row on the materials list — check data/mlist.js.',
      ftPickOk:'Confirm',
      ftPickSrc:'Source:',
      mlKind:'TYPE',
      mlItem:'ITEM#',
      mlDesc:'ITEM DESCRIPTION',
      mlSize:'WIDTH / SIZE',
      mlColor:'MATERIALS COLOR',
      mlUnit:'UNIT',
      mlNeed:'TOTAL NEED',
      mlShipQ:'SHIPPED',
      mlArr:'ARRIVED W/H',
      mlSup:'SUPPLIER',
      mlRecv:'RECEIVED QTY',
      mlBal:'BALANCE',
      fsTitle:'Finishing Status',
      fsPanel:'Packing · Shipment Status',
      fsSub:'Goods received into finishing — packed, un-packed, shipped and in stock. Order / Shipped / Stock are filtered on the matching style · PO · colour in the F.G Shipment Plan',
      fsK1:'RECEIVED',
      fsK1s:'pcs received into finishing',
      fsK2:'UN-PACKED',
      fsK2s:'pcs received but not packed',
      fsK3:'PACKED',
      fsK3s:'pcs through the packing stage',
      fsK4:'STOCK',
      fsK4s:'pcs packed but not shipped',
      fsCLine:'Line',
      fsCBrand:'Brand',
      fsCStyle:'Style',
      fsCPo:'PO#',
      fsCColor:'Color',
      fsCOrder:'Order Qty',
      fsCPacked:'Packed Qty',
      fsCUnpack:'Un-Packed Qty',
      fsCPackY:'Yesterday',
      fsCPackT:'Today',
      fsCPackC:'Cumulative',
      fsCOrderC:'Ordered Carton Qty',
      fsCPackedC:'Packed Carton Qty',
      fsCUnpackC:'Un-Packed Carton Qty',
      fsCShip:'Shipped Qty',
      fsCStock:'Stock Qty',
      fsCRemark:'Remark',
      fsPoTip:'From the F.G Shipment row matching style · PO · colour — when several colours share one row the figure shows on the first of them',
      fsNoFgTip:'No F.G Shipment row matches this style · PO · colour — add one there, or hit Reseed from plan',
      fsPackAuto:'Auto from packed cartons —',
      fsPcsCtn:'pcs per carton (placeholder ratio)',
      fsPackYTip:'Auto from the cartons packed yesterday — that day is closed',
      fsPackCTip:'Auto from every packed carton',
      fsPackOverTip:'More than was received into finishing — the pcs-per-carton ratio is off, or a carton count is wrong',
      fsCtnOrdTip:'Cartons ordered for this style · PO · colour — keyed in, nothing in the app derives it',
      fsCtnTip:'Cartons packed today — editable',
      fsCtnCap:'remaining',
      fsCtnYTip:'Cartons packed on the previous calendar day — that day is closed, not editable here',
      fsCtnCTip:'Every logged day of cartons added up',
      fsCtnUTip:'Ordered cartons minus packed cartons — blank until an ordered carton qty is keyed in',
      fsCtnOverTip:'Packed beyond the ordered carton qty — fix the ordered qty or a daily carton count',
      fsCAct:'ACTIONS',
      fsScanBtn:'Scan',
      fsScanTip:'Scan each carton barcode — checked against the barcode list imported in the F.G Shipment Plan',
      fsScanNoBc:'This row’s shipment has no barcode list yet — import a packing list then the barcodes in the F.G Shipment Plan',
      fsScanTitle:'CARTON BARCODE SCAN',
      fsScanPh:'Scan or type a barcode, then Enter…',
      fsScanDone:'cartons scanned',
      fsScanOk:'Recorded',
      fsScanDup:'Already scanned at',
      fsScanBad:'That code is not in this shipment’s barcode list',
      fsScanLogL:'Scanned on this row',
      fsScanNone:'Nothing scanned yet',
      fsScanUndo:'Undo this scan',
      fsScanHint:'A wedge scanner sends Enter itself — keep scanning, the box clears after each code',
      fsCtnScanT:'cartons from scans',
      fsCtnManT:'cartons keyed in',
      fsRemarkPh:'Remark…',
      fsIron:'IRON',
      fsQc:'FINAL QC',
      fsPack:'PACK',
      fsFg:'FG WAREHOUSE',
      fsCount:'groups',
      fsSearch:'Search style, PO, colour, line…',
      fsNoHit:'No row matches the search',
      fsEmpty:'Nothing received yet — go to Finishing In and confirm a handover slip.',
      fgTitle:'Finished Goods Shipment Plan',
      fgPanel:'Shipments By Style · PO',
      fgSub:'One row per style · PO — the COLOR cell lists every colour of the shipment, read from the cutting plan SUMMARY BY COLOUR (matched on style · PO); shipped quantity, loading date, ship mode, destination and CBM are keyed in',
      fgK1:'ORDERED',
      fgK1s:'pcs on the shipment plan',
      fgK2:'READY',
      fgK2s:'pcs booked into finished goods',
      fgK3:'SHIPPED',
      fgK3s:'pcs already loaded',
      fgK4:'LATE',
      fgK4s:'shipments past their ETD',
      fgNo:'NO#',
      fgBrand:'BRAND',
      fgSeason:'SEASON',
      fgFactory:'FACTORY',
      fgStyle:'STYLE NO#',
      fgPo:'PO#',
      fgColor:'COLOR',
      fgQty:'ORDER QUANTITY',
      fgShipped:'SHIPPED QUANTITY',
      fgBal:'BALANCE QUANTITY',
      fgLoad:'LOADING DATE',
      fgEtd:'ETD',
      fgMode:'SHIP MODE',
      fgDest:'DESTINATION',
      fgCbm:'CBM',
      fgNote:'RE-MARK',
      fgAdd:'Add shipment',
      fgCount:'shipments',
      fgReseed:'Reseed from seed',
      fgReseedAsk:'Reseed every shipment from the module seed? Manual edits in this table will be lost.',
      fgPkImp:'Packing list',
      fgPkTip:'Import this shipment’s packing list (.xlsx/.xls/.csv) — takes the total carton qty and feeds Ordered Carton Qty on Finishing Status',
      fgPkHas:'Packing list imported — click to import a different file',
      fgPkClr:'Drop the packing list (drops this shipment’s barcodes too)',
      fgPkOk:'Packing list imported —',
      fgPkCtn:'ctn',
      fgPkNone:'No carton count found in the file. It needs a CARTON NO column, a carton-qty column, or a TOTAL CARTONS cell.',
      fgBcImp:'Barcode',
      fgBcTip:'Import the carton barcode file (.xlsx/.xls/.csv) — the list is stored for the Finishing Status table',
      fgBcHas:'Barcodes imported — click to import a different file',
      fgBcClr:'Drop this shipment’s barcode list',
      fgBcNeed:'Import the packing list first — barcodes need it',
      fgBcOk:'Barcodes imported —',
      fgBcN:'codes',
      fgBcCut:'codes (the overflow was dropped)',
      fgBcNone:'No barcode found in the file. It needs a BARCODE / UPC / EAN column.',
      fgMdPanel:'Shipment Detail',
      fgMdSub:'Shipment summary plus the packing list expanded carton by carton',
      fgMdOpen:'Click the row to open this shipment',
      fgPkFile:'PACKING LIST FILE',
      fgBcFile:'BARCODE FILE',
      fgNoFile:'not imported',
      fgPkLn:'packing list lines',
      fgPkPcs:'TOTAL PCS',
      fgPkGw:'GROSS WEIGHT (KG)',
      fgPkNw:'NET WEIGHT (KG)',
      fgPkCbm:'TOTAL CBM',
      fgPkCtnN:'TOTAL CARTONS',
      fgDCtn:'CARTON NO',
      fgDSize:'SIZE / WEIGHT',
      fgDQc:"Q'TY OF PCS/CTN",
      fgDGw:'GROSS WT/CTN (KG)',
      fgDNw:'NET WT/CTN (KG)',
      fgDBox:'BOX SIZE (CM)',
      fgDCbm:'CBM/CTN',
      fgDBc:'BARCODE',
      fgDEmpty:'No packing list yet — hit the Packing list button above to import one.',
      fgDNone:'The carton detail could not be read. The file needs a header row with CARTON NO (FIRST BOX ~ LAST BOX / BOX QUANTITY) and a pcs-per-carton column.',
      fgPgPrev:'‹ Prev',
      fgPgNext:'Next ›',
      fgPgOf:'of',
      fgPgSize:'ctn/page',
      fgPgShow:'Showing',
      fgPgPage:'Page',
      fsCtnOrdPk:'From the packing list',
      fsCtnBcTip:'Barcodes imported for this shipment',
      fgSearch:'Search brand, style, PO, colour, destination, ETD…',
      fgNoHit:'No shipment matches the search',
      fgEmpty:'No shipment yet — hit Reseed from plan or Add shipment.' },
  };

  NAVVI = {'FINISHING':'HOÀN THIỆN','Finishing In':'Nhận hàng hoàn thiện','Finishing Status':'Tình trạng hoàn thiện','F.G Shipment Plan':'Kế hoạch xuất hàng'};

  // ==========================================================================
  // Khai bao module
  // ==========================================================================
  MOD = {
    id: 'finishing', key: 'yic.mes.finishing', seedVar: 'FINISHING_SEED', bcRoot: 'modFin',
    nav: [['FINISHING', [['Finishing In', 1, 'finIn'], ['Finishing Status', 1, 'finSt'],
                         ['F.G Shipment Plan', 1, 'fgShip']]]],
    pages: { finIn: 'renderFinInBody', finSt: 'renderFinStBody', fgShip: 'renderFgBody' },
    bc: { finIn: 'fiBc', finSt: 'fsBc', fgShip: 'fgBc' },
  };
  PERSIST_MOD = ['finRecv', 'finStage', 'fsRemark', 'fsPackD', 'fsCtnO', 'fsCtnD', 'fsScan',
    'finTab', 'ftRows', 'ftSeeded', 'ftSel', 'fgRows', 'fgSeeded', 'fgPk', 'fgBc', 'dsoHandWho'];

  // ==========================================================================
  // Du lieu tu seed.js — thay cho window.PSCHED / window.KHC / window.MLIST
  // --------------------------------------------------------------------------
  // Truoc khi tach module, ba bang duoi day duoc suy ra tai cho tu Ke hoach san
  // xuat + tac nghiep cat + state cua man San luong may. Gio chung dong bang
  // trong seed, nen HOAN THIEN chay doc lap hoan toan.
  // ==========================================================================
  SEEDORD = SEED.ordered || {};        // (chuyen|ma hang|PO|mau) -> SL don hang
  SEEDROWS = SEED.orders || [];        // (ma hang|PO) -> {brand, qty, end, colors}

  // SL don hang theo (chuyen | ma hang | PO | mau) — cot SL DON HANG cua bang nhan
  finOrderedMap() { return this.SEEDORD; }
  // Danh muc phu lieu (MATERIALS LIST)
  ML() { return SEED.mlist || { rows: [] }; }
  // Chua co dong nao trong Ke hoach xuat hang thi doan thuong hieu tu seed
  brandForStyle(style) {
    const s = String(style || '').toUpperCase().replace(/\s+/g, '');
    const hit = this.SEEDROWS.find(o => String(o.style).toUpperCase().replace(/\s+/g, '') === s);
    return (hit && hit.brand) || '';
  }

  // Phu lieu hoan thien: 1 dong / (ma hang | PO). SL DON HANG gieo tu seed,
  // SL THUC NHAN la so nguoi dung go khi hang ve.
  ftSeed() {
    return this.SEEDROWS.map((o, i) => ({ id: 'ft' + (i + 1), brand: o.brand || '',
      style: o.style, po: o.po, qty: o.qty || 0, act: 0 }))
      .sort((a, b) => String(a.brand).localeCompare(String(b.brand))
        || String(a.style).localeCompare(String(b.style))
        || String(a.po).localeCompare(String(b.po)));
  }

  // Ke hoach xuat hang: 1 dong / (ma hang | PO). ETD = ngay ket thuc san xuat
  // cong FG_LEAD; ngay dong container lui truoc FG_LOAD_LEAD ngay.
  fgSeed() {
    return this.SEEDROWS.map((o, i) => {
      const e = this.pd(o.end);
      const etd = new Date(e.getFullYear(), e.getMonth(), e.getDate() + this.FG_LEAD);
      const ld = new Date(etd.getFullYear(), etd.getMonth(), etd.getDate() - this.FG_LOAD_LEAD);
      return { id: 'fg' + (i + 1), brand: o.brand || '', season: this.fgSeason(etd),
        factory: this.FG_FACTORY, style: o.style, po: o.po, color: (o.colors || []).join(' + '),
        qty: o.qty || 0, ship: 0, load: this.psFmtD(ld), etd: this.psFmtD(etd),
        mode: 'SEA', dest: '', cbm: '', note: '' };
    }).sort((a, b) => String(a.etd).localeCompare(String(b.etd))
      || String(a.style).localeCompare(String(b.style))
      || String(a.po).localeCompare(String(b.po)));
  }

  // ==========================================================================
  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
    this.state = { ...this.coreState(),
      page: 'finIn', edit: null, bedit: null,
      // Phieu ban giao tu seed — dau vao duy nhat cua module
      dsoSlips: (SEED.slips || []).map(s => ({ ...s })), dsoSlipSeq: {}, dsoHandWho: {}, dsoHandAsk: null,
      finRecv: {}, finStage: {}, finQ: '', fiSel: null,
      fsQ: '', fsRemark: {}, fsPackD: {}, fsCtnO: {}, fsCtnD: {},
      fsScan: {}, fsScanAt: null, fsScanQ: '', fsScanMsg: null,
      finTab: 'gmt', ftRows: [], ftSeeded: 0, ftQ: '', ftSel: {}, ftPick: null, ftPickDraft: null,
      fgRows: [], fgSeeded: 0, fgQ: '', fgEdit: null, fgMsg: '', fgPk: {}, fgBc: {},
      fgSel: null, fgPg: 1, fgPp: 100,
    };
    this.restore();
  }

  // ---- vong doi -----------------------------------------------------------
  // Gieo 1 lan; sau do hai bang la du lieu nguoi dung sua duoc.
  onMount() { this.fgEnsure(); this.ftEnsure(); }
  onUnmount() { clearTimeout(this._fgT); }
  onEsc() {
    if (this.state.fsScanAt) this.fsScanClose();
    if (this.state.ftPick) this.ftPickClose();
    if (this.state.fgSel) this.fgClose();
    if (this.state.dsoHandAsk) this.dsoSlipClose();
  }

  FIN_STAGES=[['iron','fsIron'],['qc','fsQc'],['pack','fsPack'],['fg','fsFg']];
  // PO cua 1 don, doc DUY NHAT o day: uu tien PO ghi tren tac nghiep cat roi moi
  // den PO cua don. dsoSizeCards (phia may) va fgSeed (ke hoach xuat) cung goi
  // ham nay -> khoa (ma hang | PO) cua 2 ben luon khop, cot SAN SANG chay dung.
  finKpis(cards){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    return h('div',{style:{display:'grid',gridTemplateColumns:'repeat('+cards.length+',minmax(0,1fr))',gap:12,marginBottom:16}},
      cards.map(([label,val,sub,warn],i)=>h('div',{key:i,title:sub||'',
        style:{background:C.white,border:'1px solid '+C.border,borderRadius:13,padding:'10px 14px',
          boxShadow:C.shadow,display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{width:26,height:26,borderRadius:8,background:warn?'#fbf3df':C.tint,
          color:warn?'#b0791b':C.dark,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},this.finIc(i)),
        h('div',{style:{flex:1,minWidth:0,fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.sub,
          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},label),
        h('div',{style:{fontSize:19,fontWeight:700,letterSpacing:'-.4px',lineHeight:1,
          fontVariantNumeric:'tabular-nums',flex:'none',fontFamily:mono,color:warn?'#b0791b':C.ink}},val))));
  }
  finIc(i){ const h=React.createElement, p={width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8};
    const d=[['M3 7h18v13H3z','M8 7V4h8v3'],
             ['M12 2 2 7l10 5 10-5-10-5z','M2 17l10 5 10-5M2 12l10 5 10-5'],
             ['M20 6 9 17l-5-5'],
             ['M22 12h-4l-3 9L9 3l-3 9H2']];
    return h('svg',p,d[i%4].map((x,j)=>h('path',{key:j,d:x}))); }
  // 'XS:12  S:30  M:44' — theo đúng thứ tự size chuẩn, size lạ xếp cuối
  finSizeTxt(sizes){ const o=sizes||{};
    const std=this.SORDER.filter(z=>Number(o[z])>0);
    const rest=Object.keys(o).filter(z=>this.SORDER.indexOf(z)<0&&Number(o[z])>0).sort();
    return std.concat(rest).map(z=>z+':'+this.fmt(o[z])).join('  '); }
  finChip(on){ const h=React.createElement, C=this.C;
    const c=on?{fg:C.dark,bg:C.tint,bd:'#cfe3a6'}:{fg:'#b0791b',bg:'#fbf3df',bd:'#ecdcb4'};
    return h('span',{style:{fontSize:11,fontWeight:700,color:c.fg,background:c.bg,border:'1px solid '+c.bd,
      borderRadius:999,padding:'3px 9px',whiteSpace:'nowrap'}},this.t(on?'fiDone':'fiWait')); }

  // ---- Finishing In: sổ nhận phiếu bàn giao --------------------------------
  finRecvMap(){ return this.state.finRecv||{}; }
  // Chỉ phiếu ĐÃ CHỐT (có ts) mới về hoàn thiện — bản nháp chưa phát hành thì không
  finSlips(){ return this.dsoSlipList().filter(s=>s&&s.id&&s.ts); }
  // 1 dong cua to phieu -> (ma hang | PO | mau) THAT. Uu tien a.key vi do la
  // dung khoa lich su may (ngay|chuyen|ma hang|PO|mau); phieu cu khong co alloc
  // thi lui ve chinh cac truong cua to phieu.
  finPart(a,s){ const p=String((a&&a.key)||'').split('|'), k5=p.length===5;
    const g=(i,alt,sv)=>{ const v=(k5?p[i]:'')||alt||sv; return (v==null||v==='')?'—':String(v); };
    return {style:g(2,a&&a.style,s.style), po:g(3,a&&a.po,s.po), color:g(4,a&&a.color,s.color),
      line:String((k5?p[1]:'')||(a&&a.line)||s.line||'').trim(),
      qty:Number(a&&a.qty)||0, sizes:(a&&a.sizes)||{}}; }
  finParts(s){ const al=(s.alloc||[]).filter(a=>a&&(Number(a.qty)||0)>0);
    return al.length?al.map(a=>this.finPart(a,s))
      :[{style:s.style||'—',po:s.po||'—',color:s.color||'—',line:s.line||'',
         qty:Number(s.qty)||0,sizes:s.sizes||{}}]; }
  // Ten nguoi nhan KHONG go lai o day: doc thang o 'Nguoi nhan (Hoan thien)'
  // da ky tren to phieu (state.dsoHandWho). Ban ghi cu con go tay thi giu lai
  // lam du phong, va to phieu luon duoc uu tien -- sua ten tren phieu la cot
  // NGUOI NHAN doi theo.
  finWhoTo(who,id){ return String(((who||{})[id]||{}).to||'').trim(); }
  finRecvBy(s){ const r=this.finRecvMap()[s.id];
    return this.finWhoTo(this.state.dsoHandWho,s.id)||String((r&&r.by)||'').trim(); }
  finRecvSet(s,on){ const id=s&&s.id; if(!id) return;
    this.setState(st=>{ const m={...(st.finRecv||{})};
      if(on) m[id]={ts:Date.now(),by:this.finWhoTo(st.dsoHandWho,id)||(m[id]&&m[id].by)||''};
      else delete m[id];
      return {finRecv:m}; }); }
  finRecvAll(){ const ids=this.finSlips().map(s=>s.id);
    this.setState(st=>{ const m={...(st.finRecv||{})}, ts=Date.now();
      ids.forEach(id=>{ if(!m[id]) m[id]={ts,by:this.finWhoTo(st.dsoHandWho,id)}; });
      return {finRecv:m}; }); }

  // ---- Finishing In · Phụ liệu hoàn thiện ----------------------------------
  // Cung nguon voi bang Ke hoach xuat hang: 1 dong / (ma hang | PO) cua Ke hoach
  // san xuat, khoa PO doc qua orderPo() nen khop voi ca 2 ben May va Hoan thien.
  // SL DON HANG gieo tu ke hoach; SL THUC NHAN la so nguoi dung go khi hang ve.
  FIN_IN_TABS=[['gmt','fiTab1'],['trim','fiTab2']];
  ftEnsure(){ if(this.state.ftSeeded||(this.state.ftRows||[]).length) return false;
    const rows=this.ftSeed(); if(!rows.length) return false;
    this.set({ftRows:rows,ftSeeded:1}); return true; }
  ftReseed(){ if(!window.confirm(this.t('ftReseedAsk'))) return;
    this.set({ftRows:this.ftSeed(),ftSeeded:1,ftQ:'',ftSel:{},ftPick:null}); }
  ftAll(){ return this.state.ftRows||[]; }
  ftList(q){ const l=this.ftAll(); q=String(q||'').trim().toLowerCase(); if(!q) return l;
    return l.filter(r=>[r.brand,r.style,r.po].join(' ').toLowerCase().indexOf(q)>=0); }
  ftSet(id,patch){ this.setState(s=>({ftRows:(s.ftRows||[]).map(r=>r.id===id?{...r,...patch}:r)})); }
  ftDel(id){ this.setState(s=>{ const sel={...(s.ftSel||{})}; delete sel[id];
    return {ftRows:(s.ftRows||[]).filter(r=>r.id!==id),ftSel:sel,
      ftPick:s.ftPick===id?null:s.ftPick}; }); }
  // Am = con thieu, duong = nhan vuot, 0 = dung bang don hang.
  // Phu lieu chi co MOT danh muc (data/mlist.js) nen SL DON HANG cua moi dong
  // deu la tong SL CAN cua nhung item loai TRIMS trong danh muc do. Day la so
  // DAN XUAT -- khong con go tay o bang ngoai nua.
  ftTrims(){ const rows=this.mlRows();
    const c=this._ftTr; if(c&&c.rows===rows) return c.out;
    const out=rows.filter(m=>String(m.kind||'').trim().toUpperCase()==='TRIMS');
    this._ftTr={rows,out}; return out; }
  ftOrdQty(){ return this.ftTrims().reduce((a,m)=>a+(Number(m.need)||0),0); }
  ftBal(r){ return (Number(r.act)||0)-this.ftOrdQty(); }

  // ---- O SL THUC NHAN -> hop chon phu lieu --------------------------------
  // Bang trong hop la Danh muc phu lieu (data/mlist.js), sinh tu file Excel
  // "MATERIALS LIST ... -FORM - update.xlsx". Moi dong = 1 phu lieu: tich chon
  // roi go SL nhan; Xac nhan thi TONG bay vao o SL THUC NHAN ngoai bang.
  // ftSel[dong].{id phu lieu} = SL nhan -> giu lai de mo lai van thay da chon gi.
  mlRows(){ return this.ML().rows||[]; }
  mlKinds(){ const out=[]; this.mlRows().forEach(m=>{ const k=m.kind||'';
    if(k&&out.indexOf(k)<0) out.push(k); }); return out; }
  mlList(q,kind){ let l=this.mlRows();
    if(kind) l=l.filter(m=>(m.kind||'')===kind);
    q=String(q||'').trim().toLowerCase(); if(!q) return l;
    return l.filter(m=>[m.item,m.desc,m.pos,m.size,m.mcolor,m.color,m.unit,m.sup,m.arr,m.ship]
      .join(' ').toLowerCase().indexOf(q)>=0); }
  mlSize(m){ return String(m.size||m.pos||'').trim(); }
  // SL nhan mac dinh cua 1 dong = SL DA GUI. KHONG lui ve SL CAN khi chua gui
  // gi: hop nay mo san ca danh muc, lui ve SL CAN la khai khong hang chua ve.
  // Lam tron vi o nhap chi an so nguyen (fgNum).
  mlDefQty(m){ return Math.round(Number(m.rcvd)||0); }
  // Duong = ve vuot so can, am = con thieu. Chua tich thi soi theo SL da gui.
  mlDiff(m,q){ return (q==null?(Number(m.rcvd)||0):(Number(q)||0))-(Number(m.need)||0); }

  ftPickOpen(id){ if(!this.ftAll().some(r=>r.id===id)) return;
    // Ban nhap mo san CA danh muc TRIMS -- khong con tich chon tung dong. Dong
    // nao da xac nhan truoc do thi giu so cu, dong moi lay SL DA GUI lam goi y.
    const prev=(this.state.ftSel||{})[id]||{}, d={};
    this.ftTrims().forEach(m=>{ d[m.id]=prev[m.id]!=null?prev[m.id]:this.mlDefQty(m); });
    this.set({ftPick:id,ftPickDraft:d}); }
  ftPickClose(){ this.set({ftPick:null,ftPickDraft:null}); }
  ftDraft(){ return this.state.ftPickDraft||{}; }
  ftPickQty(mid,v){ this.setState(s=>({ftPickDraft:{...(s.ftPickDraft||{}),[mid]:this.fgNum(v)}})); }
  // units = cac don vi dang cong don (MT / YD / EA / SET / CONE). Tong nay gop
  // nhieu don vi that, nen hop noi thang ra chu khong lang le cong don.
  ftPickSum(){ const d=this.ftDraft(), by={}; let n=0, qty=0;
    this.ftTrims().forEach(m=>{ n++; qty+=Number(d[m.id])||0;
      const u=String(m.unit||'').trim(); if(u) by[u]=1; });
    return {n,qty,units:Object.keys(by)}; }
  ftPickOk(){ const id=this.state.ftPick; if(!id) return;
    const sum=this.ftPickSum(), d={...this.ftDraft()};
    this.setState(s=>({ftSel:{...(s.ftSel||{}),[id]:d},
      ftRows:(s.ftRows||[]).map(r=>r.id===id?{...r,act:sum.qty}:r),
      ftPick:null,ftPickDraft:null})); }
  ftSelN(id){ const d=(this.state.ftSel||{})[id]; return d?Object.keys(d).length:0; }

  renderFinInBody(){
    const h=React.createElement, tab=this.state.finTab||'gmt';
    return h('div',{ref:this.scrollRef,className:'yscroll','data-screen-label':'Finishing In',
      style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('fiTitle','S-06-FINISH-IN · UI Proto'),
      this.tabBar(this.FIN_IN_TABS,tab,id=>this.set({finTab:id}),false),
      tab==='trim'
        ? h('div',null,this.renderFinTrimKpis(),this.renderFinTrimTable())
        : h('div',null,this.renderFinInKpis(),this.renderFinInTable()),
      this.renderFinRecvModal(),
      this.renderDsoHandAsk(),
      this.renderFtPick());
  }
  renderFinInKpis(){
    const rec=this.finRecvMap(), today=this.dsoToday();
    let waitN=0, waitQ=0, todayQ=0, allQ=0;
    this.finSlips().forEach(s=>{ const q=Number(s.qty)||0, r=rec[s.id];
      if(r){ allQ+=q; if(this.psFmtD(new Date(r.ts||0))===today) todayQ+=q; }
      else { waitN++; waitQ+=q; } });
    return this.finKpis([
      [this.t('fiK1'),this.fmtn(waitN),this.t('fiK1s'),waitN>0],
      [this.t('fiK2'),this.fmtn(waitQ),this.t('fiK2s'),waitQ>0],
      [this.t('fiK3'),this.fmtn(todayQ),this.t('fiK3s')],
      [this.t('fiK4'),this.fmtn(allQ),this.t('fiK4s')]]);
  }
  // ---- Finishing In · Hang may: tong hop theo CHUYEN | MA HANG | PO | MAU --
  // Bang ngoai la so tong hop; tung to phieu ban giao nam trong modal bam vao 1
  // dong moi mo. SL DON HANG doc tu Ke hoach san xuat -- CUNG nguon voi cac card
  // size ben May (dsoSizeCards), nen khoa 4 phan cua 2 ben luon khop nhau.
  finLineCmp(a,b){ const na=this.parseNums(a), nb=this.parseNums(b);
    return ((na.length?na[0]:1e9)-(nb.length?nb[0]:1e9))||String(a).localeCompare(String(b)); }
  // 1 dong = 1 (chuyen | ma hang | PO | mau). Hop cua HAI nguon: nhom co trong
  // ke hoach (co SL don hang, co the chua co phieu nao) va nhom chi co tren
  // phieu ban giao (ord = 0) -- khong ben nao bi mat dong.
  finRecvGroups(){ const rec=this.finRecvMap(), sl=this.state.dsoSlips, ord=this.finOrderedMap();
    const c=this._finRG; if(c&&c.rec===rec&&c.sl===sl&&c.ord===ord) return c.out;
    const at={}, out=[];
    const get=(line,style,po,color)=>{ const k=[line,style,po,color].join('|'); let g=at[k];
      if(!g){ g=at[k]={key:k,line:line||'—',style:style,po:po,color:color,
        ord:0,recv:0,hand:0,items:[],imap:{},wait:0,waitQ:0,at:0}; out.push(g); }
      return g; };
    Object.keys(ord).forEach(k=>{ const p=k.split('|');
      get(p[0],p[1],p[2],p[3]).ord=ord[k]; });
    // 1 to phieu co the cham nhieu nhom (phieu gop nhieu mau) -> gop lai 1 muc
    // trong nhom, va SL cua muc do chi la PHAN thuoc nhom nay, khong phai ca to.
    this.finSlips().forEach(s=>{ const r=rec[s.id];
      this.finParts(s).forEach(p=>{
        const g=get(String(p.line||'').trim(),p.style,p.po,p.color);
        let it=g.imap[s.id];
        if(!it){ it=g.imap[s.id]={s:s,qty:0,sizes:{}}; g.items.push(it); }
        it.qty+=p.qty;
        Object.keys(p.sizes||{}).forEach(z=>{ it.sizes[z]=(it.sizes[z]||0)+(Number(p.sizes[z])||0); });
        g.hand+=p.qty;
        if(r){ g.recv+=p.qty; g.at=Math.max(g.at,r.ts||0); } }); });
    out.forEach(g=>{ g.items.sort((a,b)=>(b.s.ts||0)-(a.s.ts||0));
      g.wait=g.items.filter(it=>!rec[it.s.id]).length;
      g.waitQ=g.items.reduce((a,it)=>a+(rec[it.s.id]?0:it.qty),0); });
    out.sort((a,b)=>this.finLineCmp(a.line,b.line)
      ||String(a.style).localeCompare(String(b.style))
      ||String(a.po).localeCompare(String(b.po))
      ||String(a.color).localeCompare(String(b.color)));
    this._finRG={rec,sl,ord,out}; return out; }
  finRecvGroupList(q){ const list=this.finRecvGroups(); q=String(q||'').trim().toLowerCase();
    if(!q) return list;
    return list.filter(g=>[g.line,g.style,g.po,g.color].join(' ').toLowerCase().indexOf(q)>=0); }
  // Nhan ca nhom. Xac nhan van la xac nhan CA TO phieu -- to nao gop nhieu mau
  // thi cac nhom con lai cua no cung sang 'da nhan', dung nghia to phieu.
  finRecvGrpAll(g){ const rec=this.finRecvMap();
    const ids=g.items.filter(it=>!rec[it.s.id]).map(it=>it.s.id);
    if(!ids.length) return;
    this.setState(st=>{ const m={...(st.finRecv||{})}, ts=Date.now();
      ids.forEach(id=>{ if(!m[id]) m[id]={ts,by:this.finWhoTo(st.dsoHandWho,id)}; });
      return {finRecv:m}; }); }

  renderFinInTable(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const q=this.state.finQ||'', all=this.finRecvGroups(), rows=this.finRecvGroupList(q);
    const wait=all.reduce((a,g)=>a+g.wait,0);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('fiGCount')),
      this.dfSearchBox(q,v=>this.set({finQ:v}),false,'fiGSearch'),
      wait?this.mtBtn(this.t('fiRecvAll'),()=>this.finRecvAll(),
        {color:C.primary,borderColor:C.border,padding:'6px 12px',fontSize:12}):null);
    const body=rows.map((g,i)=>{
      const bg=i%2?'#f7f9f3':C.white;
      // Mau cot DA NHAN: du don = xanh, vuot don = vang (canh bao), con thieu = thuong
      const full=g.ord>0&&g.recv>=g.ord, over=g.ord>0&&g.recv>g.ord;
      return h('tr',{key:g.key,onClick:()=>this.set({fiSel:g.key}),title:this.t('fiRowTip'),
          style:{cursor:'pointer',background:bg},'style-hover':{background:C.tint}},
        h('td',{style:{...S.td,textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}},i+1),
        h('td',{style:{...S.td,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},g.line),
        h('td',{style:{...S.td,fontFamily:S.mono,fontWeight:700,wordBreak:'break-all'}},g.style),
        h('td',{style:{...S.td,fontFamily:S.mono,whiteSpace:'nowrap'}},g.po),
        h('td',{style:{...S.td,fontWeight:600,color:C.dark,wordBreak:'break-word'}},g.color),
        h('td',{style:{...S.td,fontFamily:S.mono,fontWeight:600,textAlign:'right',
          whiteSpace:'nowrap'}}, g.ord?this.fmt(g.ord):h('span',{style:{color:C.faint}},'—')),
        h('td',{title:over?this.t('fiOverTip'):(g.ord&&g.recv<g.ord?this.t('fiShortTip'):''),
          style:{...S.td,fontFamily:S.mono,fontWeight:700,fontSize:14,textAlign:'right',
            whiteSpace:'nowrap',color:over?'#946200':(full?'#2f7d32':(g.recv?C.ink:C.faint))}},
          this.fmt(g.recv)),
        h('td',{onClick:e=>e.stopPropagation(),
            style:{...S.td,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6,alignItems:'center'}},
            g.wait?this.mtBtn(this.t('fiRecv')+' · '+this.fmt(g.wait),
              ()=>this.finRecvGrpAll(g),{border:'1px solid '+C.primary,background:C.tint}):null,
            this.mtBtn(this.t('fiDetail')+' ›',()=>this.set({fiSel:g.key})))));
    });
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1000px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'46px'}}),h('col',{style:{width:'104px'}}),
          h('col',{style:{width:'150px'}}),h('col',{style:{width:'104px'}}),
          h('col',{style:{width:'auto'}}),h('col',{style:{width:'128px'}}),
          h('col',{style:{width:'128px'}}),h('col',{style:{width:'220px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...S.th,textAlign:'center',paddingLeft:8}},this.t('mtNo')),
          ...['fiLine','fiStyle','fiPo','fiColor'].map(k=>h('th',{key:k,style:S.th},this.t(k))),
          h('th',{style:{...S.th,textAlign:'right'}},this.t('fiOrd')),
          h('th',{style:{...S.th,textAlign:'right'}},this.t('fiRecvd')),
          h('th',{style:{...S.th,borderRight:'none'}},this.t('fiAct')))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:8,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'fiGNoHit':'fiGEmpty'))))));
    return this.dsoCard('fiGPanel','fiGSub','Finishing In',tbl,{full:true,action});
  }

  // ---- Modal: cac to phieu ban giao cua DUNG 1 dong tong hop ---------------
  // Day la bang 'Phieu Ban Giao Tu May' cu, chi con nhung to thuoc nhom dang mo.
  // 4 cot chuyen / ma hang / PO / mau bo di -- da nam o dau modal roi. Bam Nhan
  // o day la doi so ngay tren bang ngoai: ca hai deu doc tu finRecvGroups().
  renderFinRecvModal(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const key=this.state.fiSel; if(!key) return null;
    const g=this.finRecvGroups().find(x=>x.key===key); if(!g) return null;
    const rec=this.finRecvMap(), close=()=>this.set({fiSel:null});
    const fld=(lb,v,ex)=>h('div',{key:lb,style:{minWidth:0}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,
        whiteSpace:'nowrap'}},lb),
      h('div',{style:{fontSize:13.5,fontWeight:700,color:C.ink,marginTop:2,
        wordBreak:'break-word',...(ex||{})}},v||'—'));
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'15px 20px',
        flex:'none',borderBottom:'1px solid '+C.line}},
      h('div',{style:{width:36,height:36,borderRadius:10,background:C.tint,color:C.dark,flex:'none',
          display:'flex',alignItems:'center',justifyContent:'center'}},
        h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M3 7h18v13H3z'}),h('path',{d:'M8 7V4h8v3'}))),
      h('div',{style:{minWidth:0,marginRight:'auto'}},
        h('div',{style:{fontSize:16,fontWeight:700}},this.t('fiPanel')),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:2}},this.t('fiSub'))),
      h('button',{title:this.t('dsoClose'),onClick:close,
        style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,
          height:30,flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,
          fontFamily:'inherit'},'style-hover':{background:C.tint}},'×'));
    // Dai dau modal: dong nao dang mo + 4 con so cua chinh dong do
    const info=h('div',{style:{display:'flex',alignItems:'center',gap:18,flexWrap:'wrap',flex:'none',
        padding:'13px 20px',background:C.tint2,borderBottom:'1px solid '+C.line}},
      h('div',{style:{flex:'1 1 260px',minWidth:0,display:'grid',
          gridTemplateColumns:'repeat(auto-fit,minmax(96px,1fr))',gap:14}},
        fld(this.t('fiLine'),g.line,{color:C.primary,fontFamily:S.mono}),
        fld(this.t('fiStyle'),g.style,{fontFamily:S.mono}),
        fld(this.t('fiPo'),g.po,{fontFamily:S.mono}),
        fld(this.t('fiColor'),g.color,{color:C.dark})),
      h('div',{style:{flex:'none',display:'flex',gap:9,flexWrap:'wrap'}},
        [[this.t('fiOrd'),g.ord,C.ink],[this.t('fiHand'),g.hand,C.dark],
         [this.t('fiRecvd'),g.recv,'#2f7d32'],[this.t('fiK1'),g.waitQ,g.waitQ?'#b0791b':C.faint]]
          .map(([lb,v,fg])=>h('div',{key:lb,style:{flex:'none',minWidth:84,background:C.white,
              border:'1px solid '+C.border,borderRadius:10,padding:'7px 12px'}},
            h('div',{style:{fontSize:9,fontWeight:700,letterSpacing:'.5px',color:C.faint,
              whiteSpace:'nowrap'}},lb),
            h('div',{style:{fontSize:17,fontWeight:700,fontFamily:S.mono,color:fg,marginTop:2,
              lineHeight:1}},this.fmt(v))))));
    const body=g.items.map((it,i)=>{ const s=it.s, on=!!rec[s.id], bg=i%2?'#f7f9f3':C.white;
      return h('tr',{key:s.id,style:{background:bg}},
        h('td',{style:{...S.td,textAlign:'center',fontFamily:S.mono,color:C.faint,
          fontWeight:600}},i+1),
        h('td',{style:{...S.td,whiteSpace:'nowrap'}},
          h('span',{title:this.t('fiView'),onClick:()=>this.dsoSlipOpen(s),
            style:{fontFamily:S.mono,fontWeight:700,color:C.primary,cursor:'pointer',
              borderBottom:'1px dotted '+C.primary}},this.dsoSlipNo(s))),
        h('td',{style:{...S.td,fontFamily:S.mono,fontSize:11.5,color:C.sub,
          whiteSpace:'nowrap'}},this.dsoSlipWhen(s.ts)),
        h('td',{style:{...S.td,fontFamily:S.mono,fontSize:11,color:C.sub,
          wordBreak:'break-word'}},this.finSizeTxt(it.sizes)||'—'),
        h('td',{style:{...S.td,fontFamily:S.mono,fontWeight:700,
          textAlign:'right'}},this.fmt(it.qty)),
        h('td',{style:{...S.td,whiteSpace:'nowrap'}},this.finChip(on)),
        h('td',{style:{...S.td,wordBreak:'break-word'}},
          on?h('span',{title:this.t('fiByTip'),style:{fontWeight:600,color:C.ink}},
              this.finRecvBy(s)||'—')
            :h('span',{style:{color:C.faint}},'—')),
        h('td',{style:{...S.td,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6}},
            on?this.mtBtn(this.t('fiUnrecv'),()=>this.finRecvSet(s,false),
                {color:'#c0392b',borderColor:'#eccfca'})
              :this.mtBtn(this.t('fiRecv'),()=>this.finRecvSet(s,true),
                {border:'1px solid '+C.primary,background:C.tint}),
            this.mtBtn(this.t('fiView'),()=>this.dsoSlipOpen(s)))));
    });
    const tbl=h('div',{className:'yscroll',style:{overflow:'auto',flex:1,minHeight:120}},
      h('table',{style:{width:'100%',minWidth:'820px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'44px'}}),h('col',{style:{width:'132px'}}),
          h('col',{style:{width:'126px'}}),h('col',{style:{width:'auto'}}),
          h('col',{style:{width:'86px'}}),h('col',{style:{width:'96px'}}),
          h('col',{style:{width:'128px'}}),h('col',{style:{width:'150px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...S.th,textAlign:'center',paddingLeft:8,position:'sticky',top:0,
            zIndex:1}},this.t('mtNo')),
          ...['fiNo','fiWhen','fiSizes'].map(k=>h('th',{key:k,
            style:{...S.th,position:'sticky',top:0,zIndex:1}},this.t(k))),
          h('th',{style:{...S.th,textAlign:'right',position:'sticky',top:0,
            zIndex:1}},this.t('fiQty')),
          h('th',{style:{...S.th,position:'sticky',top:0,zIndex:1}},this.t('fiSt')),
          h('th',{style:{...S.th,position:'sticky',top:0,zIndex:1}},this.t('fiBy')),
          h('th',{style:{...S.th,borderRight:'none',position:'sticky',top:0,
            zIndex:1}},this.t('fiAct')))),
        h('tbody',null, g.items.length?body:h('tr',null,h('td',{colSpan:8,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',
            borderRight:'none'}},this.t('fiMdEmpty'))))));
    const foot=h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',
        flex:'none',borderTop:'1px solid '+C.line,background:'#f8faf3',flexWrap:'wrap'}},
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.faint,
        whiteSpace:'nowrap'}},this.fmt(g.items.length)+' '+this.t('fiCount')),
      h('div',{style:{flex:1,minWidth:8}}),
      h('button',{onClick:close,style:this.btn('ghost')},this.t('dsoClose')),
      g.wait?h('button',{onClick:()=>this.finRecvGrpAll(g),style:this.btn('primary')},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',
          strokeWidth:2},h('path',{d:'M20 6 9 17l-5-5'})),
        this.t('fiRecvAll')+' · '+this.fmt(g.wait)):null);
    return h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:86,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:'min(1040px,96vw)',maxHeight:'92vh',
          display:'flex',flexDirection:'column',background:C.white,borderRadius:18,
          boxShadow:'0 30px 70px rgba(0,0,0,.34)',overflow:'hidden'}},
        head,info,tbl,foot));
  }

  renderFinTrimKpis(){
    const l=this.ftAll(), q=this.ftOrdQty(); let qty=0, act=0, short=0, done=0;
    l.forEach(r=>{ const a=Number(r.act)||0;
      qty+=q; act+=a; if(a<q) short+=q-a; else if(q>0) done++; });
    return this.finKpis([
      [this.t('ftK1'),this.fmtn(qty),this.t('ftK1s')],
      [this.t('ftK2'),this.fmtn(act),this.t('ftK2s')],
      [this.t('ftK3'),this.fmtn(short),this.t('ftK3s'),short>0],
      [this.t('ftK4'),this.fmtn(done),this.t('ftK4s')]]);
  }
  renderFinTrimTable(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const q=this.state.ftQ||'', all=this.ftAll(), rows=this.ftList(q);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('ftCount')),
      this.dfSearchBox(q,v=>this.set({ftQ:v}),false,'ftSearch'),
      this.mtBtn(this.t('ftReseed'),()=>this.ftReseed(),{padding:'6px 12px',fontSize:12}));
    const body=rows.map((r,i)=>{
      const bg=i%2?'#f7f9f3':C.white, bal=this.ftBal(r), ord=this.ftOrdQty();
      const selN=this.ftSelN(r.id);
      // THUONG HIEU · MA HANG · PO# la khoa dong, do Ke hoach san xuat quyet dinh.
      // Sua o trang Ke hoach san xuat roi Gieo lai.
      const ro=f=>String(r[f]||'').trim()||'—';
      const cell=(el,extra)=>h('td',{style:{...S.td,background:bg,...(extra||{})}},el);
      const lock=(el,extra)=>h('td',{title:this.t('tipPlanCol'),
        style:{...S.td,background:bg,...(extra||{})}},el);
      return h('tr',{key:r.id},
        cell(i+1,{textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}),
        lock(ro('brand'),{fontWeight:600}),
        lock(ro('style'),{fontFamily:S.mono,fontWeight:700,color:C.primary}),
        lock(ro('po'),{fontFamily:S.mono}),
        h('td',{title:this.t('ftOrdTip'),style:{...S.td,background:bg,textAlign:'right',
          fontFamily:S.mono,fontWeight:700}},this.fmtn(ord)),
        // O SL THUC NHAN khong go tay: bam vao la mo hop chon phu lieu (renderFtPick).
        // The nho ben canh = so dong phu lieu dang gop lai thanh con so nay.
        h('td',{onClick:()=>this.ftPickOpen(r.id),
          title:this.t('ftPickTip')+(bal<0?' · '+this.t('ftShortTip')
            :(bal>0?' · '+this.t('ftOverTip'):'')),
          style:{...S.td,background:bg,padding:0,cursor:'pointer'}},
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:7,
              padding:'8px 10px'},'style-hover':{background:C.tint}},
            selN?h('span',{style:{fontSize:10,fontWeight:700,fontFamily:S.mono,color:C.dark,
              background:C.tint,border:'1px solid '+C.border,borderRadius:999,padding:'1px 7px',
              whiteSpace:'nowrap'}},this.fmt(selN)+' '+this.t('ftPickLn')):null,
            h('span',{style:{fontFamily:S.mono,fontWeight:700,
              color:bal<0?'#c0392b':(bal>0?C.primary:C.ink)}},this.fmt(r.act)),
            h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:C.faint,strokeWidth:2,
              style:{flex:'none'}},h('path',{d:'M6 9l6 6 6-6'})))),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6}},
            this.mtBtn(this.t('mtDel'),()=>this.ftDel(r.id),{color:'#c0392b',borderColor:'#eccfca'}))));
    });
    const cols=[['mtNo',0],['ftBrand',0],['ftStyle',0],['ftPo',0],['ftQtyO',1],['ftQtyA',1],['mtAct',0]];
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'880px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'46px'}}),h('col',{style:{width:'auto'}}),
          h('col',{style:{width:'auto'}}),h('col',{style:{width:'130px'}}),
          h('col',{style:{width:'140px'}}),h('col',{style:{width:'150px'}}),
          h('col',{style:{width:'150px'}})),
        h('thead',null,h('tr',null,
          cols.map(([k,rt],ci)=>h('th',{key:k,style:{...S.th,
            ...(rt?{textAlign:'right'}:{}),
            ...(ci===0?{textAlign:'center',paddingLeft:8}:{}),
            ...(ci===cols.length-1?{borderRight:'none'}:{})}},this.t(k))))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:cols.length,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'ftNoHit':'ftEmpty'))))));
    return this.dsoCard('ftPanel','ftSub','Finishing Trims',tbl,{full:true,action});
  }

  // ---- Hop nhap SL nhan cua phu lieu --------------------------------------
  // Mo tu o SL THUC NHAN. Ben trong la DANH MUC PHU LIEU (data/mlist.js) da loc
  // san loai TRIMS -- khong con thanh loc, khong con tich chon: moi dong deu go
  // duoc o SL NHAN. So dang go nam trong ftPickDraft (nhap nhay tuy y, chua dinh
  // gi den bang ngoai); chi Xac nhan moi ghi vao ftSel va cong lai thanh o SL
  // THUC NHAN. Bam ra ngoai hay Huy la mat ban nhap -- co y nhu vay.
  renderFtPick(){
    const h=React.createElement, C=this.C, S=this.mtStyles(), mono=S.mono;
    const id=this.state.ftPick; if(!id) return null;
    const r=this.ftAll().find(x=>x.id===id); if(!r) return null;
    const ML=this.ML(), close=()=>this.ftPickClose();
    const rows=this.ftTrims(), d=this.ftDraft(), sum=this.ftPickSum();
    const order=this.ftOrdQty(), diff=sum.qty-order, dash='—';
    // --- dau hop: dong nao dang duoc nhan phu lieu ---
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'15px 20px',
        flex:'none',borderBottom:'1px solid '+C.line}},
      h('div',{style:{width:36,height:36,borderRadius:10,background:C.tint,color:C.dark,flex:'none',
          display:'flex',alignItems:'center',justifyContent:'center'}},
        h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M20 7l-8-4-8 4 8 4 8-4zM4 7v10l8 4 8-4V7'}))),
      h('div',{style:{minWidth:0,marginRight:'auto'}},
        h('div',{style:{fontSize:16,fontWeight:700}},this.t('ftPickT')),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:2,display:'flex',gap:7,
            flexWrap:'wrap',alignItems:'center'}},
          h('span',{style:{fontWeight:700,color:C.sub}},String(r.brand||'').trim()||dash),
          h('span',{style:{color:C.border}},'·'),
          h('span',{style:{fontFamily:mono,fontWeight:700,color:C.primary}},String(r.style||'').trim()||dash),
          h('span',{style:{color:C.border}},'·'),
          h('span',{style:{fontFamily:mono}},String(r.po||'').trim()||dash),
          h('span',{style:{color:C.border}},'·'),
          h('span',null,this.t('ftPickSub')))),
      h('button',{title:this.t('dsoClose'),onClick:close,
        style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,
          height:30,flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,fontFamily:'inherit'},
        'style-hover':{background:C.tint}},'×'));
    // --- tong hop tren dau: dang go duoc bao nhieu, so voi SL don hang ---
    const card=(label,value,sub,tone)=>h('div',{key:label,
      style:{flex:'1 1 170px',minWidth:150,border:'1px solid '+C.border,borderRadius:12,
        background:C.white,padding:'10px 13px'}},
      h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:C.faint,
        whiteSpace:'nowrap'}},label),
      h('div',{style:{fontSize:21,fontWeight:700,fontFamily:mono,lineHeight:1.15,marginTop:3,
        color:tone||C.ink}},value),
      h('div',{style:{fontSize:10.5,color:C.faint,marginTop:3,overflow:'hidden',
        textOverflow:'ellipsis',whiteSpace:'nowrap'}},sub));
    const pct=order>0?Math.min(100,Math.round(sum.qty/order*100)):0;
    const tone=diff<0?'#c0392b':(diff>0?C.primary:C.ink);
    const recap=h('div',{style:{padding:'16px 20px 0',flex:'none'}},
      h('div',{style:{display:'flex',gap:10,flexWrap:'wrap'}},
        card(this.t('ftPickOrd'),this.fmtn(order),this.t('ftPickOrdS')),
        card(this.t('ftPickQty'),this.fmtn(sum.qty),
          sum.units.length>1?this.t('ftPickMix')+' '+sum.units.join(' + ')
            :(sum.units[0]?this.t('ftPickQtyS')+' · '+sum.units[0]:this.t('ftPickQtyS')),
          sum.qty?C.ink:C.faint),
        card(this.t('ftPickDif'),(diff>0?'+':'')+this.fmtn(diff),this.t('ftPickDifS'),tone)),
      // thanh do: da go duoc bao nhieu phan so voi SL don hang
      order>0?h('div',{style:{marginTop:11}},
        h('div',{style:{height:6,borderRadius:99,background:C.line,overflow:'hidden'}},
          h('div',{style:{width:pct+'%',height:'100%',borderRadius:99,
            background:diff<0?'#e6a19a':C.primary,transition:'width .18s'}})),
        h('div',{style:{fontSize:10.5,color:C.faint,marginTop:5,fontFamily:mono}},
          this.fmtn(sum.qty)+' / '+this.fmtn(order)+'  ·  '+pct+'%')):null);
    // --- bang danh muc phu lieu (da loc TRIMS) ---
    const sth={...S.th,position:'sticky',top:0,zIndex:1};
    const ctd={padding:'7px 9px',fontSize:12,borderTop:'1px solid '+C.line,
      borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    // 2 cot cuoi ghim phai (SL nhan + chenh lech) — keo ngang van thay o nhap.
    const PINW=[112,108];
    const pin=(i,z)=>({position:'sticky',right:i?0:PINW[1],zIndex:z,
      ...(i?{}:{borderLeft:'1px solid '+C.border})});
    const txt=v=>String(v==null?'':v).trim()||dash;
    const cols=[['mtNo','c'],['mlKind','l'],['mlItem','l'],['mlDesc','l'],['mlSize','l'],
      ['mlColor','l'],['mlUnit','c'],['mlNeed','r'],['mlShipQ','r'],['mlArr','l'],['mlSup','l'],
      ['mlRecv','r'],['mlBal','r']];
    const body=rows.map((m,i)=>{ const dq=d[m.id], dv=this.mlDiff(m,dq);
      const rbg=i%2?'#f7f9f3':C.white;
      return h('tr',{key:m.id,style:{background:rbg}},
        h('td',{style:{...ctd,textAlign:'center',paddingLeft:14,fontFamily:mono,color:C.faint,
          fontWeight:600}},i+1),
        h('td',{style:{...ctd,whiteSpace:'nowrap'}},
          h('span',{style:{fontSize:10,fontWeight:700,fontFamily:mono,letterSpacing:'.3px',
            color:C.sub,background:C.white,border:'1px solid '+C.border,borderRadius:999,
            padding:'1px 7px'}},txt(m.kind))),
        h('td',{style:{...ctd,fontFamily:mono,fontWeight:700,color:C.dark,whiteSpace:'nowrap'}},txt(m.item)),
        h('td',{style:{...ctd,fontWeight:600,minWidth:180,wordBreak:'break-word'}},txt(m.desc)),
        h('td',{style:{...ctd,fontFamily:mono,whiteSpace:'nowrap'}},txt(this.mlSize(m))),
        h('td',{style:{...ctd,whiteSpace:'nowrap'}},txt(m.mcolor||m.color)),
        h('td',{style:{...ctd,textAlign:'center',fontFamily:mono,color:C.sub,whiteSpace:'nowrap'}},txt(m.unit)),
        h('td',{style:{...ctd,textAlign:'right',fontFamily:mono,whiteSpace:'nowrap'}},this.fmtn(m.need)),
        h('td',{style:{...ctd,textAlign:'right',fontFamily:mono,color:C.sub,whiteSpace:'nowrap'}},
          Number(m.rcvd)?this.fmtn(m.rcvd):dash),
        h('td',{style:{...ctd,fontFamily:mono,fontSize:11.5,color:C.sub,minWidth:92}},txt(m.arr)),
        h('td',{style:{...ctd,color:C.sub,minWidth:80,wordBreak:'break-word'}},txt(m.sup)),
        h('td',{style:{...ctd,textAlign:'right',width:PINW[0],minWidth:PINW[0],
            background:rbg,...pin(0,2)}},
          h('input',{value:dq==null?'':String(dq),inputMode:'numeric',
            title:this.t('ftPickCellTip'),
            onChange:e=>this.ftPickQty(m.id,e.target.value),
            style:{...S.inp,textAlign:'right'}})),
        h('td',{style:{...ctd,borderRight:'none',textAlign:'right',fontFamily:mono,fontWeight:700,
          whiteSpace:'nowrap',width:PINW[1],minWidth:PINW[1],background:rbg,...pin(1,2),
          color:dv<0?'#c0392b':(dv>0?C.primary:C.faint)}},
          (dv>0?'+':'')+this.fmtn(dv))); });
    const note=k=>h('div',{style:{padding:'46px 20px',textAlign:'center',color:C.faint,
      fontSize:13}},this.t(k));
    const table=!rows.length?h('div',{style:{flex:1,minHeight:150}},note('ftPickEmpty'))
      : h('div',{className:'yscroll',style:{overflow:'auto',flex:1,minHeight:150,
          borderTop:'1px solid '+C.line}},
          h('table',{style:{width:'100%',minWidth:'1200px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              cols.map(([k,a],ci)=>{ const pi=ci-(cols.length-2);
                return h('th',{key:'h'+ci,style:{...sth,
                  ...(a==='r'?{textAlign:'right'}:(a==='c'?{textAlign:'center'}:{})),
                  ...(ci===0?{paddingLeft:14}:{}),
                  ...(ci===cols.length-1?{borderRight:'none'}:{}),
                  ...(pi>=0?{width:PINW[pi],minWidth:PINW[pi],...pin(pi,3)}:{})}},
                  k?this.t(k):''); }))),
            h('tbody',null,body)));
    // --- chan hop: dang go bao nhieu dong + Huy / Xac nhan ---
    const foot=h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',
        flex:'none',borderTop:'1px solid '+C.line,background:'#f8faf3',flexWrap:'wrap'}},
      h('span',{style:{fontSize:12,fontWeight:700,whiteSpace:'nowrap',
        color:sum.qty?C.dark:C.faint}},this.t('ftPickFoot')+': ',
        h('span',{style:{fontFamily:mono}},
          this.fmt(sum.n)+' '+this.t('ftPickLn')+' · '+this.fmtn(sum.qty))),
      ML.src?h('span',{title:ML.src,style:{fontSize:10.5,color:C.faint,minWidth:0,overflow:'hidden',
        textOverflow:'ellipsis',whiteSpace:'nowrap'}},this.t('ftPickSrc')+' '+ML.src):null,
      h('div',{style:{flex:1,minWidth:8}}),
      h('button',{onClick:close,style:this.btn('ghost')},this.t('psCancel')),
      h('button',{onClick:()=>this.ftPickOk(),style:this.btn('primary')},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M5 13l4 4L19 7'})),this.t('ftPickOk')));
    const over=h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:87,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:'min(1340px,96vw)',maxHeight:'92vh',
          display:'flex',flexDirection:'column',background:C.white,borderRadius:18,
          boxShadow:'0 30px 70px rgba(0,0,0,.34)',overflow:'hidden'}},
        head,recap,table,foot));
    return (RD&&RD.createPortal)?RD.createPortal(over,document.body):over;
  }

  // ---- Finishing Status: WIP qua 4 công đoạn -------------------------------
  // Gom hàng ĐÃ NHẬN theo (mã hàng | PO | màu) — đúng cấp mà tờ phiếu mang theo.
  // Nho lai theo dung 2 mieng state ma ham nay doc — fgReadyQty goi lai cho
  // tung lo xuat nen khong the tinh lai moi lan.
  finGroups(){ const rec=this.finRecvMap(), sl=this.state.dsoSlips;
    const c=this._finGC; if(c&&c.rec===rec&&c.sl===sl) return c.out;
    const at={}, out=[];
    this.finSlips().forEach(s=>{ const r=rec[s.id]; if(!r) return;
      this.finParts(s).forEach(p=>{
        const k=[p.style,p.po,p.color].join('|'); let g=at[k];
        if(!g){ g=at[k]={key:k,style:p.style,po:p.po,color:p.color,
          in:0,sizes:{},lines:[],at:0}; out.push(g); }
        g.in+=p.qty; g.at=Math.max(g.at,r.ts||0);
        Object.keys(p.sizes||{}).forEach(z=>{ g.sizes[z]=(g.sizes[z]||0)+(Number(p.sizes[z])||0); });
        const ln=String(p.line||'').trim(); if(ln&&g.lines.indexOf(ln)<0) g.lines.push(ln); }); });
    out.sort((a,b)=>String(a.style).localeCompare(String(b.style))
      ||String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color)));
    this._finGC={rec,sl,out}; return out; }
  finGroupList(q){ const list=this.finGroups(); q=String(q||'').trim().toLowerCase();
    if(!q) return list;
    return list.filter(g=>[g.style,g.po,g.color,g.lines.join(' '),
      this.fsBrand(g),this.fsRemark(g)].join(' ').toLowerCase().indexOf(q)>=0); }
  // So THO da go, chua kep tran
  finRawQ(key,st){ return Math.max(0,Number((this.state.finStage||{})[key+'|'+st])||0); }
  // So HIEN THI cua cong doan i: khong vuot duoc DA NHAN, cung khong vuot duoc
  // bat ky cong doan nao truoc no. Kep luc doc nen so da go khong bi pha, va
  // khi DA NHAN tut xuong thi cac cong doan tu dung theo.
  finStageQ(g,i){ let v=g.in;
    for(let j=0;j<=i;j++) v=Math.min(v,this.finRawQ(g.key,this.FIN_STAGES[j][0]));
    return Math.max(0,v); }
  finStageId(g,id){ const i=this.FIN_STAGES.findIndex(x=>x[0]===id); return i<0?0:this.finStageQ(g,i); }
  finLast(g){ return this.finStageQ(g,this.FIN_STAGES.length-1); }
  // Trần của 1 công đoạn = số của công đoạn liền trước (công đoạn đầu = đã nhận)
  finCap(g,i){ return i<=0?g.in:this.finStageQ(g,i-1); }
  finWip(g){ return Math.max(0,g.in-this.finLast(g)); }
  finPct(g){ return g.in?Math.min(100,Math.round(this.finLast(g)/g.in*100)):0; }
  // Sửa 1 công đoạn: chỉ ghi đúng ô đó, không đụng vào các công đoạn sau
  finStageSet(g,i,v){
    const n=Math.max(0,Math.min(g.in,parseInt(String(v).replace(/[^0-9]/g,''),10)||0));
    this.setState(s=>{ const m={...(s.finStage||{})}; m[g.key+'|'+this.FIN_STAGES[i][0]]=n;
      return {finStage:m}; }); }
  finPushAll(g){ this.setState(s=>{ const m={...(s.finStage||{})};
    this.FIN_STAGES.forEach(([id])=>{ m[g.key+'|'+id]=g.in; }); return {finStage:m}; }); }
  finClear(g){ this.setState(s=>{ const m={...(s.finStage||{})};
    this.FIN_STAGES.forEach(([id])=>{ delete m[g.key+'|'+id]; }); return {finStage:m}; }); }
  // ---- Finishing Status: dong goi / da xuat / ton kho ---------------------
  // Bang chi con cot DONG GOI go tay, nen doc SO THO roi kep theo DA NHAN.
  // KHONG dung finStageQ: ham do kep theo ca Ui / Kiem cuoi, ma hai cong doan
  // do khong con cot nao de go -> pack se dung 0 mai.
  // So dong goi go theo TUNG NGAY: fsPackD['ma hang|PO|mau|YYYY-MM-DD'].
  // Bang chi mo o HOM NAY; hom qua da chot chi doc, tong luy ke la so cong lai.
  fsYesterday(){ const d=new Date(); d.setDate(d.getDate()-1); return this.psFmtD(d); }
  // ---- PCS DA DONG GOI: SINH TU SO THUNG ---------------------------------
  // Cot DA DONG GOI khong go tay nua -- moi con so deu la SO THUNG x ti le.
  // Packing list moi cho TONG SO THUNG, chua tach duoc 1 thung bao nhieu cai,
  // nen ti le tam khoa cung o day. Co du lieu that (cot pcs/carton trong
  // packing list, hay ti le theo ma hang) thi doi DUNG 1 CHO NAY.
  //
  // Chuoi day du:  quet ma vach -> so thung -> pcs -> CHUA DONG GOI / TON KHO
  //
  // state.fsPackD (so pcs go tay cua ban truoc) khong con duoc doc, nhung van
  // giu trong PERSIST -- bo ti le tu sinh nay di la du lieu cu con nguyen.
  FS_PCS_CTN=9;
  fsPcs(ctn){ return Math.max(0,Math.round((Number(ctn)||0)*this.FS_PCS_CTN)); }
  fsPackDay(g,day){ return this.fsPcs(this.fsCtnDay(g,day)); }
  fsPackRaw(g){ return this.fsPcs(this.fsCtnRaw(g)); }
  fsPacked(g){ return this.fsPackRaw(g); }
  // Vuot so DA NHAN = ti le tam dang sai (hoac so thung go nham) -> to do o cot
  // TONG LUY KE. Khong kep lai: 3 o cua khoi pcs deu la so thung x ti le, kep
  // mot o thi cong doc khong khop, nhin nhu bang tinh sai.
  fsPackOver(g){ return Math.max(0,this.fsPackRaw(g)-g.in); }
  fsUnpacked(g){ return Math.max(0,g.in-this.fsPacked(g)); }
  // ---- SO THUNG: y het khoi pcs o tren, chi khac cai tran --------------------
  // fsCtnO['ma hang|PO|mau']            SL thung don hang, go tay
  // fsCtnD['ma hang|PO|mau|YYYY-MM-DD'] so thung dong trong ngay do
  // Khong co du lieu nao trong app suy ra duoc so thung (khong co ti le
  // pcs/thung o dau ca) nen SL thung don hang phai go. Chua go thi coi nhu
  // chua biet tran: khong kep so thung dong, va cot THUNG CHUA DONG de trong.
  fsInt(v){ return Math.max(0,parseInt(String(v).replace(/[^0-9]/g,''),10)||0); }
  // Packing list nhap o Ke hoach xuat FG la nguon uu tien cho SL THUNG DON HANG.
  // Do nguoc ve dung 1 dong (ma hang | PO | mau) qua fsFgRow(g). Chua nhap
  // packing list thi van go tay nhu cu -> khong lam hong du lieu da co.
  fsCtnPk(g){ const r=this.fsFgRow(g); return r?this.fgPkCtn(r):0; }
  fsCtnBc(g){ const r=this.fsFgRow(g); const b=r?this.fgBcOf(r):null;
    return b?((b.list||[]).length):0; }
  fsCtnOrd(g){ return this.fsCtnPk(g)
    ||Math.max(0,Number((this.state.fsCtnO||{})[g.key])||0); }
  fsCtnOrdSet(g,v){ if(this.fsCtnPk(g)) return;   // dang do packing list lai -> khoa
    const n=this.fsInt(v);
    this.setState(s=>{ const m={...(s.fsCtnO||{})};
      if(n>0) m[g.key]=n; else delete m[g.key]; return {fsCtnO:m}; }); }
  // GO TAY va QUET MA la 2 nguon rieng, cong lai moi ra so thung cua 1 ngay.
  // Tach ra vi o HOM NAY chi sua duoc phan go tay -- phan quet duoc thi phai
  // bo mot lan quet moi giam di.
  fsCtnMan(g,day){ return Math.max(0,Number((this.state.fsCtnD||{})[g.key+'|'+day])||0); }
  fsCtnDay(g,day){ return this.fsCtnMan(g,day)+this.fsScanDay(g,day); }
  fsCtnSums(){ const m=this.state.fsCtnD||{};
    const c=this._fsCS; if(c&&c.m===m) return c.out;
    const out={}; Object.keys(m).forEach(k=>{ const i=k.lastIndexOf('|'); if(i<0) return;
      const gk=k.slice(0,i); out[gk]=(out[gk]||0)+Math.max(0,Number(m[k])||0); });
    this._fsCS={m,out}; return out; }
  fsCtnRaw(g){ return (this.fsCtnSums()[g.key]||0)+this.fsScanN(g); }
  fsCtnPacked(g){ return this.fsCtnRaw(g); }
  // Packing list la so cua CA PO (1 dong Ke hoach xuat = 1 ma hang · PO, gop
  // moi mau) nen tran / con lai cung phai tinh o cap PO: cong so thung da dong
  // cua moi mau cung tro ve 1 dong Ke hoach xuat. Khong co packing list thi giu
  // nguyen cach cu -- go tay tung mau, tran tinh trong pham vi mau do.
  fsCtnPackedFg(g){ const k=this.fsFgKey(g); let n=0;
    this.finGroups().forEach(x=>{ if(this.fsFgKey(x)===k) n+=this.fsCtnRaw(x); });
    return n; }
  fsCtnOver(g){ const pk=this.fsCtnPk(g);
    if(pk) return Math.max(0,this.fsCtnPackedFg(g)-pk);
    const o=this.fsCtnOrd(g); return o?Math.max(0,this.fsCtnRaw(g)-o):0; }
  // null = chua co SL thung don hang -> chua co tran de kep
  // Chi tru phan GO TAY cua ngay do: phan quet duoc cua chinh ngay do van
  // chiem cho, khong duoc go de lan len.
  fsCtnCap(g,day){ const pk=this.fsCtnPk(g);
    if(pk) return Math.max(0,pk-(this.fsCtnPackedFg(g)-this.fsCtnMan(g,day)));
    const o=this.fsCtnOrd(g); if(!o) return null;
    return Math.max(0,o-(this.fsCtnRaw(g)-this.fsCtnMan(g,day))); }
  fsCtnUnpacked(g){ const pk=this.fsCtnPk(g);
    if(pk) return Math.max(0,pk-this.fsCtnPackedFg(g));
    const o=this.fsCtnOrd(g); return o?Math.max(0,o-this.fsCtnRaw(g)):null; }
  fsCtnSet(g,day,v){ const cap=this.fsCtnCap(g,day);
    let n=this.fsInt(v); if(cap!=null) n=Math.min(cap,n);
    this.setState(s=>{ const m={...(s.fsCtnD||{})}, k=g.key+'|'+day;
      if(n>0) m[k]=n; else delete m[k]; return {fsCtnD:m}; }); }
  // ---- QUET MA VACH DONG THUNG -------------------------------------------
  // Danh sach ma vach nhap o bang Ke hoach xuat (state.fgBc[fgRowId].list), do
  // nguoc ve dung 1 dong qua fsFgRow(g). Quet trung 1 ma -> ghi lai moc
  // dd/mm/yyyy HH:mm; so thung dong duoc cua 1 ngay CHINH LA so ma quet trong
  // ngay do, khong phai con so go tay nua.
  //
  //   fsScan['MA VACH'] = {ts, key}   key = 'ma hang|PO|mau' cua dong da quet
  //
  // Khoa theo MA VACH nen 1 thung khong the dem 2 lan: quet lai ma cu thi bao
  // 'da quet luc ...' chu khong cong them. Ghi ca key vi may mau co the dung
  // chung 1 dong Ke hoach xuat -> phai biet ma nay duoc quet o dong nao.
  fsBcNorm(v){ return String(v==null?'':v).trim().toUpperCase(); }
  fsWhen(ts){ const d=new Date(ts), p=n=>String(n).padStart(2,'0');
    return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()
      +' '+p(d.getHours())+':'+p(d.getMinutes()); }
  fsBcOf(g){ const r=this.fsFgRow(g), b=r?this.fgBcOf(r):null; return (b&&b.list)||[]; }
  // Set de tra ma trong O(1) -- danh sach co the toi 20.000 ma (FG_BC_MAX).
  // Nho theo chinh mang list nen nhap file khac la tu dung lai.
  fsBcSet(g){ const list=this.fsBcOf(g); if(!list.length) return null;
    this._fsBS=this._fsBS||new WeakMap();
    let s=this._fsBS.get(list);
    if(!s){ s=new Set(list.map(x=>this.fsBcNorm(x))); this._fsBS.set(list,s); }
    return s; }
  // Dem theo nhom + theo ngay, cong 1 lan cho ca bang roi nho lai
  fsScanSums(){ const m=this.state.fsScan||{};
    const c=this._fsSS; if(c&&c.m===m) return c.out;
    const out={};
    Object.keys(m).forEach(k=>{ const v=m[k]; if(!v||!v.key) return;
      const o=out[v.key]||(out[v.key]={n:0,day:{}});
      o.n++; const d=this.psFmtD(new Date(v.ts||0)); o.day[d]=(o.day[d]||0)+1; });
    this._fsSS={m,out}; return out; }
  fsScanN(g){ const o=this.fsScanSums()[g.key]; return o?o.n:0; }
  fsScanDay(g,day){ const o=this.fsScanSums()[g.key]; return (o&&o.day[day])||0; }
  fsScanLog(g){ const m=this.state.fsScan||{};
    return Object.keys(m).filter(k=>m[k]&&m[k].key===g.key)
      .map(k=>({code:k,ts:m[k].ts||0})).sort((a,b)=>b.ts-a.ts); }
  fsScanShow(g){ this.set({fsScanAt:g.key,fsScanQ:'',fsScanMsg:null}); }
  fsScanClose(){ this.set({fsScanAt:null,fsScanQ:'',fsScanMsg:null}); }
  fsScanGroup(){ const k=this.state.fsScanAt;
    return k?(this.finGroups().find(x=>x.key===k)||null):null; }
  // 3 ket qua: khong co trong danh sach / da quet roi / khop va con moi
  fsScanTake(g,raw){ const code=this.fsBcNorm(raw); if(!code) return;
    const set=this.fsBcSet(g);
    if(!set||!set.has(code)){ this.set({fsScanMsg:{t:'bad',code},fsScanQ:''}); return; }
    const old=(this.state.fsScan||{})[code];
    if(old){ this.set({fsScanMsg:{t:'dup',code,ts:old.ts},fsScanQ:''}); return; }
    const ts=Date.now();
    this.setState(s=>({fsScan:{...(s.fsScan||{}),[code]:{ts,key:g.key}},
      fsScanMsg:{t:'ok',code,ts},fsScanQ:''})); }
  fsScanDrop(code){ this.setState(s=>{ const m={...(s.fsScan||{})}; delete m[code];
    return {fsScan:m,fsScanMsg:null}; }); }
  // ---- Do dong Ke hoach xuat FG cho 1 nhom hoan thien ---------------------
  // Ke hoach xuat FG gio moi dong la 1 (ma hang | PO | MAU) nen phai loc DU CA
  // BA truong -- vi du '0131M&W Kirin pants' | 'PO0131M&W' | 'BLACK'. Cong ca
  // PO lai (nhu ban truoc) thi cot SL DON cua tung mau deu ra tong ca don.
  //
  // Mau 2 ben khong cung mot bo chu: ben may lay o CUTCOLORS ('Black'), ben cat
  // lay ma vai cua tac nghiep ('BLK'), va o COLOR ben Ke hoach xuat thi go tay.
  // Nen do theo bac: dung het -> chua nhau -> don CHUA tach mau (1 dong, va 1
  // trong 2 ben de trong). Khong ra dong nao thi tra null, cot de '—' chu khong
  // muon so cua mau khac.
  fsNorm(v){ return String(v==null?'':v).trim().toLowerCase(); }
  // Danh so 1 lan theo (ma hang | PO) roi nho lai: fsFgRow bi goi lai theo
  // O(nhom^2) qua fsPackedFg, quet ca bang Ke hoach xuat moi lan thi rat ky.
  fsFgIndex(){ const rows=this.fgAll();
    const c=this._fsFGI; if(c&&c.rows===rows) return c.out;
    const out={}; rows.forEach(r=>{ const k=this.fsNorm(r.style)+'|'+this.fsNorm(r.po);
      (out[k]=out[k]||[]).push(r); });
    this._fsFGI={rows,out}; return out; }
  fsFgRow(g){ const same=this.fsFgIndex()[this.fsNorm(g.style)+'|'+this.fsNorm(g.po)];
    if(!same||!same.length) return null;
    const co=this.fsNorm(g.color);
    const hit=same.find(r=>this.fsNorm(r.color)===co); if(hit) return hit;
    if(co){ const near=same.find(r=>{ const rc=this.fsNorm(r.color);
      return rc&&(rc.indexOf(co)>=0||co.indexOf(rc)>=0); }); if(near) return near; }
    const only=same.length===1?same[0]:null;
    return (only&&(!co||!this.fsNorm(only.color)))?only:null; }
  fsOrderQ(g){ const r=this.fsFgRow(g); return r?(Number(r.qty)||0):0; }
  // brandForStyle chi quet don DANG CHAY -> don da qua tuan se ra rong.
  // Dong Ke hoach xuat FG khoa theo (ma hang | PO) va mang san khach hang.
  fsBrand(g){ const r=this.fsFgRow(g); return (r&&r.brand)||this.brandForStyle(g.style)||''; }
  fsShippedQ(g){ const r=this.fsFgRow(g); return r?(Number(r.ship)||0):0; }
  // Cum cac mau dang dung CHUNG mot dong Ke hoach xuat. Moi mau co dong rieng
  // -> cum chi 1 dong. Don chua tach mau -> ca may mau chung 1 dong.
  fsFgKey(g){ const r=this.fsFgRow(g);
    return r?('#'+r.id):('?|'+this.fsNorm(g.style)+'|'+this.fsNorm(g.po)); }
  fsPackedFg(g){ const k=this.fsFgKey(g); let n=0;
    this.finGroups().forEach(x=>{ if(this.fsFgKey(x)===k) n+=this.fsPacked(x); });
    return n; }
  // Ton kho = da dong goi cua cum - da xuat cua chinh dong do
  fsStockQ(g){ return Math.max(0,this.fsPackedFg(g)-this.fsShippedQ(g)); }
  // In so o dong dau cua cum thoi, khong thi may mau chung 1 dong Ke hoach xuat
  // se cong doc theo cot ra gap doi. finGroups() da sap theo ma hang -> PO ->
  // mau nen cac dong cung cum luon lien nhau.
  fsFgHead(rows,i){ const p=rows[i-1];
    return !p||this.fsFgKey(rows[i])!==this.fsFgKey(p); }
  fsRemark(g){ return (this.state.fsRemark||{})[g.key]||''; }
  fsRemarkSet(g,v){ this.setState(s=>({fsRemark:{...(s.fsRemark||{}),[g.key]:v}})); }
  // Thành phẩm sẵn sàng xuất của 1 mã hàng · PO (cộng mọi màu) — nguồn cho F.G Shipment.
  // Truoc doc cong doan 'fg'; bang Finishing Status khong con cot go cho Ui /
  // Kiem cuoi / Nhap kho nen so do se dung 0 mai. Dong goi la moc cuoi con go
  // duoc, va hang da dong goi dung la hang san sang xuat.
  finFgQty(style,po){ let n=0;
    this.finGroups().forEach(g=>{ if(g.style===style&&g.po===po) n+=this.fsPacked(g); });
    return n; }

  renderFinStBody(){
    const h=React.createElement;
    return h('div',{ref:this.scrollRef,className:'yscroll','data-screen-label':'Finishing Status',
      style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('fsTitle','S-07-FINISH-STATUS · UI Proto'),
      this.renderFinStKpis(),
      this.renderFinStTable(),
      this.renderFsScan());
  }
  bcIc(){ const h=React.createElement;
    return h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'currentColor'},
      h('path',{d:'M2 4h2v16H2V4zm3 0h1v16H5V4zm2 0h2v16H7V4zm3 0h1v16h-1V4zm2 0h2v16h-2V4zm3 0h1v16h-1V4zm2 0h2v16h-2V4zm3 0h1v16h-1V4z'})); }
  // Hop thoai quet: o nhap tu focus, may quet go xong tu Enter -> quet lien tuc
  // duoc, moi ma xong thi xoa o nhap va bao ket qua ngay ben duoi.
  renderFsScan(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const g=this.fsScanGroup(); if(!g) return null;
    const close=()=>this.fsScanClose();
    const tot=this.fsBcOf(g).length, done=this.fsScanN(g);
    const pct=tot?Math.min(100,Math.round(done/tot*100)):0;
    const log=this.fsScanLog(g), msg=this.state.fsScanMsg;
    const MC={ok:['#2f7d32','#e6f2e2','#c3ddbe'],
              dup:['#b0791b','#fbf3df','#ecdcb4'],
              bad:['#c0392b','#fdecea','#eccfca']};
    const head=h('div',{style:{padding:'20px 24px 14px',borderBottom:'1px solid '+C.line}},
      h('div',{style:{fontSize:15,fontWeight:700,letterSpacing:'.2px',color:C.ink}},
        this.t('fsScanTitle')),
      h('div',{style:{marginTop:5,fontSize:12.5,color:C.sub,wordBreak:'break-word'}},
        [g.style,g.po,g.color].filter(Boolean).join(' \u00b7 ')),
      h('div',{style:{marginTop:12,display:'flex',alignItems:'baseline',gap:8}},
        h('span',{style:{fontFamily:S.mono,fontSize:19,fontWeight:700,color:C.ink}},
          this.fmt(done)+' / '+this.fmt(tot)),
        h('span',{style:{fontSize:12,color:C.sub}},this.t('fsScanDone'))),
      h('div',{style:{marginTop:8,height:6,borderRadius:3,background:'#e6e9e1',overflow:'hidden'}},
        h('div',{style:{height:'100%',width:pct+'%',background:C.primary,borderRadius:3,
          transition:'width .2s ease'}})));
    const box=h('div',{style:{padding:'16px 24px 0'}},
      h('input',{autoFocus:true,value:this.state.fsScanQ||'',placeholder:this.t('fsScanPh'),
        onChange:e=>this.set({fsScanQ:e.target.value}),
        onKeyDown:e=>{ if(e.key==='Enter'){ e.preventDefault(); this.fsScanTake(g,this.state.fsScanQ); } },
        style:{width:'100%',boxSizing:'border-box',border:'1.5px solid '+C.primary,borderRadius:10,
          padding:'11px 13px',fontSize:15,fontFamily:S.mono,fontWeight:700,letterSpacing:'.5px',
          color:C.ink,background:C.white,outline:'none'}}),
      h('div',{style:{marginTop:6,fontSize:11,color:C.faint}},this.t('fsScanHint')),
      msg?h('div',{style:{marginTop:11,display:'flex',alignItems:'center',gap:8,borderRadius:9,
          padding:'9px 12px',fontSize:12.5,fontWeight:600,
          color:MC[msg.t][0],background:MC[msg.t][1],border:'1px solid '+MC[msg.t][2]}},
        h('span',{style:{fontFamily:S.mono,fontWeight:700}},msg.code),
        h('span',{style:{flex:1,minWidth:0,textAlign:'right'}},
          msg.t==='ok'?(this.t('fsScanOk')+' '+this.fsWhen(msg.ts))
          :msg.t==='dup'?(this.t('fsScanDup')+' '+this.fsWhen(msg.ts))
          :this.t('fsScanBad'))):null);
    const rows=log.map(x=>h('div',{key:x.code,
      style:{display:'flex',alignItems:'center',gap:10,padding:'7px 0',
        borderTop:'1px solid '+C.line}},
      h('span',{style:{flex:1,minWidth:0,fontFamily:S.mono,fontSize:12,fontWeight:700,
        color:C.ink,wordBreak:'break-all'}},x.code),
      h('span',{style:{flex:'none',fontFamily:S.mono,fontSize:11.5,color:C.sub}},
        this.fsWhen(x.ts)),
      h('button',{title:this.t('fsScanUndo'),onClick:()=>this.fsScanDrop(x.code),
        style:{flex:'none',border:'1px solid '+C.border,background:C.white,color:'#c0392b',
          borderRadius:7,padding:'2px 8px',fontSize:11,fontWeight:700,fontFamily:'inherit',
          cursor:'pointer'}},'\u00d7')));
    const list=h('div',{style:{padding:'16px 24px 0'}},
      h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
        color:C.sub}},this.t('fsScanLogL')),
      h('div',{className:'yscroll',style:{marginTop:4,maxHeight:210,overflow:'auto'}},
        log.length?rows:h('div',{style:{padding:'22px 0',textAlign:'center',fontSize:12.5,
          color:C.faint}},this.t('fsScanNone'))));
    const foot=h('div',{style:{display:'flex',justifyContent:'flex-end',marginTop:18,
      padding:'13px 20px',borderTop:'1px solid '+C.line,background:'#f8faf3'}},
      h('button',{onClick:close,style:this.btn('ghost')},this.t('dsoClose')));
    return h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:60,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),className:'yscroll',
        style:{width:'min(560px,96vw)',maxHeight:'92vh',overflow:'auto',background:C.white,
          borderRadius:16,boxShadow:'0 30px 70px rgba(0,0,0,.32)'}},
        head, box, list, foot));
  }
  renderFinStKpis(){
    const list=this.finGroups(); let inQ=0,packQ=0,shipQ=0; const seen={};
    list.forEach(g=>{ inQ+=g.in; packQ+=this.fsPacked(g);
      // Da xuat la so cua PO -> chi cong 1 lan cho moi (ma hang | PO)
      const k=g.style+'|'+g.po; if(!seen[k]){ seen[k]=1; shipQ+=this.fsShippedQ(g); } });
    const unpack=Math.max(0,inQ-packQ), stock=Math.max(0,packQ-shipQ);
    return this.finKpis([
      [this.t('fsK1'),this.fmtn(inQ),this.t('fsK1s')],
      [this.t('fsK2'),this.fmtn(unpack),this.t('fsK2s'),unpack>0],
      [this.t('fsK3'),this.fmtn(packQ),this.t('fsK3s')],
      [this.t('fsK4'),this.fmtn(stock),this.t('fsK4s')]]);
  }
  // Bang tinh trang hoan thien: 1 dong = 1 (ma hang | PO | mau) da nhan.
  // Cot go tay: DA DONG GOI va GHI CHU -- o nhap luon mo, khong co che do sua
  // rieng, vi bang khong con cot hanh dong.
  // SL DON / DA XUAT / TON KHO la so cua CA PO (Ke hoach xuat FG chi co den
  // cap ma hang | PO, khong tach mau) -> chi in o dong dau cua moi PO.
  renderFinStTable(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const q=this.state.fsQ||'', all=this.finGroups(), rows=this.finGroupList(q);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('fsCount')),
      this.dfSearchBox(q,v=>this.set({fsQ:v}),false,'fsSearch'));
    // O nhap gon: khong vien, chi gach chan net roi -- giong o ky tren phieu
    const inp=(val,onCh,o)=>h('input',{value:val,placeholder:(o&&o.ph)||'',
      inputMode:(o&&o.num)?'numeric':undefined,size:(o&&o.num)?5:undefined,
      title:(o&&o.title)||undefined,
      onChange:e=>onCh(e.target.value),
      style:{width:'100%',border:'none',background:'none',padding:'2px 0',
        borderBottom:'1px dashed '+((val===''||val==null)?'#c8ccc2':'transparent'),
        textAlign:(o&&o.num)?'right':'left',fontFamily:(o&&o.num)?S.mono:'inherit',
        fontSize:(o&&o.num)?12.5:12,fontWeight:(o&&o.num)?700:500,color:C.ink,outline:'none'}});
    const num=(v,bg,col)=>h('td',{style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,
      fontWeight:700,color:col||C.ink}},v);
    const yday=this.fsYesterday(), today=this.dsoToday();
    const autoTip=this.t('fsPackAuto')+' '+this.FS_PCS_CTN+' '+this.t('fsPcsCtn');
    const body=rows.map((g,i)=>{
      const bg=i%2?'#f7f9f3':C.white, head=this.fsFgHead(rows,i), fg=this.fsFgRow(g);
      const packed=this.fsPacked(g), unpack=this.fsUnpacked(g), packOver=this.fsPackOver(g);
      const packY=this.fsPackDay(g,yday), packT=this.fsPackDay(g,today);
      const ctnO=this.fsCtnOrd(g), ctnP=this.fsCtnPacked(g), ctnU=this.fsCtnUnpacked(g);
      const ctnPk=this.fsCtnPk(g), ctnBc=this.fsCtnBc(g);
      const ctnY=this.fsCtnDay(g,yday), ctnT=this.fsCtnDay(g,today);
      const ctnCap=this.fsCtnCap(g,today), ctnOver=this.fsCtnOver(g);
      const scanT=this.fsScanDay(g,today), scanN=this.fsScanN(g), bcN=this.fsCtnBc(g);
      const ctnTip=this.t('fsCtnTip')
        +(ctnCap!=null?(' \u00b7 '+this.t('fsCtnCap')+' '+this.fmt(ctnCap)):'');
      // Da quet hom nay thi o nay thanh so chi doc: bay 2 con so (o nhap hien
      // phan go tay, cot tong hien ca quet) thi nhin nhu bang tinh sai.
      const ctnMixTip=this.fmt(scanT)+' '+this.t('fsCtnScanT')
        +' + '+this.fmt(this.fsCtnMan(g,today))+' '+this.t('fsCtnManT');
      const order=this.fsOrderQ(g), ship=this.fsShippedQ(g), stock=this.fsStockQ(g);
      // O lay tu Ke hoach xuat FG: in o dong dau cua cum, cac dong sau de trong.
      // Chua do ra dong nao khop ca 3 truong thi de '—' kem chu thich, chu khong
      // in 0 -- 0 la 'co dong, so bang khong', khac han 'chua co dong nao'.
      const po=(v,col)=>h('td',{title:head?this.t(fg?'fsPoTip':'fsNoFgTip'):undefined,
        style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700,
          color:head?((fg&&v)?(col||C.ink):C.faint):'transparent'}},
        head?(fg?this.fmt(v):'\u2014'):'\u00a0');
      return h('tr',{key:g.key},
        h('td',{style:{...S.td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},
          g.lines.join(', ')||'\u2014'),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},
          this.fsBrand(g)||'\u2014'),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono,fontWeight:700}},g.style),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono}},g.po),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},g.color),
        po(order),
        h('td',{title:this.t('fsPackYTip'),style:{...S.td,background:bg,textAlign:'right',
          fontFamily:S.mono,fontWeight:700,color:packY?C.ink:C.faint}},this.fmt(packY)),
        h('td',{title:autoTip,style:{...S.td,background:bg,textAlign:'right',
          fontFamily:S.mono,fontWeight:700,color:packT?C.ink:C.faint}},this.fmt(packT)),
        h('td',{title:this.t(packOver?'fsPackOverTip':'fsPackCTip'),
          style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700,
            color:packOver?'#c0392b':(packed?C.dark:C.faint)}},this.fmt(packed)),
        num(this.fmt(unpack),bg,unpack?'#b0791b':C.faint),
        ctnPk
          // Packing list la so cua ca PO -> in o dong dau cua cum thoi, y het
          // cot SL DON / DA XUAT / TON KHO. Chip nho ben trai la so barcode.
          ? h('td',{title:head?(this.t('fsCtnOrdPk')
              +(ctnBc?(' · '+this.fmt(ctnBc)+' '+this.t('fgBcN')):'')):undefined,
              style:{...S.td,background:bg,textAlign:'right'}},
              head?h('div',{style:{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:5}},
                ctnBc?h('span',{title:this.t('fsCtnBcTip'),
                  style:{fontSize:9.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
                    border:'1px solid '+C.border,borderRadius:999,padding:'1px 5px'}},
                  this.fmt(ctnBc)):null,
                h('span',{style:{fontFamily:S.mono,fontWeight:700,color:C.dark}},this.fmt(ctnPk)))
              :' ')
          : h('td',{style:{...S.td,background:bg,textAlign:'right'}},
              inp(ctnO?String(ctnO):'',v=>this.fsCtnOrdSet(g,v),
                {num:true,ph:'0',title:this.t('fsCtnOrdTip')})),
        h('td',{title:this.t('fsCtnYTip'),style:{...S.td,background:bg,textAlign:'right',
          fontFamily:S.mono,fontWeight:700,color:ctnY?C.ink:C.faint}},this.fmt(ctnY)),
        scanT
          ? h('td',{title:ctnMixTip,style:{...S.td,background:bg,textAlign:'right',
              fontFamily:S.mono,fontWeight:700,color:C.dark}},this.fmt(ctnT))
          : h('td',{style:{...S.td,background:bg,textAlign:'right'}},
              inp(ctnT?String(ctnT):'',v=>this.fsCtnSet(g,today,v),
                {num:true,ph:'0',title:ctnTip})),
        h('td',{title:this.t(ctnOver?'fsCtnOverTip':'fsCtnCTip'),
          style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700,
            color:ctnOver?'#c0392b':(ctnP?C.dark:C.faint)}},this.fmt(ctnP)),
        // Con lai cung o cap PO khi so thung do packing list -> chi in dong dau.
        h('td',{title:(!ctnPk||head)?this.t('fsCtnUTip'):undefined,
          style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700,
            color:(ctnPk&&!head)?'transparent':(ctnU?'#b0791b':C.faint)}},
          (ctnPk&&!head)?'\u00a0':(ctnU==null?'\u2014':this.fmt(ctnU))),
        po(ship,'#1c6b52'),
        po(stock,C.dark),
        h('td',{style:{...S.td,background:bg,minWidth:150}},
          inp(this.fsRemark(g),v=>this.fsRemarkSet(g,v),{ph:this.t('fsRemarkPh')})),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('button',{disabled:!bcN,title:this.t(bcN?'fsScanTip':'fsScanNoBc'),
            onClick:()=>{ if(bcN) this.fsScanShow(g); },
            style:{display:'inline-flex',alignItems:'center',gap:6,borderRadius:8,
              padding:'4px 10px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',
              border:'1px solid '+(bcN?C.primary:C.border),background:bcN?C.tint:C.white,
              color:bcN?C.dark:C.faint,cursor:bcN?'pointer':'not-allowed'}},
            this.bcIc(), this.t('fsScanBtn'),
            bcN?h('span',{style:{fontFamily:S.mono,fontSize:10.5,color:C.sub}},
              this.fmt(scanN)+'/'+this.fmt(bcN)):null)));
    });
    // Tieu de 2 hang. {g,sub} = 1 o om 3 cot con (DA DONG GOI pcs va THUNG DA
    // DONG); cot thuong keo cao ca 2 hang. Thu tu: khoi pcs xong roi den khoi
    // thung, cuoi cung la DA XUAT / TON KHO / GHI CHU.
    // tip la CHUOI da dung san, khong phai khoa i18n -- o HOM NAY cua khoi pcs
    // can chen ca ti le vao chu thich.
    const SUBP=[['fsCPackY',this.t('fsPackYTip')],['fsCPackT',autoTip],
                ['fsCPackC',this.t('fsPackCTip')]];
    const SUBC=[['fsCPackY',this.t('fsCtnYTip')],['fsCPackT',this.t('fsCtnTip')],
                ['fsCPackC',this.t('fsCtnCTip')]];
    const spec=[{k:'fsCLine'},{k:'fsCBrand'},{k:'fsCStyle'},{k:'fsCPo'},{k:'fsCColor'},
      {k:'fsCOrder',r:1},{g:'fsCPacked',gt:autoTip,sub:SUBP},{k:'fsCUnpack',r:1},
      {k:'fsCOrderC',r:1},{g:'fsCPackedC',sub:SUBC},{k:'fsCUnpackC',r:1},
      {k:'fsCShip',r:1},{k:'fsCStock',r:1},{k:'fsCRemark'},{k:'fsCAct'}];
    const nCol=spec.reduce((a,c)=>a+(c.sub?c.sub.length:1),0);
    // Hang 2 phai la 1 mang phang, moi o 1 key rieng -- long mang vao nhau thi
    // React canh bao trung key giua 2 nhom.
    const sub2=[]; spec.forEach(c=>{ if(c.sub) c.sub.forEach(([k,tip],j)=>
      sub2.push([c.g+'-'+j,k,tip])); });
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'2080px',borderCollapse:'collapse'}},
        h('thead',null,
          h('tr',null, spec.map((c,ci)=>c.sub
            ? h('th',{key:'g'+ci,colSpan:c.sub.length,title:c.gt||undefined,
                style:{...S.th,textAlign:'center',borderBottom:'1px solid '+C.line}},this.t(c.g))
            : h('th',{key:c.k,rowSpan:2,style:{...S.th,...(c.r?{textAlign:'right'}:{}),
                ...(ci===spec.length-1?{borderRight:'none'}:{})}},this.t(c.k)))),
          h('tr',null, sub2.map(([key,k,tip])=>h('th',{key,title:tip,
            style:{...S.th,textAlign:'right',fontSize:10,letterSpacing:'.3px',width:104}},this.t(k))))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:nCol,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'fsNoHit':'fsEmpty'))))));
    return this.dsoCard('fsPanel','fsSub','Finishing Status',tbl,{full:true,action});
  }

  // ---- F.G Shipment Plan ---------------------------------------------------
  // Hạt giống lấy thẳng từ Kế hoạch sản xuất: mỗi (mã hàng · PO) = 1 lô xuất.
  // Cột COLOR gom mọi màu của lô: khóa (mã hàng | PO) dò ra tác nghiệp cắt rồi
  // lấy danh sách màu ở BẢNG TỔNG THEO MÀU, xem fgColors().
  // ETD = ngày kết thúc chuyền + FG_LEAD ngày cho hoàn thiện + kiểm + đóng cont.
  FG_LEAD=7;
  FG_LOAD_LEAD=2;                       // ngày đóng hàng = ETD - 2 ngày
  FG_FACTORY='YIC Hà Nam';
  FG_MODES=['SEA','AIR','EXPRESS','TRUCK'];
  // BẢNG TỔNG THEO MÀU: danh sách màu của tác nghiệp cắt (bỏ nhóm phụ liệu 'aux')
  fgEnsure(){ if(this.state.fgSeeded||(this.state.fgRows||[]).length) return false;
    const rows=this.fgSeed(); if(!rows.length) return false;
    this.set({fgRows:rows,fgSeeded:1}); return true; }
  fgReseed(){ if(!window.confirm(this.t('fgReseedAsk'))) return;
    const rows=this.fgSeed(); this.set({fgRows:rows,fgSeeded:1,fgEdit:null,fgQ:''}); }
  fgAll(){ return this.state.fgRows||[]; }
  // ETD go vao duoc ca 2 dang: '2026-09-10' (trong state) va '10/09/2026' (tren bang)
  fgList(q){ const l=this.fgAll(); q=String(q||'').trim().toLowerCase(); if(!q) return l;
    return l.filter(r=>[r.brand,r.season,r.factory,r.style,r.po,r.color,r.mode,r.dest,
      r.load,this.dsoDay(r.load),r.etd,this.dsoDay(r.etd),r.note]
      .join(' ').toLowerCase().indexOf(q)>=0); }
  fgSet(id,patch){ this.setState(s=>({fgRows:(s.fgRows||[]).map(r=>r.id===id?{...r,...patch}:r)})); }
  fgDel(id){ this.setState(s=>({fgRows:(s.fgRows||[]).filter(r=>r.id!==id),
    fgEdit:s.fgEdit===id?null:s.fgEdit})); }
  fgAdd(){ this.setState(s=>{ const l=s.fgRows||[]; let n=0;
      l.forEach(r=>{ const m=String(r.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); });
      const id='fg'+(n+1); this._fgNew=id;
      return {fgRows:[...l,{id,brand:'',season:'',factory:this.FG_FACTORY,style:'',po:'',color:'',
        qty:0,ship:0,load:this.dsoToday(),etd:this.dsoToday(),mode:'SEA',dest:'',cbm:'',note:''}],fgSeeded:1}; });
    setTimeout(()=>{ if(this._mounted&&this._fgNew) this.set({fgEdit:this._fgNew,fgQ:''}); },0); }
  fgNum(v){ return Math.max(0,parseInt(String(v).replace(/[^0-9]/g,''),10)||0); }
  // CBM giữ nguyên chuỗi khi đang gõ (cho phép '1.', '0.05') — chỉ chặn ký tự lạ.
  fgDec(v){ return String(v).replace(/[^0-9.]/g,'').replace(/^\./,'0.').replace(/(\..*)\./g,'$1'); }
  fgCbmTxt(v){ const n=Number(v); return n>0?n.toFixed(2):'—'; }
  fgSeason(d){ const m=d.getMonth()+1;
    return (m<=6?'SS':'AW')+String(d.getFullYear()).slice(-2); }
  fgReadyQty(r){ return this.finFgQty(r.style,r.po); }
  // SL CÂN ĐỐI = SL đã xuất − SL đơn hàng: âm = còn thiếu, dương = xuất vượt.
  fgBal(r){ return (Number(r.ship)||0)-(Number(r.qty)||0); }
  // Tre ETD: con hang chua xuat ma da qua ngay ETD.
  fgLate(r){ return !!(r.etd&&String(r.etd)<this.dsoToday()
    &&(Number(r.ship)||0)<(Number(r.qty)||0)); }
  fgExport(){ const X=window.XLSX; if(!X||!X.utils){ this.fgSay(this.t('mtNoXlsx')); return; }
    const rows=this.fgList(this.state.fgQ||'');
    const head=['fgBrand','fgSeason','fgFactory','fgStyle','fgPo','fgColor','fgQty','fgShipped','fgBal',
      'fgLoad','fgEtd','fgMode','fgDest','fgCbm','fgNote'];
    const aoa=[[this.t('fgTitle')],['YIC HÀ NAM · '+this.todayStamp()],[],head.map(k=>this.t(k))];
    rows.forEach(r=>aoa.push([r.brand||'',r.season||'',r.factory||'',r.style||'',r.po||'',r.color||'',
      Number(r.qty)||0,Number(r.ship)||0,this.fgBal(r),r.load||'',r.etd||'',r.mode||'',r.dest||'',
      Number(r.cbm)||0,r.note||'']));
    const ws=X.utils.aoa_to_sheet(aoa);
    ws['!cols']=[14,10,14,18,12,14,15,16,16,13,13,11,16,8,26].map(w=>({wch:w}));
    const wb=X.utils.book_new(); X.utils.book_append_sheet(wb,ws,'FG Shipment');
    X.writeFile(wb,'YIC-HaNam_FG-Shipment-Plan.xlsx'); }
  fgSay(m){ this.set({fgMsg:m}); clearTimeout(this._fgT);
    this._fgT=setTimeout(()=>{ if(this._mounted) this.set({fgMsg:''}); },4000); }

  // ==========================================================================
  // PACKING LIST + BARCODE cua 1 lo xuat
  // --------------------------------------------------------------------------
  // Khoa theo id dong Ke hoach xuat (ma hang | PO | mau) chu khong theo PO tran:
  // bang Tinh trang hoan thien do nguoc ve dung 1 dong qua fsFgRow(g), nen so
  // thung cua packing list chay thang vao cot SL THUNG DON HANG cua dong do.
  //
  //   fgPk[fgRowId] = {name,at,ctn,rows}   packing list -> TONG SO THUNG
  //   fgBc[fgRowId] = {name,at,list:[...]} danh sach barcode dong thung
  //
  // Barcode phai co packing list truoc: barcode la ma cua tung thung, khong co
  // packing list thi khong biet lo nay dang co bao nhieu thung de doi chieu.
  FG_BC_MAX=20000;                       // tran de khong lam vo localStorage
  fgPkOf(r){ return (this.state.fgPk||{})[r&&r.id]||null; }
  fgBcOf(r){ return (this.state.fgBc||{})[r&&r.id]||null; }
  fgPkCtn(r){ const p=this.fgPkOf(r); return p?(Number(p.ctn)||0):0; }
  // Header do khach hang dat ten, moi noi mot kieu -> quet 12 dong dau tim hang
  // tieu de, khong khop thi tra ve -1 va ben goi tu quyet dinh.
  fgHdr(aoa,PAT){ const n=s=>this.dfFold(s).replace(/\s+/g,' ');
    for(let i=0;i<Math.min((aoa||[]).length,12);i++){ const r=aoa[i]||[], m={};
      r.forEach((c,j)=>{ const v=n(c); if(!v) return;
        PAT.forEach(([f,re])=>{ if(m[f]==null&&re.test(v)) m[f]=j; }); });
      if(Object.keys(m).length) return {hi:i,map:m}; }
    return {hi:-1,map:{}}; }
  // TONG SO THUNG, theo do tin cay giam dan:
  //   1. o ghi ro 'TONG SO THUNG / TOTAL CARTON' -> lay so ben canh
  //   2. cot SO THUNG (carton no) -> dem so thung KHAC NHAU (1 thung nhieu dong size)
  //   3. cot SL THUNG (ctn qty)   -> cong lai
  fgPkParse(aoa){
    const n=s=>this.dfFold(s).replace(/\s+/g,' ');
    const num=v=>{ const s=String(v==null?'':v).replace(/[^0-9.]/g,''); const x=parseFloat(s);
      return isFinite(x)?Math.round(x):0; };
    const TOT=/(tong (so )?(thung|carton|ctn)|total (no of )?(carton|ctn)s?|carton (qty|total)|grand total ctns?)/;
    for(let i=0;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      for(let j=0;j<r.length;j++){ if(!TOT.test(n(r[j]))) continue;
        for(let k=j+1;k<Math.min(j+5,r.length);k++){ const v=num(r[k]); if(v>0) return {ctn:v,rows:0}; } } }
    const PAT=[['no',/(so thung|carton no|ctn no|carton ?#|ctn ?#|carton number|^carton$|^ctn$)/],
               ['qty',/(sl thung|so luong thung|ctn qty|carton qty|qty ?\/ ?ctn|total ctn|no ?of ?ctn|box qty)/]];
    const {hi,map}=this.fgHdr(aoa,PAT);
    if(hi<0) return {ctn:0,rows:0};
    let rows=0; const seen={}; let sum=0;
    for(let i=hi+1;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      if(map.no!=null){ const v=String(r[map.no]==null?'':r[map.no]).trim();
        if(v&&!TOT.test(n(v))&&!seen[v]){ seen[v]=1; } }
      if(map.qty!=null){ const q=num(r[map.qty]); if(q>0) sum+=q; }
      if((r||[]).some(c=>String(c==null?'':c).trim()!=='')) rows++; }
    const dis=Object.keys(seen).length;
    return {ctn:dis||sum,rows};
  }
  // CHI TIET DONG THUNG. Packing list cua khach viet gon: 1 dong la 1 DAI thung
  // giong het nhau -- 'FIRST BOX 1 ~ LAST BOX 27 / BOX QUANTITY 27'. Ham nay giu
  // nguyen dang gon do (18 dong thay vi 508) roi de fgPkSlice() bung ra khi ve
  // bang: localStorage khong phinh, ma van doc duoc tung thung mot.
  //
  // Bo tieu de cua file mau gom 3 hang:
  //   hang 1  STYLE NO | CARTON NO# | COLOR | PO# | SIZE / QUANTITY / WEIGHT
  //           | Q'TY OF PCS/CTN | Q'TY OF PCS | GROSS WEIGHT OF BOX | ... | BOX SIZE
  //   hang 2  FIRST BOX | ~ | LAST BOX | BOX QUANTITY | M L XL 2XL... | L W H CBM
  //   hang 3  trong luong 1 pcs cua tung size (0.32 / 0.35 / 0.38 ...)
  // Khoi cot size = tu cot 'SIZE / ...' den ngay truoc cot pcs/thung.
  //
  // GW/NW/CBM tren file: cot GROSS WEIGHT OF BOX la cua 1 thung, con GROSS WEIGHT
  // / NET WEIGHT / CBM la CONG CA DAI -> chia cho BOX QUANTITY de ra 1 thung.
  fgPkDetail(aoa){
    const n=s=>this.dfFold(s).replace(/\s+/g,' ');
    const num=v=>{ if(typeof v==='number') return isFinite(v)?v:0;
      const s=String(v==null?'':v).replace(/[^0-9.]/g,''); const x=parseFloat(s);
      return isFinite(x)?x:0; };
    const has=r=>(r||[]).some(c=>String(c==null?'':c).trim()!=='');
    // 1. Hang tieu de chinh: phai co CA cot so thung LAN cot so pcs mot thung,
    //    khong thi con dang la mot hang thong tin dau file.
    let hi=-1, M=null;
    for(let i=0;i<Math.min((aoa||[]).length,30);i++){ const r=aoa[i]||[], m={};
      r.forEach((c,j)=>{ const v=n(c); if(!v) return;
        if(m.ctn==null  && /(carton|ctn) ?(no|#|number)/.test(v)) m.ctn=j;
        if(m.style==null&& /^style ?(no|#|code)?\b/.test(v)) m.style=j;
        if(m.color==null&& /^colou?r\b/.test(v)) m.color=j;
        if(m.po==null   && /^po ?#?$/.test(v)) m.po=j;
        if(m.size==null && /^size ?[\/·-]/.test(v)) m.size=j;
        if(m.qc==null   && /\/ ?ctn|per ctn|\/ ?box|per box|\/thung/.test(v)) m.qc=j;
        if(m.gwBox==null&& /gross weight of (box|ctn|carton)/.test(v)) m.gwBox=j;
        if(m.gw==null   && /^gross weight/.test(v) && !/of (box|ctn|carton)/.test(v)) m.gw=j;
        if(m.nw==null   && /net weight/.test(v)) m.nw=j;
        if(m.bs==null   && /(box|carton|ctn) (size|measure|dimension)/.test(v)) m.bs=j; });
      if(m.ctn!=null&&m.qc!=null){ hi=i; M=m; break; } }
    if(hi<0) return null;
    // 2. Hang tieu de phu ngay duoi: khoang thung + kich thuoc thung
    const sub=aoa[hi+1]||[];
    sub.forEach((c,j)=>{ const v=n(c); if(!v) return;
      if(M.first==null&& /first (box|ctn|carton)|^from$/.test(v)) M.first=j;
      if(M.last==null && /last (box|ctn|carton)|^to$/.test(v)) M.last=j;
      if(M.qty==null  && /(box|ctn|carton) (quantity|qty)/.test(v)) M.qty=j;
      if(M.L==null    && /^length$/.test(v)) M.L=j;
      if(M.W==null    && /^width$/.test(v)) M.W=j;
      if(M.H==null    && /^height$/.test(v)) M.H=j;
      if(M.cbm==null  && /cbm/.test(v)) M.cbm=j; });
    if(M.first==null) return null;
    // 3. Ten size lay o hang phu, trong luong 1 pcs o hang ke tiep
    const sizes=[], wrow=aoa[hi+2]||[];
    if(M.size!=null&&M.qc>M.size)
      for(let j=M.size;j<M.qc;j++){ const nm=String(sub[j]==null?'':sub[j]).trim();
        if(nm) sizes.push({c:j,name:nm.replace(/\s+/g,' '),unit:num(wrow[j])}); }
    // 4. Dong du lieu: dung ngay khi cham khoi tong ket cuoi bang
    const TTL=/^(ttl|total|tong|grand|order qty|shipped)/;
    const st=hi+(sizes.some(s=>s.unit>0)?3:2);
    const lines=[]; let blank=0;
    for(let i=st;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      if(!has(r)){ if(lines.length&&++blank>=6) break; continue; }
      if(r.slice(0,Math.max(6,M.qc)).some(c=>TTL.test(n(c)))) break;
      const f=Math.round(num(r[M.first])); if(!(f>0)) continue;
      const l=Math.max(f,M.last!=null?Math.round(num(r[M.last])):f);
      let box=M.qty!=null?Math.round(num(r[M.qty])):0;
      if(!(box>0)) box=Math.max(1,l-f+1);
      const sz=sizes.map(s=>({name:s.name,unit:s.unit,qty:Math.round(num(r[s.c]))}))
        .filter(s=>s.qty>0);
      const qc=M.qc!=null&&num(r[M.qc])>0?Math.round(num(r[M.qc]))
        :sz.reduce((a,b)=>a+b.qty,0);
      lines.push({first:f,last:l,box,qc,sz,
        style:M.style!=null?String(r[M.style]||'').trim():'',
        color:M.color!=null?String(r[M.color]||'').trim():'',
        po:M.po!=null?String(r[M.po]||'').trim():'',
        gw:M.gwBox!=null?num(r[M.gwBox]):(M.gw!=null?num(r[M.gw])/box:0),
        nw:M.nw!=null?num(r[M.nw])/box:0,
        cbm:M.cbm!=null?num(r[M.cbm])/box:0,
        L:M.L!=null?num(r[M.L]):0,W:M.W!=null?num(r[M.W]):0,H:M.H!=null?num(r[M.H]):0});
      blank=0; }
    if(!lines.length) return null;
    const sum=f=>lines.reduce((a,b)=>a+(Number(b[f])||0)*b.box,0);
    return {lines,ctn:lines.reduce((a,b)=>a+b.box,0),rows:lines.length,
      pcs:sum('qc'),gw:sum('gw'),nw:sum('nw'),cbm:sum('cbm')};
  }
  // Barcode: uu tien cot co tieu de barcode; khong co tieu de thi khong doan bua.
  fgBcParse(aoa){
    const PAT=[['bc',/(barcode|bar code|ma vach|ma so thung|upc|ean|gtin|sscc|scan ?code)/]];
    const {hi,map}=this.fgHdr(aoa,PAT);
    if(hi<0||map.bc==null) return [];
    const out=[], seen={};
    for(let i=hi+1;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      const v=String(r[map.bc]==null?'':r[map.bc]).trim();
      if(!v||v.length<4||seen[v]) continue; seen[v]=1; out.push(v);
      if(out.length>=this.FG_BC_MAX) break; }
    return out; }
  async fgSheet(file){ const X=window.XLSX;
    if(!X||!X.read){ this.fgSay(this.t('mtNoXlsx')); return null; }
    const buf=await file.arrayBuffer();
    const wb=X.read(new Uint8Array(buf),{type:'array'});
    const ws=wb.Sheets[wb.SheetNames[0]];
    return X.utils.sheet_to_json(ws,{header:1,blankrows:false}); }
  // Doc ban CHI TIET truoc: no cho ca danh sach thung lan tong so thung dung
  // (cong BOX QUANTITY). File nao khong co bo tieu de day du thi lui ve
  // fgPkParse() cu -- chi lay duoc tong so thung, modal se bao chua doc duoc.
  async fgPkImport(r,file){ if(!r||!file) return;
    try{ const aoa=await this.fgSheet(file); if(!aoa) return;
      const det=this.fgPkDetail(aoa);
      const got=det||this.fgPkParse(aoa);
      if(!got.ctn){ this.fgSay(this.t('fgPkNone')); return; }
      this.setState(s=>({fgPk:{...(s.fgPk||{}),
        [r.id]:{name:file.name,at:Date.now(),ctn:got.ctn,rows:got.rows,
          lines:det?det.lines:null,pcs:det?det.pcs:0,gw:det?det.gw:0,
          nw:det?det.nw:0,cbm:det?det.cbm:0}}}));
      this.fgSay(this.t('fgPkOk')+' '+this.fmt(got.ctn)+' '+this.t('fgPkCtn'));
    }catch(e){ this.fgSay(this.t('mtImportErr')); } }
  async fgBcImport(r,file){ if(!r||!file) return;
    if(!this.fgPkOf(r)){ this.fgSay(this.t('fgBcNeed')); return; }
    try{ const aoa=await this.fgSheet(file); if(!aoa) return;
      const list=this.fgBcParse(aoa);
      if(!list.length){ this.fgSay(this.t('fgBcNone')); return; }
      this.setState(s=>({fgBc:{...(s.fgBc||{}),
        [r.id]:{name:file.name,at:Date.now(),list}}}));
      const cut=list.length>=this.FG_BC_MAX;
      this.fgSay(this.t('fgBcOk')+' '+this.fmt(list.length)+' '+this.t(cut?'fgBcCut':'fgBcN'));
    }catch(e){ this.fgSay(this.t('mtImportErr')); } }
  // Bo packing list thi bo luon barcode -- barcode khong dung mot minh duoc.
  fgPkClear(r){ this.setState(s=>{ const p={...(s.fgPk||{})}, b={...(s.fgBc||{})};
    delete p[r.id]; delete b[r.id]; return {fgPk:p,fgBc:b}; }); }
  fgBcClear(r){ this.setState(s=>{ const b={...(s.fgBc||{})}; delete b[r.id]; return {fgBc:b}; }); }
  // Nut nhap file: label boc input type=file an di -- cung kieu voi Line Setting.
  fgImpBtn(label,title,onFile,on,extra){ const h=React.createElement, C=this.C;
    const st={border:'1px solid '+(on?C.primary:C.border),background:on?C.tint:C.white,
      color:on?C.dark:C.sub,borderRadius:8,padding:'4px 10px',fontSize:11.5,fontWeight:700,
      cursor:'pointer',whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:5,...(extra||{})};
    return h('label',{title,style:st,'style-hover':{background:C.tint}}, label,
      h('input',{type:'file',accept:'.xlsx,.xls,.csv',style:{display:'none'},
        onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) onFile(f); }})); }

  // 2 nut nhap file cua 1 lo xuat + so lieu da nhap. Barcode chi mo khi da co
  // packing list; chua co thi hien nut mo nhat, khong bam duoc.
  fgImpCell(r){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const pk=this.fgPkOf(r), bc=this.fgBcOf(r);
    const chip=(txt,title,onX,clrTip)=>h('span',{title,
      style:{display:'inline-flex',alignItems:'center',gap:4,fontSize:10.5,fontWeight:700,
        fontFamily:S.mono,color:C.dark,background:C.tint,border:'1px solid '+C.border,
        borderRadius:999,padding:'2px 4px 2px 8px',whiteSpace:'nowrap'}}, txt,
      h('button',{title:clrTip,onClick:onX,style:{border:'none',background:'none',color:'#c0392b',
        cursor:'pointer',fontSize:13,lineHeight:1,padding:'0 3px',fontFamily:'inherit'}},'×'));
    return h('div',{style:{display:'inline-flex',gap:6,flexWrap:'wrap',alignItems:'center'}},
      this.fgImpBtn(this.t('fgPkImp'),this.t(pk?'fgPkHas':'fgPkTip'),
        f=>this.fgPkImport(r,f),!!pk),
      pk?chip(this.fmt(pk.ctn)+' '+this.t('fgPkCtn'),
        pk.name+' · '+this.dsoSlipWhen(pk.at),()=>this.fgPkClear(r),this.t('fgPkClr')):null,
      pk?this.fgImpBtn(this.t('fgBcImp'),this.t(bc?'fgBcHas':'fgBcTip'),
          f=>this.fgBcImport(r,f),!!bc)
        :h('span',{title:this.t('fgBcNeed'),
            style:{border:'1px dashed '+C.border,background:'none',color:C.faint,borderRadius:8,
              padding:'4px 10px',fontSize:11.5,fontWeight:700,whiteSpace:'nowrap',cursor:'not-allowed'}},
            this.t('fgBcImp')),
      bc?chip(this.fmt((bc.list||[]).length)+' '+this.t('fgBcN'),
        bc.name+' · '+this.dsoSlipWhen(bc.at),()=>this.fgBcClear(r),this.t('fgBcClr')):null);
  }

  // ==========================================================================
  // MODAL 1 LO XUAT: the tong hop + packing list bung theo tung thung
  // --------------------------------------------------------------------------
  // Bang ngoai moi lo dung 1 dong; bam vao dong nao thi mo modal cua dong do.
  // Phia tren la the thong tin cua chinh dong ay + 2 nut nhap packing list /
  // barcode (dung lai fgImpCell). Phia duoi bung dong packing list '1 ~ 27  27'
  // thanh dung 27 dong thung.
  //
  // Cot SIZE / QUANTITY / WEIGHT cua file goc thu con 1 cot: chi ghi size va
  // trong luong 1 pcs -- so hang trong thung da nam o cot SL PCS/THUNG ben canh.
  // Rieng thung ghep nhieu size thi phai ghi kem so pcs tung size, vi luc do cot
  // SL PCS/THUNG chi la tong, khong suy nguoc ra duoc.
  //
  // 1 lo co the vai nghin thung nen bang chia trang; fgPkSlice() chi dung ra
  // dung so thung cua trang dang xem chu khong dung ca mang.
  FG_PP=[50,100,200,500];
  fgOpen(id){ this.set({fgSel:id,fgPg:1}); }
  fgClose(){ this.set({fgSel:null}); }
  fgSelRow(){ const id=this.state.fgSel;
    return id?(this.fgAll().find(r=>r.id===id)||null):null; }
  fgPkLines(r){ const p=this.fgPkOf(r); return (p&&p.lines)||[]; }
  fgPkCtnN(r){ return this.fgPkLines(r).reduce((a,b)=>a+Math.max(1,Number(b.box)||1),0); }
  // Bung [from,to) thung: dong nao nam ngoai khoang thi nhay qua ca dong.
  fgPkSlice(r,from,to){ const out=[]; let base=0;
    this.fgPkLines(r).forEach(l=>{ const box=Math.max(1,Number(l.box)||1);
      const a=Math.max(from,base), b=Math.min(to,base+box);
      for(let i=a;i<b;i++) out.push({i,no:(Number(l.first)||1)+(i-base),l});
      base+=box; });
    return out; }
  fgKg(n){ n=Number(n)||0; return n?n.toFixed(2):'—'; }
  fgM3(n){ n=Number(n)||0; return n?n.toFixed(4):'—'; }
  fgBoxTxt(l){ const d=[l.L,l.W,l.H].map(x=>Number(x)||0);
    return d.every(x=>x>0)?d.map(x=>this.fmtn(x)).join(' × '):'—'; }
  // Thung 1 size -> 'M'; thung ghep -> '2XL ×8 + 4XL ×20'
  fgSzTxt(l){ const s=(l&&l.sz)||[]; if(!s.length) return '—';
    const mix=s.length>1;
    return s.map(x=>x.name+(mix?' ×'+this.fmt(x.qty):'')).join(' + '); }
  fgSzWt(l){ const s=((l&&l.sz)||[]).filter(x=>Number(x.unit)>0);
    return s.length?s.map(x=>Number(x.unit).toFixed(2)).join(' / ')+' kg/pcs':''; }
  fgPgN(tot,pp){ return Math.max(1,Math.ceil(tot/pp)); }

  renderFgModal(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const r=this.fgSelRow(); if(!r) return null;
    const close=()=>this.fgClose();
    const pk=this.fgPkOf(r), bc=this.fgBcOf(r), bl=(bc&&bc.list)||[];
    const tot=this.fgPkCtnN(r);
    const pp=Number(this.state.fgPp)||100, np=this.fgPgN(tot,pp);
    const pg=Math.min(Math.max(1,Number(this.state.fgPg)||1),np);
    const from=(pg-1)*pp, to=Math.min(tot,from+pp);
    const page=tot?this.fgPkSlice(r,from,to):[];
    // Co file ma khong ra thung nao = bo tieu de cua file khong doc duoc
    const noneKey=pk&&!tot?'fgDNone':'fgDEmpty';
    const fld=(lb,v,ex)=>h('div',{key:lb,style:{minWidth:0}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,
        whiteSpace:'nowrap'}},lb),
      h('div',{style:{fontSize:13,fontWeight:700,color:C.ink,marginTop:2,
        wordBreak:'break-word',...(ex||{})}},v==null||v===''?'—':v));
    const kpi=(lb,v,fg)=>h('div',{key:lb,style:{flex:'none',minWidth:96,background:C.white,
        border:'1px solid '+C.border,borderRadius:10,padding:'7px 12px'}},
      h('div',{style:{fontSize:9,fontWeight:700,letterSpacing:'.5px',color:C.faint,
        whiteSpace:'nowrap'}},lb),
      h('div',{style:{fontSize:16,fontWeight:700,fontFamily:S.mono,color:fg||C.ink,marginTop:2,
        lineHeight:1}},v));
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'15px 20px',
        flex:'none',borderBottom:'1px solid '+C.line}},
      h('div',{style:{width:36,height:36,borderRadius:10,background:C.tint,color:C.dark,flex:'none',
          display:'flex',alignItems:'center',justifyContent:'center'}},
        h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M3 9h18v11H3z'}),h('path',{d:'M3 9l2-5h14l2 5'}),h('path',{d:'M10 13h4'}))),
      h('div',{style:{minWidth:0,marginRight:'auto'}},
        h('div',{style:{fontSize:16,fontWeight:700}},this.t('fgMdPanel')),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:2}},this.t('fgMdSub'))),
      this.state.fgMsg?h('span',{style:{fontSize:11.5,fontWeight:600,color:C.primary,background:C.tint,
        border:'1px solid '+C.border,borderRadius:99,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.state.fgMsg):null,
      h('button',{title:this.t('dsoClose'),onClick:close,
        style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,
          height:30,flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,
          fontFamily:'inherit'},'style-hover':{background:C.tint}},'×'));
    // The thong tin: y het 1 dong cua bang ngoai, gom ca 2 nut nhap file
    const bal=this.fgBal(r);
    const info=h('div',{style:{flex:'none',padding:'14px 20px',background:C.tint2,
        borderBottom:'1px solid '+C.line,display:'flex',flexDirection:'column',gap:13}},
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(104px,1fr))',
          gap:13}},
        fld(this.t('fgStyle'),r.style,{color:C.primary,fontFamily:S.mono}),
        fld(this.t('fgPo'),r.po,{fontFamily:S.mono}),
        fld(this.t('fgBrand'),r.brand),
        fld(this.t('fgSeason'),r.season,{fontFamily:S.mono}),
        fld(this.t('fgColor'),r.color,{color:C.dark}),
        fld(this.t('fgFactory'),r.factory),
        fld(this.t('fgLoad'),r.load?this.dsoDay(r.load):'',{fontFamily:S.mono}),
        fld(this.t('fgEtd'),r.etd?this.dsoDay(r.etd):'',
          {fontFamily:S.mono,color:this.fgLate(r)?'#c0392b':C.ink}),
        fld(this.t('fgMode'),r.mode,{fontFamily:S.mono}),
        fld(this.t('fgDest'),r.dest),
        fld(this.t('fgCbm'),this.fgCbmTxt(r.cbm),{fontFamily:S.mono}),
        fld(this.t('fgNote'),r.note,{fontWeight:600,color:C.sub})),
      h('div',{style:{display:'flex',gap:9,flexWrap:'wrap'}},
        kpi(this.t('fgQty'),this.fmt(r.qty)),
        kpi(this.t('fgShipped'),this.fmt(r.ship),C.dark),
        kpi(this.t('fgBal'),this.fmt(bal),bal<0?'#c0392b':(bal>0?C.primary:C.faint)),
        pk?kpi(this.t('fgPkCtnN'),this.fmt(tot),C.primary):null,
        pk?kpi(this.t('fgPkPcs'),this.fmt(pk.pcs||0)):null,
        pk?kpi(this.t('fgPkGw'),this.fgKg(pk.gw)):null,
        pk?kpi(this.t('fgPkNw'),this.fgKg(pk.nw)):null,
        pk?kpi(this.t('fgPkCbm'),this.fgM3(pk.cbm)):null,
        bl.length?kpi(this.t('fgDBc'),this.fmt(bl.length),C.dark):null),
      h('div',{style:{display:'flex',gap:14,flexWrap:'wrap',alignItems:'center'}},
        this.fgImpCell(r),
        h('div',{style:{display:'flex',gap:14,flexWrap:'wrap',fontSize:10.5,color:C.faint,
          fontFamily:S.mono}},
          h('span',null,this.t('fgPkFile')+': ',h('b',{style:{color:pk?C.sub:C.faint}},
            pk?(pk.name+' · '+this.dsoSlipWhen(pk.at)):this.t('fgNoFile'))),
          h('span',null,this.t('fgBcFile')+': ',h('b',{style:{color:bc?C.sub:C.faint}},
            bc?(bc.name+' · '+this.dsoSlipWhen(bc.at)):this.t('fgNoFile'))))));
    // Bang chi tiet: 1 dong = 1 thung
    const cols=[['mtNo',0,46],['fgDCtn',0,96],['fgStyle',0,180],['fgColor',0,110],['fgPo',0,96],
      ['fgDSize',0,'auto'],['fgDQc',1,104],['fgDGw',1,116],['fgDNw',1,116],['fgDBox',0,150],
      ['fgDCbm',1,104]].concat(bl.length?[['fgDBc',0,168]]:[]);
    const body=page.map(({i,no,l})=>{ const bg=i%2?'#f7f9f3':C.white, wt=this.fgSzWt(l);
      const cell=(v,ex)=>h('td',{style:{...S.td,background:bg,...(ex||{})}},v);
      return h('tr',{key:i},
        cell(this.fmt(i+1),{textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}),
        cell(this.fmt(no),{textAlign:'center',fontFamily:S.mono,fontWeight:700,color:C.primary}),
        cell(l.style||r.style||'—',{fontFamily:S.mono,fontSize:11.5}),
        cell(l.color||'—',{fontWeight:600}),
        cell(l.po||r.po||'—',{fontFamily:S.mono,fontSize:11.5,color:C.sub}),
        cell(h('div',null,
          h('span',{style:{fontFamily:S.mono,fontWeight:700,color:C.ink}},this.fgSzTxt(l)),
          wt?h('span',{style:{fontFamily:S.mono,fontSize:10.5,color:C.faint,marginLeft:7}},wt):null)),
        cell(this.fmt(l.qc),{textAlign:'right',fontFamily:S.mono,fontWeight:700}),
        cell(this.fgKg(l.gw),{textAlign:'right',fontFamily:S.mono}),
        cell(this.fgKg(l.nw),{textAlign:'right',fontFamily:S.mono}),
        cell(this.fgBoxTxt(l),{fontFamily:S.mono,fontSize:11.5,whiteSpace:'nowrap'}),
        cell(this.fgM3(l.cbm),{textAlign:'right',fontFamily:S.mono,fontSize:11.5}),
        bl.length?cell(bl[i]||'—',{fontFamily:S.mono,fontSize:11,
          color:bl[i]?C.dark:C.faint,wordBreak:'break-all'}):null);
    });
    const empty=h('tr',null,h('td',{colSpan:cols.length,
      style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none',
        maxWidth:0,whiteSpace:'normal',lineHeight:1.5}},
      this.t(noneKey)));
    const tbl=h('div',{className:'yscroll',style:{overflow:'auto',flex:1,minHeight:150}},
      h('table',{style:{width:'100%',minWidth:'1180px',borderCollapse:'collapse'}},
        h('colgroup',null,cols.map(([k,,w])=>h('col',{key:k,
          style:{width:w==='auto'?'auto':w+'px'}}))),
        h('thead',null,h('tr',null,cols.map(([k,rt],ci)=>h('th',{key:k,
          style:{...S.th,position:'sticky',top:0,zIndex:1,
            ...(rt?{textAlign:'right'}:{}),
            ...(ci<2?{textAlign:'center',paddingLeft:8}:{}),
            ...(ci===cols.length-1?{borderRight:'none'}:{})}},this.t(k))))),
        h('tbody',null, tot?body:empty)));
    // Chan: chia trang
    const pgBtn=(lb,go,dis)=>h('button',{onClick:dis?undefined:()=>this.set({fgPg:go}),
      style:{border:'1px solid '+C.border,background:C.white,color:dis?C.faint:C.dark,borderRadius:8,
        padding:'5px 11px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',
        cursor:dis?'default':'pointer',opacity:dis?.55:1,whiteSpace:'nowrap'}},lb);
    const foot=h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'11px 20px',
        flex:'none',borderTop:'1px solid '+C.line,background:'#f8faf3',flexWrap:'wrap'}},
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.faint,
        whiteSpace:'nowrap'}},
        tot?(this.t('fgPgShow')+' '+this.fmt(from+1)+'–'+this.fmt(to)+' '+this.t('fgPgOf')+' '
            +this.fmt(tot)+' '+this.t('fgPkCtn')
            +' · '+this.fmt(this.fgPkLines(r).length)+' '+this.t('fgPkLn'))
           :this.t(noneKey)),
      h('div',{style:{flex:1,minWidth:8}}),
      tot>pp?h('div',{style:{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}},
        pgBtn(this.t('fgPgPrev'),pg-1,pg<=1),
        h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,
          whiteSpace:'nowrap'}},this.t('fgPgPage')+' '+pg+' / '+np),
        pgBtn(this.t('fgPgNext'),pg+1,pg>=np)):null,
      tot?h('select',{value:pp,onChange:e=>this.set({fgPp:Number(e.target.value),fgPg:1}),
        title:this.t('fgPgSize'),
        style:{border:'1px solid '+C.border,borderRadius:8,padding:'5px 7px',fontSize:11.5,
          fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.white,cursor:'pointer'}},
        this.FG_PP.map(v=>h('option',{key:v,value:v},v+' '+this.t('fgPgSize')))):null,
      h('button',{onClick:close,style:this.btn('ghost')},this.t('dsoClose')));
    return h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:88,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:'min(1320px,97vw)',maxHeight:'93vh',
          display:'flex',flexDirection:'column',background:C.white,borderRadius:18,
          boxShadow:'0 30px 70px rgba(0,0,0,.34)',overflow:'hidden'}},
        head,info,tbl,foot));
  }

  renderFgBody(){
    const h=React.createElement;
    return h('div',{ref:this.scrollRef,className:'yscroll','data-screen-label':'F.G Shipment Plan',
      style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('fgTitle','S-08-FG-SHIPMENT · UI Proto'),
      this.renderFgKpis(),
      this.renderFgTable(),
      this.renderFgModal());
  }
  renderFgKpis(){
    const l=this.fgAll(); let qty=0,ship=0,ready=0,late=0;
    l.forEach(r=>{ qty+=Number(r.qty)||0; ship+=Number(r.ship)||0; ready+=this.fgReadyQty(r);
      if(this.fgLate(r)) late++; });
    return this.finKpis([
      [this.t('fgK1'),this.fmtn(qty),this.t('fgK1s')],
      [this.t('fgK2'),this.fmtn(ready),this.t('fgK2s')],
      [this.t('fgK3'),this.fmtn(ship),this.t('fgK3s')],
      [this.t('fgK4'),this.fmtn(late),this.t('fgK4s'),late>0]]);
  }
  renderFgTable(){
    const h=React.createElement, C=this.C, S=this.mtStyles();
    const q=this.state.fgQ||'', all=this.fgAll(), rows=this.fgList(q);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      this.state.fgMsg?h('span',{style:{fontSize:11.5,fontWeight:600,color:C.primary,background:C.tint,
        border:'1px solid '+C.border,borderRadius:99,padding:'4px 10px',whiteSpace:'nowrap'}},this.state.fgMsg):null,
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('fgCount')),
      this.dfSearchBox(q,v=>this.set({fgQ:v}),false,'fgSearch'),
      this.mtBtn(this.t('fgReseed'),()=>this.fgReseed(),{padding:'6px 12px',fontSize:12}),
      this.mtBtn(this.t('exportXls'),()=>this.fgExport(),{color:C.primary,borderColor:C.border,padding:'6px 12px',fontSize:12}));
    const body=rows.map((r,i)=>{
      const ed=this.state.fgEdit===r.id, bg=i%2?'#f7f9f3':C.white;
      const txt=(f,mono)=>ed
        ? h('input',{value:r[f]==null?'':r[f],onChange:e=>this.fgSet(r.id,{[f]:e.target.value}),
            style:{...S.inp,...(mono?{}:{fontFamily:'inherit'})}})
        : (String(r[f]||'').trim()||'—');
      const num=(f)=>ed
        ? h('input',{value:r[f]||'',inputMode:'numeric',onChange:e=>this.fgSet(r.id,{[f]:this.fgNum(e.target.value)}),
            style:{...S.inp,textAlign:'right'}})
        : this.fmt(r[f]);
      const day=(f)=>ed
        ? h('input',{type:'date',value:r[f]||'',onChange:e=>this.fgSet(r.id,{[f]:e.target.value}),style:{...S.inp}})
        : (r[f]?this.dsoDay(r[f]):'—');
      const mode=()=>ed
        ? h('select',{value:r.mode||'',onChange:e=>this.fgSet(r.id,{mode:e.target.value}),
            style:{...S.inp,padding:'4px 6px',cursor:'pointer'}},
            [''].concat(this.FG_MODES).map(m=>h('option',{key:m||'blank',value:m},m||'—')))
        : (String(r.mode||'').trim()||'—');
      const cbm=()=>ed
        ? h('input',{value:r.cbm==null?'':r.cbm,inputMode:'decimal',
            onChange:e=>this.fgSet(r.id,{cbm:this.fgDec(e.target.value)}),style:{...S.inp,textAlign:'right'}})
        : this.fgCbmTxt(r.cbm);
      const cell=(el,extra)=>h('td',{style:{...S.td,background:bg,...(extra||{})}},el);
      return h('tr',{key:r.id,title:ed?undefined:this.t('fgMdOpen'),
          onClick:ed?undefined:()=>this.fgOpen(r.id),
          style:{cursor:ed?'default':'pointer'}},
        cell(i+1,{textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}),
        cell(txt('brand'),{fontWeight:600}),
        cell(txt('season',true),{fontFamily:S.mono,whiteSpace:'nowrap'}),
        cell(txt('factory')),
        cell(txt('style',true),{fontFamily:S.mono,fontWeight:700,color:C.primary}),
        cell(txt('po',true),{fontFamily:S.mono}),
        cell(txt('color')),
        cell(num('qty'),{textAlign:'right',fontFamily:S.mono,fontWeight:700}),
        cell(num('ship'),{textAlign:'right',fontFamily:S.mono,fontWeight:700}),
        cell(this.fmt(this.fgBal(r)),{textAlign:'right',fontFamily:S.mono,fontWeight:600,
          color:this.fgBal(r)<0?'#c0392b':(this.fgBal(r)>0?C.primary:C.faint)}),
        cell(day('load'),{fontFamily:S.mono,whiteSpace:'nowrap'}),
        cell(day('etd'),{fontFamily:S.mono,whiteSpace:'nowrap'}),
        cell(mode(),{fontFamily:S.mono,fontWeight:600,whiteSpace:'nowrap'}),
        cell(txt('dest')),
        cell(cbm(),{textAlign:'right',fontFamily:S.mono}),
        cell(txt('note'),{color:C.sub,wordBreak:'break-word'}),
        h('td',{onClick:ev=>ev.stopPropagation(),
          style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}},
            ed?this.mtBtn(this.t('lsDone'),()=>this.set({fgEdit:null}),{border:'1px solid '+C.primary,background:C.tint})
              :this.mtBtn(this.t('lsEdit'),()=>this.set({fgEdit:r.id})),
            this.mtBtn(this.t('mtDel'),()=>this.fgDel(r.id),{color:'#c0392b',borderColor:'#eccfca'}),
            this.fgImpCell(r))));
    });
    const cols=[['fgNo',0],['fgBrand',0],['fgSeason',0],['fgFactory',0],['fgStyle',0],['fgPo',0],
      ['fgColor',0],['fgQty',1],['fgShipped',1],['fgBal',1],['fgLoad',0],['fgEtd',0],['fgMode',0],
      ['fgDest',0],['fgCbm',1],['fgNote',0],['mtAct',0]];
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'2560px',borderCollapse:'collapse'}},
        h('thead',null,h('tr',null,
          cols.map(([k,rt],ci)=>h('th',{key:k,style:{...S.th,
            ...(rt?{textAlign:'right'}:{}),
            ...(ci===0?{textAlign:'center',paddingLeft:8,width:46}:{}),
            ...(ci===cols.length-1?{borderRight:'none'}:{})}},this.t(k))))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:cols.length,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'fgNoHit':'fgEmpty'))))));
    const bodyEl=h('div',null, tbl,
      h('div',{style:{padding:'11px 13px',borderTop:'1px solid '+C.line}},
        this.mtBtn('+ '+this.t('fgAdd'),()=>this.fgAdd(),{color:C.primary,borderColor:C.border})));
    return this.dsoCard('fgPanel','fgSub','F.G Shipment Plan',bodyEl,{full:true,action});
  }

  // ==========================================================================
  // ẢNH CHỤP DỮ LIỆU (localStorage + IndexedDB)
  // --------------------------------------------------------------------------
  // Toàn bộ dữ liệu người dùng của bản prototype nằm ở đúng 2 chỗ:
  //   localStorage['yic.sewplan.v2'] — mọi field trong PERSIST, 1 chuỗi JSON
  //   IndexedDB 'yic.mes'            — store 'alertSound' + 'mlvFile' (Blob/File)
  // snapExport() gói CẢ HAI thành 1 file data/state-seed.js. Thả file đó vào
  // app/data/ rồi gửi nguyên thư mục đi: máy khác mở lên lần đầu sẽ được nạp
  // đúng dữ liệu này (xem seedStorage() ở cuối script.js).
  // ==========================================================================

}

  RT.boot(Finishing, { primaryColor: '#8FC93A', density: 'Comfortable' }, 'yic.mes.finishing');
})();
