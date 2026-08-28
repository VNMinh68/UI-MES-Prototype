/* YIC MES · MAY (SEWING) — logic rieng cua module.
 * ---------------------------------------------------------------------------
 * Hai man hinh:
 *   Ke hoach may            (page 'sewing')  — 3 tab: tuan / nhu cau BTP / phieu BTP
 *   San luong may hang ngay (page 'dso')     — cai dat, chuyen, M-level, hang loi
 *
 * Du lieu vao: app/sewing/seed.js (window.SEWING_SEED). Module KHONG doc du lieu
 * cua module nao khac; phieu ban giao phat hanh o day la dau ra, module HOAN THIEN
 * co ban seed rieng cua no.
 *
 * Nap sau app/shared/core.js (xem index.html).
 */
(function () {
  'use strict';

  var RT = window.MESRuntime;
  if (!RT || !window.MESCore) { throw new Error('shared/core.js must load before sewing/script.js'); }
  var React = RT.React, RD = RT.RD;

  var SEED = window.SEWING_SEED || {};
  window.MES_SEED_DATA = SEED;                 // nguon cho nut "Xuat anh chup"
  window.MES_SEED = SEED.snapshot || null;     // anh chup du lieu nguoi dung (co the null)

class Sewing extends window.MESCore {

  LMOD = {
    vi:{
      dsoTitle:'Sản Lượng May Hàng Ngày',
      dsoOvw:'Tổng hợp theo ngày · chuyền',
      dsoOvwSub:'Sản lượng hoàn thành và số đã giao sang hoàn thiện',
      dsoOvwDone:'HOÀN THÀNH',
      dsoOvwHanded:'ĐÃ GIAO',
      dsoOvwLeft:'CHƯA GIAO',
      dsoLines:'Chuyền may',
      dsoLinesSub:'Bấm 1 chuyền để đếm sản lượng theo size',
      dsoHist:'Lịch sử hoàn thành theo ngày',
      dsoHistSub:'Tổng hợp số hàng đã hoàn thành mỗi ngày',
      dsoHistEmpty:'Chưa ghi sản lượng nào — bấm vào card size ở trên để đếm.',
      dsoColDay:'NGÀY',
      dsoColPo:'PO',
      dsoColColor:'MÀU',
      dsoColQty:'SỐ LƯỢNG HOÀN THÀNH',
      bqTitle:'PHIẾU GIAO NHẬN BÁN THÀNH PHẨM',
      bqDay:'Ngày giao:',
      bqCust:'Khách hàng:',
      bqLine:'Cho chuyền may:',
      bqStyle:'Mã hàng:',
      bqC1:'Mẫu',
      bqC2:'Bàn',
      bqC3:'Cỡ',
      bqC4:'Số lượng',
      bqC5:'Số PO #',
      bqNote:'Ghi chú:',
      bqSign1:'Người giao',
      bqSign2:'Người nhận',
      bqOk:'Xác nhận đã nhận',
      bqOpenTip:'Bấm để mở phiếu giao nhận bán thành phẩm',
      bgView:'Xem / in phiếu bàn giao',
      dsoHandOver:'Giao sang hoàn thiện',
      dsoUndoHand:'Hủy phiếu bàn giao gần nhất của dòng này',
      dsoHistSearch:'Tìm ngày, style, PO, màu, size…',
      dsoFailOvw:'Tổng hợp hàng lỗi theo chuyền',
      dsoFailOvwSub:'Số hàng lỗi và lỗi hay gặp nhất của từng chuyền — bấm 1 dòng để mở chuyền',
      dsoFailRate:'TỈ LỆ LỖI',
      dsoTopDef:'LỖI NHIỀU NHẤT',
      dsoFailOvwEmpty:'Chưa ghi sản lượng hay hàng lỗi ở chuyền nào.',
      dsoHandAllSub:'Tổng hợp theo size — điền số lượng muốn giao cho từng size',
      bkDays:'Ngày',
      bkPend:'CHƯA BÀN GIAO THEO SIZE',
      bkGive:'SỐ LƯỢNG GIAO',
      bkLeft:'CHƯA GIAO',
      bkTot:'TỔNG',
      bkAll:'Giao hết',
      bkNone:'Xóa số',
      bkSel:'sẽ giao',
      bkNext:'Tiếp tục',
      dsoNoUnhanded:'Không còn hàng nào chờ giao — tất cả đã giao sang hoàn thiện.',
      dsoDefHist:'Lịch sử hàng lỗi theo ngày',
      dsoDefHistSub:'Mỗi lần bấm LỖI được ghi lại kèm giờ và lý do',
      dsoDefHistEmpty:'Chưa ghi hàng lỗi nào — bấm LỖI ở card size để ghi.',
      dsoDefExpTip:'Xuất .xlsx báo cáo QC 7 sheet — dashboard, theo chuyền · mã hàng, Pareto lỗi, theo giờ, chi tiết',
      dsoDefNoTime:'Không rõ giờ',
      dsoDefCut:'Sheet 07_QC_Detail chỉ chứa {n} dòng đầu trong {t} sản phẩm lỗi. Các sheet tổng hợp vẫn tính đủ; lọc hẹp lại nếu cần xem hết chi tiết.',
      dsoColSize:'SIZE',
      dsoColReason:'LÝ DO',
      dsoColDefQty:'SỐ LƯỢNG LỖI',
      dsoColTime:'GIỜ',
      mlvIncTip:'Thu nhập / 1 người theo giờ làm của chuyền',
      mlvSwitch:'Đổi chuyền',
      mlvTeam:'TỔ',
      mlvPerHour:'SẢN LƯỢNG / GIỜ',
      mlvQual:'CHẤT LƯỢNG',
      mlvFull:'Toàn màn hình',
      mlvExitFull:'Thoát toàn màn hình',
      mlvHourTip:'Số lần bấm ĐẠT trong giờ này',
      mlvRate:'Tỉ lệ lỗi',
      mlvTop3:'Top 3 lỗi nhiều nhất',
      mlvPick:'Chọn 1 chuyền để mở bảng điện tử M-level',
      mlvOpen:'Mở bảng M-level của chuyền này',
      dsoOpenLine:'Bấm để xem chi tiết theo size',
      dsoBack:'← Danh sách chuyền',
      dsoDoneNeed:'ĐÃ LÀM / CẦN LÀM',
      dsoTapSub:'Trủ 1 (bấm nhầm)',
      dsoNoCut:'Chuyền này chưa có tác nghiệp cắt',
      dsoPass:'ĐẠT',
      dsoFail:'LỖI',
      dsoPick:'Chọn Lý Do Lỗi',
      dsoPickSub:'Bấm 1 dòng để ghi hàng lỗi cho size này',
      dsoPickBack:'← Quay lại',
      dsoDefEmpty:'Thư viện lỗi đang trống — vào Cài Đặt · Thư Viện Lỗi để thêm.',
      dsoKOut:'Sản lượng',
      dsoKQc:'Cân đối QC',
      dsoKPassT:'Đạt',
      dsoKRej:'Loại bỏ',
      dsoKToday:'Hôm nay',
      dsoKIncomp:'Còn thiếu',
      dsoKRepair:'Sửa lại',
      dsoTop3:'Top 3',
      dsoTopPart:'Bộ phận · Loại lỗi',
      dsoTopOp:'Công nhân',
      dsoTopEmpty:'Ngày này chưa ghi hàng lỗi nào',
      dsoDayPrev:'Ngày trước',
      dsoDayNext:'Ngày sau',
      dsoBtnMeas:'Đo thông số',
      dsoBtnChk:'Bảng kiểm',
      dsoBtnHist:'Lịch sử',
      dsoHistHide:'Ẩn bảng lịch sử',
      dsoHistShow:'Mở bảng lịch sử theo ngày',
      dsoLblColor:'Màu',
      dsoLblSize:'Size',
      dsoBtnPass:'ĐẠT',
      dsoBtnDef:'LỖI',
      dsoNoPick:'Chọn màu và size để bắt đầu đếm',
      dsoStyleL:'Chọn mã hàng · PO',
      dsoGenL:'Giới tính',
      dsoGenNone:'Giới tính',
      dsoPhAdd:'Thêm ảnh kỹ thuật',
      dsoPhDel:'Xóa ảnh đang xem',
      dsoPhNone:'Chưa có ảnh kỹ thuật',
      dsoOperPh:'Tên công nhân (không bắt buộc)',
      dsoOperTip:'Ghi tên công nhân vào hàng lỗi này — dùng để xếp Top 3 công nhân',
      dsoMeasSoon:'Bảng đo thông số sẽ thiết kế ở bước sau — đang chờ spec chi tiết.',
      dsoChkSoon:'Bảng kiểm sẽ thiết kế ở bước sau — đang chờ spec chi tiết.',
      dfPanel:'Thư Viện Lỗi',
      dfSub:'Danh mục lỗi dùng khi ghi hàng lỗi ở chuyền may',
      dfCode:'Mã lỗi',
      dfName:'Tên lỗi',
      dfCat:'Nhóm lỗi',
      dfSev:'Mức độ',
      dfLoc:'Vị trí lỗi',
      dfCause:'Nguyên nhân gốc',
      dfAdd:'Thêm lỗi',
      dfEmpty:'Chưa có lỗi nào — bấm Thêm lỗi hoặc nhập từ Excel.',
      dfNoHit:'Không có dòng nào khớp từ khóa',
      dfImportTip:'Nhập .xlsx/.xls/.csv — cột: Mã lỗi · Tên lỗi · Nhóm lỗi · Mức độ · Vị trí lỗi · Nguyên nhân gốc',
      dfCount:'lỗi trong thư viện',
      lsCol1:'CHUYỀN',
      lsCol2:'STYLE',
      lsCol3:'CÔNG NHÂN',
      lsCol4:'GIỜ LÀM',
      lsCol5:'NGÀY (DD/MM/YYYY)',
      lsCol6:'SMV',
      lsCol7:'LOẠI',
      lsCol8:'%TARGET',
      lsCol9:'FILE M-LEVEL ĐÃ NHẬP',
      lsCol10:'HÀNH ĐỘNG',
      lsImport:'Nhập file',
      lsImportTip:'Chọn file M-level (.xlsx/.csv) — lưu trong IndexedDB',
      lsFileDel:'Xóa file',
      lsFileErr:'Không lưu được file vào IndexedDB',
      lsPctTip:'Số nguyên 0–100, không âm, không thập phân',
      lsDec1Tip:'Không âm, tối đa 1 chữ số thập phân',
      lsTypeTip:'Tự động theo SMV — không sửa tay: SMV > 100 → loại 1, 60 < SMV ≤ 100 → loại 2, SMV ≤ 60 → loại 3',
      dsotab1:'Cài Đặt',
      dsotab2:'Sản Xuất',
      dsotab3:'Cảnh Báo',
      dsotab4:'M-level',
      dsosub1:'Cấu Hình Chuyền',
      dsosub2:'Cấu Hình Loại M-level',
      dsosub3:'Thư Viện Lỗi',
      dsoLinePanel:'Cấu Hình Chuyền',
      dsoLineSub:'Danh sách chuyền may — nhóm chuyền, định mức, ca làm việc',
      mtPanel:'Loại M-level',
      mtSub:'Danh mục loại — bấm 1 dòng để xem chi tiết',
      mtdPanel:'Chi Tiết Loại M-level',
      mtdSub:'Định mức và thu nhập theo từng bậc',
      mtName:'Tên',
      mtDesc:'Mô tả',
      mtTgt:'%Target',
      mtTgtTip:'Số nguyên, không âm — bậc M cao được vượt 100%',
      mtInc:'Thu nhập / 1 người (9.5h)(VND)',
      mtAdd:'Thêm',
      mtImport:'Nhập file',
      mtImportTip:'Nhập .xlsx/.xls/.csv — thêm vào cuối danh sách chi tiết',
      mtImportOk:'Đã nhập',
      mtImportRows:'dòng',
      mtImportNone:'Không tìm thấy dòng nào có tên hợp lệ.',
      mtEmpty:'Chưa có loại M-level nào',
      mtdEmpty:'Loại này chưa có dòng chi tiết nào',
      mtPickType:'Chọn một loại M-level ở bảng bên trái',
      alEdit:'Sửa',
      alDone:'Xong',
      alAdd:'Thêm cảnh báo',
      alDel:'Xóa cảnh báo',
      alName:'Tên cảnh báo',
      alPick:'Chọn âm thanh',
      alPlay:'Nghe thử',
      alClrSnd:'Bỏ âm thanh',
      alHasSnd:'Có âm thanh',
      alNoSnd:'Chưa có âm thanh',
      alEmpty:'Chưa có cảnh báo nào — bấm Sửa để thêm',
      alSndBig:'File âm thanh quá lớn (tối đa 20 MB).',
      alSndErr:'Không lưu được file âm thanh.',
      dsoProdPanel:'Sản Lượng May Theo Ngày',
      dsoProdSub:'Sản lượng thực tế theo chuyền — nhập / theo giờ',
      dsoAlertPanel:'Cảnh Báo Sản Lượng',
      dsoAlertSub:'Bấm để phát cảnh báo — âm thanh lưu trên máy này',
      kcTb:'LƯỢT CẮT',
      kcLy:'SỐ LỚP',
      kcPcs:'TỔNG PCS',
      kcTagN:'TEM',
      lgPull:'Lấy từ Nhu Cầu BTP / Kế Hoạch May',
      planFromPs:'Chuyền & mã hàng đồng bộ từ đơn hàng trong seed của module. Cần thêm dòng cho chuyền (đơn giao nhau / làm trùng) thì bấm dấu + ở ô chuyền.',
      kpiPlan:'KẾ HOẠCH MAY',
      kpiPlanSub:'pcs kế hoạch tuần',
      kpiDemand:'NHU CẦU BTP',
      kpiDemandSub:'pcs cần cấp tuần sau',
      kpiReq:'LỆNH CẤP BTP',
      kpiReqSub:'pcs đã cấp BTP',
      tab1:'Kế Hoạch May Tuần',
      tab2:'Nhu Cầu BTP Tuần',
      tab3:'Lệnh Cấp BTP Tuần',
      period:'KỲ',
      copyWeek:'Chép tuần trước',
      downloadTpl:'Tải file mẫu',
      exportTip:'Xuất 1 file .xlsx gồm 3 sheet',
      activeRows:'Dòng có dữ liệu',
      rowsN:'Số dòng',
      linesN:'Số chuyền',
      totalQty:'Tổng SL',
      planEmpty:'Tuần này chưa có dòng nào. Chép tuần trước hoặc thêm chuyền bên dưới.',
      colLine:'CHUYỀN',
      colBrand:'THƯƠNG HIỆU',
      colStyle:'MÃ HÀNG',
      colTotal:'TỔNG',
      addBrand:'+ Thương hiệu',
      addStyle:'+ Mã hàng',
      tipLine:'Bấm để sửa / xóa chuyền',
      tipBrand:'Chọn thương hiệu',
      tipStyle:'Chọn mã hàng',
      tipDay:'Bấm để nhập số',
      tipDelLine:'Xóa chuyền',
      phLine:'Chuyền…',
      phBrand:'Thương hiệu…',
      phStyle:'Mã hàng…',
      phStyleFirst:'Chọn thương hiệu trước',
      confirmDel:'Chuyền này đang có dữ liệu — xóa toàn bộ dòng của chuyền?',
      maxLines:'Chuyền này không có trong danh sách chuyền của seed',
      dayConflict:'Ngày này đang có mã khác chạy — nhập vào đây sẽ xóa số của mã kia (1 chuyền 1 mã/ngày)',
      tipRepick:'Chọn lại — số liệu ngày của dòng này sẽ bị xóa',
      addStyleRow:'Thêm mã thứ 2 cho chuyền này trong tuần — không cần tạo lại chuyền',
      lineMergeErr:'Chỉ được gộp 2 chuyền liền kề — VD Line 1+2. Không gộp chuyền cách nhau (Line 1+3) hoặc 3 chuyền trở lên.',
      lineDupErr:'Không gộp được: chuyền này đang có dòng riêng trong bảng — xóa hoặc đổi tên dòng đó trước.',
      demandTitle:'Nhu Cầu Sản Lượng Cắt Hàng Tuần',
      demandSub:'Weekly Cutting Bundle Demand',
      grpWip:'TÌNH TRẠNG WIP',
      grpNext:'NHU CẦU TUẦN TIẾP THEO',
      dA:'TỔNG CẮT CỦA ĐƠN',
      dB:'TỔNG WIP ĐÃ CẤP',
      dC:'OUTPUT RA CHUYỀN',
      dBC:'WIP TỒN CUỐI TUẦN',
      dD:'1 NGÀY WIP',
      dE:'WIP CẦN GỐI',
      dF:'SL DỰ KIẾN TUẦN SAU',
      dNeed:'SỐ LƯỢNG CẦN CẤP',
      remark:'GHI CHÚ',
      tipA:'Tổng yêu cầu cắt — lấy từ tác nghiệp cắt (khớp thương hiệu + mã hàng), không sửa ở đây',
      tipB:'Tổng WIP đã cấp — nhập tay',
      tipC:'Tổng output ra chuyền — nhập tay',
      tipD:'Sản lượng 1 ngày WIP — nhập tay',
      tipManual:'Nhập tay — bấm để sửa',
      tipBC:'B − C',
      tipE:'E = MAX(0, D − B + C). Nếu tồn > 1 ngày WIP thì không cần cấp gối.',
      tipF:'SUMIFS từ Kế Hoạch May tuần này — khớp chuyền + thương hiệu + mã hàng',
      tipFEst:'Kế Hoạch May chưa có dòng khớp chuyền + thương hiệu + mã hàng',
      tipNeed:'IF(E+F > A−B, A−B, E+F)',
      demandEmpty:'Tuần này chưa có chuyền nào trong Kế Hoạch May.',
      reqSub:'Lệnh Cấp BTP Cắt Theo Tuần',
      colColor:'MÀU CẮT',
      recvTitle:'Lịch sử nhận bán thành phẩm',
      recvSub:'Mọi lần bấm Received đều được ghi lại',
      recvEmpty:'Chưa có lượt nhận nào',
      recvDT:'THỜI ĐIỂM',
      recvTurn:'LƯỢT CẮT',
      recvRows:'lượt',
      recvUndo:'Hủy nhận',
      colReqPlan:'ĐÃ CẤP / DEMAND',
      tipReqPlan:'Số lượng đã lên đơn yêu cầu / Số lượng demand trên kế hoạch',
      tipAutoCol:'Tự động theo tác nghiệp cắt — không sửa ở đây',
      pickColorFirst:'chọn màu trước',
      issue:'Cấp BTP',
      planShort:'KH ',
      tipIssue:'Cấp BTP cho ô này',
      tipIssueEdit:'Sửa cấp BTP',
      mTitle:'Cấp BTP theo bàn',
      mColor:'MÀU CẮT',
      mPlan:'KẾ HOẠCH (pcs)',
      cCutTurn:'Lượt cắt:',
      mIssueRow:'ĐANG CẤP',
      mPickPos:'Bấm để chọn / bỏ cỡ này',
      mBySize:'TỔNG THEO SIZE',
      mNeeded:'Cần cấp',
      mCuttable2:'Cắt được',
      mClear:'Xóa ô',
      mCancel:'Hủy',
      mSave:'Lưu cấp BTP',
      mUpdate:'Cập nhật',
      mIssue:'Cấp',
      mNoTurnSel:'Chưa chọn lượt cắt',
      mTurns:'lượt',
      mSizes:'size',
      plies:'lớp lá',
      stRequested:'Đã yêu cầu',
      stWaiting:'Chờ nhận',
      stReceived:'Đã nhận',
      stCycleTip:'Bấm để đổi trạng thái: Đã yêu cầu → Chờ nhận → Đã nhận',
      mReceived:'Đã nhận',
      mTurnPool:'Bảng lượt cắt dùng chung cho mã hàng + màu cắt này — mỗi lượt chỉ cấp được 1 lần trong tuần',
      mTakenTip:'Lượt này đã cấp ở ô khác — bỏ ở đó trước nếu muốn dùng lại',
      tipReceive:'Lưu ô này và đánh dấu đã nhận BTP',
      tipUnreceive:'Đã nhận — bấm để trả về Chờ nhận',
      dsoBrand:'\u2014' },
    en:{
      dsoTitle:'Daily Sewing Output',
      dsoOvw:'Summary by day · line',
      dsoOvwSub:'Completed output and how much was handed over to finishing',
      dsoOvwDone:'COMPLETED',
      dsoOvwHanded:'HANDED OVER',
      dsoOvwLeft:'NOT HANDED',
      dsoLines:'Sewing lines',
      dsoLinesSub:'Tap a line to count output by size',
      dsoHist:'Daily completion history',
      dsoHistSub:'Completed pieces aggregated per day',
      dsoHistEmpty:'No output recorded yet — tap a size card above to count.',
      dsoColDay:'DATE',
      dsoColPo:'PO',
      dsoColColor:'COLOUR',
      dsoColQty:'COMPLETED QTY',
      bqTitle:'SEMI-FINISHED GOODS HANDOVER SLIP',
      bqDay:'Delivery date:',
      bqCust:'Customer:',
      bqLine:'To sewing line:',
      bqStyle:'Style:',
      bqC1:'Colour',
      bqC2:'Table',
      bqC3:'Size',
      bqC4:'Quantity',
      bqC5:'PO #',
      bqNote:'Note:',
      bqSign1:'Handed by',
      bqSign2:'Received by',
      bqOk:'Confirm received',
      bqOpenTip:'Click to open the semi-finished goods handover slip',
      bgView:'View / print handover slip',
      dsoHandOver:'Hand over to finishing',
      dsoUndoHand:'Void the latest handover slip of this row',
      dsoHistSearch:'Search date, style, PO, colour, size…',
      dsoFailOvw:'Defect summary by line',
      dsoFailOvwSub:'Defect count and most frequent defect per line — tap a row to open the line',
      dsoFailRate:'DEFECT RATE',
      dsoTopDef:'TOP DEFECT',
      dsoFailOvwEmpty:'No output or defect recorded on any line yet.',
      dsoHandAllSub:'Aggregated by size — enter the qty to hand over for each size',
      bkDays:'Dates',
      bkPend:'PENDING BY SIZE',
      bkGive:'QTY TO HAND OVER',
      bkLeft:'PENDING',
      bkTot:'TOTAL',
      bkAll:'All',
      bkNone:'Clear',
      bkSel:'to hand over',
      bkNext:'Next',
      dsoNoUnhanded:'Nothing left to hand over — everything has gone to finishing.',
      dsoDefHist:'Daily defecting history',
      dsoDefHistSub:'Every FAIL tap is recorded with its time and reason',
      dsoDefHistEmpty:'No defect recorded yet — tap FAIL on a size card to log one.',
      dsoDefExpTip:'Exports the 7-sheet QC report .xlsx — dashboard, line · style, defect Pareto, hourly trend, detail',
      dsoDefNoTime:'No time',
      dsoDefCut:'07_QC_Detail holds only the first {n} of {t} defective pieces. The summary sheets still count them all; narrow the filter to see the rest of the detail.',
      dsoColSize:'SIZE',
      dsoColReason:'REASON',
      dsoColDefQty:'DEFECT QTY',
      dsoColTime:'TIME',
      mlvIncTip:'Income per person at this line\u2019s work hours',
      mlvSwitch:'Switch line',
      mlvTeam:'TEAM',
      mlvPerHour:'OUTPUT / HOUR',
      mlvQual:'QUALITY',
      mlvFull:'Full screen',
      mlvExitFull:'Exit full screen',
      mlvHourTip:'PASS taps recorded in this hour',
      mlvRate:'Defect rate',
      mlvTop3:'Top 3 defects',
      mlvPick:'Pick a line to open its M-level board',
      mlvOpen:'Open this line\u2019s M-level board',
      dsoOpenLine:'Open size detail',
      dsoBack:'← All lines',
      dsoDoneNeed:'DONE / REQUIRED',
      dsoTapSub:'Subtract 1 (mis-tap)',
      dsoNoCut:'No cutting plan for this line yet',
      dsoPass:'PASS',
      dsoFail:'FAIL',
      dsoPick:'Select Defect Reason',
      dsoPickSub:'Tap a row to log the failed piece for this size',
      dsoPickBack:'← Back',
      dsoDefEmpty:'Defect library is empty — add rows in Settings · Defect Library.',
      dsoKOut:'Output',
      dsoKQc:'QC Balance',
      dsoKPassT:'Pass',
      dsoKRej:'Reject',
      dsoKToday:'Today',
      dsoKIncomp:'Incompleted',
      dsoKRepair:'Repair',
      dsoTop3:'Top 3',
      dsoTopPart:'Defect Part · Type',
      dsoTopOp:'Operator',
      dsoTopEmpty:'No defect recorded on this day',
      dsoDayPrev:'Previous day',
      dsoDayNext:'Next day',
      dsoBtnMeas:'Measurement',
      dsoBtnChk:'Check List',
      dsoBtnHist:'History',
      dsoHistHide:'Hide the history tables',
      dsoHistShow:'Open the daily history tables',
      dsoLblColor:'Color',
      dsoLblSize:'Size',
      dsoBtnPass:'Pass',
      dsoBtnDef:'Defect',
      dsoNoPick:'Pick a colour and a size to start counting',
      dsoStyleL:'Pick style · PO',
      dsoGenL:'Gender',
      dsoGenNone:'Gender',
      dsoPhAdd:'Add a technical sketch',
      dsoPhDel:'Remove the photo on screen',
      dsoPhNone:'No sketch yet',
      dsoOperPh:'Operator name (optional)',
      dsoOperTip:'Attach an operator to this defect — this is what ranks the Top 3 operators',
      dsoMeasSoon:'The measurement sheet is to be designed next — spec pending.',
      dsoChkSoon:'The check list is to be designed next — spec pending.',
      dfPanel:'Defect Library',
      dfSub:'Defect master used when logging failed pieces on the sewing line',
      dfCode:'Defect Code',
      dfName:'Defect Name',
      dfCat:'Category',
      dfSev:'Severity',
      dfLoc:'Defect Location',
      dfCause:'Root Cause',
      dfAdd:'Add defect',
      dfEmpty:'No defect yet — add one or import from Excel.',
      dfNoHit:'No row matches the search',
      dfImportTip:'Import .xlsx/.xls/.csv — columns: Defect Code · Defect Name · Category · Severity · Defect Location · Root Cause',
      dfCount:'defects in library',
      lsCol1:'LINE',
      lsCol2:'STYLE',
      lsCol3:'WORKERS',
      lsCol4:'WORK HOURS',
      lsCol5:'DATE (DD/MM/YYYY)',
      lsCol6:'SMV',
      lsCol7:'TYPE',
      lsCol8:'%TARGET',
      lsCol9:'M-LEVEL FILE IMPORTED',
      lsCol10:'ACTIONS',
      lsImport:'Import file',
      lsImportTip:'Pick an M-level file (.xlsx/.csv) — stored in IndexedDB',
      lsFileDel:'Remove file',
      lsFileErr:'Could not store the file in IndexedDB',
      lsPctTip:'Whole number 0–100, no negatives, no decimals',
      lsDec1Tip:'No negatives, at most 1 decimal place',
      lsTypeTip:'Derived from SMV — not editable: SMV > 100 → type 1, 60 < SMV ≤ 100 → type 2, SMV ≤ 60 → type 3',
      dsotab1:'Settings',
      dsotab2:'Production',
      dsotab3:'Alerts',
      dsotab4:'M-level',
      dsosub1:'Line Setting',
      dsosub2:'M-level Type Setting',
      dsosub3:'Defect Library',
      dsoLinePanel:'Line Setting',
      dsoLineSub:'Sewing line master — line group, target, shift',
      mtPanel:'M-level Type',
      mtSub:'Type master — click a row to see its detail',
      mtdPanel:'M-level Type Detail',
      mtdSub:'Target and income per step',
      mtName:'Name',
      mtDesc:'Description',
      mtTgt:'%Target',
      mtTgtTip:'Whole number, no negatives — high M levels may exceed 100%',
      mtInc:'Income / person (9.5h)(VND)',
      mtAdd:'Add',
      mtImport:'Import',
      mtImportTip:'Import .xlsx/.xls/.csv — appended to the detail list',
      mtImportOk:'Imported',
      mtImportRows:'rows',
      mtImportNone:'No row with a usable name was found.',
      mtEmpty:'No M-level type yet',
      mtdEmpty:'This type has no detail rows yet',
      mtPickType:'Pick an M-level type on the left',
      alEdit:'Edit',
      alDone:'Done',
      alAdd:'Add alert',
      alDel:'Delete alert',
      alName:'Alert name',
      alPick:'Pick sound',
      alPlay:'Preview',
      alClrSnd:'Remove sound',
      alHasSnd:'Sound set',
      alNoSnd:'No sound yet',
      alEmpty:'No alerts yet — press Edit to add',
      alSndBig:'Sound file too large (20 MB max).',
      alSndErr:'Could not save the sound file.',
      dsoProdPanel:'Daily Sewing Output',
      dsoProdSub:'Actual output by line — entry / hourly',
      dsoAlertPanel:'Output Alerts',
      dsoAlertSub:'Tap to sound an alert — audio stored on this machine',
      kcTb:'CUT TURN',
      kcLy:'LAYERS',
      kcPcs:'TOTAL PCS',
      kcTagN:'TAGS',
      lgPull:'Pulled from Bundle Demand / Sewing Schedule',
      planFromPs:'Lines & styles sync from the orders in the module seed. Need an extra row for a line (overlapping / duplicated orders)? Use the + on the line cell.',
      kpiPlan:'SEWING PLAN',
      kpiPlanSub:'pcs planned this week',
      kpiDemand:'BUNDLE DEMAND',
      kpiDemandSub:'pcs to supply next week',
      kpiReq:'BUNDLE REQUEST',
      kpiReqSub:'pcs bundles requested',
      tab1:'Weekly Sewing Schedule',
      tab2:'Weekly Bundle Demand',
      tab3:'Weekly Bundle Request',
      period:'PERIOD',
      copyWeek:'Copy Last Week',
      downloadTpl:'Download Template',
      exportTip:'Exports one .xlsx with 3 sheets',
      activeRows:'Active Rows',
      rowsN:'Rows',
      linesN:'Lines',
      totalQty:'Total Qty',
      planEmpty:'No rows yet for this week. Copy last week or add a line below.',
      colLine:'LINE #',
      colBrand:'BRAND',
      colStyle:'STYLE #',
      colTotal:'TOTAL',
      addBrand:'+ Brand',
      addStyle:'+ Style',
      tipLine:'Click to rename / delete line',
      tipBrand:'Pick a brand',
      tipStyle:'Pick a style',
      tipDay:'Click to enter a number',
      tipDelLine:'Delete line',
      maxLines:'This line is not in the seed line list',
      dayConflict:'Another style runs this day — entering a number here clears that one (1 line, 1 style per day)',
      tipRepick:'Re-pick — this row\u2019s day numbers will be cleared',
      addStyleRow:'Add a 2nd style for this line this week — no need to re-create the line',
      lineMergeErr:'Only two adjacent lines can be merged — e.g. Line 1+2. Not gapped lines (Line 1+3) or 3+ lines.',
      lineDupErr:'Cannot merge: that line still has its own row(s) — delete or rename them first.',
      phLine:'Line…',
      phBrand:'Brand…',
      phStyle:'Style…',
      phStyleFirst:'Pick a brand first',
      confirmDel:'This line has data — delete all of its rows?',
      demandTitle:'Weekly Cutting Bundle Demand',
      demandSub:'Nhu Cầu Sản Lượng Cắt Hàng Tuần',
      grpWip:'WIP STATUS',
      grpNext:'NEXT WEEK DEMAND',
      dA:'TOTAL ORDER CUT',
      dB:'TOTAL WIP SUPPLIED',
      dC:'OUTPUT TO LINE',
      dBC:'WIP LEFT AT WEEK END',
      dD:'1 DAY WIP',
      dE:'WIP BUFFER NEEDED',
      dF:'NEXT WEEK OUTPUT',
      dNeed:'QTY TO SUPPLY',
      remark:'REMARK',
      tipA:'Total cut of the order — from the cutting order (brand + style match), not editable here',
      tipB:'Total WIP already supplied — manual',
      tipC:'Total output to the line — manual',
      tipD:'One day of WIP output — manual',
      tipManual:'Manual entry — click to edit',
      tipBC:'B − C',
      tipE:'E = MAX(0, D − B + C). If WIP left exceeds one day, no buffer is needed.',
      tipF:'SUMIFS over this week\'s Sewing Schedule — matching line + brand + style',
      tipFEst:'No matching line + brand + style in the Sewing Schedule',
      tipNeed:'IF(E+F > A−B, A−B, E+F)',
      demandEmpty:'No line planned for this week in the Sewing Schedule.',
      reqSub:'Weekly cut bundle issue order',
      colColor:'CUT COLOUR',
      recvTitle:'Bundle receiving history',
      recvSub:'Every Received click is logged',
      recvEmpty:'No receipts yet',
      recvDT:'DATE / TIME',
      recvTurn:'CUT TURN',
      recvRows:'entries',
      recvUndo:'Un-received',
      colReqPlan:'REQUESTED / DEMAND',
      tipReqPlan:'Quantity already requested / demand on the plan',
      tipAutoCol:'Automatic from the cutting plan — not editable here',
      pickColorFirst:'pick a colour first',
      issue:'Issue',
      planShort:'PLN ',
      tipIssue:'Issue bundles for this cell',
      tipIssueEdit:'Edit this issue',
      mTitle:'Issue bundles by cut turn',
      mColor:'CUT COLOUR',
      mPlan:'PLAN (pcs)',
      cCutTurn:'Cut turn:',
      mIssueRow:'ISSUING',
      mPickPos:'Click to pick / drop this size',
      mBySize:'TOTAL BY SIZE',
      mNeeded:'To supply',
      mCuttable2:'Cuttable',
      mClear:'Clear cell',
      mCancel:'Cancel',
      mSave:'Save issue',
      mUpdate:'Update',
      mIssue:'Issue',
      mNoTurnSel:'No cut turn selected',
      mTurns:'turns',
      mSizes:'sizes',
      plies:'plies',
      stRequested:'Requested',
      stWaiting:'Waiting',
      stReceived:'Received',
      stCycleTip:'Click to change status: Requested → Waiting → Received',
      mReceived:'Received',
      mTurnPool:'One cut-turn table shared by this style + cut colour — each turn can be issued once per week',
      mTakenTip:'Already issued in another cell — release it there first to reuse',
      tipReceive:'Save this cell and mark bundles received',
      tipUnreceive:'Received — click to set back to Waiting',
      dsoBrand:'\u2014' },
  };

  NAVVI = {'SEWING':'MAY','Fabric':'Vải','Cutting':'Cắt','Sewing Output':'Sản lượng may','Sewing Schedule':'Kế hoạch may','Daily Sewing Output':'Sản lượng may hàng ngày'};

  // ==========================================================================
  // Khai bao module
  // ==========================================================================
  MOD = {
    id: 'sewing', key: 'yic.mes.sewing', seedVar: 'SEWING_SEED', bcRoot: 'modSew',
    nav: [['SEWING', [['Sewing Schedule', 1, 'sewing'], ['Daily Sewing Output', 1, 'dso']]]],
    pages: { sewing: 'renderSewBody', dso: 'renderDsoBody' },
    bc: { sewing: 'bcPage', dso: 'dsoBc' },
  };
  PERSIST_MOD = ['weeks', 'week', 'openMonth', 'tab', 'cutTab', 'dsoTab', 'dsoSub', 'dsoLine',
    'mlvLine', 'mlvFs', 'dsoDone', 'dsoPassLog', 'dsoDoneV', 'dsoHand', 'dsoHandQ', 'dsoSlips',
    'dsoSlipSeq', 'dsoHandWho', 'bqNo', 'bqSeq', 'cap', 'capTurns', 'capOrder', 'multPlain',
    'multEmb', 'bundle', 'bundleV', 'recvLog', 'wip', 'daily', 'files', 'freq', 'wsc', 'dsoAlerts',
    'lset', 'dsoMtypeRows', 'dsoMtypeDet', 'mtSel', 'dsoDefects', 'dsoDefLog', 'dsoDefTime',
    'dsoDefWho', 'dsoSel', 'dsoPhoto', 'dsoPhotoI', 'dsoGen', 'dsoOp', 'dsoHistOpen'];

  // ==========================================================================
  // Du lieu tu seed.js — thay cho window.PSCHED / window.KHC cua ban 1 file
  // --------------------------------------------------------------------------
  // Ke hoach san xuat va tac nghiep cat khong con la MAN HINH rieng nua; chung
  // la BANG THAM CHIEU dong bang trong seed cua module. Chin ham duoi day la moi
  // duong module doc du lieu do.
  // ==========================================================================
  ORDERS = (SEED.orders || []).map(o => ({ ...o }));
  PLANS = SEED.plans || [];
  SEEDLINES = SEED.lines || [];

  psAllOrders() { return this.ORDERS; }
  // Chi don con chay trong tuan dang chon — tranh chon nham don da ket thuc
  psActiveOrders(key) {
    const R = this.psWeekRange(key || (this.state && this.state.week) || this.CURWK);
    return this.ORDERS.filter(o => this.pd(o.start) <= R[1] && this.pd(o.end) >= R[0]);
  }
  brandOf(o) { const b = (o && o.brand) || ''; return b === 'OTHER' ? '' : b; }
  kcPlans() { return this.PLANS; }
  khcPlansFor(style) { const k = this.sKey(style);
    return this.PLANS.filter(p => p.style === style || p.style === k || 'FG-' + p.style === k); }
  psPlan(o) { return (o && o.planId) ? (this.PLANS.find(p => p.id === o.planId) || null) : null; }
  // PO cua 1 don: uu tien PO ghi tren tac nghiep cat roi moi den PO cua don.
  orderPo(o, pl) { if (pl === undefined) pl = this.psPlan(o);
    return String((pl && pl.po) || (o && o.po) || '').replace(/^PO\s*/i, '').trim() || '—'; }
  // Danh sach chuyen bam theo seed — khong tu sinh Line 4/13
  psLines() { if (this._psLines && this._psLines.length) return this._psLines;
    const out = this.SEEDLINES.map(x => x.line).filter(Boolean);
    this.ORDERS.forEach(o => { const n = this.normName(o.line); if (out.indexOf(n) < 0) out.push(n); });
    this._psLines = out; return out; }
  // Tong SL cua don theo ke hoach — dung khi chua co file tac nghiep cat
  psOrderQty(r) {
    const ln = this.normName(r.line), st = String(r.style || '').toUpperCase().replace(/\s+/g, '');
    if (!st) return 0; let q = 0;
    this.ORDERS.forEach(o => { if (this.normName(o.line) !== ln) return;
      if (String(o.code || '').toUpperCase().replace(/\s+/g, '') === st) q = Math.max(q, o.qty || 0); });
    return q;
  }
  // Chuyen + thuong hieu + ma hang lay thang tu don hang trong seed. LAY MOI don
  // chay trong tuan; 1 dong = 1 chuyen + 1 ma hang, don cung ma tren 1 chuyen
  // duoc gop SL theo ngay.
  psPlanRows(key) {
    const [ws, we] = this.psWeekRange(key); const out = [], at = {}; let n = 0;
    this.ORDERS.forEach(o => {
      const line = String(o.line).replace(/LINE/i, 'Line');
      const s = this.pd(o.start), e = this.pd(o.end); if (s > we || e < ws) return;
      const span = Math.max(1, Math.round((e - s) / 86400000) + 1);
      const rate = Math.max(5, Math.round((o.qty / Math.max(1, span * 6 / 7)) / 5) * 5);
      const style = this.psCode(o.code), brand = this.brandOf(o), k = line + '|' + style;
      let row = at[k];
      if (!row) { const days = {}; this.DAYS.forEach(d => days[d] = null);
        row = { id: 'r' + (++n), line, brand, style, days }; at[k] = row; out.push(row); }
      else if (!row.brand && brand) row.brand = brand;
      this.DAYS.forEach((d, i) => { const dt = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + i);
        if (dt >= s && dt <= e) row.days[d] = (row.days[d] || 0) + rate; });
    });
    return this.sortPlan(out);
  }

  // ==========================================================================
  constructor(props) {
    super(props);
    this.scrollRef = React.createRef(); this.panelRef = React.createRef(); this.dailyRef = React.createRef();
    const weeks = this.seed();
    this.state = { ...this.coreState(),
      page: 'sewing', cutTab: 'capacity', dsoTab: 'cfg', dsoSub: 'line', lset: {}, lsEdit: null,
      dsoLine: null, mlvLine: null, mlvFs: false, dsoDone: {}, dsoDoneV: 2, dsoHand: {}, dsoHandQ: {},
      dsoSlips: [], dsoSlipSeq: {}, dsoHandWho: {}, dsoHandAsk: null,
      cap: {}, capTurns: {}, capOrder: null, dragRow: null, multPlain: 3, multEmb: 6,
      tab: 'weekly', openMonth: this.CURWK.split(' · ')[0], week: this.CURWK,
      weeks,
      edit: null, bedit: null, bform: null, bslip: null, bqNo: {}, bqSeq: {},
      dragOver: false, dayOpen: null, daily: {}, freq: {}, wsc: {}, recvLog: [],
      bundle: this.initBundle((weeks[this.CURWK] || { rows: [] }).rows), bundleV: 3, wip: {},
      dsoAlerts: this.initAlerts(), dsoAlEdit: false, dsoAlHit: null,
      dsoMtypeRows: null, dsoMtypeDet: {}, mtSel: null, mtEdit: null, mtMsg: '',
      dsoDefects: this.initDefects(), dsoDefLog: {}, dsoDefTime: {}, dfEdit: null, dfQ: '', dfMsg: '',
      dsoTap: null, dsoTapQ: '',
      dsoPassLog: {},
      dsoHistQ: '', dsoDefQ: '', dsoHandBulk: null,
      // Ban tablet cua trang chi tiet chuyen: o dang chon, ngay cua bang Top 3,
      // anh ky thuat / gioi tinh theo ma hang, cong nhan gan voi tung hang loi.
      dsoSel: {}, dsoDayV: null, dsoPhoto: {}, dsoPhotoI: {}, dsoGen: {}, dsoDefWho: {}, dsoOp: {},
      dsoHistOpen: false, dsoInfo: null,
      files: [{ name: 'KH cắt-199-PO10848-CHOT.xlsx', sheets: 2 },
        { name: 'KH cắt-199-PO10502-HANAM.xlsx', sheets: 2 },
        { name: 'KH cắt-VW5159-M2-BLK-PO4446+4841.xlsx', sheets: 8 },
        { name: 'KH cắt-1003117-PO10130.xlsx', sheets: 6 },
        { name: 'KH cắt-VW5159-M11-CHOT.xlsx', sheets: 8 }],
    };
    this.state.capTurns = this.allocTurns();
    this.restore();
    this.reconcileWeeks();
  }

  // Nang cap ban luu cu — goi tu restore() cua core, `saved` la chinh ban JSON.
  migrate(saved) {
    const sv = saved ? (Number(saved.bundleV) || 0) : 0;
    // v<2: rule sinh san da bo -> xoa nhung o da duoc sinh va luu tu truoc
    if (sv < 2) this.state.bundle = {};
    // v<3: khoa theo r.id (khong co tuan) -> chuyen sang khoa tuan+chuyen+ma hang
    if (sv < 3) this.state.bundle = this.migrateBundle(this.state.bundle);
    this.state.bundleV = 3;
    // Khoa dsoDone cu chua co doan NGAY -> gan vao hom nay, giu nguyen so luong.
    if ((saved ? (Number(saved.dsoDoneV) || 0) : 0) < 2) {
      const dm = this.state.dsoDone || {}, dn = {}, td = this.dsoToday();
      Object.keys(dm).forEach(k => { dn[k.split('|').length === 6 ? k : (td + '|' + k)] = dm[k]; });
      this.state.dsoDone = dn;
    }
    this.state.dsoDoneV = 2;
    // Ban luu cu chi danh dau CA DONG da giao; gio giao theo so luong ->
    // coi nhu da giao dung bang so da lam cua dong do.
    if (Object.keys(this.state.dsoHand || {}).length && !Object.keys(this.state.dsoHandQ || {}).length) {
      const dn = this.state.dsoDone || {}, hd = this.state.dsoHand || {}, hq = {};
      Object.keys(dn).forEach(k => { const rk = k.slice(0, k.lastIndexOf('|')); if (hd[rk]) hq[k] = dn[k]; });
      this.state.dsoHandQ = hq;
    }
  }

  // ---- than trang + hop thoai ---------------------------------------------
  // Ke hoach may: 3 tab dung chung 1 trang
  renderSewBody() {
    const t = this.state.tab;
    return t === 'weekly' ? this.renderBody()
      : (t === 'trim' ? this.renderBundleBody() : this.renderDemandBody());
  }
  renderOverlays() { return [this.renderBForm()]; }

  onEsc(e) {
    if (this.state.dsoTap) this.dsoTapClose();
    if (this.state.mlvFs) this.set({ mlvFs: false });
    if (this.state.bslip) this.bSlipClose();
    if (this.state.dsoHandBulk) this.set({ dsoHandBulk: null });
    if (this.state.dsoHandAsk) this.dsoSlipClose();
  }
  onMount() { this.reconcileWeeks(); }
  onUnmount() { clearTimeout(this._tblT); this.mlvClockOff(); this.mlvFsOff(); }

  MES = {
    'VUORI':['VW5159-M11','VW5202-M5','VW3310-W2','VW4408-K1','V237','VW5160'],
    'KSK':['JWJJW26311'],
    'KSC':['LHVT6WN185'],
    'FILA CHINA':['A11M645932F'],
    'FIGS':['FG-1000199','FG-1003117','FG-ISABEL-52','FG-OLIVE-60'],
    'DESCENTE':['D6432SPT51','D6432SPT50','D7118WVN22'],
    'COTOPAXI':['F25471M1691','CT-ABRZ-88'],
    'LULULEMON':['LL-ABC-2024','LL-PACE-778'],
    'PATAGONIA':['PT-4471-CAP','PT-NANO-33'],
    'NIKE':['NK-DF-8890','NK-TECH-201'],
    'ON RUNNING':['ON-CLOUD-5','ON-CORE-12'],
  };
  SIZES = {
    'VW5159-M11':['XXS','XS','S','M','L','XL','2XL'],
    'VW5202-M5':['XS','S','M','L','XL'],
    'VW3310-W2':['XS','S','M','L'],
    'FG-1000199':['XS','S','M','L','XL','2XL','3XL','4XL','5XL','6XL'],
    'FG-1003117':['XXS','XS','S','M','L','XL','2XL'],
    'VW5159-M2':['XXS','XS','S','M','L','XL','2XL'],
    'D6432SPT51':['S','M','L','XL','2XL'],
    _def:['XS','S','M','L','XL','2XL'],
  };
  CUTCOLORS = {
    'VW5159-M11':['WHITE','Black','Marshmallow','Bourbon','Washed Boysenberry'],
    'VW5202-M5':['Black','Charcoal','Heather Grey'],
    'VW3310-W2':['Dusk','Fig','Onyx'],
    'VW4408-K1':['Storm','Sand','Ink'],
    'FG-1000199':['Navy','Black','Wine'],
    'FG-1003117':['Olive','Graphite','Ceil Blue'],
    'FG-ISABEL-52':['Navy','Black','Ciel'],
    'FG-OLIVE-60':['Olive','Graphite','Navy'],
    'D6432SPT51':['Black','Navy','Ceil Blue'],
    'D6432SPT50':['Olive','Graphite','Navy'],
    'D7118WVN22':['Slate','Black','Sage'],
    'F25471M1691':['Midnight','Volt','White'],
    'CT-ABRZ-88':['Cinnamon','Maritime','Black'],
    'LL-ABC-2024':['True Navy','Black','Graphite Grey'],
    'LL-PACE-778':['White','Black','Pigment'],
    'PT-4471-CAP':['Forge Grey','Black','Tidepool'],
    'PT-NANO-33':['Classic Navy','Black','Ember'],
    'NK-DF-8890':['Midnight','White','Volt'],
    'NK-TECH-201':['Obsidian','Grey','Crimson'],
    'ON-CLOUD-5':['All Black','Glacier','Rock'],
    'ON-CORE-12':['Ink','Fog','Flame'],
  };
  CUTTURNS = {
    'VW5159-M11':[
      {id:'C1',marker:'XS+S/3+M/3+L',layers:121},
      {id:'C2',marker:'XS+S/3+M/3+L',layers:121},
      {id:'C3',marker:'XS+S/3+M/3+L',layers:121},
      {id:'C4',marker:'XS+S/3+M/3+L',layers:123},
      {id:'C5',marker:'S+M+L/3+XL/3',layers:123},
      {id:'C6',marker:'XS/3+M/3+L/2',layers:102},
      {id:'C7',marker:'XS/2+S/5+M',layers:104},
      {id:'C8',marker:'S+XL+2XL',layers:59},
      {id:'C9',marker:'XXS+XS',layers:34},
      {id:'C10',marker:'XS',layers:14},
      {id:'C11',marker:'XS+S/3+M/3+L',layers:116},
      {id:'C12',marker:'XS+S/3+M/3+L',layers:116},
      {id:'C13',marker:'M+L/3+XL/2',layers:90},
      {id:'C14',marker:'M+L',layers:35},
      {id:'C15',marker:'M+XL+2XL',layers:25},
      {id:'C16',marker:'S',layers:22},
    ],
  };
  DEMAND = {
    'VW5159-M11':{XXS:34,XS:1280,S:2878,M:2837,L:1596,XL:633,'2XL':84},
    'VW5159-M2':{XXS:327,XS:1295,S:2333,M:2175,L:1085,XL:411,'2XL':70},
    'FG-1000199':{XS:880,S:3105,M:7776,L:6440,XL:3980,'2XL':2235,'3XL':556,'4XL':385,'5XL':170,'6XL':15},
    'FG-1003117':{XXS:945,XS:4191,S:7217,M:6391,L:3339,XL:1620,'2XL':750},
  };

  CAP = [
    {n:1,brand:'FIGS',style:'1000199',emb:'KHÔNG',line:'Line 8',cut:9840,iss:8520,turns:'C1–C52',po:'10848',days:[0,0,0,0,0,0]},
    {n:2,brand:'FIGS',style:'1000199',emb:'KHÔNG',line:'Line 9',cut:7260,iss:6180,turns:'C1–C28',po:'10502',days:[0,0,0,0,0,0]},
    {n:3,brand:'VUORI',style:'VW5159-M2',emb:'KHÔNG',line:'Line 5',cut:4180,iss:3520,turns:'C1–C14',po:'4446, 4841',days:[0,0,0,0,0,0]},
    {n:4,brand:'FIGS',style:'1003117',emb:'THÊU',line:'Line 10',cut:14600,iss:12150,turns:'C1–C62',po:'10130',days:[0,0,0,0,0,0]},
    {n:5,brand:'VUORI',style:'VW5159-M11',emb:'KHÔNG',line:'Line 6',cut:5940,iss:5100,turns:'C1–C16',po:'Multi (6)',days:[0,0,0,0,0,0]},
  ];
  FAB = {
    'VW5159-M11':[{vl:'AL7121Q',tot:2439},{vl:'AL7121R',tot:1698},{vl:'AL7088B',tot:812}],
    'VW5160':[{vl:'AL7121Q',tot:1698},{vl:'AL7095C',tot:940}],
    'JWJJW26311':[{vl:'KJ4400N',tot:1120},{vl:'KJ4400B',tot:760}],
    'V237':[{vl:'VRT2100',tot:640},{vl:'VRT2101',tot:415}],
    'FG-1003117':[{vl:'FS1180C',tot:2210},{vl:'FS1180N',tot:1830},{vl:'FS1180G',tot:905}],
    'LHVT6WN185':[{vl:'KC7702',tot:1985},{vl:'KC7703',tot:1120}],
    'A11M645932F':[{vl:'FL3308',tot:820},{vl:'FL3309',tot:505}],
    'D6432SPT51':[{vl:'DS6600Q',tot:1390},{vl:'DS6601Q',tot:980}],
    'D6432SPT50':[{vl:'DS6600Q',tot:3214},{vl:'DS6602B',tot:1240}],
    'F25471M1691':[{vl:'CX2190',tot:2188},{vl:'CX2191',tot:1345}],
    'FG-1000199':[{vl:'FS1020B',tot:7420},{vl:'FS1020N',tot:3115},{vl:'FS1020G',tot:1480}],
  };
  fabOf(style){ const plans=this.khcPlansFor(style);
    if(plans.length){ const out=[],seen={};
      plans.forEach(p=>p.sections.forEach(s=>{ if(s.grp!=='aux'&&!seen[s.fab]){ seen[s.fab]=1; out.push({vl:s.fab,tot:s.total}); } }));
      if(out.length) return out; }
    return this.FAB[this.sKey(style)]||[{vl:'—',tot:0}]; }
  khcTurns(style,po){ const plans=this.khcPlansFor(style); if(!plans.length) return null;
    let pl=plans[0];
    if(plans.length>1&&po!=null&&po!==''){ const pd=String(po).replace(/\D/g,''); const hit=plans.find(p=>{ const q=p.qrPo.replace(/\D/g,''); return q&&pd&&(q===pd||pd.indexOf(q)>=0||q.indexOf(pd)>=0); }); if(hit) pl=hit; }
    this._kt=this._kt||{};
    if(!this._kt[pl.id]) this._kt[pl.id]=pl.sections.filter(s=>s.grp!=='aux').reduce((a,s)=>a.concat(s.tables.map(t=>({id:t.tb,marker:t.sz.map(([n,r])=>r>1?n+'/'+r:n).join('+'),layers:t.ly}))),[]);
    return this._kt[pl.id]; }

  SALIAS = {'VW5159':'VW5159-M11','1000199':'FG-1000199','1003117':'FG-1003117'};
  sKey(style){ return this.SALIAS[style]||style; }
  cutColors(style){ return this.CUTCOLORS[this.sKey(style)]||['Black','Navy','Grey']; }
  parseMarker(m){ const o={}; String(m).split('+').forEach(tok=>{ const p=tok.split('/'); const name=(p[0]||'').trim(); if(!name) return; o[name]=(o[name]||0)+(p[1]?(parseInt(p[1],10)||1):1); }); return o; }
  turnSizes(t){ const r=this.parseMarker(t.marker); const o={}; Object.keys(r).forEach(s=>o[s]=r[s]*t.layers); return o; }
  cutTurns(style,po){ const kt=this.khcTurns(style,po); if(kt) return kt; style=this.sKey(style); if(this.CUTTURNS[style]) return this.CUTTURNS[style]; this._gt=this._gt||{}; if(!this._gt[style]) this._gt[style]=this.buildTurns(style); return this._gt[style]; }
  buildTurns(style){ const sz=this.sizesFor(style); const combos=[sz.slice(1,4),sz.slice(2,5),sz.slice(0,3),sz.slice(3),[sz[Math.floor(sz.length/2)]]].filter(c=>c&&c.length); const lay=[120,118,104,72,40]; return combos.map((cs,i)=>({id:'C'+(i+1),marker:cs.map((s,k)=>k===1?s+'/3':(k===2?s+'/2':s)).join('+'),layers:lay[i]||30})); }
  sumTurns(ids,style){ const cat=this.cutTurns(style); const m={}; (ids||[]).forEach(id=>{ const t=cat.find(x=>x.id===id); if(t){ const ts=this.turnSizes(t); Object.keys(ts).forEach(s=>m[s]=(m[s]||0)+ts[s]); } }); return m; }
  cellFrom(style,ids,sizes,qty){ const ss=this.SORDER.filter(s=>sizes.includes(s)); return {turns:[...ids],sizes:ss,qty:{...qty},turn:ids.join(', '),size:ss.join(', '),supply:ss.map(s=>String(qty[s]||0)).join(', ')}; }
  demandTarget(style){ const d=this.DEMAND[this.sKey(style)]; if(d) return {...d}; const sz=this.sizesFor(style); const w=[1,4,7,7,4,2,1]; const t={}; sz.forEach((s,i)=>t[s]=(w[i]||1)*180); return t; }
  // Bo rule sinh san du lieu tuan -- moi o ngay bat dau trong, nhap tay.
  initBundle(rows){ return {}; }
  // 3 cot dau van tu dong: chuyen + ma hang tu Ke hoach may, mau cat theo tac nghiep cat
  autoColor(r,ri){ const cols=this.cutColors(r.style); return cols[ri%cols.length]||''; }
  // Bundle khoa theo danh tinh on dinh: tuan + chuyen + ma hang.
  // Truoc day khoa theo r.id, ma psPlanRows cap lai r1..rN cho tung tuan
  // -> o cua tuan nay hien sang tuan khac, va deo sang ca ma hang khac.
  bKey(r){ return r?(this.state.week+'|'+this.normName(r.line)+'|'+String(r.style||'')):''; }
  bKeyOf(id){ return this.bKey(this.getWeek().rows.find(r=>r.id===id)); }
  bAt(id){ const k=this.bKeyOf(id); return k?this.state.bundle[k]:null; }
  // Ban luu cu khong co tuan trong khoa -> gan vao dung tuan dang chon, la tuan nguoi dung
  // dang xem cac o do. Cac ban sao ao o tuan khac bien mat.
  migrateBundle(old){ if(!old||!Object.keys(old).length) return {};
    const wk=(this.state.weeks||{})[this.state.week]; const rows=(wk&&wk.rows)||[];
    const out={}; rows.forEach(r=>{ const v=old[r.id]; if(v) out[this.bKey(r)]=v; }); return out; }
  bundleColor(r,ri){ const b=this.state.bundle[this.bKey(r)]; return (b&&b.color)||this.autoColor(r,ri); }
  // 1 bang luot cat cho moi ma hang + mau cat. Cac dong cung scope dung chung 1 bo luot,
  // moi luot chi duoc cap 1 lan -> quet ca tuan xem luot nao da bi o khac giu.
  turnScope(style,color){ return this.sKey(style)+'|'+String(color||'').toLowerCase().trim(); }

  // ==== Chon theo TUNG VI TRI SIZE tren so do cat (khong con chon ca luot) ====
  // key = '<luot>|<size>|<so thu tu>'. 1 lenh cap co the lay vi tri cua nhieu luot khac nhau.
  posKey(tid,s,k){ return tid+'|'+s+'|'+k; }
  turnPos(t){ const r=this.parseMarker(t.marker), out=[], ly=Number(t.layers)||0;
    this.SORDER.forEach(s=>{ const n=Number(r[s])||0;
      for(let k=1;k<=n;k++) out.push({tid:t.id,s:s,k:k,ly:ly,key:this.posKey(t.id,s,k)}); });
    return out; }
  posTq(style,pos){ const cat=this.cutTurns(style), tq={};
    (pos||[]).forEach(pk=>{ const a=String(pk).split('|'); const t=cat.find(x=>x.id===a[0]); if(!t) return;
      tq[t.id]=tq[t.id]||{}; tq[t.id][a[1]]=(tq[t.id][a[1]]||0)+(Number(t.layers)||0); });
    return tq; }
  posTurns(style,pos){ const tq=this.posTq(style,pos); return this.cutTurns(style).filter(t=>tq[t.id]).map(t=>t.id); }
  // Ban luu cu chi co 'turns' -> coi nhu o do giu toan bo vi tri cua cac luot da chon
  cellPos(style,c){ if(!c) return [];
    if(c.pos) return c.pos;
    const cat=this.cutTurns(style), out=[];
    (c.turns||[]).forEach(tid=>{ const t=cat.find(x=>x.id===tid); if(t) this.turnPos(t).forEach(p=>out.push(p.key)); });
    return out; }
  usedPos(style,color,skipId,skipDay){ const key=this.turnScope(style,color), used={};
    this.getWeek().rows.forEach((r,i)=>{ if(this.turnScope(r.style,this.bundleColor(r,i))!==key) return;
      const b=this.state.bundle[this.bKey(r)]; if(!b||!b.days) return;
      this.DAYS.forEach(d=>{ if(r.id===skipId&&d===skipDay) return;
        this.cellPos(style,b.days[d]).forEach(pk=>{ if(!used[pk]) used[pk]={line:this.normName(r.line),day:d}; }); }); });
    return used; }
  bformUsedPos(){ const f=this.state.bform; if(!f) return {};
    const rows=this.getWeek().rows, i=rows.findIndex(r=>r.id===f.id); if(i<0) return {};
    return this.usedPos(rows[i].style,this.bundleColor(rows[i],i),f.id,f.day); }
  togglePos(pk){ const f=this.state.bform; if(!f) return;
    if(!(f.pos||[]).includes(pk)&&this.bformUsedPos()[pk]) return;   // vi tri da cap o o khac
    this.setState(st=>{ const p=[...((st.bform||{}).pos||[])]; const i=p.indexOf(pk);
      if(i>=0) p.splice(i,1); else p.push(pk);
      return {bform:{...st.bform,pos:p}}; }); }
  // Checkbox tren dong luot cat: chon het vi tri con trong, hoac bo het vi tri cua luot do
  toggleTurnAll(tid){ const f=this.state.bform; if(!f) return;
    const r=this.getWeek().rows.find(x=>x.id===f.id); if(!r) return;
    const t=this.cutTurns(r.style).find(x=>x.id===tid); if(!t) return;
    const used=this.bformUsedPos();
    const free=this.turnPos(t).filter(p=>!used[p.key]).map(p=>p.key);
    const cur=f.pos||[], allOn=free.length>0&&free.every(k=>cur.includes(k));
    this.setState(st=>{ let p=[...((st.bform||{}).pos||[])];
      if(allOn) p=p.filter(k=>free.indexOf(k)<0);
      else free.forEach(k=>{ if(p.indexOf(k)<0) p.push(k); });
      return {bform:{...st.bform,pos:p}}; }); }
  pickColor(id,color){ const row=this.getWeek().rows.find(r=>r.id===id); if(!row) return;
    const k=this.bKeyOf(id); if(!k) return;
    this.setState(s=>{ const prev=s.bundle[k]; const days=(prev&&prev.color)?prev.days:{}; return {bundle:{...s.bundle,[k]:{color,days}}}; }); }
  bundleTotal(id){ const b=this.bAt(id); if(!b||!b.days||!Object.keys(b.days).length) return null; let t=0; Object.values(b.days).forEach(c=>{ (String(c.supply||'').match(/\d+/g)||[]).forEach(n=>t+=Number(n)); }); return t; }
  sizesFor(style){ return this.SIZES[this.sKey(style)]||this.SIZES._def; }
  openBForm(id,day){ const row=this.getWeek().rows.find(r=>r.id===id); if(!row) return;
    const b=this.bAt(id)||{days:{}};
    // chot luon khoa luu tai thoi diem mo -> doi tuan giua luc dang mo cung khong ghi lech o
    this.setState({bform:{id,day,bk:this.bKeyOf(id),pos:this.cellPos(row.style,(b.days&&b.days[day])||null)},bedit:null,edit:null}); }
  turnCap(style,tid,sz){ const t=this.cutTurns(style).find(x=>x.id===tid); if(!t) return {cap:0,step:1}; const r=this.parseMarker(t.marker)[sz]||0; return {cap:r*t.layers,step:t.layers||1}; }
  tqTotals(tq){ const o={}; Object.keys(tq||{}).forEach(tid=>{ const m=tq[tid]||{}; Object.keys(m).forEach(s=>o[s]=(o[s]||0)+(Number(m[s])||0)); }); return o; }
  togglePickSize(tid,sz){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const tq={...(f.tq||{})}; const m={...(tq[tid]||{})}; if(Object.prototype.hasOwnProperty.call(m,sz)) delete m[sz]; else { const {step}=this.turnCap(row.style,tid,sz); m[sz]=step; } tq[tid]=m; return {bform:{...f,tq}}; }); }
  setSizeQty(tid,sz,v){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const {cap,step}=this.turnCap(row.style,tid,sz); let val=Math.max(0,parseInt(v,10)||0); val=Math.round(val/step)*step; val=Math.min(val,Math.floor(cap/step)*step); const tq={...(f.tq||{})}; tq[tid]={...(tq[tid]||{}),[sz]:val}; return {bform:{...f,tq}}; }); }
  adjSize(tid,sz,dir){ this.setState(s=>{ const f={...s.bform}; const row=this.getWeek().rows.find(r=>r.id===f.id); const {cap,step}=this.turnCap(row.style,tid,sz); const capM=Math.floor(cap/step)*step; const tq={...(f.tq||{})}; const cur=Number((tq[tid]||{})[sz])||0; let val=Math.max(0,Math.min(cur+dir*step,capM)); tq[tid]={...(tq[tid]||{}),[sz]:val}; return {bform:{...f,tq}}; }); }
  // Trang thai cap BTP cua 1 o: ban luu cu khong co truong status -> coi la 'waiting'
  cellStatus(cell){ const v=cell&&cell.status;
    return this.STORDER.indexOf(v)>=0?v:'waiting'; }
  bcellAt(id,day){ const b=this.bAt(id); return (b&&b.days&&b.days[day])||null; }
  // Nut Received trong modal: luu luon phan dang sua roi doi trang thai (bam lai -> tra ve Waiting)
  // So sanh theo tap hop -- doi thu tu chon lai cung 1 bo luot cat thi khong tinh la doi
  turnsKey(a){ return [...(a||[])].sort().join(','); }
  // Trang thai se duoc luu neu bam Cap nhat ngay bay gio.
  // Tao moi HOAC doi luot cat -> ve DAU chu ky = 'requested' (STORDER[0]), khong phai
  // 'waiting'; nhay thang sang waiting la bo mat trang thai dau va lam 1 request vua
  // tao ra da trong nhu da qua mot buoc xu ly.
  bformStatus(){ const NEW=this.STORDER[0];
    const f=this.state.bform; if(!f) return NEW;
    const prev=this.bcellAt(f.id,f.day); if(!prev) return NEW;
    const row=this.getWeek().rows.find(r=>r.id===f.id); if(!row) return NEW;
    if(this.turnsKey(this.cellPos(row.style,prev))!==this.turnsKey(f.pos)) return NEW;
    return this.cellStatus(prev); }
  receiveBForm(){ const f=this.state.bform; if(!f) return;
    const next=this.bformStatus()==='received'?'waiting':'received';
    this.logReceive(f,next==='waiting');
    this.saveBForm(next); }
  // Moi lan bam Received deu ghi 1 dong. undo=true la lan bam tra ve Waiting.
  logReceive(f,undo){ const rows=this.getWeek().rows; const idx=rows.findIndex(x=>x.id===f.id);
    const r=rows[idx]; if(!r) return;
    const tq=this.posTq(r.style,f.pos);
    const turns=Object.keys(tq).map(t=>({id:t,
      qty:Object.keys(tq[t]||{}).reduce((a,s)=>a+(Number((tq[t]||{})[s])||0),0)}));
    const e={ts:Date.now(),line:this.normName(r.line),style:r.style||'\u2014',
      color:this.bundleColor(r,idx)||'\u2014',turns,undo:!!undo};
    this.setState(s=>({recvLog:[...(s.recvLog||[]),e]})); }
  recvTurnText(e){ return (e.turns||[]).map(t=>t.id+' - '+this.fmt(t.qty)).join(', ')||'\u2014'; }
  saveBForm(status){ const f=this.state.bform; const row=this.getWeek().rows.find(r=>r.id===f.id);
    const tq=this.posTq(row.style,f.pos); const tot=this.tqTotals(tq);
    const sizes=this.SORDER.filter(s=>(tot[s]||0)>0);
    const cell=this.cellFrom(row.style,this.posTurns(row.style,f.pos),sizes,tot);
    cell.tq=tq; cell.pos=[...(f.pos||[])];
    // tao moi / doi luot cat -> Requested; con lai giu nguyen. Nut Received truyen thang status vao day
    cell.status=status||this.bformStatus();
    const k=f.bk||this.bKeyOf(f.id); if(!k){ this.set({bform:null}); return; }
    this.setState(s=>{ const bundle={...s.bundle}; const bb={...(bundle[k]||{color:'',days:{}})}; const days={...bb.days}; days[f.day]=cell; bb.days=days; bundle[k]=bb; return {bundle,bform:null}; }); }
  clearBForm(){ const f=this.state.bform; const k=f.bk||this.bKeyOf(f.id); if(!k){ this.set({bform:null}); return; }
    this.setState(s=>{ const bundle={...s.bundle}; const bb={...(bundle[k]||{days:{}})}; const days={...bb.days}; delete days[f.day]; bb.days=days; bundle[k]=bb; return {bundle,bform:null}; }); }

  seed(){
    const D=(vals)=>{ const o={}; this.DAYS.forEach((d,i)=>o[d]=(vals[i]!=null?vals[i]:null)); return o; };
    let n=0;
    const R=(line,brand,style,vals)=>({id:'r'+(++n),line,brand,style,days:D(vals)});
    // Seed từ tác nghiệp cắt (SL/ngày ≈ tổng đơn ÷ 30) — sửa tay thoải mái
    const wk=()=>[
      R('Line 5','VUORI','VW5159-M2',[255,255,255,255,255,255]),
      R('Line 6','VUORI','VW5159-M11',[310,310,310,310,310,310]),
      R('Line 8','FIGS','1000199',[420,420,420,420,420,420]),
      R('Line 9','FIGS','1000199',[430,430,430,430,430,430]),
      R('Line 10','FIGS','1003117',[815,815,815,815,815,815]),
    ];
    const keys=[]; Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>keys.push(w)));
    const out={}; let any=false;
    keys.forEach(k=>{ const rows=this.psPlanRows(k); if(rows.length) any=true; out[k]={rows,auto:true}; });
    // Chua co du lieu KHSX (file nap sau khi component dung) -> gieo tam va DANH DAU demo
    // de reconcileWeeks() thay lai bang du lieu that. Khong danh dau thi tuan hien tai
    // se dinh vinh vien 5 dong mau nay.
    if(!any&&!window.PSCHED) out[this.CURWK]={rows:wk(),demo:true};
    return out;
  }
  sortPlan(rows){ return rows.map((r,i)=>[r,i]).sort((a,b)=>{
    const na=this.parseNums(a[0].line), nb=this.parseNums(b[0].line);
    return ((na.length?na[0]:1e9)-(nb.length?nb[0]:1e9))||(a[1]-b[1]); }).map(x=>x[0]); }

  getWeek(key){ return this.state.weeks[key || this.state.week] || {rows:[]}; }
  rowTotal(r){ return this.DAYS.reduce((a,d)=>a+(Number(r.days[d])||0),0); }
  colTotal(rows,d){ return rows.reduce((a,r)=>a+(Number(r.days[d])||0),0); }
  grand(rows){ return rows.reduce((a,r)=>a+this.rowTotal(r),0); }
  weekTotal(key){ return this.grand(this.getWeek(key).rows); }
  PLANCOLS = ['line','brand','style','wa'];   // 'wa' = cot A (TOTAL ORDER CUT) o bang Nhu Cau BTP
  startEdit(id,col){ if(this.PLANCOLS.includes(col)&&this.planColLocked(id,col)) return;
    this._chainBrand=null;
    const empty=(this.getWeek().rows||[]).filter(r=>r.id!==id&&!r.brand&&!r.style&&!this.rowHasData(r)).map(r=>r.id);
    if(empty.length) this.mutateRows(rows=>rows.filter(r=>!empty.includes(r.id)));
    this.setState({edit:{id,col},bedit:null}); }
  planColLocked(id,col){ const rows=this.getWeek().rows; const r=rows.find(x=>x.id===id); if(!r) return true;
    return this.PLANCOLS.includes(col); }
  rowHasData(r){ return this.DAYS.some(d=>r.days[d]!=null); }
  clearRowLinks(id){ const bk=this.bKeyOf(id); this.setState(s=>{ const bundle={...s.bundle}; if(bk) delete bundle[bk]; const wip={...s.wip}; Object.keys(wip).forEach(k=>{ if(k.endsWith('|'+id)) delete wip[k]; }); return {bundle,wip}; }); }
  dayTaken(r,d){ const ln=this.normName(r.line); const o=this.getWeek().rows.find(x=>x.id!==r.id&&this.normName(x.line)===ln&&x.days[d]!=null); return o||null; }
  stopEdit(){
    if(this._chainBrand){ const id=this._chainBrand; this._chainBrand=null; this.setState({edit:{id,col:'brand'},bedit:null}); return; }
    const empty=(this.getWeek().rows||[]).filter(r=>!r.brand&&!r.style&&!this.rowHasData(r)).map(r=>r.id);
    if(empty.length) this.mutateRows(rows=>rows.filter(r=>!empty.includes(r.id)));
    this.setState({edit:null,bedit:null}); }
  mutateRows(fn){ this.setState(s=>{ const weeks={...s.weeks}; const key=s.week; const wk={...(weeks[key]||{rows:[]})}; wk.rows=this.sortPlan(fn(wk.rows)); delete wk.demo; delete wk.auto; weeks[key]=wk; return {weeks}; }); }
  setDay(id,day,val){ const v=(val===''||val==null)?null:(Number(val)||0); const r=this.getWeek().rows.find(x=>x.id===id); const ln=r&&this.normName(r.line);
    this.mutateRows(rows=>rows.map(x=>{ if(x.id===id) return {...x,days:{...x.days,[day]:v}};
      if(v!=null&&this.normName(x.line)===ln&&x.days[day]!=null) return {...x,days:{...x.days,[day]:null}};
      return x; })); }
  setBrand(id,v){ const r=this.getWeek().rows.find(x=>x.id===id); if(r&&r.brand===v) return; const wipe=r&&this.rowHasData(r); const blank={}; this.DAYS.forEach(d=>blank[d]=null);
    this.mutateRows(rows=>rows.map(r=>r.id===id?{...r,brand:v,style:'',...(wipe?{days:blank}:{})}:r)); if(wipe) this.clearRowLinks(id); }
  setStyle(id,v){ const r=this.getWeek().rows.find(x=>x.id===id); if(r&&r.style===v) return; const wipe=r&&this.rowHasData(r); const blank={}; this.DAYS.forEach(d=>blank[d]=null);
    const nb=this.brandForStyle(v);
    this.mutateRows(rows=>rows.map(r=>r.id===id?{...r,style:v,...((!r.brand&&nb)?{brand:nb}:{}),...(wipe?{days:blank}:{})}:r)); if(wipe) this.clearRowLinks(id); }
  MAXL = 12;
  // Danh sách chuyền bám theo Kế hoạch sản xuất — không tự sinh Line 4/13, có Line 14
  planLineNums(){ const s=new Set(); this.psLines().forEach(n=>this.parseNums(n).forEach(x=>s.add(x)));
    const a=Array.from(s).sort((x,y)=>x-y); return a.length?a:Array.from({length:this.MAXL},(_,i)=>i+1); }
  addRowSame(line){ const id='r'+Date.now(); const days={}; this.DAYS.forEach(d=>days[d]=null);
    this.mutateRows(rows=>[...rows,{id,line,brand:'',style:'',days}]); this.setState({edit:{id,col:'brand'},bedit:null}); }
  capDays(r){ const key=this.bdKey(r.line,r.brand,r.style); const out=this.DAYS.map(()=>0); let hit=false;
    this.getWeek().rows.forEach(x=>{ if(this.bdKey(x.line,x.brand,x.style)!==key) return; hit=true; this.DAYS.forEach((d,i)=>{ out[i]+=Number(x.days[d])||0; }); });
    return hit?out:(r.days||[]).map(x=>Number(x)||0); }
  renameGroup(ids,name){ const nm=this.normName(name); const ok=this.planLineNums(); if(this.parseNums(nm).some(n=>ok.indexOf(n)<0)){ window.alert(this.t('maxLines')); return; }
    const ns=this.parseNums(nm); if(ns.length>2||(ns.length===2&&Math.abs(ns[0]-ns[1])!==1)){ window.alert(this.t('lineMergeErr')); return; }
    const others=this.getWeek().rows.filter(r=>!ids.includes(r.id));
    if(ns.some(n=>others.some(x=>this.parseNums(x.line).includes(n)))){ window.alert(this.t('lineDupErr')); return; }
    const fresh=this.getWeek().rows.find(r2=>ids.includes(r2.id)&&!r2.brand&&!r2.style&&!this.rowHasData(r2)); if(fresh) this._chainBrand=fresh.id; this.mutateRows(rows=>rows.map(r=>ids.includes(r.id)?{...r,line:nm}:r)); }
  removeGroup(ids){ this.mutateRows(rows=>rows.filter(r=>!ids.includes(r.id))); }
  removeGroupSafe(ids){ const rows=this.getWeek().rows.filter(r=>ids.includes(r.id));
    const hasData=rows.some(r=>this.DAYS.some(d=>r.days[d]!=null));
    if(hasData && !window.confirm(this.t('confirmDel'))) return;
    this.removeGroup(ids); this.stopEdit(); }
  lineSpans(rows){ const norm=r=>this.normName(r.line); const info=[]; let i=0;
    while(i<rows.length){ let j=i; while(j+1<rows.length && norm(rows[j+1])===norm(rows[i])) j++; const ids=rows.slice(i,j+1).map(r=>r.id); const span=j-i+1;
      for(let k=i;k<=j;k++) info[k]={first:k===i,span,ids}; i=j+1; } return info; }
  fieldSpans(rows,field){ const norm=r=>this.normName(r.line); const info=[]; let i=0;
    while(i<rows.length){ let lend=i; while(lend+1<rows.length && norm(rows[lend+1])===norm(rows[i])) lend++;
      let k=i; while(k<=lend){ const v=rows[k][field]; let m=k; while(m+1<=lend && rows[m+1][field]===v && (v!=null&&v!=='')) m++; const span=m-k+1; for(let x=k;x<=m;x++) info[x]={first:x===k,span}; k=m+1; }
      i=lend+1; } return info; }
  copyLastWeek(){ const prev=this.prevWeekKey(); if(!prev) return; const src=this.getWeek(prev);
    this.setState(s=>{ const weeks={...s.weeks}; weeks[s.week]={rows:JSON.parse(JSON.stringify(src.rows)).map((r,i)=>({...r,id:'r'+Date.now()+'_'+i}))}; return {weeks}; }); }
  // Tải file ngay tại panel tác nghiệp cắt — không nhảy sang trang khác
  addFilesHere(list){ const arr=Array.from(list||[]).map(f=>({name:f.name,size:(Math.max(1,Math.round(f.size/1024)))+' KB'})); if(!arr.length) return; this.setState(s=>({files:[...s.files,...arr]})); }
  selectWeek(w){ this.setState({week:w,edit:null,bedit:null},()=>{ setTimeout(()=>{ const sc=this.scrollRef.current, el=this.panelRef.current; if(sc&&el){ const top=el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 16; sc.scrollTo({top,behavior:'smooth'}); } },60); }); }

  lineOptions(){ const pl=this.psLines(); const seen=pl.length?[...pl]:this.planLineNums().map(n=>'LINE '+n);
    this.getWeek().rows.forEach(r=>{ const n=this.normName(r.line); if(!seen.includes(n)) seen.push(n); });
    return seen; }
  renderBody(){
    const h=React.createElement;
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px',position:'relative'}},
      this.renderTitle(), this.renderKpis(), this.renderTabs(), this.renderPanel());
  }

  renderTabs(){
    const h=React.createElement, C=this.C;
    const tabs=[['weekly',this.t('tab1')],['daily',this.t('tab2')],['trim',this.t('tab3')]];
    return h('div',{style:{display:'inline-flex',gap:3,background:'#e7eadf',padding:4,borderRadius:12,marginBottom:20}},
      tabs.map(([id,label])=>{ const a=this.state.tab===id;
        return h('button',{key:id,onClick:()=>this.set({tab:id}),style:{border:'none',cursor:'pointer',padding:'8px 18px',fontSize:13.5,fontWeight:600,color:a?C.dark:C.sub,background:a?'#fff':'transparent',borderRadius:9,fontFamily:'inherit',boxShadow:a?'0 1px 3px rgba(24,36,14,.14)':'none',transition:'background .15s,color .15s'}},label); }));
  }

  renderKpis(){
    const h=React.createElement, C=this.C; const rows=this.getWeek().rows;
    const lineSet=new Set(); rows.forEach(r=>{ if(this.DAYS.some(d=>r.days[d]!=null)) this.parseNums(r.line).forEach(n=>lineSet.add(n)); });
    // chi cong cac dong cua tuan dang xem -- bundle gio chua ca cac tuan khac
    let reqTotal=0; this.getWeek().rows.forEach(r=>{ const t=this.bundleTotal(r.id); if(t) reqTotal+=t; });
    const cards=[
      [this.t('kpiPlan'),this.fmt(this.weekTotal()),this.t('kpiPlanSub')],
      [this.t('kpiDemand'),this.fmt(this.needTotal()),this.t('kpiDemandSub')],
      [this.t('kpiReq'),this.fmt(reqTotal),this.t('kpiReqSub')]];
    const icons=[
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('rect',{x:3,y:4,width:18,height:17,rx:3}),h('path',{d:'M8 2v4M16 2v4M3 9h18'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M12 2 2 7l10 5 10-5-10-5z'}),h('path',{d:'M2 12l10 5 10-5'}),h('path',{d:'M2 17l10 5 10-5'})),
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.8},h('path',{d:'M21 8 12 3 3 8v8l9 5 9-5V8z'}),h('path',{d:'M3 8l9 5 9-5M12 13v8'}))];
    return h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}},
      cards.map(([label,val,sub],i)=>h('div',{key:i,style:{background:C.white,border:'1px solid '+C.border,borderRadius:13,padding:'10px 14px',boxShadow:C.shadow,display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{width:26,height:26,borderRadius:8,background:C.tint,color:C.dark,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},icons[i]),
        h('div',{style:{flex:1,minWidth:0,fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.sub,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},label),
        h('div',{style:{fontSize:19,fontWeight:700,letterSpacing:'-.4px',lineHeight:1,fontVariantNumeric:'tabular-nums',flex:'none'}},val))));
  }

  renderPeriodBar(noWeeks){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const months=Object.keys(this.MONTHS); const om=this.state.openMonth||months[0]; const weeks=this.MONTHS[om]||[];
    return h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:10,padding:'9px 14px',borderBottom:'1px solid '+C.line,background:C.offBg}},
      h('span',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.6px',color:C.faint}},this.t('period')),
      h('div',{style:{display:'inline-flex',gap:3,background:'#e9ece1',padding:3,borderRadius:10}},
        months.map((m)=>{ const on=om===m;
          return h('button',{key:m,onClick:()=>this.set({openMonth:m}),style:{border:'none',padding:'5px 13px',fontSize:12.5,fontWeight:600,fontFamily:'inherit',cursor:'pointer',background:on?'#fff':'transparent',color:on?C.dark:C.sub,borderRadius:8,boxShadow:on?'0 1px 2px rgba(24,36,14,.15)':'none'}},m); })),
      noWeeks?null:h('div',{style:{width:1,height:20,background:C.border}}),
      noWeeks?null:h('div',{style:{display:'flex',flexWrap:'wrap',gap:6}},
        weeks.map(w=>{ const sel=this.state.week===w; const wn=w.split('· ')[1]; const tot=this.weekTotal(w);
          return h('button',{key:w,onClick:()=>this.selectWeek(w),style:{cursor:'pointer',fontFamily:'inherit',fontSize:12.5,fontWeight:600,padding:'6px 13px',borderRadius:999,border:'1px solid '+(sel?C.primary:C.border),background:sel?C.primary:C.white,color:sel?'#fff':C.sub,display:'inline-flex',alignItems:'center',gap:7,transition:'background .15s,color .15s,border-color .15s'}},
            wn, h('span',{style:{fontSize:10.5,fontWeight:600,color:sel?'rgba(255,255,255,.8)':C.faint,fontFamily:mono}},tot?this.fmt(tot):'—')); })));
  }

  renderPanel(){
    const h=React.createElement, C=this.C; const rows=this.getWeek().rows;
    const active=rows.filter(r=>this.DAYS.some(d=>r.days[d]!=null)).length;
    const lineSet=new Set(); rows.forEach(r=>this.parseNums(r.line).forEach(n=>lineSet.add(n)));
    return h('div',{ref:this.panelRef,style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow,scrollMarginTop:16}},
      this.renderPeriodBar(),
      h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
        h('div',{style:{marginRight:'auto'}},
          h('div',{style:{fontSize:16,fontWeight:700}},this.t('tab1')),
          h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.state.week)),
        h('div',{style:{display:'flex',flexWrap:'wrap',gap:9,justifyContent:'flex-end'}},
          h('button',{style:this.btn('ghost'),onClick:()=>this.copyLastWeek()},this.ic('copy'),this.t('copyWeek')),
          h('button',{style:this.btn('ghost'),onClick:()=>{}},this.ic('doc'),this.t('downloadTpl')),
          h('button',{style:this.btn('ghost'),title:this.t('exportTip'),onClick:()=>this.exportExcel()},this.ic('grid'),this.t('exportXls')))),
      h('div',{style:{display:'flex',flexWrap:'wrap',gap:'6px 26px',padding:'11px 20px',borderBottom:'1px solid '+C.line,fontSize:13,color:C.sub,whiteSpace:'nowrap'}},
        h('span',null,this.t('activeRows')+': ',h('b',{style:{color:C.ink}},active)),
        h('span',null,this.t('rowsN')+': ',h('b',{style:{color:C.ink}},rows.length)),
        h('span',null,this.t('linesN')+': ',h('b',{style:{color:C.ink}},lineSet.size)),
        h('span',null,this.t('totalQty')+': ',h('b',{style:{color:C.ink}},this.fmt(this.grand(rows))))),
      h('div',{style:{padding:'16px 16px 8px'}},
        rows.length? this.renderGrid() : h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('planEmpty')),
        h('div',{style:{padding:'12px 4px 10px',fontSize:11.5,color:C.faint,lineHeight:1.5}},this.t('planFromPs'))));
  }

  renderGrid(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows; const dates=this.weekDates(); const pad=this.dense?'7px 6px':'10px 8px';
    const th={padding:'8px 6px',fontSize:11,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',color:C.sub,textAlign:'center',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,background:'#f8faf3'};
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}},
      h('table',{style:{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null,
          h('col',{style:{width:'112px'}}), h('col',{style:{width:'118px'}}), h('col',{style:{width:'150px'}}),
          ...this.DAYS.map((d,i)=>h('col',{key:i})), h('col',{style:{width:'86px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...th,textAlign:'left',paddingLeft:12}},this.t('colLine')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colBrand')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colStyle')),
          ...this.DAYS.map((d,i)=>h('th',{key:d,style:{...th,background:'#fbfcfa'}},
            h('div',{style:{fontWeight:700,fontSize:13,color:C.ink}},this.dayLabel(d,i)),
            h('div',{style:{fontSize:10.5,color:C.faint,marginTop:2,fontFamily:mono,fontWeight:500}},dates[i]))),
          h('th',{style:{...th,color:'#fff',background:C.dark,borderRight:'none',borderBottom:'2px solid '+C.dark}},this.t('colTotal')))),
        h('tbody',null, (()=>{ const info=this.lineSpans(rows); const bi=this.fieldSpans(rows,'brand'); const si=this.fieldSpans(rows,'style'); let grp=-1; return rows.map((r,idx)=>{ if(info[idx].first) grp++; return this.renderRow(r,pad,mono,info[idx],bi[idx],si[idx],grp%2===1); }); })()),
        h('tfoot',null,h('tr',null,
          h('td',{colSpan:3,style:{padding:'12px',fontSize:12,fontWeight:700,letterSpacing:'.5px',color:'#cfe0be',background:C.dark}},this.t('colTotal')),
          ...this.DAYS.map(d=>h('td',{key:d,style:{padding:'12px 6px',textAlign:'center',fontSize:13.5,fontWeight:700,color:'#fff',background:C.dark}},this.fmt(this.colTotal(rows,d)))),
          h('td',{style:{padding:'12px 6px',textAlign:'center',fontSize:15,fontWeight:700,color:'#fff',background:C.dark}},this.fmt(this.grand(rows)))))));
  }

  renderRow(r,pad,mono,linfo,binfo,sinfo,stripe){
    linfo=linfo||{first:true,span:1,ids:[r.id]}; binfo=binfo||{first:true,span:1}; sinfo=sinfo||{first:true,span:1};
    const h=React.createElement, C=this.C; const e=this.state.edit; const ed=(col)=>e&&e.id===r.id&&e.col===col;
    const rbg=stripe?'#f7f9f3':C.white;
    const cb={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle'};
    const inp={width:'100%',border:'2px solid '+C.primary,padding:pad,fontSize:13,fontFamily:'inherit',color:C.ink,background:C.white};
    const brands=this.psBrands(); const styleOpts=this.psStyles(r.brand);
    const lineLk=this.planColLocked(r.id,'line'), colLk=this.planColLocked(r.id,'brand');
    const sel=(opts,ph,apply)=>h('select',{autoFocus:true,defaultValue:'',style:{...inp,fontWeight:600,cursor:'pointer',borderRadius:6,appearance:'auto'},
      onChange:ev=>{ const v=ev.target.value; if(v) apply(v); this.stopEdit(); },
      onBlur:()=>{ this._chainBrand=null; this.stopEdit(); },
      onKeyDown:ev=>{ if(ev.key==='Escape'){ this._chainBrand=null; this.stopEdit(); } }},
      [h('option',{key:'',value:'',disabled:true},ph),...opts.map(o=>h('option',{key:o,value:o},o))]);
    const commit=(fn)=>({ onBlur:ev=>{ fn(ev.target.value); this.stopEdit(); }, onKeyDown:ev=>{ if(ev.key==='Enter'){ fn(ev.target.value); this.stopEdit(); } else if(ev.key==='Escape') this.stopEdit(); } });
    // LINE #
    const lineCell = ed('line')
      ? h('td',{key:'line',rowSpan:linfo.span,style:{...cb,padding:6,background:C.tint,verticalAlign:'middle'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:6}},
            h('input',Object.assign({autoFocus:true,list:'dl-line',defaultValue:this.normName(r.line),placeholder:this.t('phLine'),style:{...inp,flex:1,minWidth:0,fontWeight:700,background:C.white,borderRadius:6}},commit(v=>this.renameGroup(linfo.ids,v)))),
            h('datalist',{id:'dl-line'}, this.lineOptions().map(n=>h('option',{key:n,value:n}))),
            h('button',{title:this.t('tipDelLine'),onMouseDown:ev=>ev.preventDefault(),onClick:()=>this.removeGroupSafe(linfo.ids),style:{border:'none',background:'none',cursor:'pointer',color:'#c0392b',display:'flex',padding:2,flex:'none'}},
              h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'})))))
      : h('td',{key:'line',class:'lncell',rowSpan:linfo.span,onClick:lineLk?undefined:()=>this.startEdit(r.id,'line'),title:lineLk?this.t('tipPlanCol'):this.t('tipLine'),style:{...cb,padding:pad,paddingLeft:12,background:C.tint,opacity:lineLk?.7:1,color:'#666',cursor:lineLk?'default':'pointer',verticalAlign:'middle',position:'relative'}},
          h('span',{style:{fontSize:12.5,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},this.normName(r.line)),
          lineLk?null:h('button',{class:'lnadd',title:this.t('addStyleRow'),onClick:ev=>{ev.stopPropagation();this.addRowSame(r.line);},
            style:{position:'absolute',left:-11,top:'50%',marginTop:-10,zIndex:40,width:20,height:20,borderRadius:'50%',border:'1px solid '+C.border,background:'#fff',color:C.primary,cursor:'pointer',display:'inline-flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(24,36,14,.2)',padding:0},
            'style-hover':{background:C.tint}},
            h('svg',{width:11,height:11,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:3,strokeLinecap:'round'},h('path',{d:'M12 5v14M5 12h14'}))));
    // BRAND
    const brandCell = ed('brand')
      ? h('td',{key:'brand',rowSpan:binfo.span,style:{...cb,padding:0,verticalAlign:'middle'}}, sel(brands,this.t('phBrand'),v=>this.setBrand(r.id,v)))
      : h('td',{key:'brand',rowSpan:binfo.span,onClick:colLk?undefined:()=>this.startEdit(r.id,'brand'),title:colLk?this.t('tipPlanCol'):(this.rowHasData(r)?this.t('tipRepick'):this.t('tipBrand')),style:{...cb,padding:pad,paddingLeft:10,fontSize:12.5,fontWeight:600,color:(r.brand||this.brandForStyle(r.style))?C.ink:C.primary,cursor:colLk?'default':'pointer',opacity:colLk?.7:1,background:rbg,verticalAlign:'middle'}}, r.brand||this.brandForStyle(r.style)||(colLk?'—':this.t('addBrand')));
    // STYLE #
    const styleCell = ed('style')
      ? h('td',{key:'style',rowSpan:sinfo.span,style:{...cb,padding:0,verticalAlign:'middle'}}, r.brand?sel(styleOpts,this.t('phStyle'),v=>this.setStyle(r.id,v)):h('div',{style:{padding:pad,fontSize:12,color:C.faint}},this.t('phStyleFirst')))
      : h('td',{key:'style',rowSpan:sinfo.span,onClick:colLk?undefined:()=>this.startEdit(r.id,'style'),title:colLk?this.t('tipPlanCol'):(this.rowHasData(r)?this.t('tipRepick'):this.t('tipStyle')),style:{...cb,padding:pad,paddingLeft:10,fontSize:12.5,fontFamily:mono,color:r.style?C.ink:C.primary,fontWeight:r.style?400:600,cursor:colLk?'default':'pointer',opacity:colLk?.7:1,background:rbg,verticalAlign:'middle'}}, r.style||(colLk?'—':this.t('addStyle')));
    // DAYS
    const dayCells=this.DAYS.map(d=>{ const val=r.days[d]; const taken=val==null&&this.dayTaken(r,d);
      if(ed(d)) return h('td',{key:d,style:{...cb,padding:0}}, h('input',Object.assign({type:'number',autoFocus:true,defaultValue:val!=null?val:'',style:{...inp,textAlign:'center',fontWeight:700}},commit(v=>this.setDay(r.id,d,v)))));
      if(taken) return h('td',{key:d,onClick:()=>this.startEdit(r.id,d),title:this.t('dayConflict'),style:{...cb,padding:pad,textAlign:'center',fontSize:13.5,fontFamily:mono,color:'#d8dcd2',background:stripe?'#f2f4ee':'#fafbf8',cursor:'pointer'}},'×');
      return h('td',{key:d,onClick:()=>this.startEdit(r.id,d),title:this.t('tipDay'),style:{...cb,padding:pad,textAlign:'center',fontSize:13.5,cursor:'pointer',fontFamily:mono,fontWeight:val!=null?700:400,color:val!=null?C.ink:'#c3c8bf',background:rbg}}, val!=null?this.fmt(val):'–'); });
    // TOTAL
    const totalCell=h('td',{key:'tot',style:{...cb,borderRight:'none',padding:pad,textAlign:'center',fontSize:14,fontWeight:700,color:C.ink,background:C.tint2}},this.fmt(this.rowTotal(r)));
    return h('tr',{key:r.id}, [...(linfo.first?[lineCell]:[]),...(binfo.first?[brandCell]:[]),...(sinfo.first?[styleCell]:[]),...dayCells,totalCell]);
  }

  renderBundleBody(){
    const h=React.createElement, C=this.C;
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle(), this.renderKpis(), this.renderTabs(),
      h('div',{style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow}},
        this.renderPeriodBar(),
        h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
          h('div',{style:{marginRight:'auto'}},
            h('div',{style:{fontSize:16,fontWeight:700}},this.t('tab3')),
            h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('reqSub')+' · '+this.state.week)),
          h('button',{style:this.btn('ghost'),title:this.t('exportTip'),onClick:()=>this.exportExcel()},this.ic('grid'),this.t('exportXls'))),
        h('div',{style:{padding:'16px 16px 8px'}}, this.getWeek().rows.length? this.renderBundleGrid() : h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty')))),
      this.renderRecvLog(), this.renderBqSlip());
  }

  // ================= Phieu giao nhan ban thanh pham =====================
  // Dung khuon to phieu giay QT.GRSBM11-09, da rut bot cho ban dien tu: 5 cot
  // (bo Xuat di nuoc / Ngay giao hang -- app khong co du lieu nay), Ghi chu,
  // 2 o ky (bo To truong Bo phan cat).
  BQ_ROWS=10;          // so dong ke san tren to phieu
  renderBqSlip(){
    const d=this.bSlipData(); if(!d) return null;
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    // Mau lay tu theme he thong (this.C), khong con khung do nhu to giay goc:
    //   net ke  -> C.border (cung token voi vien bang cua app)
    //   so lieu -> C.dark   (xanh dam, giong cot so cua cac bang khac)
    //   dau bang-> nen '#f8faf3' + chu C.sub, dung nhu S.th cua app
    const INK=C.ink, LN=C.border, VAL=C.dark, HEAD='#f8faf3';
    const close=()=>this.bSlipClose();
    // 1 truong: nhan + gia tri tren net gach roi
    const fld=(label,val)=>h('div',{key:label,style:{display:'flex',alignItems:'baseline',gap:7,minWidth:0}},
      h('span',{style:{flex:'none',fontSize:13,fontWeight:700,color:C.sub}},label),
      h('span',{style:{flex:1,minWidth:0,borderBottom:'1px dotted '+LN,paddingBottom:1,
        fontSize:14,fontWeight:700,color:VAL,fontFamily:mono,whiteSpace:'nowrap',
        overflow:'hidden',textOverflow:'ellipsis'}},val||'\u00a0'));
    const cols=[['bqC1','24%'],['bqC2','16%'],['bqC3','14%'],['bqC4','20%'],['bqC5','26%']];
    const cbase={border:'1px solid '+LN,padding:'6px 7px',fontSize:12.5,verticalAlign:'middle'};
    const th=h('tr',null,cols.map(([k,w])=>h('th',{key:k,style:{...cbase,width:w,background:HEAD,
      fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'center',lineHeight:1.3}},this.t(k))));
    const cell=(v,o)=>h('td',{key:(o&&o.k)||v,style:{...cbase,textAlign:(o&&o.al)||'center',
      fontFamily:(o&&o.mono)?mono:'inherit',fontWeight:(o&&o.b)?700:600,
      color:(o&&o.b)?VAL:INK,height:26}},
      v==null||v===''?'\u00a0':v);
    const body=[];
    d.lines.forEach((x,i)=>body.push(h('tr',{key:'r'+i},
      cell(i?'':d.color,{k:'c',al:'left'}), cell(x.tb,{k:'tb',mono:true}),
      cell(x.size,{k:'sz',b:true}), cell(this.fmt(x.qty),{k:'q',mono:true,b:true}),
      cell(i?'':d.po,{k:'po',mono:true}))));
    for(let i=d.lines.length;i<this.BQ_ROWS;i++)
      body.push(h('tr',{key:'e'+i},cols.map(([k])=>cell('',{k:k}))));
    // Khoi ky: dung khuon giong phieu ban giao cua Daily Sewing Output
    const sign=h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,
        maxWidth:560,margin:'24px auto 0',padding:'0 6px'}},
      ['bqSign1','bqSign2'].map(k=>h('div',{key:k,style:{textAlign:'center'}},
        h('div',{style:{height:40}}),
        h('div',{style:{borderTop:'1px solid '+LN,paddingTop:7,fontSize:12,fontWeight:600,
          color:C.faint}},this.t(k)))));
    const frame=h('div',{style:{border:'1px solid '+LN,borderRadius:12,background:C.white,
        padding:'14px 16px 16px'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:12}},
        h('span',{style:{flex:'none',background:C.primary,color:'#fff',fontSize:14,fontWeight:800,
          letterSpacing:'.5px',padding:'3px 9px',borderRadius:7,lineHeight:1.3}},'YIC'),
        h('div',{style:{flex:1}}),
        h('span',{style:{flex:'none',fontSize:12.5,fontWeight:700,color:C.dark,fontFamily:mono}},
          d.no||'\u2014')),
      h('div',{style:{fontSize:18,fontWeight:800,color:INK,letterSpacing:'.2px',margin:'9px 0 11px'}},
        this.t('bqTitle')),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',columnGap:30,rowGap:8,
        marginBottom:13}},
        fld(this.t('bqDay'),d.day), fld(this.t('bqCust'),d.brand),
        fld(this.t('bqLine'),d.line), fld(this.t('bqStyle'),d.style)),
      h('table',{style:{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('thead',null,th), h('tbody',null,body)),
      h('div',{style:{display:'flex',alignItems:'baseline',gap:8,marginTop:12}},
        h('span',{style:{flex:'none',fontSize:13,fontWeight:700,color:C.sub}},this.t('bqNote')),
        h('span',{style:{flex:1,borderBottom:'1px dotted '+LN,height:15}})));
    const foot=h('div',{'data-noprint':'',style:{display:'flex',alignItems:'center',gap:10,
        marginTop:22,paddingTop:16,borderTop:'1px solid '+C.line,flexWrap:'wrap'}},
      h('div',{style:{flex:1,minWidth:8}}),
      h('button',{onClick:close,style:this.btn('ghost')},this.t('dsoClose')),
      h('button',{onClick:()=>window.print(),style:this.btn('ghost')},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9},
          h('path',{d:'M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z'})),this.t('bgPrint')),
      h('button',{onClick:()=>this.bSlipReceive(),style:this.btn('primary')},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M5 12l4 4 10-10'})),this.t('bqOk')));
    const panel=h('div',{'data-bg-panel':'',className:'yscroll',onClick:ev=>ev.stopPropagation(),
        style:{width:'min(880px,96vw)',maxHeight:'94vh',overflow:'auto',background:C.white,
          borderRadius:14,boxShadow:'0 30px 70px rgba(0,0,0,.32)',padding:'20px 22px 18px'}},
      frame,sign,foot);
    const over=h('div',{'data-bg-overlay':'',onClick:close,style:{position:'fixed',inset:0,
        background:'rgba(24,28,22,.5)',backdropFilter:'blur(2px)',display:'flex',
        alignItems:'center',justifyContent:'center',zIndex:88,padding:20}},panel);
    return (RD&&RD.createPortal)?RD.createPortal(over,document.body):over;
  }

  renderRecvLog(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const log=[...(this.state.recvLog||[])].reverse();
    const th={padding:'10px 10px',fontSize:11,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,background:'#f8faf3',whiteSpace:'nowrap'};
    const td={padding:'9px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,verticalAlign:'middle'};
    const rows=log.map((e,i)=>{ const stripe=i%2===1; const bg=stripe?'#f7f9f3':C.white;
      return h('tr',{key:e.ts+'-'+i},
        h('td',{style:{...td,paddingLeft:22,background:bg,fontFamily:mono,fontWeight:600,color:e.undo?C.faint:C.ink}},
          h('span',{style:{whiteSpace:'nowrap'}},this.recvTime(e.ts)),
          e.undo?h('span',{style:{marginLeft:8,fontSize:10,fontWeight:700,color:'#946200',background:'#fbf1d5',
            border:'1px solid #efdfb0',borderRadius:4,padding:'1px 5px',fontFamily:'inherit',whiteSpace:'nowrap'}},this.t('recvUndo')):null),
        h('td',{style:{...td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},e.line),
        h('td',{style:{...td,background:bg,fontFamily:mono,color:C.ink,wordBreak:'break-all'}},e.style),
        h('td',{style:{...td,background:bg,color:C.ink}},
          h('span',{style:{display:'inline-flex',alignItems:'center',gap:7}},
            h('span',{style:{flex:'none',width:10,height:10,borderRadius:'50%',background:this.colorHex(e.color),border:'1px solid rgba(0,0,0,.18)'}}),
            h('span',{style:{fontWeight:600,whiteSpace:'nowrap'}},e.color))),
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:700,color:C.dark}},this.recvTurnText(e)));
    });
    return h('div',{style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow,marginTop:18}},
      h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
        h('div',{style:{marginRight:'auto'}},
          h('div',{style:{fontSize:16,fontWeight:700}},this.t('recvTitle')),
          h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('recvSub'))),
        h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:C.dark,background:C.tint,borderRadius:999,padding:'5px 12px'}},
          this.fmt(log.length)+' '+this.t('recvRows'))),
      log.length
        ? h('div',{className:'yscroll',style:{overflowX:'auto'}},
            h('table',{style:{width:'100%',minWidth:'1000px',borderCollapse:'collapse',tableLayout:'fixed'}},
              h('colgroup',null, ...Array.from({length:5},(_,i)=>h('col',{key:i,style:{width:'20%'}}))),
              h('thead',null,h('tr',null,
                h('th',{style:{...th,paddingLeft:22}},this.t('recvDT')),
                h('th',{style:{...th}},this.t('colLine')),
                h('th',{style:{...th}},this.t('colStyle')),
                h('th',{style:{...th}},this.t('colColor')),
                h('th',{style:{...th}},this.t('recvTurn')))),
              h('tbody',null,rows)))
        : h('div',{style:{padding:'44px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('recvEmpty')));
  }

  renderBundleGrid(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows; const dates=this.weekDates();
    const th={padding:'11px 8px',fontSize:11.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',color:C.sub,textAlign:'center',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,background:'#f8faf3'};
    const spans=this.lineSpans(rows); const sstyle=this.fieldSpans(rows,'style');
    let grp=-1;
    const body=rows.map((r,idx)=>{ const linfo=spans[idx]; const sinfo=sstyle[idx];
      if(linfo.first) grp++; const stripe=grp%2===1;
      const b=this.state.bundle[this.bKey(r)]; const color=this.bundleColor(r,idx); const chosen=!!color;
      const cells=[];
      if(linfo.first) cells.push(h('td',{key:'ln',rowSpan:linfo.span,style:{borderRight:'1px solid '+C.border,borderTop:'1px solid '+C.line,background:C.tint,verticalAlign:'middle',textAlign:'center',padding:'8px 4px',fontSize:12.5,fontWeight:700,color:C.primary,lineHeight:1.25}},this.normName(r.line)));
      if(sinfo.first) cells.push(h('td',{key:'st',rowSpan:sinfo.span,style:{borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle',padding:'8px 9px',fontSize:11.5,fontFamily:mono,color:C.ink,wordBreak:'break-all',lineHeight:1.3,background:stripe?'#f7f9f3':C.white}},r.style));
      cells.push(this.reqColorCell(r,color,stripe));
      this.DAYS.forEach((d,i)=>cells.push(this.reqDayCell(r,d,b,chosen,stripe,i===5)));
      // SL da len don yeu cau / SL demand theo Ke hoach may tuan cua chinh dong nay
      const tot=this.bundleTotal(r.id), need=this.rowTotal(r), done=tot||0;
      const dcol=!done?'#c3c8bf':(need>0&&done>=need?'#2f7d32':C.ink);
      cells.push(h('td',{key:'tot',title:this.t('tipReqPlan'),style:{borderTop:'1px solid '+C.line,textAlign:'center',verticalAlign:'middle',background:C.tint2,padding:'6px 5px'}},
        h('span',{style:{fontSize:14.5,fontWeight:700,fontFamily:mono,color:dcol}},this.fmt(done)),
        h('span',{style:{fontSize:11.5,fontWeight:600,fontFamily:mono,color:C.faint}},' / '+this.fmt(need))));
      return h('tr',{key:r.id},cells);
    });
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1180px',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null, h('col',{style:{width:'72px'}}), h('col',{style:{width:'98px'}}), h('col',{style:{width:'128px'}}),
          ...this.DAYS.map((d,i)=>h('col',{key:i,style:{width:'152px'}})), h('col',{style:{width:'122px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...th,textAlign:'left',paddingLeft:12}},this.t('colLine')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colStyle')),
          h('th',{style:{...th,textAlign:'left',paddingLeft:10}},this.t('colColor')),
          ...this.DAYS.map((d,i)=>h('th',{key:d,style:{...th,background:'#fbfcfa'}},
            h('div',{style:{fontWeight:700,fontSize:13,color:C.ink}},this.dayLabel(d,i)),
            h('div',{style:{fontSize:10.5,color:C.faint,marginTop:2,fontFamily:mono,fontWeight:500}},dates[i]))),
          h('th',{title:this.t('tipReqPlan'),style:{...th,color:'#fff',background:C.dark,borderRight:'none',borderBottom:'2px solid '+C.dark}},this.t('colReqPlan')))),
        h('tbody',null, body)));
  }

  colorHex(name){ if(!name) return '#c9cdc6'; const k=String(name).toLowerCase().trim();
    const map={'white':'#f2f2ec','marshmallow':'#efe9dc','bourbon':'#8a5a2b','black':'#23262b','all black':'#191b1e','onyx':'#2a2d33','obsidian':'#23262b','ink':'#20242c','pigment':'#373c43','midnight':'#1c2a44',
      'charcoal':'#3a3f47','graphite':'#4a4f57','graphite grey':'#4a4f57','forge grey':'#5c6169','heather grey':'#b7bcc2','grey':'#9aa0a8','gray':'#9aa0a8','fog':'#c3c8ce','glacier':'#dde6ea','rock':'#8b9099','slate':'#586572','storm':'#6b7784',
      'navy':'#243a63','true navy':'#20365c','classic navy':'#22345a','maritime':'#26456d','ceil blue':'#8fb0d6','ciel':'#9cbbdd','tidepool':'#2f6f7e','dusk':'#586a86',
      'olive':'#5f6a3a','sage':'#8a9a76','sand':'#d8c39a','cinnamon':'#9c5a34','ember':'#b8452e','flame':'#d1502f','volt':'#c8d63f','crimson':'#a02334','wine':'#6e2233','washed boysenberry':'#7a4a5e','fig':'#5c4658'};
    if(map[k]) return map[k]; const has=w=>k.indexOf(w)>=0;
    if(has('white')) return '#f2f2ec'; if(has('black')) return '#23262b'; if(has('navy')) return '#243a63'; if(has('blue')) return '#3f6bb0'; if(has('grey')||has('gray')) return '#9aa0a8'; if(has('olive')) return '#5f6a3a'; if(has('green')||has('sage')) return '#5f7a4a'; if(has('red')||has('crimson')) return '#a02334'; if(has('sand')||has('tan')) return '#d8c39a'; return '#8a9099'; }

  reqColorCell(r,color,stripe){
    const h=React.createElement, C=this.C;
    return h('td',{key:'cl',title:this.t('tipAutoCol'),style:{borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle',padding:7,background:stripe?'#f7f9f3':C.white}},
      h('div',{style:{display:'flex',alignItems:'center',gap:8,padding:'4px 2px 4px 4px',opacity:.7,cursor:'default'}},
        h('span',{style:{flex:'none',width:10,height:10,borderRadius:'50%',background:color?this.colorHex(color):'#dcb9b5',border:'1px solid rgba(0,0,0,.18)'}}),
        h('span',{style:{fontSize:12,fontWeight:600,color:C.ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},color||'—')));
  }

  // Mau trang thai cap BTP -- Waiting = cam, Received = xanh la
  STC={ requested:{fg:'#2f5d8a',bg:'#e9f1f8',bd:'#c4d7e9',dot:'#3f7cb0'},
        waiting:{fg:'#a35a00',bg:'#fdf0e0',bd:'#f0d5ae',dot:'#e2891d'},
        received:{fg:'#2f7d32',bg:'#e6f2e2',bd:'#c3ddbe',dot:'#3f9142'} };
  // Bam tag de dao vong theo dung chieu: Requested -> Waiting -> Received -> Requested
  STORDER=['requested','waiting','received'];
  STKEY={requested:'stRequested',waiting:'stWaiting',received:'stReceived'};
  nextStatus(st){ const i=this.STORDER.indexOf(st); return this.STORDER[(i<0?0:i+1)%this.STORDER.length]; }
  // Dao trang thai ngay tren o, khong mo modal
  cycleStatus(r,d,ev){ if(ev){ ev.stopPropagation(); ev.preventDefault(); }
    const k=this.bKey(r); if(!k) return;
    this.setState(st=>{ const bb=st.bundle[k]; if(!bb||!bb.days||!bb.days[d]) return null;
      const days={...bb.days}; days[d]={...days[d],status:this.nextStatus(this.cellStatus(days[d]))};
      return {bundle:{...st.bundle,[k]:{...bb,days:days}}}; }); }
  // Bam tag trang thai: dang CHO NHAN thi mo phieu giao nhan BTP (o day moi xac
  // nhan da nhan). Cac trang thai khac van dao vong ngay tren o nhu truoc.
  bStatusTap(r,d,ev){ if(ev){ ev.stopPropagation(); ev.preventDefault(); }
    const cell=this.bcellAt(r.id,d);
    if(cell&&this.cellStatus(cell)==='waiting') return this.bSlipOpen(r,d);
    this.cycleStatus(r,d); }
  // Ma phieu giao nhan BTP: CS-yyyymmdd-nnn, nnn la so thu tu trong NGAY PHAT
  // HANH (khong phai ngay giao -- ngay giao la 1 o rieng tren phieu).
  //
  // Ma thuoc ve TO GIAY, khong thuoc ve o luoi. O co the bi xoa rong roi dung
  // lai, hoac doi luot cat / size / so luong / mau -- luc do chinh app coi la
  // yeu cau moi (bformStatus tra ve 'requested'). To in ra khac han to truoc,
  // nen phai mang so khac. Vi vay ma duoc luu kem CHU KY NOI DUNG: chu ky lech
  // la cap so moi. Mo lai / in lai to dang cho thi chu ky trung -> giu so cu.
  bqNoKey(r,day){ return this.bKey(r)+'|'+day; }
  bqSig(r,day){ const c=this.bcellAt(r.id,day); if(!c) return '';
    const ri=this.getWeek().rows.findIndex(x=>x.id===r.id);
    return [c.turn||'',c.size||'',c.supply||'',this.bundleColor(r,ri)].join('|'); }
  bqNoOf(r,day){ const v=(this.state.bqNo||{})[this.bqNoKey(r,day)];
    if(!v||!v.no) return '';
    return v.sig===this.bqSig(r,day)?v.no:''; }
  // Moc phat hanh to phieu -- dung lam gio o truong 'Ngay giao'. Ban luu cu
  // (truoc khi co truong nay) khong co ts: to phieu chi hien ngay, khong gio.
  bqTsOf(r,day){ const v=(this.state.bqNo||{})[this.bqNoKey(r,day)];
    if(!v||!v.no||v.sig!==this.bqSig(r,day)) return 0;
    return Number(v.ts)||0; }
  // So thu tu trong ngay CHI TANG. Khong dem so ban ghi dang co: tra 1 so ve
  // (doi noi dung, xac nhan xong) roi dem lai se cap trung so da in.
  bqSeqAt(st,day){ const pre='CS-'+day+'-';
    let n=Number((st.bqSeq||{})[day])||0;
    const m=st.bqNo||{};
    // Ban luu dau tien luu thang chuoi ma (chua co chu ky) -- van phai tinh
    // vao day, khong thi bo dem tut lai va cap trung so da in.
    Object.keys(m).forEach(k=>{ const v=m[k], s=String((v&&v.no)||v||'');
      if(s.indexOf(pre)===0) n=Math.max(n,Number(s.slice(pre.length))||0); });
    return n; }
  // Cap so luc mo phieu. Khong tra ve gia tri: setState la bat dong bo, ben
  // goi doc lai bang bqNoOf sau khi state da cap nhat.
  bqNoIssue(r,day){ if(this.bqNoOf(r,day)) return;
    const k=this.bqNoKey(r,day), ts=Date.now(), day8=this.dsoSlipDay(ts), sig=this.bqSig(r,day);
    this.setState(st=>{ const n=this.bqSeqAt(st,day8)+1;
      return {bqSeq:{...(st.bqSeq||{}),[day8]:n},
        bqNo:{...(st.bqNo||{}),[k]:{no:'CS-'+day8+'-'+String(n).padStart(3,'0'),sig:sig,ts:ts}}}; }); }
  // Xac nhan da nhan = to giay do khep lai. Lan giao sau cua cung o phai la to
  // moi, nen tra ma ve; bo dem chi tang nen so cu khong bao gio duoc dung lai.
  bqNoRelease(r,day){ const k=this.bqNoKey(r,day);
    this.setState(st=>{ const m={...(st.bqNo||{})}; delete m[k]; return {bqNo:m}; }); }
  // Class tren <body> de @media print chi in ra to phieu -- dung chung voi
  // phieu ban giao cua Daily Sewing Output (xem style.css, bg-slip-open)
  bSlipOpen(r,d){ this.bqNoIssue(r,d); this.set({bslip:{rid:r.id,day:d}});
    document.body.classList.add('bg-slip-open'); }
  bSlipClose(){ this.set({bslip:null}); document.body.classList.remove('bg-slip-open'); }
  // Xac nhan tren phieu = dao trang thai Cho nhan -> Da nhan roi dong phieu
  bSlipReceive(){ const s=this.state.bslip; if(!s) return;
    const r=this.getWeek().rows.find(x=>x.id===s.rid);
    if(r){ this.bqNoRelease(r,s.day); this.cycleStatus(r,s.day); }
    this.bSlipClose(); }
  // 'DD/MM/YYYY HH:mm' -- NGAY lay tu dung ngay trong tuan dang xem, GIO lay
  // tu moc phat hanh to phieu (ts). Khong co ts thi chi tra ve ngay.
  bSlipDate(day,ts){ const st=this.psWeekRange(this.state.week)[0], i=this.DAYS.indexOf(day);
    const d=new Date(st.getFullYear(),st.getMonth(),st.getDate()+(i<0?0:i));
    const p=n=>String(n).padStart(2,'0');
    const s=p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear();
    if(!ts) return s;
    const t=new Date(ts);
    return s+' '+p(t.getHours())+':'+p(t.getMinutes()); }
  // PO lay tu tac nghiep cat cua ma hang; nhieu PO thi ghep lai
  bSlipPo(style){ const ps=(this.khcPlansFor(style)||[]).map(p=>String(p.qrPo||'').trim()).filter(Boolean);
    return [...new Set(ps)].join(' / '); }
  bSlipData(){ const s=this.state.bslip; if(!s) return null;
    const rows=this.getWeek().rows, ri=rows.findIndex(x=>x.id===s.rid), r=rows[ri];
    if(!r) return null;
    const cell=this.bcellAt(s.rid,s.day); if(!cell) return null;
    const cat=this.cutTurns(r.style);
    const turns=(cell.turns||[]).map(id=>cat.find(t=>t.id===id)).filter(Boolean);
    const qty=cell.qty||{};
    // 1 dong / 1 co. Cot BAN = cac luot cat co cat co do (khop cach ghi tay
    // tren phieu giay: ban 3 - S - 121, ban 4 - XS - 121).
    const lines=this.SORDER.filter(z=>(Number(qty[z])||0)>0).map(z=>({
      size:z, qty:Number(qty[z])||0,
      tb:turns.filter(t=>(this.turnSizes(t)[z]||0)>0).map(t=>t.id).join(', ')
         ||(cell.turns||[]).join(', ')}));
    return {row:r,cell:cell,lines:lines,no:this.bqNoOf(r,s.day),
      color:this.bundleColor(r,ri), day:this.bSlipDate(s.day,this.bqTsOf(r,s.day)),
      brand:r.brand||'', line:String(r.line||'').replace(/^Line\s*/i,''),
      style:r.style||'', po:this.bSlipPo(r.style)}; }

  statusTag(st,o){ const h=React.createElement; o=o||{}; const c=this.STC[st]||this.STC.waiting;
    const style={display:'inline-flex',alignItems:'center',gap:o.sm?4:5,flex:'none',border:'1px solid '+c.bd,
      background:c.bg,color:c.fg,borderRadius:99,padding:o.lg?'4px 11px':(o.sm?'2px 7px 2px 5px':'2px 8px 2px 6px'),
      fontSize:o.lg?11.5:(o.sm?9:9.5),fontWeight:700,letterSpacing:o.sm?'0':'.3px',textTransform:'uppercase',
      lineHeight:1.3,whiteSpace:'nowrap',fontFamily:'inherit'};
    const kids=[h('span',{key:'d',style:{width:o.lg?7:(o.sm?5:6),height:o.lg?7:(o.sm?5:6),borderRadius:'50%',background:c.dot,flex:'none'}}),
      this.t(this.STKEY[st]||'stWaiting')];
    if(!o.onClick) return h('span',{style:style},kids);
    return h('button',{onClick:o.onClick,title:o.title||this.t('stCycleTip'),
      style:{...style,cursor:'pointer',transition:'background .12s,border-color .12s'}},kids); }

  reqDayCell(r,d,b,chosen,stripe,weekend){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const plan=r.days[d]; const hasPlan=plan!=null;
    const base={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'top',padding:0};
    const restBg=stripe?'#f7f9f3':(weekend?'#fcfdfa':C.white);
    if(!hasPlan) return h('td',{key:d,style:{...base,background:'#f2f3f0'}});
    if(!chosen) return h('td',{key:d,style:{...base,background:restBg}},
      h('div',{style:{padding:'16px 8px',textAlign:'center',fontSize:10.5,color:'#b7bcb2',fontStyle:'italic'}},this.t('pickColorFirst')));
    const cell=b&&b.days&&b.days[d];
    const filled=cell&&cell.turns&&cell.turns.length&&(cell.sizes||[]).some(s=>(Number((cell.qty||{})[s])||0)>0);
    if(!filled) return h('td',{key:d,onClick:()=>this.openBForm(r.id,d),title:this.t('tipIssue'),style:{...base,cursor:'pointer',background:restBg}},
      h('div',{style:{margin:9,border:'1.5px dashed '+C.border,borderRadius:9,padding:'12px 6px',textAlign:'center',color:C.primary}},
        h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,style:{display:'block',margin:'0 auto'}},h('path',{d:'M12 5v14M5 12h14'})),
        h('div',{style:{fontSize:11,fontWeight:600,marginTop:4}},this.t('issue')),
        h('div',{style:{fontSize:9.5,color:C.faint,marginTop:2,fontFamily:mono}},this.t('planShort')+this.fmt(plan))));
    const sizes=(cell.sizes||[]).filter(s=>(Number((cell.qty||{})[s])||0)>0); const qty=cell.qty||{}; const turns=cell.turns||[];
    const tot=sizes.reduce((a,s)=>a+(Number(qty[s])||0),0);
    // Card an het o (full-bleed): vien cua o lam ranh, ben trong chia 2 dai 55/45
    // va can giua theo chieu doc de khong bi don cuc len tren.
    return h('td',{key:d,onClick:()=>this.openBForm(r.id,d),title:this.t('tipIssueEdit'),
      style:{...base,cursor:'pointer',background:C.white,height:1,verticalAlign:'top'}},
      h('div',{style:{height:'100%',minHeight:74,boxSizing:'border-box',display:'flex',flexDirection:'column'}},
        // dai 1 (55%): trang thai (bam de dao vong) + tong so luong
        h('div',{style:{flex:'55 1 0',minHeight:0,display:'flex',alignItems:'center',justifyContent:'space-between',
          gap:6,padding:'0 10px'}},
          this.statusTag(this.cellStatus(cell),{sm:true,onClick:ev=>this.bStatusTap(r,d,ev),
            title:this.cellStatus(cell)==='waiting'?this.t('bqOpenTip'):undefined}),
          h('span',{style:{fontSize:19,fontWeight:700,fontFamily:mono,color:C.ink,lineHeight:1,flex:'none',
            letterSpacing:'-.4px'}},this.fmt(tot))),
        // dai 2 (45%): Cut turn: C1 C2
        h('div',{style:{flex:'45 1 0',minHeight:0,display:'flex',alignItems:'center',flexWrap:'wrap',gap:4,
          padding:'0 10px',borderTop:'1px solid '+C.line,background:'#fbfcf8'}},
          h('span',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.3px',color:C.faint,flex:'none'}},this.t('cCutTurn')),
          turns.map(t=>h('span',{key:t,style:{fontSize:11.5,fontWeight:700,color:'#fff',background:C.primary,
            borderRadius:5,padding:'1px 7px',lineHeight:1.35,flex:'none'}},t)))));
  }

  renderBForm(){
    const f=this.state.bform; if(!f) return null;
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const row=this.getWeek().rows.find(r=>r.id===f.id); if(!row) return null;
    const b=this.bAt(f.id)||{color:''};
    const dates=this.weekDates(); const di=this.DAYS.indexOf(f.day);
    const quantity=Number(row.days[f.day])||0; const style=row.style;
    const pos=f.pos||[]; const posSet={}; pos.forEach(k=>posSet[k]=1);
    const tq=this.posTq(row.style,pos); const selIds=this.posTurns(row.style,pos);
    const cat=this.cutTurns(style);
    const tcols=this.SORDER.filter(s=> cat.some(t=>this.turnSizes(t)[s]));
    // Cot size tach theo tung vi tri tren so do cat: size co ti le 2 -> 2 cot (S1, S2),
    // moi cot hien SO LOP. VD 28 lop, S ti le 2 -> S1 28 + S2 28 = 56 pcs.
    const ratMax={};
    cat.forEach(t=>{ const r=this.parseMarker(t.marker);
      this.SORDER.forEach(s=>{ const v=Number(r[s])||0; if(v>(ratMax[s]||0)) ratMax[s]=v; }); });
    const scols=[]; this.SORDER.forEach(s=>{ const m=ratMax[s]||0;
      for(let k=1;k<=m;k++) scols.push({s:s,k:k,label:m>1?(s+k):s}); });
    const scolLy=(t,c)=>((Number(this.parseMarker(t.marker)[c.s])||0)>=c.k)?(Number(t.layers)||0):0;
    const avail=this.sumTurns(selIds,style);
    const grand=this.tqTotals(tq);
    const hasTurns=selIds.length>0;
    const needTotal=this.SORDER.reduce((a,s)=>a+(grand[s]||0),0);
    const availTotal=this.SORDER.reduce((a,s)=>a+(avail[s]||0),0);
    const sizeCount=this.SORDER.filter(s=>(grand[s]||0)>0).length;
    const canSave=hasTurns&&needTotal>0; const editing=!!(b.days&&b.days[f.day]);
    const curSt=this.bformStatus(); const RC=this.STC.received; const WC=this.STC.waiting;
    const used=this.bformUsedPos();
    // Mau cat hieu luc (ke ca mau tu dong) -- no quyet dinh scope cua bang luot cat
    const effColor=this.bundleColor(row,this.getWeek().rows.findIndex(r=>r.id===f.id));
    const check=(on,sz)=>h('span',{style:{width:(sz||16),height:(sz||16),borderRadius:5,flex:'none',border:'1.5px solid '+(on?C.primary:'#c7ccc2'),background:on?C.primary:C.white,display:'flex',alignItems:'center',justifyContent:'center'}}, on?h('svg',{width:(sz?sz-6:11),height:(sz?sz-6:11),viewBox:'0 0 24 24',fill:'none',stroke:'#fff',strokeWidth:3.5},h('path',{d:'M5 12l4 4 10-10'})):null);
    const info=(label,val,o)=>{ o=o||{}; return h('div',{style:{flex:o.hl?'1.15 1 0':'1 1 0',minWidth:0,border:'1px solid '+(o.hl?C.primary:C.border),borderRadius:10,padding:'9px 14px',background:o.hl?C.tint:C.white}},
      h('div',{style:{fontSize:10,fontWeight:700,letterSpacing:'.5px',color:o.hl?C.dark:C.faint,marginBottom:4}},label),
      h('div',{style:{display:'flex',alignItems:'center',gap:7,fontSize:16,fontWeight:700,color:o.hl?C.dark:C.ink,fontFamily:o.mono?mono:'inherit',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},
        o.dot?h('span',{style:{width:11,height:11,borderRadius:'50%',background:C.primary,flex:'none',border:'1px solid rgba(0,0,0,.1)'}}):null, val)); };
    const stepHead=(n,title,hint)=>h('div',{style:{display:'flex',alignItems:'center',gap:10,margin:'0 0 12px'}},
      h('span',{style:{width:25,height:25,borderRadius:'50%',background:C.primary,color:'#fff',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},n),
      h('span',{style:{fontSize:15,fontWeight:700,color:C.ink}},title),
      hint?h('span',{style:{fontSize:12,color:C.faint}},'· '+hint):null);
    const tTh={padding:'9px 6px',textAlign:'center',fontSize:11.5,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line};
    const tTd={padding:'9px 6px',textAlign:'center',fontSize:12.5,fontFamily:mono,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line};
    // Bang luot cat trinh bay giong panel tac nghiep cat: LUOT CAT / SO LOP / cac size / TONG PCS / TEM
    const sgc='150px 70px repeat('+(scols.length||1)+',minmax(46px,1fr)) 92px 56px';
    const turnHead=h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'9px 16px',
      borderBottom:'1px solid '+C.line,borderLeft:'3px solid transparent',background:'#f8faf3',fontSize:10,fontWeight:700,letterSpacing:'.6px',color:C.faint,alignItems:'end'}},
      h('div',null,this.t('kcTb')), h('div',null,this.t('kcLy')),
      scols.map(c=>h('div',{key:c.s+'-'+c.k,style:{textAlign:'center',fontFamily:mono,fontSize:11,color:C.sub}},c.label)),
      h('div',{style:{textAlign:'right'}},this.t('kcPcs')),
      h('div',{style:{textAlign:'right'}},this.t('kcTagN')));
    const turnRows=cat.map((t,ti)=>{
      const tpos=this.turnPos(t);
      const nOn=tpos.filter(p=>posSet[p.key]).length, on=nOn>0;
      const held=tpos.filter(p=>used[p.key]);
      // ca luot chi coi la het khi MOI vi tri da bi o khac giu
      // held[] la cac VI TRI; chu (line/day) nam trong map used[] theo key vi tri
      const tk=(!on&&tpos.length>0&&held.length===tpos.length)?used[held[0].key]:null;
      const ts=this.turnSizes(t), rat=this.parseMarker(t.marker);
      const tags=Object.keys(rat).reduce((a,s)=>a+(Number(rat[s])||0),0);
      // TONG PCS / TEM tinh theo phan DANG CHON cua luot nay, chua chon thi hien ca luot
      const pcs=on?nOn*(Number(t.layers)||0):this.SORDER.reduce((a,s)=>a+(Number(ts[s])||0),0);
      const tagsShown=on?nOn:tags;
      const dim=tk?'#c3c8bf':null;
      return h('div',{key:t.id,className:tk?'':'turn-pick',title:tk?this.t('mTakenTip'):'',
        onClick:tk?null:()=>this.toggleTurnAll(t.id),
        style:{display:'grid',gridTemplateColumns:sgc,gap:8,alignItems:'center',padding:'10px 16px',
          borderBottom:ti<cat.length-1?'1px solid '+C.line:'none',
          borderLeft:'3px solid '+(on?C.primary:'transparent'),
          background:on?C.tint:(tk?'#f6f7f4':C.white),
          cursor:tk?'not-allowed':'pointer',transition:'background .1s'},
        'style-hover':tk?{}:{background:on?C.tint:C.tint2}},
        h('div',{style:{display:'flex',alignItems:'center',gap:9,minWidth:0}},
          tk? h('span',{style:{width:16,height:16,borderRadius:5,flex:'none',border:'1.5px dashed #cfd3c9',background:'#f1f2ef'}}) : check(on),
          h('span',{style:{fontSize:15.5,fontWeight:700,fontFamily:mono,color:dim||(on?C.primary:C.dark)}},t.id),
          tk? h('span',{style:{fontSize:9,fontWeight:700,letterSpacing:'.2px',color:WC.fg,background:WC.bg,
            border:'1px solid '+WC.bd,borderRadius:99,padding:'1px 7px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},
            String(tk.line||'')+' \u00b7 '+String(tk.day||'').toUpperCase()):null),
        h('div',{style:{fontSize:14,fontFamily:mono,fontWeight:600,color:dim||C.ink}},t.layers),
        scols.map(c=>{ const ly=scolLy(t,c);
          if(!ly) return h('div',{key:c.s+'-'+c.k,style:{textAlign:'center',fontSize:13,fontFamily:mono,color:'#e0e4da'}},'\u00b7');
          const pk=this.posKey(t.id,c.s,c.k), on=!!posSet[pk], hold=used[pk];
          const bg=on?C.primary:(hold?'#f1f2ef':C.white);
          return h('button',{key:c.s+'-'+c.k,
            title:hold?(this.t('mTakenTip')+' \u2014 '+hold.line+' \u00b7 '+hold.day.toUpperCase()):this.t('mPickPos'),
            onClick:ev=>{ ev.stopPropagation(); if(!hold) this.togglePos(pk); },
            style:{width:'100%',padding:'6px 0',borderRadius:8,fontFamily:mono,fontSize:12.5,fontWeight:700,
              border:'1px solid '+(on?C.primary:(hold?'#e2e5dd':C.border)),background:bg,
              color:on?'#fff':(hold?'#b9bfb2':C.ink),cursor:hold?'not-allowed':'pointer',
              transition:'background .12s,border-color .12s'}},
            hold?'\u00d7':this.fmtn(ly)); }),
        h('div',{style:{textAlign:'right',fontSize:14.5,fontFamily:mono,fontWeight:700,color:dim||C.dark}},this.fmtn(pcs)),
        h('div',{style:{textAlign:'right',fontSize:13,fontFamily:mono,fontWeight:700,color:dim||C.primary}},tagsShown));
    });
    // Dong tong nam cuoi, thang cot size -- chi tinh cac luot dang chon
    const turnSum=h('div',{style:{display:'grid',gridTemplateColumns:sgc,gap:8,padding:'10px 16px',
      alignItems:'center',background:C.dark,borderTop:'1px solid '+C.line,borderLeft:'3px solid transparent'}},
      h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:'#dcefad',whiteSpace:'nowrap'}},this.t('mIssueRow')),
      h('div',null,''),
      scols.map(c=>{ let v=0; cat.forEach(t2=>{ if(posSet[this.posKey(t2.id,c.s,c.k)]) v+=Number(t2.layers)||0; });
        return h('div',{key:c.s+'-'+c.k,style:{textAlign:'center',fontSize:13,fontFamily:mono,fontWeight:700,
          color:v?'#fff':'rgba(255,255,255,.35)'}},v?this.fmtn(v):'-'); }),
      h('div',{style:{textAlign:'right',fontSize:14.5,fontFamily:mono,fontWeight:700,color:'#fff'}},this.fmtn(needTotal)),
      h('div',null,''));
    const turnTable = h('div',{style:{border:'1px solid '+C.border,borderRadius:10,overflow:'hidden'}},
      h('div',{style:{overflowX:'auto'}},
        h('div',{style:{minWidth:(408+(scols.length*50))+'px'}},
          turnHead, ...turnRows, turnSum)));
    const qtyUnit=(tid,sz)=>{ const {cap,step}=this.turnCap(style,tid,sz); const capM=Math.floor(cap/step)*step;
      const m=tq[tid]||{}; const picked=Object.prototype.hasOwnProperty.call(m,sz); const need=Number(m[sz])||0; const full=need>=capM&&capM>0; const ratio=capM>0?Math.min(1,need/capM):0;
      const stc= ratio>=1?C.primary : ratio>0?'#c99a1e':'#cfd3c9';
      const btn=(lbl,dir,dis)=>h('button',{onClick:e=>{e.stopPropagation();this.adjSize(tid,sz,dir);},disabled:dis,style:{width:34,border:'none',background:dis?'#f1f2ef':C.tint2,color:dis?'#c7cabf':C.primary,cursor:dis?'default':'pointer',fontSize:19,fontWeight:700,fontFamily:'inherit',padding:'7px 0',lineHeight:1}},lbl);
      return h('div',{key:sz,style:{width:140,border:'1.5px solid '+(picked?C.primary:C.border),borderRadius:11,overflow:'hidden',background:picked?C.white:'#fbfcfa'}},
        h('button',{onClick:()=>this.togglePickSize(tid,sz),style:{display:'flex',width:'100%',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',background:picked?C.tint:'#f4f6f0',border:'none',cursor:'pointer',fontFamily:'inherit'}},
          h('span',{style:{display:'flex',alignItems:'center',gap:7}}, check(picked,15), h('span',{style:{fontSize:13.5,fontWeight:700,color:C.ink}},sz)),
          h('span',{style:{fontSize:10,fontWeight:600,color:C.faint,fontFamily:mono}},'+'+this.fmt(step))),
        picked? h('div',null,
          h('div',{style:{display:'flex',alignItems:'center',borderTop:'1px solid '+C.line}},
            btn('−',-1,need<=0),
            h('input',{type:'number',min:0,max:capM,step:step,value:need,onClick:e=>e.stopPropagation(),onChange:e=>this.setSizeQty(tid,sz,e.target.value),style:{flex:1,minWidth:0,width:'100%',border:'none',borderLeft:'1px solid '+C.line,borderRight:'1px solid '+C.line,textAlign:'center',fontSize:16,fontWeight:700,fontFamily:mono,color:C.ink,padding:'7px 0',background:C.white}}),
            btn('+',1,full)),
          h('div',{style:{padding:'7px 10px 8px',background:C.offBg,borderTop:'1px solid '+C.line}},
            h('div',{style:{height:5,borderRadius:3,background:'#e6e9e1',overflow:'hidden'}}, h('div',{style:{height:'100%',width:(ratio*100)+'%',background:stc,borderRadius:3,transition:'width .25s ease'}})),
            h('div',{style:{fontSize:10,fontWeight:700,fontFamily:mono,textAlign:'center',marginTop:5,color:C.sub}}, this.fmt(need)+' / '+this.fmt(cap))))
        : h('div',{onClick:()=>this.togglePickSize(tid,sz),style:{fontSize:10.5,fontWeight:600,textAlign:'center',padding:'13px 0',color:'#9aa093',cursor:'pointer'}}, this.t('left')+this.fmt(cap))); };
    const turnRow=(tid)=>{ const t=cat.find(x=>x.id===tid); if(!t) return null; const rs=this.parseMarker(t.marker); const sizes=this.SORDER.filter(s=>rs[s]);
      const sub=Object.keys(tq[tid]||{}).reduce((a,s)=>a+(Number((tq[tid]||{})[s])||0),0);
      return h('div',{key:tid,style:{border:'1px solid '+C.border,borderRadius:12,padding:'13px 15px 15px',marginBottom:12,background:C.white}},
        h('div',{style:{display:'flex',alignItems:'center',gap:11,marginBottom:12,flexWrap:'wrap'}},
          h('span',{style:{fontSize:14,fontWeight:700,color:'#fff',background:C.primary,borderRadius:8,padding:'4px 13px'}},tid),
          h('span',{style:{fontSize:13.5,fontWeight:600,fontFamily:mono,color:C.ink}},t.marker),
          h('span',{style:{fontSize:13,fontWeight:600,color:C.sub}},t.layers+' '+this.t('plies')),
          h('div',{style:{flex:1}}),
          h('span',{style:{fontSize:12.5,fontWeight:700,fontFamily:mono,color:sub>0?C.primary:C.faint}},'Σ '+this.fmt(sub))),
        h('div',{style:{display:'flex',flexWrap:'wrap',gap:10}}, sizes.map(sz=>qtyUnit(tid,sz)))); };
    const gcols=this.SORDER.filter(s=>avail[s]>0);
    const totalsBar = h('div',{style:{border:'1px solid '+C.border,borderRadius:10,overflow:'hidden',marginTop:6}},
      h('table',{style:{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null, h('col',{style:{width:'150px'}}), ...gcols.map((s,i)=>h('col',{key:i})), h('col',{style:{width:'62px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...tTh,textAlign:'left',paddingLeft:14,color:C.sub,background:'#f8faf3'}},this.t('mBySize')),
          gcols.map(s=>h('th',{key:s,style:{...tTh,color:C.dark,background:'#f8faf3'}},s)),
          h('th',{style:{...tTh,color:'#fff',background:C.dark,borderRight:'none'}},'\u03a3'))),
        h('tbody',null,
          h('tr',null,
            h('td',{style:{padding:'9px 14px',borderRight:'1px solid '+C.line,fontSize:11.5,fontWeight:700,color:C.dark}},this.t('mNeeded')),
            gcols.map(s=>h('td',{key:s,style:{...tTd,fontWeight:700,color:grand[s]?C.dark:'#d3d7cd'}}, this.fmt(grand[s]||0))),
            h('td',{style:{...tTd,fontWeight:700,borderRight:'none',color:C.primary}},this.fmt(needTotal))),
          h('tr',null,
            h('td',{style:{padding:'9px 14px',borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,fontSize:11.5,fontWeight:700,color:C.sub}},this.t('mCuttable2')),
            gcols.map(s=>h('td',{key:s,style:{...tTd,color:avail[s]?C.sub:'#d3d7cd'}}, this.fmt(avail[s]||0))),
            h('td',{style:{...tTd,borderRight:'none',color:C.sub}},this.fmt(availTotal))))));
    return h('div',{onClick:()=>this.set({bform:null}),ref:el=>{ if(el&&window.anime&&el.dataset.a!=='1'){el.dataset.a='1';window.anime({targets:el,opacity:[0,1],duration:200,easing:'easeOutQuad'});} },style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),ref:el=>{ if(el&&window.anime&&el.dataset.a!=='1'){el.dataset.a='1';window.anime({targets:el,opacity:[0,1],translateY:[16,0],scale:[.98,1],duration:340,easing:'easeOutCubic'});} },style:{width:'min(1480px,96vw)',height:'min(960px,93vh)',display:'flex',flexDirection:'column',overflow:'hidden',background:C.white,borderRadius:16,boxShadow:'0 30px 70px rgba(0,0,0,.32)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:13,padding:'17px 24px',borderBottom:'1px solid '+C.line,flex:'none'}},
          h('div',{style:{width:38,height:38,borderRadius:10,background:C.tint,color:C.primary,display:'flex',alignItems:'center',justifyContent:'center',flex:'none'}},
            h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9},h('rect',{x:3,y:3,width:18,height:18,rx:2}),h('path',{d:'M3 9h18M9 21V9'}))),
          h('div',{style:{flex:1,minWidth:0}},h('div',{style:{fontSize:18,fontWeight:700}},this.t('mTitle')),
            h('div',{style:{fontSize:12.5,color:C.faint,marginTop:2}},this.normName(row.line)+' · '+f.day.toUpperCase()+' '+dates[di]+' · '+this.state.week)),
          editing? this.statusTag(curSt,{lg:true}) : null,
          h('button',{onClick:()=>this.set({bform:null}),style:{border:'1px solid '+C.border,background:C.white,cursor:'pointer',color:C.sub,padding:8,borderRadius:9,display:'flex'}},h('svg',{width:18,height:18,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M18 6 6 18M6 6l12 12'})))),
        h('div',{className:'yscroll',style:{flex:1,overflow:'auto',padding:'18px 24px 20px'}},
          h('div',{style:{display:'flex',gap:11,marginBottom:20}},
            info(this.t('colBrand'),row.brand),info(this.t('colStyle'),row.style,{mono:true}),info(this.t('mColor'),effColor||'—',{dot:!!effColor}),info(this.t('mPlan'),this.fmt(quantity),{hl:true,mono:true})),
          h('div',{style:{display:'flex',alignItems:'center',gap:7,margin:'0 0 9px',fontSize:11.5,color:C.faint}},
            h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,style:{flex:'none'}},h('circle',{cx:12,cy:12,r:9}),h('path',{d:'M12 8h.01M11 12h1v4h1'})),
            this.t('mTurnPool')),
          turnTable),
        h('div',{style:{display:'flex',alignItems:'center',gap:14,padding:'14px 24px',borderTop:'1px solid '+C.line,background:'#f8faf3',flex:'none'}},
          editing? h('button',{onClick:()=>this.clearBForm(),style:{...this.btn('ghost'),color:'#c0392b',borderColor:'#eccfca'}},this.t('mClear')):null,
          h('div',{style:{display:'flex',flexDirection:'column',gap:1}},
            h('span',{style:{fontSize:13.5,fontWeight:700,color:canSave?C.ink:C.faint}}, hasTurns? (this.t('mIssue')+' '+this.fmt(needTotal)+' / '+this.fmt(availTotal)+' pcs') : this.t('mNoTurnSel')),
            hasTurns? h('span',{style:{fontSize:11.5,color:C.faint}}, selIds.length+' '+this.t('mTurns')+' · '+sizeCount+' '+this.t('mSizes')):null),
          h('div',{style:{flex:1}}),
          h('button',{onClick:()=>this.set({bform:null}),style:this.btn('ghost')},this.t('mCancel')),
          editing? h('button',{onClick:()=>this.receiveBForm(),disabled:!canSave,title:this.t(curSt==='received'?'tipUnreceive':'tipReceive'),
            style:{...this.btn('ghost'),background:curSt==='received'?RC.bg:C.white,color:RC.fg,borderColor:curSt==='received'?RC.dot:RC.bd,opacity:canSave?1:.5,cursor:canSave?'pointer':'not-allowed'}},
            h('span',{style:{width:7,height:7,borderRadius:'50%',background:RC.dot,flex:'none'}}), this.t('mReceived')):null,
          h('button',{onClick:()=>this.saveBForm(),disabled:!canSave,style:{...this.btn('primary'),opacity:canSave?1:.5,cursor:canSave?'pointer':'not-allowed'}}, editing?this.t('mUpdate'):this.t('mSave')))));
  }

  WIPSEED = {}; // không dùng số liệu giả — A lấy tổng tác nghiệp thật, còn lại nhập tay

  wipKey(r){ return this.state.week+'|'+r.id; }
  orderTotalFor(r){ const ln=this.normName(r.line);
    const cap=this.CAP.find(c=>this.normName(c.line)===ln&&c.brand===r.brand&&c.style===r.style);
    const plans=this.khcPlansFor(r.style); if(!plans.length) return 0;
    let pl=plans[0];
    if(plans.length>1&&cap){ const pd=String(cap.po).replace(/\D/g,'');
      const hit=plans.find(p=>{ const q=p.qrPo.replace(/\D/g,''); return q&&pd&&(q===pd||pd.indexOf(q)>=0||q.indexOf(pd)>=0); }); if(hit) pl=hit; }
    return pl.sections.filter(s=>s.grp!=='aux').reduce((a,s)=>a+s.total,0); }
  planNext(r){
    // SUMIFS: tổng cột TOTAL của Kế Hoạch May tuần này, khớp LINE + BRAND + STYLE
    const ln=this.normName(r.line);
    const q=this.getWeek().rows
      .filter(x=>this.normName(x.line)===ln && (x.brand||'')===(r.brand||'') && (x.style||'')===(r.style||''))
      .reduce((a,x)=>a+this.rowTotal(x),0);
    return {qty:Math.round(q),est:q===0}; }
  wipVals(r,idx){
    const ov=(this.state.wip||{})[this.wipKey(r)]||{}; const seed=this.WIPSEED[this.bdKey(r.line,r.brand,r.style)]; let base;
    if(seed) base={a:seed[0],b:seed[1],c:seed[2],d:seed[3],remark:seed[4]||''};
    else { const nd=this.DAYS.filter(d=>r.days[d]!=null).length||1; const daily=Math.round(this.rowTotal(r)/nd)||0;
      base={a:this.orderTotalFor(r)||0,b:daily*2,c:Math.round(daily*1.8),d:daily,remark:''}; }
    const v={...base,...ov};
    const planTot=this.orderTotalFor(r)||this.psOrderQty(r)||0;
    const a=planTot||(Number(v.a)||0), b=Number(v.b)||0, c=Number(v.c)||0, d=Number(v.d)||0;
    const f=this.planNext(r); const e=Math.max(0,d-b+c);
    const left=Math.max(0,a-b);
    return {a,b,c,d,wip:b-c,e,f:f.qty,fEst:f.est,need:Math.max(0,(e+f.qty)>left?left:(e+f.qty)),remark:v.remark||''};
  }
  setWip(r,field,val){ const k=this.wipKey(r); const v=field==='remark'?val:Math.max(0,parseInt(String(val).replace(/[^0-9-]/g,''),10)||0);
    this.setState(s=>({wip:{...s.wip,[k]:{...((s.wip||{})[k]||{}),[field]:v}}})); }
  needTotal(){ return this.getWeek().rows.reduce((a,r,i)=>a+this.wipVals(r,i).need,0); }
  wkRange(){ const M={Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
    const ds=this.weekDates(); const yr=(this.state.week.split(' · ')[0].split(' ')[1])||'2026';
    const f=s=>{ const p=String(s).split('-'); return String(p[0]).padStart(2,'0')+'/'+(M[p[1]]||'07'); };
    return f(ds[0])+' – '+f(ds[ds.length-1])+'/'+yr; }

  exportExcel(){
    const X=window.XLSX;
    if(!X){ window.alert('Thư viện Excel chưa tải xong — thử lại sau vài giây.'); return; }
    const rows=this.getWeek().rows, dates=this.weekDates(), wk=this.state.week;
    const fac=['Nhà máy (Factory)','YIC Hà Nam'], wkr=['Tuần (Week)',this.wkRange()];
    const dayHead=this.DAYS.map((d,i)=>d.toUpperCase()+' '+dates[i]);
    const wb=X.utils.book_new();
    const add=(name,aoa,cols)=>{ const ws=X.utils.aoa_to_sheet(aoa); ws['!cols']=cols.map(w=>({wch:w})); X.utils.book_append_sheet(wb,ws,name); };

    const a1=[['WEEKLY SEWING SCHEDULE'],fac,wkr,[],['LINE','BRAND','STYLE #',...dayHead,'TOTAL']];
    rows.forEach(r=>a1.push([this.normName(r.line),r.brand,r.style,...this.DAYS.map(d=>r.days[d]!=null?Number(r.days[d]):null),this.rowTotal(r)]));
    a1.push(['TOTAL','','',...this.DAYS.map(d=>this.colTotal(rows,d)),this.grand(rows)]);
    add('Sewing Schedule',a1,[12,12,16,...this.DAYS.map(()=>11),11]);

    const V=rows.map((r,i)=>this.wipVals(r,i)); const S=f=>V.reduce((a,v)=>a+v[f],0);
    const a2=[['WEEKLY CUTTING BUNDLE DEMAND'],fac,wkr,[],
      ['LINE','BRAND','STYLE #','A · TỔNG CẮT CỦA ĐƠN','B · TỔNG WIP ĐÃ CẤP','C · OUTPUT RA CHUYỀN','B−C · WIP TỒN CUỐI TUẦN','D · 1 NGÀY WIP','E · WIP CẦN GỐI','F · SL DỰ KIẾN TUẦN SAU','SỐ LƯỢNG CẦN CẤP']];
    rows.forEach((r,i)=>{ const v=V[i]; a2.push([this.normName(r.line),r.brand,r.style,v.a,v.b,v.c,v.wip,v.d,v.e,v.f,v.need]); });
    a2.push(['TOTAL','','',S('a'),S('b'),S('c'),S('wip'),'',S('e'),S('f'),S('need')]);
    add('Bundle Demand',a2,[12,12,16,15,14,14,15,12,13,15,15]);

    const a3=[['WEEKLY BUNDLE REQUEST'],fac,wkr,[],['LINE','STYLE #','MÀU CẮT',...dayHead,'TỔNG']];
    rows.forEach(r=>{ const b=this.state.bundle[this.bKey(r)]||{};
      a3.push([this.normName(r.line),r.style,b.color||'',
        ...this.DAYS.map(d=>{ const c=b.days&&b.days[d]; if(!c||!(c.sizes||[]).length) return ''; const q=c.qty||{};
          return (c.turns||[]).join('+')+' | '+c.sizes.map(s=>s+' '+(Number(q[s])||0)).join(' · '); }),
        this.bundleTotal(r.id)||0]); });
    add('Bundle Request',a3,[12,16,18,...this.DAYS.map(()=>26),10]);

    X.writeFile(wb,('YIC-HaNam_'+wk).replace(/[^0-9A-Za-z]+/g,'-').replace(/-+$/,'')+'.xlsx');
  }

  renderDemandBody(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows;
    const pill=(label,val)=>h('div',{style:{border:'1px solid '+C.border,borderRadius:9,padding:'6px 13px',background:C.white}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},label),
      h('div',{style:{fontSize:13,fontWeight:700,color:C.ink,fontFamily:mono,marginTop:2,whiteSpace:'nowrap'}},val));
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle(), this.renderKpis(), this.renderTabs(),
      h('div',{ref:this.panelRef,style:{background:C.white,border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',boxShadow:C.shadow}},
        this.renderPeriodBar(),
        h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:12,padding:'16px 22px 14px',borderBottom:'1px solid '+C.line}},
          h('div',{style:{marginRight:'auto'}},
            h('div',{style:{fontSize:16,fontWeight:700}},this.t('demandTitle')),
            h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('demandSub')+' · '+this.state.week)),
          pill(this.t('factory'),'YIC Hà Nam'),
          h('button',{style:this.btn('ghost'),title:this.t('exportTip'),onClick:()=>this.exportExcel()},this.ic('grid'),this.t('exportXls'))),
        h('div',{style:{padding:'16px 16px 18px'}},
          rows.length? this.renderDemandGrid() : h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty')))));
  }

  renderDemandGrid(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows; const spans=this.lineSpans(rows); const pad=this.dense?'7px 5px':'9px 5px';
    const e=this.state.edit; const ed=(id,col)=>e&&e.id===id&&e.col===col;
    const commit=fn=>({onBlur:ev=>{fn(ev.target.value);this.stopEdit();},onKeyDown:ev=>{if(ev.key==='Enter'){fn(ev.target.value);this.stopEdit();}else if(ev.key==='Escape')this.stopEdit();}});
    const inp={width:'100%',border:'2px solid '+C.primary,padding:pad,fontSize:13,fontFamily:mono,fontWeight:700,color:C.ink,background:C.white,textAlign:'center'};
    const cb={borderRight:'1px solid '+C.line,borderTop:'1px solid '+C.line,verticalAlign:'middle'};
    const gh={padding:'7px 8px',fontSize:10.5,fontWeight:700,letterSpacing:'.7px',textTransform:'uppercase',textAlign:'center',color:'#fff',background:C.dark,borderRight:'1px solid rgba(255,255,255,.22)'};
    const th={padding:'7px 5px',fontSize:10,fontWeight:700,letterSpacing:'.3px',textTransform:'uppercase',color:C.sub,textAlign:'center',borderRight:'1px solid '+C.line,borderBottom:'2px solid '+C.border,background:'#f8faf3',verticalAlign:'middle',lineHeight:1.3};
    const hc=(label,o)=>{ o=o||{}; return h('th',{key:label,title:o.title,style:{...th,...(o.style||{})}},label); };
    const T=f=>rows.reduce((a,r,i)=>a+this.wipVals(r,i)[f],0);
    let grp=-1;
    const body=rows.map((r,idx)=>{
      const li=spans[idx]; if(li.first) grp++; const stripe=grp%2===1; const rbg=stripe?'#f7f9f3':C.white; const calcBg=stripe?'#f0f2ec':'#fafbf7';
      const v=this.wipVals(r,idx);
      const man=(field,val,warn)=>{ const col='w'+field;
        if(ed(r.id,col)) return h('td',{key:field,style:{...cb,padding:0,background:C.tint}},
          h('input',Object.assign({type:'number',autoFocus:true,defaultValue:val,style:inp},commit(x=>this.setWip(r,field,x)))));
        return h('td',{key:field,onClick:()=>this.startEdit(r.id,col),title:this.t('tipManual'),
          style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:13,fontWeight:600,cursor:'pointer',color:warn?'#c0392b':C.ink,background:warn?'#fdeceb':rbg}},this.fmt(val)); };
      const calc=(k,val,title)=>h('td',{key:k,title:title,style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:12.5,fontWeight:val?600:400,color:val?C.sub:'#c3c8bf',background:calcBg}},this.fmt(val));
      // Chi doc: gia tri lay tu tac nghiep cat / ke hoach, khong nhap tay
      const lock=(k,val,title)=>h('td',{key:k,title:title,style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:13,fontWeight:600,cursor:'default',opacity:.7,color:C.ink,background:calcBg}},this.fmt(val));
      const cells=[];
      if(li.first) cells.push(ed(r.id,'line')
        ? h('td',{key:'ln',rowSpan:li.span,style:{...cb,padding:0,background:C.tint}},
            h('input',Object.assign({list:'dl-line',autoFocus:true,defaultValue:this.normName(r.line),placeholder:this.t('phLine'),style:{...inp,fontSize:12}},commit(v=>this.renameGroup(li.ids,v)))),
            h('datalist',{id:'dl-line'}, this.lineOptions().map(n=>h('option',{key:n,value:n}))))
        : h('td',{key:'ln',rowSpan:li.span,title:this.t('tipPlanCol'),style:{...cb,padding:'8px 4px',textAlign:'center',verticalAlign:'middle',fontSize:12,fontWeight:700,cursor:'default',opacity:.7,color:C.primary,background:C.tint,lineHeight:1.25}},this.normName(r.line)));
      cells.push(h('td',{key:'br',title:this.t('lgPull'),style:{...cb,padding:pad,paddingLeft:9,textAlign:'left',fontSize:11.5,fontWeight:600,color:r.brand?C.ink:'#c3c8bf',background:rbg}},r.brand||'—'));
      cells.push(h('td',{key:'st',title:this.t('lgPull'),style:{...cb,padding:pad,paddingLeft:9,textAlign:'left',fontSize:11,fontFamily:mono,color:r.style?C.ink:'#c3c8bf',background:rbg,wordBreak:'break-all',lineHeight:1.3}},r.style||'—'));
      cells.push(lock('a',v.a,this.t('tipA'))); cells.push(man('b',v.b)); cells.push(man('c',v.c));
      cells.push(calc('wip',v.wip,this.t('tipBC')));
      cells.push(man('d',v.d,v.d===0));
      cells.push(calc('e',v.e,this.t('tipE')));
      cells.push(h('td',{key:'f',title:v.fEst?this.t('tipFEst'):this.t('tipF')+' · '+this.state.week,
        style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:13,fontWeight:600,color:C.primary,background:stripe?'#eef3e6':'#f5f9f0'}},this.fmt(v.f)));
      cells.push(h('td',{key:'need',title:this.t('dNeed')+' = '+this.t('tipNeed'),
        style:{...cb,padding:pad,textAlign:'center',fontFamily:mono,fontSize:15,fontWeight:700,color:v.need?C.dark:'#c3c8bf',background:v.need?C.tint:'#f4f5f2'}},this.fmt(v.need)));
      return h('tr',{key:r.id},cells);
    });
    return h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1070px',borderCollapse:'collapse',tableLayout:'fixed'}},
        h('colgroup',null,
          h('col',{style:{width:'86px'}}),h('col',{style:{width:'88px'}}),h('col',{style:{width:'112px'}}),
          h('col',{style:{width:'96px'}}),h('col',{style:{width:'88px'}}),h('col',{style:{width:'92px'}}),h('col',{style:{width:'90px'}}),h('col',{style:{width:'78px'}}),
          h('col',{style:{width:'92px'}}),h('col',{style:{width:'98px'}}),h('col',{style:{width:'106px'}})),
        h('thead',null,
          h('tr',null,
            h('th',{colSpan:3,style:{...gh,background:'#f8faf3',borderRight:'1px solid '+C.line}},''),
            h('th',{colSpan:5,style:gh},this.t('grpWip')),
            h('th',{colSpan:3,style:gh},this.t('grpNext'))),
          h('tr',null,
            hc(this.t('colLine'),{style:{fontSize:11}}),
            hc(this.t('colBrand'),{style:{fontSize:11,textAlign:'left',paddingLeft:9}}),
            hc(this.t('colStyle'),{style:{fontSize:11,textAlign:'left',paddingLeft:9}}),
            hc(this.t('dA'),{title:'A · '+this.t('tipA')}),
            hc(this.t('dB'),{title:'B · '+this.t('tipB')}),
            hc(this.t('dC'),{title:'C · '+this.t('tipC')}),
            hc(this.t('dBC'),{title:this.t('tipBC')}),
            hc(this.t('dD'),{title:'D · '+this.t('tipD')}),
            hc(this.t('dE'),{title:this.t('tipE')}),
            hc(this.t('dF'),{title:'F · '+this.t('tipF')}),
            hc(this.t('dNeed'),{title:this.t('tipNeed'),style:{background:C.dark,color:'#fff',borderBottom:'2px solid '+C.dark}}))),
        h('tbody',null,body),
        h('tfoot',null,h('tr',null,
          h('td',{colSpan:3,style:{padding:'11px 12px',fontSize:11,fontWeight:700,letterSpacing:'.5px',color:'#cfe0be',background:C.dark}},this.t('colTotal')),
          ['a','b','c','wip','d','e','f'].map(f=>h('td',{key:f,style:{padding:'11px 5px',textAlign:'center',fontFamily:mono,fontSize:12.5,fontWeight:700,color:'#e6efdb',background:C.dark}},this.fmt(T(f)))),
          h('td',{style:{padding:'11px 5px',textAlign:'center',fontFamily:mono,fontSize:15,fontWeight:700,color:'#fff',background:C.dark}},this.fmt(T('need')))))));
  }

  // Dòng đặt năng lực cắt lấy trực tiếp từ Nhu Cầu BTP / Kế Hoạch May (chuyền + thương hiệu + mã hàng)
  capRows(){ const o=this.state.cap||{}; const seen={}, list=[];
    this.getWeek().rows.forEach(r=>{ if(!r.brand&&!r.style) return;
      const key=this.bdKey(r.line,r.brand,r.style); if(seen[key]) return; seen[key]=1;
      const sd=this.CAP.find(c=>this.bdKey(c.line,c.brand,c.style)===key)||{}; const id='cap:'+key;
      const bd=this.bundleIndex()[key]||{}; const base=Math.round(bd.need||0)||Math.round((bd.d||0)*3)||0;
      const r10=x=>Math.round(x/10)*10;
      list.push({...sd,id,brand:r.brand,style:r.style,line:this.normName(r.line),emb:sd.emb||'KHÔNG',
        cut:sd.cut||r10(base*1.3),iss:sd.iss||r10(base*1.05),turns:sd.turns||'',days:sd.days||[0,0,0,0,0,0],...(o[id]||{})}); });
    const ord=(this.state&&this.state.capOrder)||null; if(!ord) return list;
    const by={}; list.forEach(r=>{ by[r.id]=r; });
    const out=[]; ord.forEach(id=>{ if(by[id]){ out.push(by[id]); delete by[id]; } });
    list.forEach(r=>{ if(by[r.id]) out.push(r); });
    return out; }
  // PO lấy từ tác nghiệp cắt — khớp lượt cắt đã đặt cho dòng
  multFor(emb){ const s=this.state||{}; const v=emb?s.multEmb:s.multPlain; return v==null?(emb?6:3):v; }
  isOoo(r){ return /^out of order$/i.test(String(r.turns||'').trim()); }
  turnQty(style,k,po){ const cat=this.cutTurns(style,po)||[]; if(!cat.length) return 400;
    const t=cat[k%cat.length]; const ts=this.turnSizes(t);
    return Object.keys(ts).reduce((a,s)=>a+ts[s],0)||400; }
  allocTurns(){ const m={}; let n=1;
    this.capRows().forEach(r=>{ if(this.isOoo(r)){ m[r.id]=[]; return; }
      const need=Math.max(0,Math.round(this.capVals(r).out));
      const arr=[]; let sum=0,k=0;
      const cat=this.khcTurns(r.style,r.po);
      if(cat&&cat.length){ while(sum<need && k<cat.length){ const t=cat[k]; const q=Object.values(this.turnSizes(t)).reduce((a,x)=>a+x,0); arr.push({c:t.id,q:q}); sum+=q; k++; } }
      else { while(sum<need && k<40){ const q=this.turnQty(r.style,k,r.po); arr.push({c:'C'+(n++),q:q}); sum+=q; k++; } }
      m[r.id]=arr; });
    return m; }
  bdKey(line,brand,style){ const u=s=>String(s||'').toUpperCase().replace(/\s+/g,' ').trim();
    return this.normName(line)+'|'+u(brand)+'|'+u(style); }
  bundleIndex(){
    if(!this.state) return {};
    const sig=this.state.week+'|'+JSON.stringify(this.state.wip||{});
    if(this._bdSig===sig) return this._bd;
    const m={};
    this.getWeek().rows.forEach((r,i)=>{ const v=this.wipVals(r,i); const k=this.bdKey(r.line,r.brand,r.style);
      const c=m[k]||{d:0,need:0}; c.d+=v.d; c.need+=v.need; m[k]=c; });
    this._bdSig=sig; this._bd=m; return m;
  }
  capVals(r){
    const bd=this.bundleIndex()[this.bdKey(r.line,r.brand,r.style)];
    const wip1=bd?bd.d:(Number(r.wip1)||0);
    const sew=bd?bd.need:(Number(r.sew)||0);
    const rem=(Number(r.cut)||0)-(Number(r.iss)||0);
    const mult=this.multFor(r.emb==='THÊU');
    const ahead=wip1*mult;
    const ooo=this.isOoo(r);
    return {rem,mult,wip1,sew,linked:!!bd,ahead,out:Math.max(0,sew+ahead-rem),
      wk:this.capDays(r).reduce((a,x)=>a+(Number(x)||0),0),
      list:ooo?[]:(((this.state&&this.state.capTurns)||{})[r.id]||[]), ooo};
  }
  capTotals(){ const T={cut:0,iss:0,rem:0,wip1:0,ahead:0,sew:0,out:0,tc:0,days:[0,0,0,0,0,0],wk:0};
    this.capRows().forEach(r=>{ const v=this.capVals(r);
      T.cut+=Number(r.cut)||0; T.iss+=Number(r.iss)||0; T.rem+=v.rem; T.wip1+=v.wip1;
      T.ahead+=v.ahead; T.sew+=v.sew; T.out+=v.out; T.tc+=v.list.length; T.wk+=v.wk;
      this.capDays(r).forEach((x,i)=>{ T.days[i]+=Number(x)||0; }); });
    return T; }

  DSO_TABS=[['cfg','dsotab1'],['prod','dsotab2'],['alert','dsotab3'],['mlv','dsotab4']];
  // Bang lich su chi cao toi da DSO_HIST_ROWS dong roi cuon TRONG bang, khong keo
  // dai trang. Tieu de dinh o tren nen cuon van doc duoc ten cot.
  // Chieu cao 1 dong KHAC nhau giua 2 bang (do thuc te tren Chrome): bang hoan thanh
  // co nut Giao sang hoan thien nen dong cao hon, bang loi chi co chip ly do.
  DSO_HIST_ROWS=6;
  DSO_ROW_H={done:45,def:37};
  dsoHistH(kind){ return this.DSO_HIST_ROWS*(this.DSO_ROW_H[kind]||38)+35; }
  DSO_SUBS=[['line','dsosub1'],['mtype','dsosub2'],['defect','dsosub3']];
  // Nhan KEY dich (khong nhan nhan da resolve) de nhan tu doi khi bam VI/EN.
  // sub=true -> preset nhe hon, giong segmented control trong renderPeriodBar.
  DSO_ALERTS=['Máy hỏng','Mất điện nước','Lỗi kĩ thuật','Lỗi chất lượng','Cần cơ động','Đào tạo',
              'Trợ giúp chất lượng','Quản lý','Kim gãy','Lỗi khác','Lỗi phụ liệu','Phôi lỗi'];
  initAlerts(){ return this.DSO_ALERTS.map((n,i)=>({id:'a'+(i+1),name:n,snd:null})); }
  SND_MAX=20*1024*1024;

  // File am thanh nam trong IndexedDB (localStorage chi giu ten/kich co) -- blob am thanh
  // vuot xa gioi han ~5MB cua localStorage.
  alerts(){ return this.state.dsoAlerts||[]; }
  setAlerts(fn){ this.setState(s=>({dsoAlerts:fn(s.dsoAlerts||[])})); }
  // Bam 1 canh bao -> phat am thanh + nhay sang de biet da nhan
  fireAlert(a){ this.playAlert(a);
    clearTimeout(this._alT); this.set({dsoAlHit:a.id});
    this._alT=setTimeout(()=>{ if(this._mounted) this.set({dsoAlHit:null}); },900); }
  playAlert(a){ if(!a||!a.snd) return;
    this.sndGet(a.id).then(blob=>{ if(!blob) return;
      if(this._sndUrl) URL.revokeObjectURL(this._sndUrl);
      this._sndUrl=URL.createObjectURL(blob);
      this._snd=this._snd||new window.Audio();
      this._snd.src=this._sndUrl; const p=this._snd.play(); if(p&&p.catch) p.catch(()=>{}); }).catch(()=>{}); }
  pickAlertSound(id,file){ if(!file) return;
    if(file.size>this.SND_MAX){ window.alert(this.t('alSndBig')); return; }
    this.sndPut(id,file).then(()=>this.setAlerts(l=>l.map(a=>a.id===id?{...a,snd:{name:file.name,size:file.size,type:file.type||''}}:a)))
      .catch(()=>window.alert(this.t('alSndErr'))); }
  clearAlertSound(id){ this.sndDel(id).catch(()=>{});
    this.setAlerts(l=>l.map(a=>a.id===id?{...a,snd:null}:a)); }
  renameAlert(id,name){ this.setAlerts(l=>l.map(a=>a.id===id?{...a,name}:a)); }
  delAlert(id){ this.sndDel(id).catch(()=>{}); this.setAlerts(l=>l.filter(a=>a.id!==id)); }
  addAlert(){ const l=this.alerts();
    let n=0; l.forEach(a=>{ const m=String(a.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); });
    this.setAlerts(x=>[...x,{id:'a'+(n+1),name:'',snd:null}]); }
  icSnd(on){ const h=React.createElement;
    return h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,style:{flex:'none'}},
      h('path',{d:'M11 5 6 9H3v6h3l5 4z'}),
      on?h('path',{d:'M16 8a5 5 0 0 1 0 8'}):h('path',{d:'M22 9l-6 6M16 9l6 6'})); }

  // Mot the trong dung chung cho ca 5 man -- sau nay chi truyen body that vao la xong
  // opts.full = bo tran max-width; opts.action = phan tu ghim goc tren ben phai
  renderDsoAlerts(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const list=this.alerts(); const ed=!!this.state.dsoAlEdit; const hit=this.state.dsoAlHit;
    const grid={display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax('+(ed?258:206)+'px,1fr))',gap:12,padding:'18px 22px 22px',alignItems:'stretch'};
    const iconBtn=(title,onClick,col,bd,bg)=>h('button',{title,onClick,
      style:{border:'1px solid '+bd,background:bg,color:col,borderRadius:9,padding:'6px 9px',cursor:'pointer',display:'inline-flex',alignItems:'center',flex:'none',fontFamily:'inherit',fontSize:12,fontWeight:700,lineHeight:1}},title);
    const body = !list.length
      ? h('div',{style:{padding:'52px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('alEmpty'))
      : h('div',{style:grid},
          list.map(a=>{
            if(!ed){ const on=hit===a.id;
              return h('button',{key:a.id,onClick:()=>this.fireAlert(a),
                style:{display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'space-between',gap:10,minHeight:98,
                  border:'1px solid '+(on?'#c0392b':C.border),background:on?'#fdecea':C.white,color:C.ink,borderRadius:14,
                  padding:'14px 15px',cursor:'pointer',fontFamily:'inherit',textAlign:'left',
                  boxShadow:on?'0 0 0 3px rgba(192,57,43,.13)':'0 1px 2px rgba(40,60,10,.05)',transition:'background .12s,border-color .12s,box-shadow .12s'}},
                h('span',{style:{fontSize:15,fontWeight:700,lineHeight:1.3,wordBreak:'break-word'}},a.name||'—'),
                h('span',{style:{display:'inline-flex',alignItems:'center',gap:6,fontSize:10.5,fontWeight:600,color:a.snd?C.primary:C.faint}},
                  this.icSnd(!!a.snd), a.snd?this.t('alHasSnd'):this.t('alNoSnd')));
            }
            return h('div',{key:a.id,style:{border:'1px solid '+C.border,borderRadius:14,padding:'12px 13px 13px',background:C.white,display:'flex',flexDirection:'column',gap:9}},
              h('div',{style:{display:'flex',gap:8,alignItems:'center'}},
                h('input',{value:a.name,placeholder:this.t('alName'),onChange:e=>this.renameAlert(a.id,e.target.value),
                  style:{flex:1,minWidth:0,border:'1px solid '+C.border,borderRadius:9,padding:'8px 10px',fontSize:13.5,fontWeight:600,fontFamily:'inherit',color:C.ink,background:C.white}}),
                h('button',{title:this.t('alDel'),onClick:()=>this.delAlert(a.id),
                  style:{border:'1px solid #eccfca',background:C.white,color:'#c0392b',borderRadius:9,padding:'7px 8px',cursor:'pointer',display:'flex',flex:'none'}},
                  h('svg',{width:15,height:15,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14'})))),
              h('div',{style:{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}},
                h('label',{style:{...this.btn('ghost'),padding:'6px 10px',fontSize:12,cursor:'pointer'}},
                  this.icSnd(true), this.t('alPick'),
                  h('input',{type:'file',accept:'audio/*',style:{display:'none'},
                    onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; this.pickAlertSound(a.id,f); }})),
                a.snd?iconBtn(this.t('alPlay'),()=>this.playAlert(a),C.primary,C.border,C.tint2):null,
                a.snd?iconBtn(this.t('alClrSnd'),()=>this.clearAlertSound(a.id),'#c0392b','#eccfca',C.white):null),
              h('div',{style:{fontSize:10.5,fontFamily:mono,color:a.snd?C.sub:C.faint,wordBreak:'break-all'}},
                a.snd?(a.snd.name+' · '+this.kb(a.snd.size)):this.t('alNoSnd')));
          }),
          ed?h('button',{key:'__add',onClick:()=>this.addAlert(),
            style:{minHeight:112,border:'1.5px dashed '+C.border,borderRadius:14,background:'#fbfcfa',color:C.primary,
              cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:700,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:7}},
            h('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M12 5v14M5 12h14'})),
            this.t('alAdd')):null);
    const action=h('button',{onClick:()=>this.set({dsoAlEdit:!ed,dsoAlHit:null}),
      style:ed?this.btn('primary'):this.btn('ghost')},
      ed?null:h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},h('path',{d:'M12 20h9'}),h('path',{d:'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z'})),
      ed?this.t('alDone'):this.t('alEdit'));
    return this.dsoCard('dsoAlertPanel','dsoAlertSub','DSO Alerts',body,{full:true,action});
  }

  // Style dung chung cho 2 bang cua M-level Type Setting
  renderMtypeTable(){
    const h=React.createElement, C=this.C; const S=this.mtStyles();
    const list=this.mtypes(), sel=this.mtSelId();
    const body=list.map((m,i)=>{
      const ed=this.state.mtEdit==='t:'+m.id, on=sel===m.id, bg=on?C.tint:(i%2?'#f7f9f3':C.white);
      return h('tr',{key:m.id,onClick:()=>{ if(!ed) this.set({mtSel:m.id}); },style:{cursor:ed?'default':'pointer'}},
        h('td',{style:{...S.td,background:bg,fontWeight:700,color:on?C.primary:C.ink,
          borderLeft:'3px solid '+(on?C.primary:'transparent')}},
          ed?h('input',{autoFocus:true,value:m.name,placeholder:this.t('mtName'),onClick:e=>e.stopPropagation(),
              onChange:e=>this.mtSetType(m.id,{name:e.target.value}),style:S.inp})
            :(String(m.name||'').trim()||'—')),
        h('td',{style:{...S.td,background:bg,color:m.desc?C.ink:C.faint,wordBreak:'break-word'}},
          ed?h('input',{value:m.desc||'',placeholder:this.t('mtDesc'),onClick:e=>e.stopPropagation(),
              onChange:e=>this.mtSetType(m.id,{desc:e.target.value}),style:{...S.inp,fontFamily:'inherit'}})
            :(m.desc||'—')),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6}},
            ed?this.mtBtn(this.t('lsDone'),e=>{ e.stopPropagation(); this.set({mtEdit:null}); },{border:'1px solid '+C.primary,background:C.tint})
              :this.mtBtn(this.t('lsEdit'),e=>{ e.stopPropagation(); this.set({mtEdit:'t:'+m.id,mtSel:m.id}); }),
            this.mtBtn(this.t('mtDel'),e=>{ e.stopPropagation(); this.mtDelType(m.id); },{color:'#c0392b',borderColor:'#eccfca'}))));
    });
    const tbl=h('div',{style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'320px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'30%'}}),h('col',{style:{width:'40%'}}),h('col',{style:{width:'30%'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...S.th,paddingLeft:13}},this.t('mtName')),
          h('th',{style:S.th},this.t('mtDesc')),
          h('th',{style:{...S.th,borderRight:'none'}},this.t('mtAct')))),
        h('tbody',null, list.length?body:h('tr',null,h('td',{colSpan:3,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'38px 16px',borderRight:'none'}},this.t('mtEmpty'))))));
    const bodyEl=h('div',null, tbl,
      h('div',{style:{padding:'11px 13px',borderTop:'1px solid '+C.line}},
        this.mtBtn('+ '+this.t('mtAdd'),()=>this.mtAddType(),{color:C.primary,borderColor:C.border})));
    return this.dsoCard('mtPanel','mtSub','DSO M-level Type',bodyEl,{full:true});
  }

  // ---- Bảng 2 (tỉ lệ 7): chi tiết của loại đang chọn ----
  renderMtypeDetail(){
    const h=React.createElement, C=this.C; const S=this.mtStyles();
    const tid=this.mtSelId(); const rows=tid?this.mtDet(tid):[];
    const imp=h('div',{style:{display:'flex',alignItems:'center',gap:9}},
      this.state.mtMsg?h('span',{style:{fontSize:11.5,fontWeight:600,color:C.primary,background:C.tint,
        border:'1px solid '+C.border,borderRadius:99,padding:'4px 10px',whiteSpace:'nowrap'}},this.state.mtMsg):null,
      h('label',{title:this.t('mtImportTip'),style:{...this.btn('ghost'),padding:'6px 12px',fontSize:12,cursor:tid?'pointer':'not-allowed',opacity:tid?1:.5}},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M12 3v12M8 11l4 4 4-4'}),h('path',{d:'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'})),
        this.t('mtImport'),
        h('input',{type:'file',accept:'.xlsx,.xls,.csv',disabled:!tid,style:{display:'none'},
          onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) this.mtImport(f); }})));
    let bodyEl;
    if(!tid) bodyEl=h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('mtPickType'));
    else {
      const body=rows.map((r,i)=>{
        const ed=this.state.mtEdit==='d:'+tid+':'+r.id, bg=i%2?'#f7f9f3':C.white;
        const cell=(field,fn,ph,align)=>ed
          ? h('input',{value:r[field]==null?'':r[field],placeholder:ph,inputMode:field==='inc'?'decimal':'numeric',
              onChange:e=>this.mtSetDet(tid,r.id,{[field]:fn?this[fn](e.target.value):e.target.value}),
              style:{...S.inp,textAlign:align||'left',...(fn?{}:{fontFamily:'inherit'})}})
          : (field==='inc'?this.mtMoneyFmt(r.inc)
             :(r[field]===''||r[field]==null?'—'
               :(field==='tgt'?r.tgt+'%':String(r[field]))));
        return h('tr',{key:r.id},
          h('td',{style:{...S.td,background:bg,textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}},i+1),
          h('td',{style:{...S.td,background:bg,fontWeight:600,wordBreak:'break-word'}},cell('name',null,this.t('mtName'))),
          h('td',{style:{...S.td,background:bg,textAlign:'center',fontFamily:S.mono,fontWeight:700}},cell('tgt','mtPct','0','center')),
          h('td',{style:{...S.td,background:bg,textAlign:'right',fontFamily:S.mono,fontWeight:700}},cell('inc','mtMoney','0','right')),
          h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
            h('div',{style:{display:'flex',gap:6}},
              ed?this.mtBtn(this.t('lsDone'),()=>this.mtDetDone(tid,r.id),{border:'1px solid '+C.primary,background:C.tint})
                :this.mtBtn(this.t('lsEdit'),()=>this.set({mtEdit:'d:'+tid+':'+r.id})),
              this.mtBtn(this.t('mtDel'),()=>this.mtDelDet(tid,r.id),{color:'#c0392b',borderColor:'#eccfca'}))));
      });
      const tbl=h('div',{style:{overflowX:'auto'}},
        h('table',{style:{width:'100%',minWidth:'640px',borderCollapse:'collapse'}},
          h('colgroup',null,h('col',{style:{width:'56px'}}),h('col',{style:{width:'26%'}}),
            h('col',{style:{width:'15%'}}),h('col',{style:{width:'30%'}}),h('col',{style:{width:'160px'}})),
          h('thead',null,h('tr',null,
            h('th',{style:{...S.th,textAlign:'center',paddingLeft:8}},this.t('mtNo')),
            h('th',{style:S.th},this.t('mtName')),
            h('th',{title:this.t('mtTgtTip'),style:{...S.th,textAlign:'center'}},this.t('mtTgt')),
            h('th',{style:{...S.th,textAlign:'right'}},this.t('mtInc')),
            h('th',{style:{...S.th,borderRight:'none'}},this.t('mtAct')))),
          h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:5,
            style:{...S.td,textAlign:'center',color:C.faint,padding:'38px 16px',borderRight:'none'}},this.t('mtdEmpty'))))));
      bodyEl=h('div',null, tbl,
        h('div',{style:{padding:'11px 13px',borderTop:'1px solid '+C.line}},
          this.mtBtn('+ '+this.t('mtAdd'),()=>this.mtAddDet(tid),{color:C.primary,borderColor:C.border})));
    }
    return this.dsoCard('mtdPanel','mtdSub','DSO M-level Type Detail',bodyEl,{full:true,action:imp});
  }

  // ==== Thu vien loi (Defect Library) =====================================
  // Danh muc loi dung khi cong nhan bam FAIL o card size. Ca 6 cot deu la CHU
  // tu do -- moi nha may co bo ma / nhom / muc do rieng, nen khong validate gi
  // ngoai viec don khoang trang khi bam Xong.
  DEFECT_DEF=[
    {code:'SW-001',name:'Bỏ mũi chỉ',              cat:'May',        sev:'Major',    loc:'Đường sườn',    cause:'Kim mòn · chỉ căng'},
    {code:'SW-002',name:'Đường may nhăn',          cat:'May',        sev:'Major',    loc:'Nẹp áo',        cause:'Áp lực chân vịt sai'},
    {code:'SW-003',name:'Đường may lệch',          cat:'May',        sev:'Critical', loc:'Cổ áo',         cause:'Canh sai dấu bấm'},
    {code:'SW-004',name:'Tuột chỉ · nhảy chỉ',     cat:'May',        sev:'Major',    loc:'Gấu áo',        cause:'Máy chưa hiệu chỉnh'},
    {code:'SW-005',name:'Chỉ thừa chưa cắt',       cat:'Vệ sinh',    sev:'Minor',    loc:'Toàn sản phẩm', cause:'Bỏ sót khâu cắt chỉ'},
    {code:'FB-001',name:'Vải lỗi sợi · sợi thô',   cat:'Vải',        sev:'Major',    loc:'Thân trước',    cause:'Nguyên liệu đầu vào'},
    {code:'FB-002',name:'Vải khác màu',            cat:'Vải',        sev:'Critical', loc:'Tay áo',        cause:'Trộn lô nhuộm'},
    {code:'FB-003',name:'Vải bị lỗ · xước',        cat:'Vải',        sev:'Critical', loc:'Thân sau',      cause:'Nguyên liệu đầu vào'},
    {code:'CT-001',name:'Cắt sai thông số',        cat:'Cắt',        sev:'Critical', loc:'Chi tiết thân', cause:'Sơ đồ cắt sai'},
    {code:'CT-002',name:'Chi tiết không đối xứng', cat:'Cắt',        sev:'Major',    loc:'Tay áo',        cause:'Xô lệch khi cắt'},
    {code:'AC-001',name:'Khóa kéo không êm',       cat:'Phụ liệu',   sev:'Major',    loc:'Nẹp khóa',      cause:'Phụ liệu lỗi'},
    {code:'AC-002',name:'Cúc lệch · thiếu cúc',    cat:'Phụ liệu',   sev:'Major',    loc:'Nẹp áo',        cause:'Đóng cúc sai vị trí'},
    {code:'AC-003',name:'Nhãn sai · thiếu nhãn',   cat:'Phụ liệu',   sev:'Critical', loc:'Cổ trong',      cause:'Cấp sai nhãn'},
    {code:'PR-001',name:'In · thêu lệch vị trí',   cat:'In thêu',    sev:'Major',    loc:'Ngực trái',     cause:'Định vị khuôn sai'},
    {code:'PR-002',name:'Thêu thiếu mũi',          cat:'In thêu',    sev:'Minor',    loc:'Ngực trái',     cause:'Chương trình thêu'},
    {code:'IR-001',name:'Vết bẩn dầu máy',         cat:'Vệ sinh',    sev:'Major',    loc:'Toàn sản phẩm', cause:'Máy rỉ dầu'},
    {code:'IR-002',name:'Là ép bị bóng',           cat:'Hoàn thiện', sev:'Major',    loc:'Thân trước',    cause:'Nhiệt là quá cao'},
    {code:'SZ-001',name:'Sai thông số kích cỡ',    cat:'Đo lường',   sev:'Critical', loc:'Vòng ngực',     cause:'Rập · cắt sai'},
  ];
  // [ten truong, khoa dich] -- dung chung cho bang Cai Dat va bang chon ly do loi
  DEFECT_COLS=[['code','dfCode'],['name','dfName'],['cat','dfCat'],['sev','dfSev'],['loc','dfLoc'],['cause','dfCause']];
  initDefects(){ return this.DEFECT_DEF.map((r,i)=>({id:'f'+(i+1),...r})); }
  // Array.isArray (khong phai l&&l.length) -- xoa het dong phai GIU bang rong,
  // khong duoc hoi sinh danh muc mac dinh.
  defects(){ const l=this.state.dsoDefects; return Array.isArray(l)?l:this.initDefects(); }
  setDefects(fn){ this.setState(s=>({dsoDefects:fn(Array.isArray(s.dsoDefects)?s.dsoDefects:this.initDefects())})); }
  dfSet(id,patch){ this.setDefects(l=>l.map(r=>r.id===id?{...r,...patch}:r)); }
  dfAddRow(){ this.setDefects(l=>{ const id=this.mtNextId(l,'f'); this._dfNew=id;
      return [...l,{id,code:'',name:'',cat:'',sev:'',loc:'',cause:''}]; });
    // xoa tu khoa tim: dong rong khong khop tu khoa nao nen se bi an mat
    setTimeout(()=>{ if(this._mounted&&this._dfNew) this.set({dfEdit:this._dfNew,dfQ:''}); },0); }
  dfDelRow(id){ this.setDefects(l=>l.filter(r=>r.id!==id));
    this.setState(s=>({dfEdit:s.dfEdit===id?null:s.dfEdit})); }
  dfDone(id){ const r=this.defects().find(x=>x.id===id);
    if(r){ const p={}; this.DEFECT_COLS.forEach(([f])=>{ p[f]=String(r[f]||'').replace(/\s+/g,' ').trim(); });
      this.dfSet(id,p); }
    this.set({dfEdit:null}); }
  // Tim khong dau: go 'loi chi' van khop 'Lỗi chỉ'. Moi tu deu phai khop (AND).
  dfMatch(r,q){ const k=this.dfFold(q); if(!k) return true;
    const hay=this.dfFold(this.DEFECT_COLS.map(([f])=>r[f]||'').join(' '));
    return k.split(/\s+/).every(w=>hay.indexOf(w)>=0); }
  dfList(q){ return this.defects().filter(r=>this.dfMatch(r,q)); }
  // Muc do la chu tu do -> bat ca tieng Viet lan tieng Anh; khong khop thi chip xam
  dfSevChip(sev){ const C=this.C, s=this.dfFold(sev);
    if(!s) return null;
    if(/critical|nghiem|nang/.test(s)) return {fg:'#a3271b',bg:'#fdecea',bd:'#eccfca'};
    if(/major|lon|trung/.test(s))      return {fg:'#946200',bg:'#fdf5e3',bd:'#ecdcb4'};
    if(/minor|nhe|thap/.test(s))       return {fg:'#2f7d32',bg:'#e6f2e2',bd:'#cfe3b4'};
    return {fg:C.sub,bg:'#f2f4ee',bd:C.border}; }
  // Thong bao inline (khong dung window.alert -- dialog cua browser chan het tuong tac)
  dfSay(msg){ clearTimeout(this._dfT); this.set({dfMsg:msg});
    this._dfT=setTimeout(()=>{ if(this._mounted) this.set({dfMsg:''}); },4000); }
  // Doc header linh dong (VI hoac EN). Khong thay header -> doc 6 cot dau theo dung thu tu.
  dfParse(aoa){
    const n=s=>this.dfFold(s).replace(/\s+/g,' ');
    const PAT=[['code',/(ma loi|defect code|\bcode\b|\bma\b)/],['name',/(ten loi|defect name|\bname\b|\bten\b)/],
      ['cat',/(nhom|phan loai|category|\btype\b)/],['sev',/(muc do|nghiem trong|severity|\blevel\b)/],
      ['loc',/(vi tri|defect location|location|position)/],['cause',/(nguyen nhan|root cause|\bcause\b|reason)/]];
    let hi=-1, map={};
    for(let i=0;i<Math.min((aoa||[]).length,10);i++){ const r=aoa[i]||[], m={};
      r.forEach((c,j)=>{ const v=n(c); if(!v) return;
        PAT.forEach(([f,re])=>{ if(m[f]==null&&re.test(v)) m[f]=j; }); });
      if(m.code!=null||m.name!=null){ hi=i; map=m; break; } }
    const out=[], start=hi>=0?hi+1:0;
    const txt=v=>String(v==null?'':v).replace(/\s+/g,' ').trim();
    for(let i=start;i<(aoa||[]).length;i++){ const r=aoa[i]||[];
      const g=(f,pos)=>txt(hi>=0?(map[f]!=null?r[map[f]]:''):r[pos]);
      const row={code:g('code',0),name:g('name',1),cat:g('cat',2),sev:g('sev',3),loc:g('loc',4),cause:g('cause',5)};
      if(!row.code&&!row.name) continue;      // dong trong / dong ke chan
      out.push(row); }
    return out; }
  async dfImport(file){
    if(!file) return;
    const X=window.XLSX; if(!X||!X.read){ this.dfSay(this.t('mtNoXlsx')); return; }
    try{
      const buf=await file.arrayBuffer();
      const wb=X.read(new Uint8Array(buf),{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const got=this.dfParse(X.utils.sheet_to_json(ws,{header:1,blankrows:false}));
      if(!got.length){ this.dfSay(this.t('mtImportNone')); return; }
      this.setDefects(l=>{ let n=0; l.forEach(x=>{ const m=String(x.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); });
        return [...l,...got.map((g,i)=>({...g,id:'f'+(n+1+i)}))]; });
      this.set({dfQ:''});                     // dong vua nhap phai nhin thay ngay
      this.dfSay(this.t('mtImportOk')+' '+got.length+' '+this.t('mtImportRows'));
    }catch(e){ this.dfSay(this.t('mtImportErr')); } }

  // O tim dung chung: bang Cai Dat (nho) va hop chon ly do loi (to, tu focus)
  renderDefectLib(){
    const h=React.createElement, C=this.C; const S=this.mtStyles();
    const q=this.state.dfQ||'', all=this.defects(), rows=this.dfList(q);
    const action=h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
      this.state.dfMsg?h('span',{style:{fontSize:11.5,fontWeight:600,color:C.primary,background:C.tint,
        border:'1px solid '+C.border,borderRadius:99,padding:'4px 10px',whiteSpace:'nowrap'}},this.state.dfMsg):null,
      h('span',{style:{fontSize:11.5,fontWeight:700,fontFamily:S.mono,color:C.dark,background:C.tint,
        border:'1px solid '+C.border,borderRadius:999,padding:'4px 10px',whiteSpace:'nowrap'}},
        this.fmt(all.length)+' '+this.t('dfCount')),
      this.dfSearchBox(q,v=>this.set({dfQ:v}),false),
      h('label',{title:this.t('dfImportTip'),style:{...this.btn('ghost'),padding:'6px 12px',fontSize:12,cursor:'pointer'}},
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M12 3v12M8 11l4 4 4-4'}),h('path',{d:'M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2'})),
        this.t('mtImport'),
        h('input',{type:'file',accept:'.xlsx,.xls,.csv',style:{display:'none'},
          onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) this.dfImport(f); }})));
    const body=rows.map((r,i)=>{
      const ed=this.state.dfEdit===r.id, bg=i%2?'#f7f9f3':C.white;
      const cell=(f,useMono)=>{ const k=(this.DEFECT_COLS.find(x=>x[0]===f)||[])[1];
        return ed
          ? h('input',{value:r[f]==null?'':r[f],placeholder:this.t(k),
              onChange:e=>this.dfSet(r.id,{[f]:e.target.value}),
              style:{...S.inp,...(useMono?{}:{fontFamily:'inherit'})}})
          : (String(r[f]||'').trim()||'\u2014'); };
      const sv=this.dfSevChip(r.sev);
      return h('tr',{key:r.id},
        h('td',{style:{...S.td,background:bg,textAlign:'center',fontFamily:S.mono,color:C.faint,fontWeight:600}},i+1),
        h('td',{style:{...S.td,background:bg,fontFamily:S.mono,fontWeight:700,color:C.primary,
          whiteSpace:ed?'normal':'nowrap'}},cell('code',true)),
        h('td',{style:{...S.td,background:bg,fontWeight:600,wordBreak:'break-word'}},cell('name')),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},cell('cat')),
        h('td',{style:{...S.td,background:bg}}, ed?cell('sev')
          :(sv?h('span',{style:{fontSize:11,fontWeight:700,color:sv.fg,background:sv.bg,border:'1px solid '+sv.bd,
                borderRadius:999,padding:'3px 9px',whiteSpace:'nowrap'}},String(r.sev).trim())
             :h('span',{style:{color:C.faint}},'\u2014'))),
        h('td',{style:{...S.td,background:bg,wordBreak:'break-word'}},cell('loc')),
        h('td',{style:{...S.td,background:bg,color:C.sub,wordBreak:'break-word'}},cell('cause')),
        h('td',{style:{...S.td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6}},
            ed?this.mtBtn(this.t('lsDone'),()=>this.dfDone(r.id),{border:'1px solid '+C.primary,background:C.tint})
              :this.mtBtn(this.t('lsEdit'),()=>this.set({dfEdit:r.id})),
            this.mtBtn(this.t('mtDel'),()=>this.dfDelRow(r.id),{color:'#c0392b',borderColor:'#eccfca'}))));
    });
    const tbl=h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1140px',borderCollapse:'collapse'}},
        h('colgroup',null,h('col',{style:{width:'52px'}}),h('col',{style:{width:'11%'}}),
          h('col',{style:{width:'19%'}}),h('col',{style:{width:'12%'}}),h('col',{style:{width:'10%'}}),
          h('col',{style:{width:'15%'}}),h('col',{style:{width:'19%'}}),h('col',{style:{width:'130px'}})),
        h('thead',null,h('tr',null,
          h('th',{style:{...S.th,textAlign:'center',paddingLeft:8}},this.t('mtNo')),
          ...this.DEFECT_COLS.map(([f,k])=>h('th',{key:f,style:S.th},this.t(k))),
          h('th',{style:{...S.th,borderRight:'none'}},this.t('mtAct')))),
        h('tbody',null, rows.length?body:h('tr',null,h('td',{colSpan:8,
          style:{...S.td,textAlign:'center',color:C.faint,padding:'38px 16px',borderRight:'none'}},
          this.t(all.length?'dfNoHit':'dfEmpty'))))));
    const bodyEl=h('div',null, tbl,
      h('div',{style:{padding:'11px 13px',borderTop:'1px solid '+C.line}},
        this.mtBtn('+ '+this.t('dfAdd'),()=>this.dfAddRow(),{color:C.primary,borderColor:C.border})));
    return this.dsoCard('dfPanel','dfSub','DSO Defect Library',bodyEl,{full:true,action});
  }

  // ==== Bam LOI o trang chuyen -> bang chon ly do =========================
  // Nut DAT / LOI da nam san tren trang chuyen, nen hop nay chi con mot buoc:
  // chon ly do loi. dsoTap luon o stage 'fail'.
  dsoTapClose(){ this.set({dsoTap:null,dsoTapQ:''}); }
  // Hang loi ghi theo (ngay, chuyen, style, PO, mau, size) + ma loi -> dem duoc
  // ca so luong loi va loi nao hay gap. KHONG cong vao san luong hoan thanh.
  // Doc new Date() MOT lan roi dung chung cho ca khoa ngay lan moc gio: doc 2
  // lan, bam dung luc doi ngay -> so luong vao ngay nay ma moc gio vao ngay kia.
  // Moc HH:MM ghi song song sang dsoDefTime theo khoa (o size + ma loi) --
  // dsoDefLog GIU NGUYEN hinh dang so dem nen may dang co du lieu cu van doc duoc.
  dsoDefTake(c,d){ const now=new Date(), k=this.dsoDoneKey(c,this.psFmtD(now)), at=this.dsoHM(now);
    const code=String(d.code||'').trim()||String(d.name||'').trim()||'?';
    const who=this.dsoOpOf(c.line).replace(/\s+/g,' ').trim();
    this.setState(st=>{ const m={...(st.dsoDefLog||{})}, cur={...(m[k]||{})};
      cur[code]=(Number(cur[code])||0)+1; m[k]=cur;
      const tm={...(st.dsoDefTime||{})}, tk=k+'|'+code;
      tm[tk]=(tm[tk]||[]).concat(at);
      // Ten cong nhan ghi song song, CUNG khoa va CUNG chieu dai voi dsoDefTime
      // (ke ca khi bo trong) -- nho vay xep hang Top 3 cong nhan chi con la dem.
      const wm={...(st.dsoDefWho||{})};
      wm[tk]=(wm[tk]||[]).concat(who);
      return {dsoDefLog:m,dsoDefTime:tm,dsoDefWho:wm,dsoTap:null,dsoTapQ:''}; }); }
  // Tong luy ke moi ngay, giong dsoDoneOf
  dsoDefOf(c){ const m=this.state.dsoDefLog||{};
    const tail='|'+c.line+'|'+c.style+'|'+c.po+'|'+c.color+'|'+c.size;
    let n=0; Object.keys(m).forEach(k=>{ if(k.slice(-tail.length)!==tail) return;
      const o=m[k]||{}; Object.keys(o).forEach(x=>{ n+=Number(o[x])||0; }); });
    return n; }

  // Buoc 1: 2 nut lon PASS / FAIL. Buoc 2: bang ly do loi lay tu Thu Vien Loi
  // (Cai Dat · Thu Vien Loi) kem o tim. Ve tu renderDsoLineDetail nen khong
  // phai them slot moi vao shell(), giong renderDsoHandAsk.
  renderDsoTap(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const t=this.state.dsoTap; if(!t||!t.c) return null;
    const c=t.c, S=this.mtStyles();
    const close=()=>this.dsoTapClose();
    const done=this.dsoDoneOf(c), nf=this.dsoDefOf(c);
    const chip=(label,val,col)=>h('div',{key:label,style:{minWidth:0}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,whiteSpace:'nowrap'}},label),
      h('div',{style:{fontSize:13,fontWeight:700,fontFamily:mono,color:col||C.ink,marginTop:2,
        wordBreak:'break-word'}},val||'\u2014'));
    // Dai thong tin: size to ben trai, cac truong con lai xep ngang -- cong nhan
    // phai thay ro dang dem cho size / PO / mau nao truoc khi bam.
    const info=h('div',{style:{display:'flex',alignItems:'center',gap:18,flexWrap:'wrap',flex:'none',
        padding:'14px 22px',background:C.tint2,borderBottom:'1px solid '+C.line}},
      h('div',{style:{flex:'none',display:'flex',alignItems:'baseline',gap:9}},
        h('span',{style:{fontSize:42,fontWeight:700,lineHeight:.95,letterSpacing:'-1.5px',color:C.ink}},c.size),
        h('span',{style:{fontSize:15,fontWeight:700,fontFamily:mono,
          color:c.need&&done>=c.need?'#2f7d32':C.sub}},this.fmt(done)+'/'+this.fmt(c.need))),
      h('div',{style:{flex:1,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(88px,1fr))',
          gap:14,minWidth:0}},
        chip(this.t('lsCol1'),c.line,C.primary),
        chip(this.t('lsCol2'),c.style),
        chip(this.t('dsoColPo'),c.po),
        chip(this.t('dsoColColor'),c.color,C.dark),
        nf?chip(this.t('dsoFail'),this.fmt(nf),'#a3271b'):null));
    const head=(titleKey,subKey,back)=>h('div',{style:{display:'flex',alignItems:'center',gap:12,flex:'none',
        padding:'15px 20px',borderBottom:'1px solid '+C.line}},
      back
        ? h('button',{onClick:close,
            style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:9,padding:'6px 12px',
              fontSize:12.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',flex:'none'},
            'style-hover':{background:C.tint}},this.t('dsoPickBack'))
        : h('div',{style:{width:36,height:36,borderRadius:10,background:C.tint,color:C.dark,flex:'none',
              display:'flex',alignItems:'center',justifyContent:'center'}},
            h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
              h('path',{d:'M9 11l3 3 8-8'}),
              h('path',{d:'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'}))),
      h('div',{style:{minWidth:0,marginRight:'auto'}},
        h('div',{style:{fontSize:16,fontWeight:700}},this.t(titleKey)),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:2}},this.t(subKey))),
      h('button',{title:this.t('dsoClose'),onClick:close,
        style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,height:30,
          flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,fontFamily:'inherit'},
        'style-hover':{background:C.tint}},'\u00d7'));
    // ---- Bang ly do loi + o tim -------------------------------------------
    // Mau nen dat o <tr> (khong o <td>) de :hover cua ca dong hien duoc.
    const q=this.state.dsoTapQ||'', all=this.defects(), rows=this.dfList(q);
    const sth={...S.th,position:'sticky',top:0,zIndex:1};
    const ctd={padding:'9px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,
      borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const txt=v=>String(v==null?'':v).trim()||'\u2014';
    const tblRows=rows.map((r,i)=>{ const sv=this.dfSevChip(r.sev);
      return h('tr',{key:r.id,onClick:()=>this.dsoDefTake(c,r),title:this.t('dsoPickSub'),
          style:{cursor:'pointer',background:i%2?'#f7f9f3':C.white},'style-hover':{background:C.tint}},
        h('td',{style:{...ctd,paddingLeft:20,fontFamily:mono,fontWeight:700,color:C.primary,
          whiteSpace:'nowrap'}},txt(r.code)),
        h('td',{style:{...ctd,fontWeight:600,wordBreak:'break-word'}},txt(r.name)),
        h('td',{style:{...ctd,wordBreak:'break-word'}},txt(r.cat)),
        h('td',{style:ctd}, sv
          ? h('span',{style:{fontSize:11,fontWeight:700,color:sv.fg,background:sv.bg,border:'1px solid '+sv.bd,
              borderRadius:999,padding:'3px 9px',whiteSpace:'nowrap'}},String(r.sev).trim())
          : h('span',{style:{color:C.faint}},'\u2014')),
        h('td',{style:{...ctd,wordBreak:'break-word'}},txt(r.loc)),
        h('td',{style:{...ctd,borderRight:'none',paddingRight:20,color:C.sub,
          wordBreak:'break-word'}},txt(r.cause))); });
    // O ten cong nhan: ghi kem vao hang loi sap chon -> Top 3 cong nhan o trang
    // chuyen xep hang tu day. Bo trong van ghi duoc, chi la khong quy duoc ai.
    const ops=this.dsoOpNames(), opId='dso-op-'+String(c.line||'').replace(/[^\w-]/g,'');
    const opBox=h('div',{title:this.t('dsoOperTip'),
        style:{flex:'none',display:'flex',alignItems:'center',gap:8,border:'1px solid '+C.border,
          borderRadius:9,background:C.white,padding:'0 10px',height:32}},
      h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:C.faint,strokeWidth:1.9,
          style:{flex:'none'}},
        h('circle',{cx:12,cy:8,r:3.4}),h('path',{d:'M4.5 20.5a7.5 7.5 0 0 1 15 0'})),
      h('input',{type:'text',value:this.dsoOpOf(c.line),list:ops.length?opId:undefined,
        placeholder:this.t('dsoOperPh'),onChange:e=>this.dsoOpSet(c.line,e.target.value),
        style:{width:186,border:'none',background:'none',padding:0,fontSize:12.5,fontWeight:600,
          fontFamily:'inherit',color:C.ink,outline:'none'}}),
      ops.length?h('datalist',{id:opId},ops.map(n=>h('option',{key:n,value:n}))):null);
    const search=h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',flex:'none',
        borderBottom:'1px solid '+C.line,background:'#fbfcf8',flexWrap:'wrap'}},
      this.dfSearchBox(q,v=>this.set({dsoTapQ:v}),true),
      opBox,
      h('span',{style:{flex:'none',fontSize:11.5,fontWeight:700,fontFamily:mono,color:C.faint,
        whiteSpace:'nowrap'}},this.fmt(rows.length)+' / '+this.fmt(all.length)));
    const table=h('div',{className:'yscroll',style:{overflow:'auto',flex:1,minHeight:130}},
      h('table',{style:{width:'100%',minWidth:'820px',borderCollapse:'collapse'}},
        h('thead',null,h('tr',null,
          h('th',{style:{...sth,paddingLeft:20}},this.t('dfCode')),
          h('th',{style:sth},this.t('dfName')),
          h('th',{style:sth},this.t('dfCat')),
          h('th',{style:sth},this.t('dfSev')),
          h('th',{style:sth},this.t('dfLoc')),
          h('th',{style:{...sth,borderRight:'none',paddingRight:20}},this.t('dfCause')))),
        h('tbody',null, rows.length?tblRows:h('tr',null,h('td',{colSpan:6,
          style:{...ctd,textAlign:'center',color:C.faint,padding:'44px 16px',borderRight:'none'}},
          this.t(all.length?'dfNoHit':'dsoDefEmpty'))))));
    const pick=h('div',{style:{display:'flex',flexDirection:'column',minHeight:0,flex:1}},
      head('dsoPick','dsoPickSub',true), info, search, table,
      h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',flex:'none',
          borderTop:'1px solid '+C.line,background:'#f8faf3'}},
        h('div',{style:{flex:1}}),
        h('button',{onClick:close,style:this.btn('ghost')},this.t('psCancel'))));
    return h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:85,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:'min(960px,96vw)',
          maxHeight:'92vh',display:'flex',flexDirection:'column',background:C.white,borderRadius:18,
          boxShadow:'0 30px 70px rgba(0,0,0,.34)',overflow:'hidden'}},
        pick));
  }

  renderDsoSettings(){
    const h=React.createElement; const sub=this.state.dsoSub||'line';
    // 3:7 theo chieu ngang -- flex-basis 0 nen ti le dung chinh xac, bang tu cuon ngang khi hep
    const mtype=h('div',{style:{display:'flex',gap:16,alignItems:'flex-start'}},
      h('div',{style:{flex:'3 1 0',minWidth:0}},this.renderMtypeTable()),
      h('div',{style:{flex:'7 1 0',minWidth:0}},this.renderMtypeDetail()));
    return h('div',null,
      this.tabBar(this.DSO_SUBS,sub,id=>this.set({dsoSub:id,edit:null,mtEdit:null,dfEdit:null,dfQ:''}),true),
      sub==='mtype'?mtype
      :sub==='defect'?this.renderDefectLib()
                   :this.dsoCard('dsoLinePanel','dsoLineSub','DSO Line Setting',this.renderLineSetting()));
  }
  // ---- Line Setting -------------------------------------------------------
  // Chuyen + Style sinh tu Ke hoach san xuat (qua Ke hoach may tuan) -> chi doc.
  // Cac gia tri cau hinh khoa theo chuyen+style, KHONG theo tuan (day la bang master).
  // ==== Loại M-level: bảng danh mục (trái) + bảng chi tiết theo loại (phải) ====
  MTYPE_DEF=[{id:'m1',name:'1',desc:''},{id:'m2',name:'2',desc:''},{id:'m3',name:'3',desc:''}];
  mtypes(){ const t=this.state.dsoMtypeRows; return (t&&t.length)?t:this.MTYPE_DEF; }
  mtSelId(){ const l=this.mtypes(), s=this.state.mtSel;
    return (s&&l.some(m=>m.id===s))?s:(l.length?l[0].id:null); }
  mtDet(id){ return ((this.state.dsoMtypeDet||{})[id])||[]; }
  mtNextId(list,pre){ let n=0; (list||[]).forEach(x=>{ const m=String(x.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); }); return pre+(n+1); }
  setMtypes(fn){ this.setState(s=>{ const cur=(s.dsoMtypeRows&&s.dsoMtypeRows.length)?s.dsoMtypeRows:this.MTYPE_DEF;
    return {dsoMtypeRows:fn(cur)}; }); }
  setMtDet(id,fn){ this.setState(s=>{ const d={...(s.dsoMtypeDet||{})}; d[id]=fn(d[id]||[]); return {dsoMtypeDet:d}; }); }
  mtSetType(id,patch){ this.setMtypes(l=>l.map(m=>m.id===id?{...m,...patch}:m)); }
  mtAddType(){ this.setMtypes(l=>{ const id=this.mtNextId(l,'m');
    this._mtNew=id; return [...l,{id,name:'',desc:''}]; });
    setTimeout(()=>{ if(this._mounted&&this._mtNew) this.set({mtEdit:'t:'+this._mtNew,mtSel:this._mtNew}); },0); }
  mtDelType(id){ this.setState(s=>{ const d={...(s.dsoMtypeDet||{})}; delete d[id];
    const cur=(s.dsoMtypeRows&&s.dsoMtypeRows.length)?s.dsoMtypeRows:this.MTYPE_DEF;
    return {dsoMtypeRows:cur.filter(m=>m.id!==id),dsoMtypeDet:d,mtEdit:null,mtSel:s.mtSel===id?null:s.mtSel}; }); }
  mtSetDet(tid,did,patch){ this.setMtDet(tid,l=>l.map(x=>x.id===did?{...x,...patch}:x)); }
  mtAddDet(tid){ const id=this.mtNextId(this.mtDet(tid),'d');
    this.setMtDet(tid,l=>[...l,{id,name:'',tgt:'',inc:''}]);
    setTimeout(()=>{ if(this._mounted) this.set({mtEdit:'d:'+tid+':'+id}); },0); }
  mtDelDet(tid,did){ this.setMtDet(tid,l=>l.filter(x=>x.id!==did)); this.set({mtEdit:null}); }
  // Thu nhap: khong am (dau '-' bi loai luon vi khong nam trong [0-9.]), toi da 3 chu so thap phan.
  // Giu nguyen dang chuoi khi dang nhap de con go duoc dau '.' o giua -- giong lsDec1.
  mtMoney(v){ const s=String(v==null?'':v).replace(/[^0-9.]/g,''); const p=s.split('.');
    return p.length>1?p[0]+'.'+p.slice(1).join('').slice(0,3):p[0]; }
  // Bam Xong: don '.' bi bo lung ('4500.' -> '4500') va '.5' -> '0.5'
  mtMoneyFix(v){ let s=this.mtMoney(v);
    if(!/[0-9]/.test(s)) return '';              // chi co dau '.' hoac rong -> de trong
    if(s.charAt(0)==='.') s='0'+s;
    if(s.charAt(s.length-1)==='.') s=s.slice(0,-1);
    return s; }
  // Import: o Excel dang SO -> lay dung gia tri (lam tron 3 chu so thap phan).
  // O dang CHU -> '.'/',' coi la phan cach nghin (3.200.000), giu nguyen hanh vi cu.
  mtMoneyImp(v){ if(typeof v==='number'){ if(!isFinite(v)||v<0) return '';
      return String(Math.round(v*1000)/1000); }
    const n=parseInt(String(v==null?'':v).replace(/[^0-9]/g,''),10); return isNaN(n)?'':String(Math.max(0,n)); }
  // Import %Target cua BAC M. O Excel/CSV dinh dang PHAN TRAM tra ve PHAN SO:
  // 120% -> so 1.2, 60% -> 0.6. Truoc day dung lsPct: dau '.' bi XOA (1.2 -> 12)
  // roi con bi kep tran 100 -> target tren board M-level sai dung 10 lan.
  // disp = chuoi hien thi cua dung o do (raw:false), vd '120%' hay '130'.
  // Tran 999 theo mtPct, KHONG kep 100 -- bac M cao thuong vuot 100%.
  mtPctImp(v,disp){
    if(typeof v==='number'){ if(!isFinite(v)||v<0) return '';
      // Co '%' -> chac chan la phan so. So le nho (0.85) cung la phan so:
      // khong bac M nao dat muc 0.85%, con 85% thi rat thuong.
      const fr=/%/.test(String(disp==null?'':disp))||(v>0&&v<5&&v!==Math.floor(v));
      return this.mtPct(String(Math.round(fr?v*100:v))); }
    // O dang CHU: '120%' da la phan tram san, chi '0.85' moi phai nhan 100.
    const s=String(v==null?'':v), n=parseFloat(s.replace(/,/g,'.').replace(/[^0-9.]/g,''));
    if(!isFinite(n)||n<0) return '';
    const fr=!/%/.test(s)&&n>0&&n<5&&n!==Math.floor(n);
    return this.mtPct(String(Math.round(fr?n*100:n))); }
  mtMoneyFmt(v){ if(v===''||v==null) return '—';
    const s=String(v), i=s.indexOf('.');
    const g=(Number(i>=0?s.slice(0,i):s)||0).toLocaleString('en-US');
    const dec=i>=0?s.slice(i+1):'';
    return dec?g+'.'+dec:g; }
  mtDetDone(tid,did){ const r=this.mtDet(tid).find(x=>x.id===did);
    if(r) this.mtSetDet(tid,did,{inc:this.mtMoneyFix(r.inc)});
    this.set({mtEdit:null}); }
  // Thong bao inline, khong dung window.alert (dialog cua browser chan het tuong tac)
  mtSay(msg){ clearTimeout(this._mtT); this.set({mtMsg:msg});
    this._mtT=setTimeout(()=>{ if(this._mounted) this.set({mtMsg:''}); },4000); }
  // Doc header linh dong; khong co header thi doc theo vi tri No / Ten / %Target / Thu nhap
  // dsp = CUNG sheet do nhung doc dang chuoi hien thi (raw:false). Chi dung de
  // biet o %Target co dinh dang phan tram hay khong -- xem mtPctImp.
  mtParse(aoa,dsp){
    const norm=s=>String(s==null?'':s).toLowerCase().replace(/\s+/g,' ').trim();
    let hi=-1, map={};
    for(let i=0;i<Math.min((aoa||[]).length,10);i++){ const r=aoa[i]||[], m={};
      r.forEach((c,j)=>{ const v=norm(c); if(!v) return;
        if(m.name==null&&/\b(tên|ten|name)\b/.test(v)) m.name=j;
        else if(m.tgt==null&&/target/.test(v)) m.tgt=j;
        else if(m.inc==null&&/(thu nhập|thu nhap|income|vnd)/.test(v)) m.inc=j; });
      if(m.name!=null){ hi=i; map=m; break; } }
    const out=[], start=hi>=0?hi+1:0, useMap=hi>=0;
    // Giu CHI SO COT (tj/ij) chu khong giu gia tri: con phai doc dung o do trong dsp.
    for(let i=start;i<(aoa||[]).length;i++){ const r=aoa[i]||[], dr=((dsp||[])[i])||[];
      let name,tj,ij;
      if(useMap){ name=r[map.name]; tj=map.tgt!=null?map.tgt:-1; ij=map.inc!=null?map.inc:-1; }
      else if(r.length>=4){ name=r[1]; tj=2; ij=3; }
      else { name=r[0]; tj=1; ij=2; }
      const nm=String(name==null?'':name).trim();
      if(!nm) continue;
      out.push({name:nm,tgt:this.mtPctImp(tj>=0?r[tj]:'',tj>=0?dr[tj]:''),
        inc:this.mtMoneyImp(ij>=0?r[ij]:'')}); }
    return out; }
  async mtImport(file){
    const tid=this.mtSelId(); if(!tid||!file) return;
    const X=window.XLSX; if(!X||!X.read){ this.mtSay(this.t('mtNoXlsx')); return; }
    try{
      const buf=await file.arrayBuffer();
      const wb=X.read(new Uint8Array(buf),{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      // Doc 2 lan cung 1 sheet: gia tri thuc (raw) + chuoi hien thi (raw:false).
      // O %Target dinh dang phan tram cho ra 1.2 chu khong phai 120, phai co
      // chuoi '120%' moi biet duong ma nhan lai 100 (mtPctImp).
      const jopt={header:1,blankrows:false};
      const got=this.mtParse(X.utils.sheet_to_json(ws,jopt),
        X.utils.sheet_to_json(ws,{...jopt,raw:false}));
      if(!got.length){ this.mtSay(this.t('mtImportNone')); return; }
      this.setMtDet(tid,l=>{ let n=0; l.forEach(x=>{ const m=String(x.id).match(/(\d+)$/); if(m) n=Math.max(n,Number(m[1])); });
        return [...l,...got.map((g,i)=>({...g,id:'d'+(n+1+i)}))]; });
      this.mtSay(this.t('mtImportOk')+' '+got.length+' '+this.t('mtImportRows'));
    }catch(e){ this.mtSay(this.t('mtImportErr')); } }
  lsKey(r){ return this.normName(r.line)+'|'+String(r.style||''); }
  LS_DEF={w:26,hrs:'9.5',tgt:100};
  // SMV mac dinh: "random" 50..120 nhung SUY RA TU KHOA DONG, khong dung Math.random().
  // Random that se cho so khac nhau moi lan re-render, keo Type nhay theo -> khong dung duoc.
  lsSeedSmv(k){ let h=2166136261;
    for(let i=0;i<k.length;i++){ h^=k.charCodeAt(i); h=Math.imul(h,16777619); }
    return 50+(Math.abs(h)%71); }
  lsGet(r){ const k=this.lsKey(r);
    return {...this.LS_DEF,smv:this.lsSeedSmv(k),...((this.state.lset||{})[k]||{})}; }
  // Type suy ra tu SMV, khong sua tay: >100 -> loai 1, 60<smv<=100 -> loai 2, <=60 -> loai 3.
  lsTypeIdx(smv){ if(smv===''||smv==null) return 0; const n=Number(smv);
    if(!isFinite(n)) return 0; return n>100?1:(n>60?2:3); }
  // Tra ve dung '1'/'2'/'3' theo rule (bac suy tu SMV, khong phai vi tri dong).
  lsType(r){ const i=this.lsTypeIdx(this.lsGet(r).smv); return i?String(i):''; }
  // Dong trong DANH MUC M-level ung voi chuyen. Ba buoc, tu chac den lo:
  //   ten dung bang '1'/'2'/'3'  ->  ten co chua chu so do ('M1','Loai 1')  ->  vi tri.
  // Chi khop ten tuyet doi la doi ten danh muc mot cai board trong tron ngay.
  mtypeOf(r){ const i=this.lsTypeIdx(this.lsGet(r).smv); if(!i) return null;
    const list=this.mtypes()||[]; if(!list.length) return null;
    const s=String(i), dg=x=>String(x==null?'':x).replace(/[^0-9]/g,'');
    return list.find(m=>String(m.name||'').trim()===s)
        || list.find(m=>dg(m.name)===s)
        || list[i-1] || null; }
  // Nhan hien o cot LOAI: TEN trong danh muc, de doi chieu duoc voi man M-level.
  lsTypeLabel(r){ const m=this.mtypeOf(r);
    const nm=m?String(m.name||'').trim():''; return nm||this.lsType(r); }
  lsSet(r,patch){ const k=this.lsKey(r);
    this.setState(st=>({lset:{...(st.lset||{}),[k]:{...((st.lset||{})[k]||{}),...patch}}})); }
  // %Target cua BAC M-level: KHONG kep 100 nhu cot %Target cua chuyen -- bac M
  // cao thuong vuot 100% hieu suat. Van la so nguyen khong am, tran 999.
  mtPct(v){ const n=parseInt(String(v).replace(/[^0-9]/g,''),10);
    return isNaN(n)?'':Math.max(0,Math.min(999,n)); }
  // %target: so nguyen 0..100, khong am, khong thap phan
  lsPct(v){ const n=parseInt(String(v).replace(/[^0-9]/g,''),10); return isNaN(n)?'':Math.max(0,Math.min(100,n)); }
  lsNum(v){ const n=parseInt(String(v).replace(/[^0-9]/g,''),10); return isNaN(n)?'':Math.max(0,n); }
  // Khong am, toi da 1 chu so thap phan -- dung cho ca Gio lam va SMV.
  // Bo dau '-' va ky tu la (khong nam trong [0-9.]), giu dau '.' dau tien.
  // Tra ve CHUOI de con go duoc trang thai trung gian '9.'
  // Doi ',' -> '.' truoc khi loc: ban go tieng Viet hay dung dau phay lam dau
  // thap phan; khong doi thi '95,5' thanh '955' (nhay han sang loai 1) khong ai biet.
  lsDec1(v){ const s=String(v==null?'':v).replace(/,/g,'.').replace(/[^0-9.]/g,''); const p=s.split('.');
    return p.length>1?p[0]+'.'+p.slice(1).join('').slice(0,1):p[0]; }
  // Don dau vao con do dang: '9.' -> '9', '.5' -> '0.5', chi co '.' -> de trong
  lsDec1Fix(v){ let s=this.lsDec1(v);
    if(!/[0-9]/.test(s)) return '';
    if(s.charAt(0)==='.') s='0'+s;
    if(s.charAt(s.length-1)==='.') s=s.slice(0,-1);
    return s; }
  // Bam Xong: don ca 2 cot thap phan. Chi sua o da go tay (kieu string) --
  // SMV chua sua la SO tu lsSeedSmv, khong duoc bien thanh chuoi o day.
  lsDone(r){ const v=this.lsGet(r), p={};
    ['hrs','smv'].forEach(f=>{ if(typeof v[f]!=='string') return;
      const s=this.lsDec1Fix(v[f]); if(s!==v[f]) p[f]=s; });
    if(Object.keys(p).length) this.lsSet(r,p);
    this.set({lsEdit:null}); }
  lsFileSize(n){ n=Number(n)||0; return n<1024?n+' B':(n<1048576?(n/1024).toFixed(0)+' KB':(n/1048576).toFixed(1)+' MB'); }
  async lsImport(r,file){ if(!file) return;
    const k=this.lsKey(r);
    try{ await this.mlvPut(k,file);
      this.lsSet(r,{file:{name:file.name,size:file.size,at:Date.now()}}); }
    catch(e){ window.alert(this.t('lsFileErr')); } }
  async lsFileDel(r){ const k=this.lsKey(r);
    try{ await this.mlvDel(k); }catch(e){}
    this.lsSet(r,{file:null}); }

  // 1 card / 1 CHUYEN. Mot chuyen chay nhieu style -> Line Setting co nhieu dong
  // nhung van chi 1 card; uu tien dong da duoc cau hinh that.
  prodLines(){ const by={}, order=[], stored=this.state.lset||{};
    this.getWeek().rows.forEach(r=>{ const n=this.normName(r.line);
      if(!by[n]){ by[n]=[]; order.push(n); } by[n].push(r); });
    return order.map(n=>{ const rows=by[n];
      const pick=rows.find(r=>stored[this.lsKey(r)])||rows[0];
      return {line:n,cfg:this.lsGet(pick)}; }); }

  // ---- Detail 1 chuyen: 1 card / (Size x PO x Mau) ----------------------
  // Nguon: don dang chay cua chuyen trong Ke hoach san xuat -> psPlan(o) ra
  // tac nghiep cat -> section (mau vai, bo 'aux') -> demand theo size.
  dsoSizeCards(line){ const out=[];
    this.psActiveOrders().forEach(o=>{
      if(this.normName(o.line)!==line) return;
      const pl=this.psPlan(o); if(!pl) return;
      const style=this.psCode(o.code);
      const po=this.orderPo(o,pl);
      (pl.sections||[]).forEach(sec=>{ if(sec.grp==='aux') return;
        (sec.demand||[]).forEach(([sz,qty])=>{ if(!(Number(qty)>0)) return;
          out.push({line,style,size:sz,need:Number(qty),po,color:sec.fab||'\u2014'}); }); }); });
    // xep theo thu tu size chuan roi den mau, dung thu tu trong file
    const oi=z=>{ const i=this.SORDER.indexOf(z); return i<0?99:i; };
    return out.sort((a,b)=>oi(a.size)-oi(b.size)||String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color)));
  }
  dsoStyles(line){ const out=[];
    this.getWeek().rows.forEach(r=>{ if(this.normName(r.line)!==line) return;
      const st=r.style||''; if(st&&out.indexOf(st)<0) out.push(st); });
    return out; }
  dsoRowKey(c,day){ return [day||this.dsoToday(),c.line,c.style,c.po,c.color].join('|'); }
  dsoDoneKey(c,day){ return this.dsoRowKey(c,day)+'|'+c.size; }
  // Card size hien TONG luy ke -> cong het moi ngay
  dsoDoneOf(c){ const m=this.state.dsoDone||{}; const tail='|'+c.line+'|'+c.style+'|'+c.po+'|'+c.color+'|'+c.size;
    let n=0; Object.keys(m).forEach(k=>{ if(k.slice(-tail.length)===tail) n+=Number(m[k])||0; }); return n; }
  // 'HH:MM' -- NGAY da nam trong khoa nen moc chi can gio/phut
  dsoPassTimes(c,day){ const m=this.state.dsoPassLog||{}, out=[];
    const push=k=>(m[k]||[]).forEach(t=>out.push({day:k.split('|')[0],at:t}));
    if(day){ push(this.dsoDoneKey(c,day)); return out; }
    const tail='|'+c.line+'|'+c.style+'|'+c.po+'|'+c.color+'|'+c.size;
    Object.keys(m).sort().forEach(k=>{ if(k.slice(-tail.length)===tail) push(k); });
    return out; }
  // Chi ghi/sua san luong cua HOM NAY; so cua ngay truoc giu nguyen trong lich su
  // 1 lan bam ghi vao 2 so tay dung CHUNG mot khoa: so luong ngay (dsoDone) va
  // moc gio PASS tung san pham (dsoPassLog). Bang M-level lay SAN LUONG / GIO
  // tu chinh dsoPassLog -- khong con so tay thu ba de co the lech voi lich su.
  // Doc new Date() MOT lan roi dung chung: doc 2 lan, bam dung luc doi ngay ->
  // so luong vao ngay nay ma moc gio vao ngay kia.
  dsoBump(c,d){ const now=new Date(), day=this.psFmtD(now);
    const k=this.dsoDoneKey(c,day), at=this.dsoHM(now);
    this.setState(st=>{ const m={...(st.dsoDone||{})};
      const pv=Number(m[k])||0, nx=Math.max(0,pv+d), dd=nx-pv;
      m[k]=nx; if(!m[k]) delete m[k];
      // dd>0: moi san pham PASS them 1 moc HH:MM. dd<0 (bam nham): bo bot tu
      // cuoi -- moc bi xoa la lan bam gan nhat, dung voi y nghia 'tru 1 vua bam'.
      // Vi tru dung moc do nen cot gio cua no giam theo, khong phai cot gio hien tai.
      const pm={...(st.dsoPassLog||{})}, ls=(pm[k]||[]).slice();
      if(dd>0){ for(let i=0;i<dd;i++) ls.push(at); }
      else if(dd<0){ ls.length=Math.max(0,ls.length+dd); }
      if(ls.length) pm[k]=ls; else delete pm[k];
      return {dsoDone:m,dsoPassLog:pm}; }); }
  // Tong hop theo (ngay, style, PO, mau). Bo trong 'line' -> lay MOI chuyen,
  // day la duong dung cho bang tong hop o cap Daily Sewing Output sau nay.
  dsoHistory(line){ const m=this.state.dsoDone||{}, at={}, out=[];
    Object.keys(m).forEach(k=>{ const q=Number(m[k])||0; if(q<=0) return;
      const p=k.split('|'); if(p.length!==6) return;
      if(line&&p[1]!==line) return;
      const rk=p.slice(0,5).join('|');
      if(!at[rk]){ at[rk]={key:rk,day:p[0],line:p[1],style:p[2],po:p[3],color:p[4],qty:0,sizes:{}}; out.push(at[rk]); }
      at[rk].qty+=q; at[rk].sizes[p[5]]=(at[rk].sizes[p[5]]||0)+q; });
    return out.sort((a,b)=>String(b.day).localeCompare(String(a.day))
      ||String(a.line).localeCompare(String(b.line))||String(a.style).localeCompare(String(b.style))
      ||String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color))); }
  // ==== Da giao sang hoan thien =========================================
  // Giao theo SO LUONG chu khong con la co bat/tat:
  //   dsoHandQ  cung khoa voi dsoDone (ngay|chuyen|style|PO|mau|size) -> da giao bao nhieu
  //   dsoHand   moc gio 1 DONG duoc giao XONG (bang lich su van hien 'Da giao ...')
  //   dsoSlips  cac to phieu da phat hanh, de mo xem / in lai
  dsoHandQOf(k){ return Number((this.state.dsoHandQ||{})[k])||0; }
  // Con lai chua giao cua 1 dong lich su
  dsoRemain(row){ const o=row.sizes||{}, out={}; let n=0;
    Object.keys(o).forEach(z=>{ const q=(Number(o[z])||0)-this.dsoHandQOf(row.key+'|'+z);
      if(q>0){ out[z]=q; n+=q; } });
    return {sizes:out,qty:n}; }
  dsoHandedQty(row){ return Math.max(0,row.qty-this.dsoRemain(row).qty); }
  dsoHandAt(row){ return (this.state.dsoHand||{})[row.key]||0; }
  // Da DAT nhung chua giao het -- TAT CA cac ngay, khong chi hom nay
  dsoUnhanded(line){ return this.dsoHistory(line).filter(r=>this.dsoRemain(r).qty>0); }
  // Tat ca hang con cho giao trong pham vi dang xem, gop LAM MOT theo size.
  // Khong tach theo ma hang -- 1 lan nhap so luong la giao chung; ma hang \u00b7 PO \u00b7
  // mau nao thuc su di theo phieu thi doc ra tu phan bo ben duoi.
  dsoHandPool(line){ const rows=[], sizes={}; let qty=0;
    this.dsoUnhanded(line).forEach(r=>{ const rem=this.dsoRemain(r);
      rows.push({row:r,rem:rem.sizes});
      Object.keys(rem.sizes).forEach(z=>{ sizes[z]=(sizes[z]||0)+rem.sizes[z]; });
      qty+=rem.qty; });
    // ngay cu di truoc, cung ngay thi theo chuyen roi ma hang
    rows.sort((a,b)=>String(a.row.day).localeCompare(String(b.row.day))
      ||String(a.row.line).localeCompare(String(b.row.line))
      ||String(a.row.style).localeCompare(String(b.row.style)));
    const uniq=f=>{ const o=[]; rows.forEach(x=>{ const v=f(x.row); if(o.indexOf(v)<0) o.push(v); }); return o; };
    return {rows:rows,sizes:sizes,qty:qty,lines:uniq(r=>r.line).sort(),days:uniq(r=>r.day).sort()}; }
  // Chia so luong muon giao ve tung dong lich su: ngay cu di truoc (FIFO)
  dsoAlloc(pool,want){ const out=[], left={...(want||{})};
    (pool.rows||[]).forEach(({row,rem})=>{ const take={}; let n=0;
      Object.keys(rem).forEach(z=>{ const w=Math.max(0,Math.min(Number(left[z])||0,rem[z]));
        if(w>0){ take[z]=w; left[z]=(Number(left[z])||0)-w; n+=w; } });
      if(n) out.push({key:row.key,day:row.day,line:row.line,style:row.style,po:row.po,color:row.color,
        sizes:take,qty:n}); });
    return out; }

  // ---- To phieu ban giao (BG-YYYYMMDD-NNN) ------------------------------
  // So phieu chay theo ngay phat hanh; phieu chua chot lay so ke tiep cua hom nay.
  dsoHandedTot(style,po,color){ let n=0;
    this.dsoHistory(null).forEach(r=>{ if(r.style===style&&r.po===po&&r.color===color)
      n+=this.dsoHandedQty(r); });
    return n; }
  // Luy ke den to phieu nay -- chot lai luc phat hanh, phieu sau khong lam doi
  dsoRowSlipNew(row){ const rem=this.dsoRemain(row);
    return {id:'row|'+row.key,ts:0,style:row.style,po:row.po,color:row.color,line:row.line,
      dayTxt:this.dsoDay(row.day),sizes:rem.sizes,qty:rem.qty,
      alloc:[{key:row.key,day:row.day,line:row.line,sizes:rem.sizes,qty:rem.qty}]}; }
  // To phieu gan nhat da di qua dong nay -- bam badge 'Da giao' de xem / in lai.
  // Ban luu cu chi co moc gio, khong co phieu -> dung tam so lieu cua dong.
  dsoRowSlipLast(row){ const hit=this.dsoSlipList().filter(s=>(s.alloc||[]).some(a=>a.key===row.key));
    if(hit.length) return hit[hit.length-1];
    const at=this.dsoHandAt(row); if(!at) return null;
    return {id:'row|'+row.key,ts:at,style:row.style,po:row.po,color:row.color,line:row.line,
      dayTxt:this.dsoDay(row.day),sizes:row.sizes,qty:row.qty,
      alloc:[{key:row.key,day:row.day,line:row.line,sizes:row.sizes,qty:row.qty}]}; }
  // Phat hanh phieu: ghi so da giao vao so, danh dau dong nao da giao xong,
  // luu phieu lai roi mo chinh to phieu do ra.
  dsoSlipCommit(slip){ const ts=Date.now(), id='BG'+ts, day=this.dsoSlipDay(ts);
    const base={...slip,id:id,ts:ts,
      cum:slip.cum!=null?slip.cum:(this.dsoHandedTot(slip.style,slip.po,slip.color)+slip.qty)};
    delete base.back;
    this.setState(st=>{ const q={...(st.dsoHandQ||{})}, hd={...(st.dsoHand||{})}, done=st.dsoDone||{};
      // Cap so NGAY TRONG updater roi tang bo dem trong cung mot lan ghi:
      // hai lan phat hanh khong the ra cung so, va huy phieu khong tra so lai.
      const seq=this.dsoSlipSeqAt(st,day)+1;
      const rec={...base,no:'SF-'+day+'-'+String(seq).padStart(3,'0')};
      (rec.alloc||[]).forEach(a=>Object.keys(a.sizes||{}).forEach(z=>{
        const k=a.key+'|'+z; q[k]=(Number(q[k])||0)+(Number(a.sizes[z])||0); }));
      (rec.alloc||[]).forEach(a=>{ let full=true;
        Object.keys(done).forEach(k=>{ if(k.indexOf(a.key+'|')!==0) return;
          if((Number(q[k])||0)<(Number(done[k])||0)) full=false; });
        if(full&&!hd[a.key]) hd[a.key]=ts; });
      // ten da go o ban nhap chuyen sang so phieu chinh thuc
      const who={...(st.dsoHandWho||{})};
      if(slip.id&&slip.id!==id){ if(who[slip.id]) who[id]=who[slip.id]; delete who[slip.id]; }
      return {dsoHandQ:q,dsoHand:hd,dsoSlips:[...(st.dsoSlips||[]),rec],dsoHandWho:who,
        dsoSlipSeq:{...(st.dsoSlipSeq||{}),[day]:seq},
        dsoHandAsk:rec,dsoHandBulk:null}; });
    document.body.classList.add('bg-slip-open'); }
  // Huy 1 to phieu: tra lai so luong cho tat ca cac dong tren phieu
  dsoSlipVoid(id){ this.setState(st=>{ const list=st.dsoSlips||[];
    const s=list.find(x=>x.id===id); if(!s) return null;
    const q={...(st.dsoHandQ||{})}, hd={...(st.dsoHand||{})};
    (s.alloc||[]).forEach(a=>{ Object.keys(a.sizes||{}).forEach(z=>{ const k=a.key+'|'+z;
        const n=(Number(q[k])||0)-(Number(a.sizes[z])||0); if(n>0) q[k]=n; else delete q[k]; });
      delete hd[a.key]; });
    return {dsoHandQ:q,dsoHand:hd,dsoSlips:list.filter(x=>x.id!==id),dsoHandAsk:null}; });
    document.body.classList.remove('bg-slip-open'); }
  // Bo danh dau da giao o 1 dong: huy to phieu da di qua dong do
  dsoRowUndo(row){ const s=this.dsoRowSlipLast(row);
    if(s&&this.dsoSlipList().some(x=>x.id===s.id)) return this.dsoSlipVoid(s.id);
    this.setState(st=>{ const q={...(st.dsoHandQ||{})}, hd={...(st.dsoHand||{})};
      Object.keys(st.dsoDone||{}).forEach(k=>{ if(k.indexOf(row.key+'|')===0) delete q[k]; });
      delete hd[row.key]; return {dsoHandQ:q,dsoHand:hd}; }); }
  // Ten nguoi giao / nguoi nhan go tay tren phieu, luu theo tung to phieu
  dsoRowHit(r,q,extra){ const k=this.dfFold(q); if(!k) return true;
    const parts=[this.dsoDay(r.day),r.day,r.line,r.style,r.po,r.color];
    if(r.sizes) parts.push(Object.keys(r.sizes).join(' '));
    if(r.size) parts.push(r.size);
    if(extra) parts.push(extra);
    const hay=this.dfFold(parts.join(' '));
    return k.split(/\s+/).every(w=>hay.indexOf(w)>=0); }
  // Ten loi tra ve tu Thu Vien Loi theo ma. Sua ten trong thu vien thi lich su
  // doi theo -- thu vien la nguon su that duy nhat cho danh muc loi.
  dsoDefName(code){ const c=String(code||'').trim();
    const d=this.defects().find(x=>String(x.code||'').trim()===c);
    return d?String(d.name||'').trim():''; }
  // 1 dong = 1 (ngay, GIO, chuyen, style, PO, mau, size, ma loi). Bam nhieu lan
  // trong CUNG mot phut cho cung ma loi thi gop lai 1 dong voi so luong -- bang
  // van gon ma khong mat moc gio nao.
  // Ban ghi cu (truoc khi co dsoDefTime) khong co moc gio: phan con thieu do vao
  // 1 dong at:'' de tong so luong luon khop voi dsoDefLog.
  // Bo trong 'line' -> moi chuyen.
  dsoDefHistory(line){ const m=this.state.dsoDefLog||{}, tm=this.state.dsoDefTime||{}, out=[];
    const oi=z=>{ const i=this.SORDER.indexOf(z); return i<0?99:i; };
    Object.keys(m).forEach(k=>{ const p=k.split('|'); if(p.length!==6) return;
      if(line&&p[1]!==line) return;
      const o=m[k]||{};
      Object.keys(o).forEach(code=>{ let q=Number(o[code])||0; if(q<=0) return;
        const base={day:p[0],line:p[1],style:p[2],po:p[3],color:p[4],size:p[5],code:code};
        const ls=(tm[k+'|'+code]||[]).slice(0,q), by={}, ord=[];
        ls.forEach(at=>{ if(by[at]===undefined){ by[at]=0; ord.push(at); } by[at]++; });
        ord.forEach(at=>{ out.push({...base,key:k+'|'+code+'|'+at,at:at,qty:by[at]}); });
        q-=ls.length;
        if(q>0) out.push({...base,key:k+'|'+code+'|-',at:'',qty:q}); }); });
    return out.sort((a,b)=>String(b.day).localeCompare(String(a.day))
      ||String(b.at).localeCompare(String(a.at))
      ||String(a.line).localeCompare(String(b.line))||String(a.style).localeCompare(String(b.style))
      ||String(a.po).localeCompare(String(b.po))||String(a.color).localeCompare(String(b.color))
      ||oi(a.size)-oi(b.size)||String(a.code).localeCompare(String(b.code))); }

  // ==========================================================================
  // XUAT EXCEL LICH SU HANG LOI  ->  bao cao QC nhieu sheet
  // --------------------------------------------------------------------------
  // 7 sheet, dung ten va dung cot nhu file mau Endline_QC_MES_Report_Sample:
  //   01_Dashboard          KPI chung + bang theo chuyen  (+ bieu do cot)
  //   02_Line_Style_Report  1 dong / (chuyen, ma hang)
  //   03_Defect_Pareto      xep hang loi theo so luong     (+ bieu do cot)
  //   04_Hourly_Trend       theo khung gio san xuat        (+ bieu do duong)
  //   05_Rework_ReQC        CHUA CO NGUON -- app chua co luong sua hang/kiem lai
  //   06_QC_Performance     CHUA CO NGUON -- app chua ghi ten QC kiem hang
  //   07_QC_Detail          1 dong / 1 san pham NG
  //
  // Pham vi bao cao = cac NGAY co trong danh sach dang xem, giao voi chuyen dang
  // loc. Trong pham vi do lay TAT CA du lieu, KHONG qua o tim kiem: loc danh
  // sach la de chon ky bao cao, con so lieu giua cac sheet phai khop nhau.
  //
  // Cot khong co nguon trong app thi de trong (Rework, Reject, Bundle, QC) --
  // giu cot cho dung form, dien duoc ngay khi app ghi nhan them.
  QC_NAMES=['01_Dashboard','02_Line_Style_Report','03_Defect_Pareto','04_Hourly_Trend',
    '05_Rework_ReQC','06_QC_Performance','07_QC_Detail'];
  QC_TITLE='ENDLINE QC DASHBOARD – MES';
  QC_MARGINS={left:.75,right:.75,top:1,bottom:1,header:.5,footer:.5};
  QC_MAXDETAIL=5000;       // tran so dong sheet 07 cho khoi treo trinh duyet
  DEF_SLOTS=[['7:30-8:30',450],['8:30-9:30',510],['9:30-10:30',570],['10:30-12:00',630],
    ['13:00-14:00',780],['14:00-15:00',840],['15:00-16:00',900],['16:00-17:00',960],
    ['17:00-18:00',1020],['18:00-20:30',1080]];

  // Moc gio HH:MM -> ten khung gio. Roi vao khe nghi (12:00-13:00) hay muon hon
  // ca ca thi don ve khung gan nhat truoc do; '' = ban ghi cu khong co moc gio.
  dsoDefSlot(at){ const m=/^\s*(\d{1,2}):(\d{2})/.exec(String(at||''));
    if(!m) return '';
    const t=Number(m[1])*60+Number(m[2]); let nm=this.DEF_SLOTS[0][0];
    this.DEF_SLOTS.forEach(s=>{ if(t>=s[1]) nm=s[0]; });
    return nm; }
  // Thu Vien Loi la nguon duy nhat cho ten / nhom / vi tri cua ma loi.
  dsoDefRec(code){ const c=String(code||'').trim();
    return this.defects().find(x=>String(x.code||'').trim()===c)||null; }
  dsoDefLoc(code){ const d=this.dsoDefRec(code); return d?String(d.loc||'').trim():''; }
  dsoDefCat(code){ const d=this.dsoDefRec(code); return d?String(d.cat||'').trim():''; }

  // ---- Gom so lieu cho ca quyen bao cao trong 1 lan quet -------------------
  dsoQcData(line,rows){
    const NOT=this.t('dsoDefNoTime');
    const day={}, days=[];
    rows.forEach(r=>{ if(!day[r.day]){ day[r.day]=1; days.push(r.day); } });
    days.sort();
    const F={days:days,pass:0,fail:0,line:{},lineOrd:[],ls:{},lsOrd:[],
      code:{},codeOrd:[],slot:{},slotOrd:[],detail:[],detailAll:0};
    const gl=n=>{ if(!F.line[n]){ F.line[n]={line:n,pass:0,fail:0}; F.lineOrd.push(n); }
      return F.line[n]; };
    const gls=(n,st)=>{ const k=n+'|'+st;
      if(!F.ls[k]){ F.ls[k]={line:n,style:st,buyer:this.brandForStyle(st),pass:0,fail:0}; F.lsOrd.push(k); }
      return F.ls[k]; };
    const gsl=s=>{ if(!F.slot[s]) F.slot[s]={pass:0,fail:0}; return F.slot[s]; };

    // DAT -- moi san pham bam DAT de lai 1 moc HH:MM trong dsoPassLog.
    // Quet ca nhung chuyen chi co hang DAT ma khong co loi trong ky: khong the
    // bo, neu khong so DA KIEM se thieu va FPY bi tinh sai.
    const pm=this.state.dsoPassLog||{};
    Object.keys(pm).forEach(k=>{ const p=k.split('|');
      if(p.length!==6||!day[p[0]]||(line&&p[1]!==line)) return;
      (pm[k]||[]).forEach(t=>{ const s=this.dsoDefSlot(t)||NOT;
        F.pass++; gl(p[1]).pass++; gls(p[1],p[2]).pass++; gsl(s).pass++; }); });

    // LOI
    this.dsoDefHistory(line).forEach(r=>{ if(!day[r.day]) return;
      const q=Number(r.qty)||0; if(q<=0) return;
      const s=this.dsoDefSlot(r.at)||NOT, c=String(r.code||'');
      F.fail+=q; gl(r.line).fail+=q; gls(r.line,r.style).fail+=q; gsl(s).fail+=q;
      if(!F.code[c]){ F.code[c]={code:c,qty:0}; F.codeOrd.push(c); }
      F.code[c].qty+=q;
      F.detailAll+=q;
      // 1 dong = 1 san pham NG, dung nhu file mau (khong co cot so luong)
      for(let i=0;i<q&&F.detail.length<this.QC_MAXDETAIL;i++) F.detail.push(r); });

    F.lineOrd.sort(); F.lsOrd.sort();
    F.codeOrd.sort((a,b)=>F.code[b].qty-F.code[a].qty||String(a).localeCompare(String(b)));
    F.slotOrd=this.DEF_SLOTS.map(s=>s[0]);
    if(F.slot[NOT]) F.slotOrd.push(NOT);
    return F; }

  // ---- Dinh dang o theo file mau ------------------------------------------
  qcS(){ return this._qcS||(this._qcS={
    title:{font:{bold:true,sz:16},alignment:{vertical:'center'}},
    kpi:{font:{bold:true},fill:{patternType:'solid',fgColor:{rgb:'FFD9EAF7'}},
      alignment:{vertical:'center'}},
    head:{font:{bold:true,color:{rgb:'FFFFFFFF'}},fill:{patternType:'solid',fgColor:{rgb:'FF1F4E78'}},
      alignment:{vertical:'center'}},
    cell:{alignment:{vertical:'center'}} }); }
  xsCol(n){ let s='', i=Number(n); while(i>=0){ s=String.fromCharCode(65+(i%26))+s; i=Math.floor(i/26)-1; }
    return s; }
  // v: so | chuoi | {f:'cong thuc',v:gia tri da tinh}. pct -> dinh dang 0.0%.
  // O cong thuc van kem gia tri da tinh san: Excel tin o dem san va chi tinh lai
  // khi can, khong co no thi mo file ra thay 0 cho den luc bam tinh lai.
  qcCell(v,s,pct){ const o={s:s};
    if(v&&typeof v==='object'&&v.f!=null){ o.t='n'; o.f=v.f;
      o.v=(typeof v.v==='number'&&isFinite(v.v))?v.v:0; }
    else { o.t=(typeof v==='number')?'n':'s'; o.v=(v==null?'':v); }
    if(pct) o.z='0.0%';
    return o; }
  // Bang phang: dong 1 tieu de, tu dong 2 la du lieu. cd=[{w,pct}]
  qcTable(head,body,cd){ const ws={}, S=this.qcS();
    head.forEach((h,i)=>{ ws[this.xsCol(i)+'1']=this.qcCell(h,S.head); });
    body.forEach((row,r)=>row.forEach((v,i)=>{
      ws[this.xsCol(i)+(r+2)]=this.qcCell(v,S.cell,!!(cd[i]&&cd[i].pct)); }));
    ws['!ref']='A1:'+this.xsCol(head.length-1)+(body.length+1);
    ws['!cols']=cd.map(c=>({width:c.w}));
    ws['!margins']=this.QC_MARGINS;
    return ws; }

  // ---- 01_Dashboard: KPI + bang theo chuyen -------------------------------
  qcDash(F){ const ws={}, S=this.qcS(), insp=F.pass+F.fail;
    const put=(c,r,v,s,pct)=>{ ws[this.xsCol(c)+r]=this.qcCell(v,s,pct); };
    put(0,1,this.QC_TITLE,S.title);
    for(let c=1;c<=7;c++) put(c,1,'',S.title);
    // FPY / DHU de cong thuc nhu file mau -> sua so o tren la ty le chay theo
    const KPI=[['Total Inspected',insp,false],['Pass',F.pass,false],['Defect Qty',F.fail,false],
      ['FPY',{f:'IFERROR(B4/B3,0)',v:insp?F.pass/insp:0},true],
      ['DHU',{f:'IFERROR(B5/B3,0)',v:insp?F.fail/insp:0},true],
      ['Rework','',false],['Reject','',false]];
    KPI.forEach((k,i)=>{ const r=i+3; put(0,r,k[0],S.kpi); put(1,r,k[1],S.cell,k[2]); });
    ['Line','Inspected','Pass','Defect','DHU'].forEach((h,i)=>put(i,11,h,S.head));
    F.lineOrd.forEach((n,i)=>{ const r=12+i, o=F.line[n], k=o.pass+o.fail;
      put(0,r,n,S.cell); put(1,r,k,S.cell); put(2,r,o.pass,S.cell);
      put(3,r,o.fail,S.cell);
      put(4,r,{f:'IFERROR(D'+r+'/B'+r+',0)',v:k?o.fail/k:0},S.cell,true); });
    ws['!ref']='A1:H'+(11+Math.max(1,F.lineOrd.length));
    ws['!cols']=[22,15,12,12,12,3,18,18].map(w=>({width:w}));
    ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:7}}];
    ws['!margins']=this.QC_MARGINS;
    return ws; }

  // ---- Ca 7 sheet ---------------------------------------------------------
  qcSheets(F){
    const pc=(col,num,den,r)=>({f:'IFERROR('+col+num+r+'/'+col+den+r+',0)'});
    // 02
    const t2=this.qcTable(
      ['Line','Buyer','Style','Qty Check','Pass','Defect','DHU','Rework','Reject'],
      F.lsOrd.map((k,i)=>{ const o=F.ls[k], r=i+2, n=o.pass+o.fail;
        return [o.line,o.buyer,o.style,n,o.pass,o.fail,
          {f:'IFERROR(F'+r+'/D'+r+',0)',v:n?o.fail/n:0},'','']; }),
      [{w:12},{w:15},{w:14},{w:14},{w:12},{w:12},{w:12,pct:true},{w:12},{w:12}]);
    // 03 -- % Total chia cho tong cot Qty, vung co dinh nhu file mau
    const n3=Math.max(1,F.codeOrd.length), sum3='SUM($D$2:$D$'+(1+n3)+')';
    const t3=this.qcTable(
      ['Rank','Defect Code','Defect Name','Qty','% Total','Process'],
      F.codeOrd.map((c,i)=>[i+1,c,this.dsoDefName(c),F.code[c].qty,
        {f:'IFERROR(D'+(i+2)+'/'+sum3+',0)',v:F.fail?F.code[c].qty/F.fail:0},
        this.dsoDefCat(c)]),
      [{w:8},{w:14},{w:24},{w:12},{w:14,pct:true},{w:14}]);
    // 04
    const t4=this.qcTable(
      ['Time','Inspected','Defect','DHU'],
      F.slotOrd.map((s,i)=>{ const o=F.slot[s]||{pass:0,fail:0}, r=i+2, n=o.pass+o.fail;
        return [s,n,o.fail,{f:'IFERROR(C'+r+'/B'+r+',0)',v:n?o.fail/n:0}]; }),
      [{w:16},{w:14},{w:12},{w:12,pct:true}]);
    // 05 / 06 -- app chua co nguon, giu dung tieu de cot cua form
    const t5=this.qcTable(
      ['Bundle','Style','Initial QC','Defect','Rework Status','Re-QC','Final Result'],[],
      [{w:14},{w:14},{w:14},{w:22},{w:18},{w:14},{w:16}]);
    const t6=this.qcTable(
      ['QC','Qty Checked','Defect Found','DHU','Recheck','Hours'],[],
      [{w:12},{w:15},{w:15},{w:12,pct:true},{w:12},{w:10}]);
    // 07 -- 1 dong / 1 san pham NG
    const t7=this.qcTable(
      ['Date','Line','Style','Bundle','QC','Defect Code','Defect Name','Process','Operation','Result'],
      F.detail.map(r=>[r.day,r.line,r.style,'','',r.code,this.dsoDefName(r.code),
        this.dsoDefCat(r.code),this.dsoDefLoc(r.code),'NG']),
      [{w:14},{w:12},{w:12},{w:12},{w:10},{w:14},{w:22},{w:14},{w:20},{w:12}]);
    return [this.qcDash(F),t2,t3,t4,t5,t6,t7]; }

  // ---- Bieu do + dong bang dong tieu de ------------------------------------
  // SheetJS khong ghi duoc bieu do lan pane dong bang, nen 2 thu do duoc chen o
  // muc zip (XLSX.CFB) sau khi da tao xong file. XML bieu do dung dung khuon cua
  // file mau. Hong bat cu buoc nao thi tra ve file goc -- van du du lieu, chi
  // mat bieu do.
  QC_NSC='http://schemas.openxmlformats.org/drawingml/2006/chart';
  QC_NSA='http://schemas.openxmlformats.org/drawingml/2006/main';
  QC_NSR='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  QC_FREEZE='<sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft"'
    +' state="frozen"/><selection pane="bottomLeft" activeCell="A1" sqref="A1"/></sheetView>';
  qcEsc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  qcRich(t){ const a=' xmlns:a="'+this.QC_NSA+'"';
    return '<tx><rich><a:bodyPr'+a+'/><a:p'+a+'><a:pPr><a:defRPr/></a:pPr><a:r><a:t>'
      +this.qcEsc(t)+'</a:t></a:r></a:p></rich></tx>'; }
  qcChartXml(c){
    const a=' xmlns:a="'+this.QC_NSA+'"';
    const ln='<spPr><a:ln'+a+'><a:prstDash val="solid"/></a:ln></spPr>';
    const bar=c.kind!=='line';
    const ser='<ser><idx val="0"/><order val="0"/><tx><strRef><f>'+this.qcEsc(c.ser)+'</f></strRef></tx>'
      +ln+(bar?'':'<marker><symbol val="none"/>'+ln+'</marker>')
      +'<cat><numRef><f>'+this.qcEsc(c.cat)+'</f></numRef></cat>'
      +'<val><numRef><f>'+this.qcEsc(c.val)+'</f></numRef></val></ser>';
    const plot=bar
      ? '<barChart><barDir val="col"/><grouping val="clustered"/>'+ser
        +'<gapWidth val="150"/><axId val="10"/><axId val="100"/></barChart>'
      : '<lineChart><grouping val="standard"/>'+ser+'<axId val="10"/><axId val="100"/></lineChart>';
    const ax=t=>t?'<title>'+this.qcRich(t)+'</title>':'';
    return '<chartSpace xmlns="'+this.QC_NSC+'"><chart><title>'+this.qcRich(c.title)+'</title><plotArea>'
      +plot
      +'<catAx><axId val="10"/><scaling><orientation val="minMax"/></scaling><axPos val="l"/>'+ax(c.catAx)
      +'<majorTickMark val="none"/><minorTickMark val="none"/><crossAx val="100"/>'
      +'<lblOffset val="100"/></catAx>'
      +'<valAx><axId val="100"/><scaling><orientation val="minMax"/></scaling><axPos val="l"/>'
      +'<majorGridlines/>'+ax(c.valAx)
      +'<majorTickMark val="none"/><minorTickMark val="none"/><crossAx val="10"/></valAx>'
      +'</plotArea><legend><legendPos val="r"/></legend><plotVisOnly val="1"/>'
      +'<dispBlanksAs val="gap"/></chart></chartSpace>'; }
  qcDrawXml(col,row){
    return '<wsDr xmlns="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing">'
      +'<oneCellAnchor><from><col>'+col+'</col><colOff>0</colOff><row>'+row+'</row>'
      +'<rowOff>0</rowOff></from><ext cx="5400000" cy="2700000"/><graphicFrame>'
      +'<nvGraphicFramePr><cNvPr id="1" name="Chart 1"/><cNvGraphicFramePr/></nvGraphicFramePr><xfrm/>'
      +'<a:graphic xmlns:a="'+this.QC_NSA+'"><a:graphicData uri="'+this.QC_NSC+'">'
      +'<c:chart xmlns:c="'+this.QC_NSC+'" xmlns:r="'+this.QC_NSR+'" r:id="rId1"/>'
      +'</a:graphicData></a:graphic></graphicFrame><clientData/></oneCellAnchor></wsDr>'; }
  qcRels(type,target){
    return '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      +'<Relationship Type="'+this.QC_NSR+'/'+type+'" Target="'+target+'" Id="rId1"/></Relationships>'; }
  // Vung du lieu cua tung bieu do bam theo so dong that, khong co dinh nhu mau
  qcChartDefs(F){
    const nl=Math.max(1,F.lineOrd.length), nc=Math.max(1,F.codeOrd.length),
      ns=Math.max(1,F.slotOrd.length);
    return [
      {sh:1,col:6,row:2,kind:'bar',title:'Defect Qty by Line',catAx:'Line',valAx:'Defect Qty',
        ser:"'01_Dashboard'!$D$11",cat:"'01_Dashboard'!$A$12:$A$"+(11+nl),
        val:"'01_Dashboard'!$D$12:$D$"+(11+nl)},
      {sh:3,col:7,row:1,kind:'bar',title:'Top Defects',
        ser:"'03_Defect_Pareto'!$D$1",cat:"'03_Defect_Pareto'!$C$2:$C$"+(1+nc),
        val:"'03_Defect_Pareto'!$D$2:$D$"+(1+nc)},
      {sh:4,col:5,row:1,kind:'line',title:'Hourly DHU Trend',catAx:'Time',valAx:'DHU',
        ser:"'04_Hourly_Trend'!$D$1",cat:"'04_Hourly_Trend'!$A$2:$A$"+(1+ns),
        val:"'04_Hourly_Trend'!$D$2:$D$"+(1+ns)}]; }
  qcPack(XS,wb,F){
    const buf=XS.write(wb,{bookType:'xlsx',type:'array',bookSST:true});
    const C=XS&&XS.CFB;
    if(!C||!C.read||!C.write||!C.find||!C.utils||!C.utils.cfb_add
      ||typeof TextDecoder==='undefined'||typeof TextEncoder==='undefined') return buf;
    const cf=C.read(new Uint8Array(buf),{type:'array'});
    const dec=new TextDecoder('utf-8'), enc=new TextEncoder();
    const rd=nm=>{ const f=C.find(cf,nm); return f&&f.content?dec.decode(new Uint8Array(f.content)):null; };
    const wr=(nm,s)=>{ const b=enc.encode(s), f=C.find(cf,nm);
      if(f){ f.content=b; f.size=b.length; } else C.utils.cfb_add(cf,nm,b); };

    // Dong bang dong tieu de o moi sheet
    (cf.FileIndex||[]).forEach((f,i)=>{
      const nm=String((cf.FullPaths||[])[i]||'');
      if(!/xl\/worksheets\/sheet\d+\.xml$/.test(nm)||!f.content) return;
      let s=dec.decode(new Uint8Array(f.content));
      if(s.indexOf('<pane ')>=0) return;
      s=s.replace('<sheetView workbookViewId="0"/>',this.QC_FREEZE);
      const b=enc.encode(s); f.content=b; f.size=b.length; });

    // Bieu do
    let ct=rd('/[Content_Types].xml');
    if(!ct) return buf;
    this.qcChartDefs(F).forEach((c,k)=>{
      const n=k+1, sh='/xl/worksheets/sheet'+c.sh+'.xml';
      let s=rd(sh); if(s==null) return;
      wr('/xl/charts/chart'+n+'.xml',this.qcChartXml(c));
      wr('/xl/drawings/drawing'+n+'.xml',this.qcDrawXml(c.col,c.row));
      wr('/xl/drawings/_rels/drawing'+n+'.xml.rels',this.qcRels('chart','/xl/charts/chart'+n+'.xml'));
      wr('/xl/worksheets/_rels/sheet'+c.sh+'.xml.rels',
        this.qcRels('drawing','/xl/drawings/drawing'+n+'.xml'));
      if(s.indexOf('<drawing ')<0)
        s=s.replace('</worksheet>','<drawing xmlns:r="'+this.QC_NSR+'" r:id="rId1"/></worksheet>');
      wr(sh,s);
      ct=ct.replace('</Types>',
        '<Override PartName="/xl/drawings/drawing'+n+'.xml"'
        +' ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>'
        +'<Override PartName="/xl/charts/chart'+n+'.xml"'
        +' ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/></Types>'); });
    wr('/[Content_Types].xml',ct);
    return C.write(cf,{type:'array',fileType:'zip'}); }

  dsoDefExport(line){
    const XS=window.XLSXStyle||window.XLSX;
    if(!XS||!XS.utils){ window.alert(this.t('mtNoXlsx')); return; }
    const q=this.state.dsoDefQ||'';
    const rows=this.dsoDefHistory(line)
      .filter(r=>this.dsoRowHit(r,q,r.at+' '+r.code+' '+this.dsoDefName(r.code)));
    if(!rows.length){ window.alert(this.t(this.dsoDefHistory(line).length?'dfNoHit':'dsoDefHistEmpty')); return; }
    const F=this.dsoQcData(line,rows);
    const wb=XS.utils.book_new();
    this.qcSheets(F).forEach((ws,i)=>XS.utils.book_append_sheet(wb,ws,this.QC_NAMES[i]));
    const name=('YIC-HaNam_Endline-QC-Report_'+(line||'ALL')+'_'+this.todayStamp())
      .replace(/[^0-9A-Za-z]+/g,'-').replace(/-+$/,'')+'.xlsx';
    // Tu tai bang Blob de con kip chen bieu do + pane dong bang vao. Hong bat cu
    // buoc nao thi de chinh thu vien tai file -- van du du lieu, chi mat bieu do.
    const MIME='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    let done=false;
    try{ const buf=this.qcPack(XS,wb,F); if(buf) done=this.snapDownload(name,buf,MIME); }
    catch(e){ done=false; }
    if(!done) XS.writeFile(wb,name,{bookSST:true});
    if(F.detail.length<F.detailAll)
      window.alert(this.t('dsoDefCut').replace('{n}',F.detail.length).replace('{t}',F.detailAll)); }

  // ---- Hop chon so luong giao (mo tu nut 'Giao sang hoan thien (n)') ----
  dsoBulkOpen(line){ const p=this.dsoHandPool(line||null);
    this.set({dsoHandBulk:{line:line||'',qty:{...p.sizes}}}); }
  dsoBulkPool(){ const b=this.state.dsoHandBulk; if(!b) return null;
    return this.dsoHandPool(b.line||null); }
  // Go so: chi nhan so nguyen 0..con lai
  dsoBulkSet(z,v,max){ const n=Math.max(0,Math.min(Number(String(v).replace(/[^\d]/g,''))||0,max||0));
    this.setState(st=>{ const b=st.dsoHandBulk; if(!b) return null;
      const q={...(b.qty||{})}; q[z]=n; return {dsoHandBulk:{...b,qty:q}}; }); }
  dsoBulkFill(on){ this.setState(st=>{ const b=st.dsoHandBulk; if(!b) return null;
    const p=this.dsoHandPool(b.line||null);
    return {dsoHandBulk:{...b,qty:on?{...p.sizes}:{}}}; }); }
  dsoBulkQty(){ const b=this.state.dsoHandBulk, p=this.dsoBulkPool(); if(!b||!p) return 0;
    return Object.keys(p.sizes).reduce((a,z)=>a+Math.min(Number((b.qty||{})[z])||0,p.sizes[z]),0); }
  // Chot: chia so luong ve cac dong roi phat hanh phieu. Ma hang \u00b7 PO \u00b7 mau \u00b7
  // chuyen \u00b7 ngay tren phieu lay tu dung nhung dong da bi tru.
  dsoBulkOk(){ const b=this.state.dsoHandBulk, p=this.dsoBulkPool(); if(!b||!p) return;
    const want={}; let n=0;
    Object.keys(p.sizes).forEach(z=>{ const v=Math.max(0,Math.min(Number((b.qty||{})[z])||0,p.sizes[z]));
      if(v>0){ want[z]=v; n+=v; } });
    if(!n) return;
    const alloc=this.dsoAlloc(p,want);
    const pick=f=>{ const o=[]; alloc.forEach(a=>{ const v=f(a); if(o.indexOf(v)<0) o.push(v); }); return o; };
    const days=pick(a=>a.day).sort(), seen={};
    // Luy ke: cong don cua tung ma hang \u00b7 PO \u00b7 mau co mat tren phieu
    const cum=alloc.reduce((s,a)=>{ const k=a.style+'|'+a.po+'|'+a.color;
      if(seen[k]) return s; seen[k]=1; return s+this.dsoHandedTot(a.style,a.po,a.color); },0)+n;
    this.set({dsoHandBulk:null});
    this.dsoSlipOpen({id:'draft|'+(b.line||''),ts:0,back:{line:b.line||'',qty:{...(b.qty||{})}},
      style:pick(a=>a.style).join(' + '),po:pick(a=>a.po).join(' + '),
      color:pick(a=>a.color).join(' + '),line:pick(a=>a.line).sort().join(' + '),
      dayTxt:days.length>1?(this.dsoDay(days[0])+' \u2192 '+this.dsoDay(days[days.length-1]))
        :this.dsoDay(days[0]),
      sizes:want,qty:n,cum:cum,alloc:alloc}); }

  // ==========================================================================
  // DSO · CHI TIET CHUYEN — ban dung cho tablet dat tai chuyen
  // --------------------------------------------------------------------------
  // Bo cuc 2x2, dung theo ban thiet ke:
  //   trai-tren  4 o KPI: Output / QC Balance / Pass / Reject
  //   trai-duoi  Top 3 (bo phan · loai loi | cong nhan) theo NGAY + 3 nut
  //              Measurement / Check List / History
  //   phai-tren  the ma hang: o chon style · PO, thuong hieu · gioi tinh, anh
  //   phai-duoi  hang mau -> hang size -> 2 nut lon DAT / LOI
  // Ma tran size cu bo di: o chuyen chi con 2 thao tac — cham mau + size roi
  // bam. Hai bang lich su van con nguyen, nam sau nut History.
  // ==========================================================================

  // Con so cua CA chuyen, luy ke moi ngay. Hai section cung mot don co the trung
  // (mau, size) -> chung khoa luu; cong 'need' ca hai nhung 'done/fail' chi mot
  // lan, khong thi so da lam bi dem doi.
  dsoKpi(line){ const cards=this.dsoSizeCards(line), td=this.dsoToday();
    const dm=this.state.dsoDone||{}, seen={};
    let need=0,done=0,fail=0,today=0;
    cards.forEach(c=>{ need+=c.need;
      const k=[c.line,c.style,c.po,c.color,c.size].join('|'); if(seen[k]) return; seen[k]=1;
      done+=this.dsoDoneOf(c); fail+=this.dsoDefOf(c);
      today+=Number(dm[this.dsoDoneKey(c,td)])||0; });
    return {need:need,done:done,fail:fail,today:today,insp:done+fail,left:Math.max(0,need-done)}; }
  // '99.93%' — toi da 2 chu so thap phan, bo duoi 0 (0 -> '0%')
  dsoPct2(a,b){ const v=b?(Number(a)||0)/b*100:0;
    return (Math.round(v*100)/100).toLocaleString('en-US',{maximumFractionDigits:2})+'%'; }

  // ---- Ngay cua bang Top 3 (khong luu lai: mo lai app la ve hom nay) -------
  DOW3=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  dsoDayView(){ return this.state.dsoDayV||this.dsoToday(); }
  dsoDayShift(n){ const p=String(this.dsoDayView()).split('-').map(Number);
    const d=new Date(p[0],(p[1]||1)-1,p[2]||1); d.setDate(d.getDate()+n);
    this.set({dsoDayV:this.psFmtD(d)}); }
  dsoDayLabel(v){ const p=String(v||'').split('-').map(Number); if(p.length<3) return String(v||'');
    const d=new Date(p[0],(p[1]||1)-1,p[2]||1), z=n=>String(n).padStart(2,'0');
    return z(d.getDate())+'/'+z(d.getMonth()+1)+' '+this.DOW3[d.getDay()]; }

  // ---- Top 3 cua 1 ngay ----------------------------------------------------
  // Bo phan · loai loi lay tu Thu Vien Loi theo ma loi: loc = bo phan, name =
  // loai loi. Cung nguon voi dsoDefName nen sua thu vien la bang nay doi theo.
  dsoTop3Def(line,day){ const m=this.state.dsoDefLog||{}, by={};
    Object.keys(m).forEach(k=>{ const p=k.split('|'); if(p.length!==6) return;
      if(p[0]!==day||p[1]!==line) return;
      const o=m[k]||{}; Object.keys(o).forEach(c=>{ by[c]=(by[c]||0)+(Number(o[c])||0); }); });
    const lib=this.defects();
    return Object.keys(by).map(c=>{ const d=lib.find(x=>String(x.code||'').trim()===c)||{};
        return {code:c,part:String(d.loc||'').trim(),type:String(d.name||'').trim(),n:by[c]}; })
      .sort((a,b)=>b.n-a.n||String(a.code).localeCompare(String(b.code))).slice(0,3); }
  // Xep hang cong nhan theo so hang loi da ghi ten. dsoDefWho di song song voi
  // dsoDefTime (cung khoa, cung chieu dai) nen ban ghi khong co ten van dung so.
  dsoTop3Op(line,day){ const m=this.state.dsoDefWho||{}, by={};
    Object.keys(m).forEach(k=>{ const p=k.split('|'); if(p.length!==7) return;
      if(p[0]!==day||p[1]!==line) return;
      (m[k]||[]).forEach(nm=>{ const n=String(nm||'').trim(); if(n) by[n]=(by[n]||0)+1; }); });
    return Object.keys(by).map(n=>({name:n,n:by[n]}))
      .sort((a,b)=>b.n-a.n||a.name.localeCompare(b.name)).slice(0,3); }
  // Moi ten da tung ghi -> goi y cho o nhap trong hop chon ly do loi
  dsoOpNames(){ const m=this.state.dsoDefWho||{}, seen={}, out=[];
    Object.keys(m).forEach(k=>(m[k]||[]).forEach(nm=>{ const n=String(nm||'').trim();
      if(n&&!seen[n]){ seen[n]=1; out.push(n); } }));
    return out.sort((a,b)=>a.localeCompare(b)); }
  dsoOpOf(line){ return String((this.state.dsoOp||{})[line]||''); }
  dsoOpSet(line,v){ this.setState(st=>{ const m={...(st.dsoOp||{})}; m[line]=v; return {dsoOp:m}; }); }

  // ---- O dang chon cua 1 chuyen -------------------------------------------
  // Gia tri luu co the khong con trong ke hoach (sang tuan khac, doi don) nen
  // luon soi lai qua danh sach card va tu roi ve lua chon dau tien con hop le.
  dsoPick(line,cards){ const sel=(this.state.dsoSel||{})[line]||{};
    const keys=[], kmap={}, nPo={};
    cards.forEach(c=>{ const k=c.style+'|'+c.po;
      if(!kmap[k]){ kmap[k]={sk:k,style:c.style,po:c.po}; keys.push(kmap[k]);
        nPo[c.style]=(nPo[c.style]||0)+1; } });
    // Nhan o chon: chi ghi kem PO khi mot ma hang co nhieu PO tren chuyen nay
    keys.forEach(k=>{ k.label=k.style+(nPo[k.style]>1?'   ·   '+k.po:''); });
    const sk=(sel.sk&&kmap[sel.sk])?sel.sk:(keys[0]?keys[0].sk:'');
    const mine=cards.filter(c=>c.style+'|'+c.po===sk);
    const colors=[]; mine.forEach(c=>{ if(colors.indexOf(c.color)<0) colors.push(c.color); });
    const color=colors.indexOf(sel.color)>=0?sel.color:(colors[0]||'');
    const oi=z=>{ const i=this.SORDER.indexOf(z); return i<0?99:i; };
    const sizes=[]; mine.forEach(c=>{ if(c.color===color&&sizes.indexOf(c.size)<0) sizes.push(c.size); });
    sizes.sort((a,b)=>oi(a)-oi(b)||String(a).localeCompare(String(b)));
    const size=sizes.indexOf(sel.size)>=0?sel.size:(sizes[0]||'');
    return {keys:keys,sk:sk,style:kmap[sk]?kmap[sk].style:'',po:kmap[sk]?kmap[sk].po:'',
      colors:colors,color:color,sizes:sizes,size:size,
      card:mine.find(c=>c.color===color&&c.size===size)||null}; }
  // Doi ma hang -> bo mau/size cu; doi mau -> bo size cu. dsoPick tu chon lai.
  dsoPickSet(line,patch){ this.setState(st=>{ const m={...(st.dsoSel||{})}, cur={...(m[line]||{})};
      if(patch.sk!==undefined&&patch.sk!==cur.sk){ delete cur.color; delete cur.size; }
      if(patch.color!==undefined&&patch.color!==cur.color) delete cur.size;
      m[line]={...cur,...patch}; return {dsoSel:m}; }); }

  // ---- Anh ky thuat + gioi tinh theo MA HANG -------------------------------
  // Anh nam trong localStorage cung cho voi du lieu khac (nen tu dong theo ra
  // state-seed.js), vi vay phai thu nho truoc khi luu: canvas -> JPEG <=560px.
  DSO_PH_MAX=4; DSO_PH_PX=560;
  dsoPhotos(style){ const l=(this.state.dsoPhoto||{})[style]; return Array.isArray(l)?l:[]; }
  dsoPhotoIdx(style){ const n=this.dsoPhotos(style).length;
    const i=Number((this.state.dsoPhotoI||{})[style])||0; return n?Math.min(Math.max(0,i),n-1):0; }
  dsoPhotoAdd(style,file){ if(!file||!style) return;
    const r=new FileReader();
    r.onload=()=>{ const im=new Image();
      im.onload=()=>{ try{
          const s=Math.min(1,this.DSO_PH_PX/Math.max(im.width||1,im.height||1));
          const w=Math.max(1,Math.round((im.width||1)*s)), hh=Math.max(1,Math.round((im.height||1)*s));
          const cv=document.createElement('canvas'); cv.width=w; cv.height=hh;
          const cx=cv.getContext('2d'); cx.fillStyle='#fff'; cx.fillRect(0,0,w,hh);
          cx.drawImage(im,0,0,w,hh);
          const url=cv.toDataURL('image/jpeg',.72);
          if(!this._mounted) return;
          this.setState(st=>{ const m={...(st.dsoPhoto||{})};
            const l=(Array.isArray(m[style])?m[style]:[]).concat(url).slice(-this.DSO_PH_MAX);
            m[style]=l; const ix={...(st.dsoPhotoI||{})}; ix[style]=l.length-1;
            return {dsoPhoto:m,dsoPhotoI:ix}; });
        }catch(e){} };
      im.src=String(r.result||''); };
    try{ r.readAsDataURL(file); }catch(e){} }
  dsoPhotoDel(style){ const i=this.dsoPhotoIdx(style);
    this.setState(st=>{ const m={...(st.dsoPhoto||{})};
      const l=(Array.isArray(m[style])?m[style]:[]).filter((_,k)=>k!==i);
      if(l.length) m[style]=l; else delete m[style];
      const ix={...(st.dsoPhotoI||{})}; ix[style]=Math.max(0,Math.min(i,l.length-1));
      return {dsoPhoto:m,dsoPhotoI:ix}; }); }
  DSO_GEN=['Men','Women','Unisex','Kids'];
  dsoGenOf(style){ return String((this.state.dsoGen||{})[style]||''); }
  dsoGenSet(style,v){ this.setState(st=>{ const m={...(st.dsoGen||{})};
      if(v) m[style]=v; else delete m[style]; return {dsoGen:m}; }); }
  // Hinh ao ve san — cho o anh khi ma hang chua co anh ky thuat nao
  dsoTeeSvg(size){ const h=React.createElement;
    return h('svg',{width:size,height:size,viewBox:'0 0 120 120',fill:'none',
        stroke:'#c9cec4',strokeWidth:1.6,strokeLinejoin:'round'},
      h('path',{d:'M44 20 L30 26 L18 40 L27 50 L33 44 L33 100 L87 100 L87 44 L93 50 L102 40 L90 26 L76 20 Z'}),
      h('path',{d:'M44 20 C48 30 72 30 76 20'}),
      h('path',{d:'M33 92 L87 92',stroke:'#e0e4db'})); }

  renderDsoLineDetail(line){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const cards=this.dsoSizeCards(line), K=this.dsoKpi(line);
    const back=h('button',{onClick:()=>this.set({dsoLine:null}),
      style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:9,padding:'6px 13px',
        fontSize:12.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',flex:'none'},
      'style-hover':{background:C.tint}},this.t('dsoBack'));
    const bar=h('div',{style:{display:'flex',alignItems:'center',gap:13,flexWrap:'wrap',marginBottom:13}},
      back,
      h('div',{style:{fontSize:20,fontWeight:700,fontFamily:mono,color:C.primary,lineHeight:1,
        flex:'none'}},line),
      h('div',{style:{flex:1,minWidth:8}}),
      h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,flex:'none'}},
        this.t('dsoDoneNeed')),
      h('div',{style:{fontSize:15,fontWeight:700,fontFamily:mono,color:C.ink,flex:'none'}},
        this.fmt(K.done)+' / '+this.fmt(K.need)));
    if(!cards.length) return h('div',{style:{padding:'16px 18px 22px'}},bar,
      h('div',{style:{padding:'48px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},
        this.t('dsoNoCut')));

    const P=this.dsoPick(line,cards), c=P.card;
    const dq=c?this.dsoDoneOf(c):0, dn=c?this.dsoDefOf(c):0;
    const histOpen=!!this.state.dsoHistOpen;

    // ---- Goc trai tren: 4 o KPI ------------------------------------------
    const tile=(o)=>h('div',{key:o.t,style:{background:o.bg,padding:'13px 17px 15px',minWidth:0,
        display:'flex',flexDirection:'column',minHeight:126,
        borderRight:o.br?'1px solid '+C.line:'none',borderBottom:o.bb?'1px solid '+C.line:'none'}},
      h('div',{style:{fontSize:19,fontWeight:700,color:o.fg,letterSpacing:'-.3px',lineHeight:1.05,
        wordBreak:'break-word'}},o.t),
      h('div',{style:{flex:1,minHeight:8}}),
      (o.subs||[]).length?h('div',{style:{display:'flex',flexDirection:'column',alignItems:'flex-end',
          gap:1,marginBottom:2}},
        o.subs.map(sb=>h('div',{key:sb[0],style:{display:'flex',alignItems:'baseline',gap:7}},
          h('span',{style:{fontSize:11.5,color:C.sub,whiteSpace:'nowrap'}},sb[0]),
          h('span',{style:{fontSize:14,fontWeight:700,fontFamily:mono,color:C.ink,
            whiteSpace:'nowrap'}},sb[1])))):null,
      h('div',{style:{display:'flex',alignItems:'baseline',justifyContent:'flex-end',gap:6}},
        h('span',{style:{fontSize:31,fontWeight:700,fontFamily:mono,color:o.fg,lineHeight:1,
          letterSpacing:'-1.2px'}},o.big),
        o.pct?h('span',{style:{fontSize:12,fontFamily:mono,color:C.sub,whiteSpace:'nowrap'}},
          '('+o.pct+')'):null));
    const dhu=K.insp?(K.fail/K.insp*100):0;
    const kpi=h('div',{style:{flex:1,minWidth:0,display:'grid',
        gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',
        gridTemplateRows:'minmax(0,1fr) minmax(0,1fr)'}},
      tile({t:this.t('dsoKOut'),fg:'#2f9e44',bg:'#eef8ee',br:1,bb:1,big:this.fmt(K.need),
        subs:[[this.t('dsoKToday'),this.fmt(K.today)],[this.t('dsoKIncomp'),this.fmt(K.left)]]}),
      tile({t:this.t('dsoKQc'),fg:'#e8830c',bg:'#fff5e9',bb:1,big:this.fmt(K.insp),
        pct:this.dsoPct2(K.insp,K.need),subs:[[this.t('dsoKRepair'),this.fmt(K.fail)]]}),
      tile({t:this.t('dsoKPassT'),fg:'#4338ca',bg:'#eeeefc',br:1,big:this.fmt(K.done),
        pct:this.dsoPct2(K.done,K.insp)}),
      tile({t:this.t('dsoKRej'),fg:'#e03131',bg:'#fdeeed',big:this.fmt(K.fail),
        pct:this.dsoPct2(K.fail,K.insp),
        subs:[['DHU',this.fmtn(Math.round(dhu*100)/100)+' %']]}));

    // ---- Goc trai duoi: Top 3 theo NGAY + 3 nut phu ----------------------
    const day=this.dsoDayView();
    const nbtn={border:'none',background:'none',color:C.sub,cursor:'pointer',padding:'0 10px',
      fontSize:17,lineHeight:1,fontFamily:'inherit',height:30};
    const nav=h('div',{style:{display:'inline-flex',alignItems:'center',flex:'none',
        border:'1px solid '+C.border,borderRadius:9,overflow:'hidden',background:C.white}},
      h('button',{title:this.t('dsoDayPrev'),onClick:()=>this.dsoDayShift(-1),style:nbtn,
        'style-hover':{background:C.tint}},'‹'),
      h('span',{style:{display:'inline-flex',alignItems:'center',gap:7,padding:'0 11px',fontSize:12.5,
          fontWeight:700,fontFamily:mono,color:C.ink,whiteSpace:'nowrap',height:30,
          borderLeft:'1px solid '+C.line,borderRight:'1px solid '+C.line}},
        h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:C.faint,strokeWidth:1.9,
            style:{flex:'none'}},
          h('rect',{x:3,y:5,width:18,height:16,rx:2}),h('path',{d:'M8 3v4M16 3v4M3 11h18'})),
        this.dsoDayLabel(day)),
      h('button',{title:this.t('dsoDayNext'),onClick:()=>this.dsoDayShift(1),style:nbtn,
        'style-hover':{background:C.tint}},'›'));
    const tDef=this.dsoTop3Def(line,day), tOp=this.dsoTop3Op(line,day);
    const rkTh={padding:'8px 12px',fontSize:11.5,fontWeight:600,color:C.sub,textAlign:'center',
      borderBottom:'1px solid '+C.line,background:'#fbfcf8',whiteSpace:'nowrap'};
    const rkRow=(i,body)=>h('div',{key:i,style:{display:'flex',alignItems:'center',gap:9,
        padding:'8px 12px',borderTop:i?'1px solid '+C.line:'none',minHeight:44}},
      h('span',{style:{flex:'none',width:14,fontSize:10,fontFamily:mono,color:C.faint,
        textAlign:'right'}},i+1),
      h('div',{style:{minWidth:0,flex:1}},body));
    const rkEmpty=h('div',{style:{padding:'26px 12px',textAlign:'center',color:C.faint,
      fontSize:11.5,lineHeight:1.5}},this.t('dsoTopEmpty'));
    const rkCol=(titleKey,rows,render,br)=>h('div',{style:{minWidth:0,flex:1,
        borderRight:br?'1px solid '+C.line:'none'}},
      h('div',{style:rkTh},this.t(titleKey)),
      rows.length?rows.map((r,i)=>rkRow(i,render(r))):rkEmpty);
    const top3=h('div',{style:{padding:'13px 17px 15px',minWidth:0,display:'flex',
        flexDirection:'column',borderRight:'1px solid '+C.line}},
      h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:11,flexWrap:'wrap'}},
        h('div',{style:{fontSize:18,fontWeight:700,color:C.ink,letterSpacing:'-.3px',flex:'none'}},
          this.t('dsoTop3')),
        h('div',{style:{flex:1,minWidth:4}}),nav),
      h('div',{style:{flex:1,border:'1px solid '+C.border,borderRadius:11,overflow:'hidden',
          display:'flex',alignItems:'stretch',background:C.white}},
        rkCol('dsoTopPart',tDef,r=>h('div',null,
          h('div',{title:[r.part,r.type].filter(Boolean).join('  |  ')+'  ·  '+r.code,
              style:{fontSize:12.5,fontWeight:600,color:C.ink,lineHeight:1.3,overflow:'hidden',
                textOverflow:'ellipsis',whiteSpace:'nowrap'}},
            r.part||r.code,
            r.type?h('span',{key:'s',style:{color:C.border}},'  |  '):null,
            r.type?h('span',{key:'t',style:{fontWeight:500,color:C.sub}},r.type):null),
          h('div',{style:{fontSize:11,fontFamily:mono,color:C.sub,marginTop:2}},
            this.fmt(r.n),h('span',{style:{color:C.faint}},' pcs'))),true),
        rkCol('dsoTopOp',tOp,r=>h('div',{style:{display:'flex',alignItems:'baseline',gap:8}},
          h('span',{style:{minWidth:0,fontSize:12.5,fontWeight:600,color:C.ink,overflow:'hidden',
            textOverflow:'ellipsis',whiteSpace:'nowrap'}},r.name),
          h('span',{style:{flex:'none',fontSize:11,fontFamily:mono,color:C.faint}},
            '×'+this.fmt(r.n))),false)));
    const sideBtn=(labelKey,tipKey,icon,on,live)=>h('button',{key:labelKey,onClick:on,
        title:this.t(tipKey||labelKey),
        style:{display:'flex',alignItems:'center',justifyContent:'center',gap:9,minHeight:62,
          border:'1px solid '+(live?C.primary:C.border),borderRadius:11,
          background:live?C.tint:'#fafbf7',color:C.ink,fontSize:14.5,fontWeight:600,
          fontFamily:'inherit',cursor:'pointer',padding:'0 14px'},
        'style-hover':{background:live?C.tint:C.tint2,borderColor:C.primary}},
      h('svg',{width:17,height:17,viewBox:'0 0 24 24',fill:'none',stroke:C.sub,strokeWidth:1.8,
        style:{flex:'none'}},icon),
      h('span',{style:{whiteSpace:'nowrap'}},this.t(labelKey)));
    const acts=h('div',{style:{padding:'13px 17px 15px',minWidth:0,display:'grid',
        gridTemplateRows:'repeat(3,minmax(0,1fr))',gap:11,alignContent:'center'}},
      sideBtn('dsoBtnMeas',null,
        h('path',{d:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8-3-3-3.8 3.8zM6 22l-4-4 9.6-9.6 4 4L6 22z'}),
        ()=>this.set({dsoInfo:'meas'}),false),
      sideBtn('dsoBtnChk',null,
        h('path',{d:'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11'}),
        ()=>this.set({dsoInfo:'chk'}),false),
      sideBtn('dsoBtnHist',histOpen?'dsoHistHide':'dsoHistShow',
        h('g',null,h('circle',{cx:12,cy:12,r:9}),h('path',{d:'M12 7v5l4 2'})),
        ()=>this.set({dsoHistOpen:!histOpen}),histOpen));

    // ---- Goc phai tren: the ma hang (o chon · thuong hieu · anh) ----------
    const st=P.style, brand=st?this.brandForStyle(st):'';
    const photos=this.dsoPhotos(st), pi=this.dsoPhotoIdx(st);
    const icoSt={display:'inline-flex',alignItems:'center',justifyContent:'center',width:28,height:28,
      flex:'none',border:'1px solid '+C.border,borderRadius:8,background:C.white,cursor:'pointer',
      padding:0,fontFamily:'inherit'};
    const ico=d=>h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',
      strokeWidth:1.9},h('path',{d:d}));
    const delBtn=h('button',{title:this.t('dsoPhDel'),onClick:()=>this.dsoPhotoDel(st),
        style:{...icoSt,color:'#c0392b'},'style-hover':{background:'#fdeeec'}},
      ico('M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5'));
    const addBtn=h('label',{title:this.t('dsoPhAdd'),style:{...icoSt,color:C.dark},
        'style-hover':{background:C.tint}},
      ico('M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z'),
      h('input',{type:'file',accept:'image/*',style:{display:'none'},
        onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value='';
          if(f) this.dsoPhotoAdd(st,f); }}));
    const styleCard=h('div',{style:{padding:'13px 17px 15px',minWidth:0,display:'flex',
        flexDirection:'column',gap:12}},
      h('select',{value:P.sk,title:this.t('dsoStyleL'),
          onChange:e=>this.dsoPickSet(line,{sk:e.target.value}),
          style:{width:'100%',border:'1px solid '+C.border,borderRadius:9,background:'#fafbf7',
            padding:'9px 11px',fontSize:14,fontWeight:700,fontFamily:mono,color:C.ink,
            appearance:'auto',cursor:'pointer',boxSizing:'border-box'}},
        P.keys.map(k=>h('option',{key:k.sk,value:k.sk},k.label))),
      h('div',{style:{display:'flex',alignItems:'center',gap:9,flexWrap:'wrap'}},
        h('span',{style:{fontSize:13,fontWeight:600,color:brand?C.ink:C.faint,whiteSpace:'nowrap'}},
          brand||this.t('dsoBrand')),
        h('span',{style:{flex:'none',color:C.border}},'|'),
        h('select',{value:this.dsoGenOf(st),title:this.t('dsoGenL'),
            onChange:e=>this.dsoGenSet(st,e.target.value),
            style:{border:'none',background:'none',fontSize:13,fontWeight:600,fontFamily:'inherit',
              color:this.dsoGenOf(st)?C.ink:C.faint,cursor:'pointer',appearance:'auto',padding:0}},
          h('option',{value:''},this.t('dsoGenNone')),
          this.DSO_GEN.map(g=>h('option',{key:g,value:g},g))),
        h('div',{style:{flex:1,minWidth:4}}),
        photos.length?delBtn:null, addBtn),
      h('div',{style:{display:'flex',alignItems:'flex-start',gap:11,minWidth:0}},
        h('div',{style:{flex:'none',width:186,height:186,border:'1px solid '+C.border,borderRadius:10,
            background:'#fbfcf8',display:'flex',alignItems:'center',justifyContent:'center',
            overflow:'hidden'}},
          photos.length
            ? h('img',{src:photos[pi],alt:st,
                style:{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',display:'block'}})
            : h('div',{style:{textAlign:'center',color:C.faint}},this.dsoTeeSvg(112),
                h('div',{style:{fontSize:10.5,marginTop:2}},this.t('dsoPhNone')))),
        photos.length>1?h('div',{style:{display:'flex',flexWrap:'wrap',gap:8,minWidth:0}},
          photos.map((u,i)=>h('button',{key:i,
              onClick:()=>this.setState(s2=>{ const ix={...(s2.dsoPhotoI||{})};
                ix[st]=i; return {dsoPhotoI:ix}; }),
              style:{width:56,height:56,padding:2,flex:'none',cursor:'pointer',borderRadius:8,
                background:C.white,border:'1px solid '+(i===pi?C.ink:C.border)}},
            h('img',{src:u,alt:'',
              style:{width:'100%',height:'100%',objectFit:'contain',display:'block'}})))):null));

    // ---- Goc phai duoi: mau -> size -> 2 nut lon -------------------------
    const chipRow=(label,items,cur,on,extra)=>h('div',{style:{display:'flex',alignItems:'stretch',
        borderTop:'1px solid '+C.line,minHeight:46}},
      h('div',{style:{flex:'none',width:70,display:'flex',alignItems:'center',padding:'0 13px',
        fontSize:12.5,fontWeight:600,color:C.sub,borderRight:'1px solid '+C.line,
        whiteSpace:'nowrap'}},label),
      // Chip xuong dong thay vi cuon ngang: chuyen nhieu size van thay het,
      // khong co o nao bi giau sau thanh cuon (tren tablet gan nhu khong keo duoc).
      h('div',{style:{flex:1,minWidth:0,display:'flex',flexWrap:'wrap',alignContent:'flex-start'}},
        items.length?items.map(v=>{ const on2=v===cur;
            return h('button',{key:v,onClick:()=>on(v),title:String(v),
              style:{flex:'0 0 auto',minWidth:88,height:45,border:'none',
                borderRight:'1px solid '+C.line,borderBottom:'1px solid '+C.line,
                background:on2?C.ink:C.white,color:on2?'#fff':C.ink,fontSize:13.5,
                fontWeight:on2?700:500,fontFamily:'inherit',cursor:'pointer',padding:'0 15px'},
              'style-hover':on2?{}:{background:C.tint}},v); })
          : h('span',{style:{padding:'0 13px',alignSelf:'center',fontSize:12,color:C.faint}},'—')),
      extra||null);
    const noMinus=!c||dq<=0;
    const minus=h('button',{title:this.t('dsoTapSub'),disabled:noMinus,
        onClick:()=>{ if(!noMinus) this.dsoBump(c,-1); },
        style:{flex:'none',width:52,border:'none',borderLeft:'1px solid '+C.line,background:'#fafbf7',
          color:noMinus?'#c8ccc2':C.sub,fontSize:18,lineHeight:1,fontFamily:'inherit',
          cursor:noMinus?'not-allowed':'pointer',padding:0},
        'style-hover':noMinus?{}:{background:C.tint}},'−');
    const bigBtn=(label,sub,bg,on)=>h('button',{onClick:c?on:undefined,disabled:!c,
        style:{flex:1,minWidth:0,minHeight:152,border:'none',background:c?bg:'#e7eae2',
          color:c?'#fff':'#a9afa3',fontFamily:'inherit',cursor:c?'pointer':'not-allowed',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:7,
          transition:'filter .12s'},
        'style-hover':c?{filter:'brightness(1.08)'}:{}},
      h('span',{style:{fontSize:31,fontWeight:700,letterSpacing:'.3px',lineHeight:1}},label),
      h('span',{style:{fontSize:12.5,fontWeight:600,fontFamily:mono,opacity:.92}},sub));
    const tapPanel=h('div',{style:{minWidth:0,display:'flex',flexDirection:'column'}},
      chipRow(this.t('dsoLblColor'),P.colors,P.color,v=>this.dsoPickSet(line,{color:v})),
      chipRow(this.t('dsoLblSize'),P.sizes,P.size,v=>this.dsoPickSet(line,{size:v}),minus),
      h('div',{style:{flex:1,display:'flex',alignItems:'stretch',minHeight:152,
          borderTop:'1px solid '+C.line}},
        bigBtn(this.t('dsoBtnPass'),c?(this.fmt(dq)+' / '+this.fmt(c.need)):this.t('dsoNoPick'),
          '#4038e0',()=>this.dsoBump(c,1)),
        bigBtn(this.t('dsoBtnDef'),c?('✕ '+this.fmt(dn)):this.t('dsoNoPick'),
          '#ee4b47',()=>this.set({dsoTap:{c:c,stage:'fail'},dsoTapQ:''}))));

    return h('div',{style:{padding:'16px 18px 22px'}},bar,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:16,overflow:'hidden',background:C.white,
          boxShadow:C.shadow,display:'grid',gridTemplateColumns:'minmax(0,1.04fr) minmax(0,1fr)',
          alignItems:'stretch'}},
        h('div',{style:{minWidth:0,display:'flex',borderRight:'1px solid '+C.line,
          borderBottom:'1px solid '+C.line}},kpi),
        h('div',{style:{minWidth:0,borderBottom:'1px solid '+C.line}},styleCard),
        h('div',{style:{minWidth:0,borderRight:'1px solid '+C.line,display:'grid',
          gridTemplateColumns:'minmax(0,1.55fr) minmax(0,1fr)',alignItems:'stretch'}},top3,acts),
        tapPanel),
      histOpen
        ? h('div',null,this.renderDsoHistory(line),this.renderDsoDefHistory(line))
        : h('div',null,this.renderDsoHandAsk(),this.renderDsoHandBulk()),
      this.renderDsoTap(),this.renderDsoInfo());
  }

  // Measurement / Check List: chua co spec -> hop thoai giu cho, de nut khong
  // bam trong ma van thay ro no se thanh cai gi.
  renderDsoInfo(){
    const h=React.createElement, C=this.C;
    const k=this.state.dsoInfo; if(!k) return null;
    const close=()=>this.set({dsoInfo:null});
    const panel=h('div',{onClick:ev=>ev.stopPropagation(),
        style:{width:'min(460px,94vw)',background:C.white,borderRadius:16,overflow:'hidden',
          boxShadow:'0 30px 70px rgba(0,0,0,.32)'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'15px 20px',
          borderBottom:'1px solid '+C.line}},
        h('div',{style:{fontSize:16,fontWeight:700,marginRight:'auto'}},
          this.t(k==='meas'?'dsoBtnMeas':'dsoBtnChk')),
        h('button',{title:this.t('dsoClose'),onClick:close,
          style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,
            height:30,flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,
            fontFamily:'inherit'},'style-hover':{background:C.tint}},'×')),
      h('div',{style:{padding:'30px 24px',textAlign:'center',color:C.faint,fontSize:13.5,
        lineHeight:1.6}},this.t(k==='meas'?'dsoMeasSoon':'dsoChkSoon')),
      h('div',{style:{display:'flex',justifyContent:'flex-end',padding:'12px 20px',
          borderTop:'1px solid '+C.line,background:'#f8faf3'}},
        h('button',{onClick:close,style:this.btn('ghost')},this.t('dsoClose'))));
    const over=h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
      backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
      zIndex:88,padding:24}},panel);
    return (RD&&RD.createPortal)?RD.createPortal(over,document.body):over;
  }
  // ==== PHIEU BAN GIAO: May -> Hoan thien ==================================
  // Nhan 1 'slip': {id, no, ts, style, po, color, line, dayTxt, sizes, qty, alloc}.
  // ts = 0 -> phieu chua chot, nut la 'Xac nhan giao'; da chot -> in / luu PDF.
  // Portal ra <body> nen khi in chi con to phieu tren giay, va khong phai
  // them slot moi vao shell().
  renderDsoHistory(line){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    // dsoHistory tra ve MOI ngay (khong loc hom nay); o tim loc them tren client
    const all=this.dsoHistory(line), q=this.state.dsoHistQ||'';
    const rows=all.filter(r=>this.dsoRowHit(r,q));
    const un=all.filter(r=>this.dsoRemain(r).qty>0);
    const th={padding:'9px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,
      background:'#f8faf3',whiteSpace:'nowrap',position:'sticky',top:0,zIndex:1};
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    // Nut giao TONG: chi hien khi con dong chua giao, kem so dong dang cho
    const bulk=un.length?h('button',{onClick:()=>this.dsoBulkOpen(line),
      style:{...this.btn('primary'),padding:'7px 13px',fontSize:12.5},title:this.t('dsoHandAllSub')},
      h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
        h('path',{d:'M5 12h14M13 6l6 6-6 6'})),
      this.t('dsoHandOver')+' ('+this.fmt(un.length)+')'):null;
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:10,marginTop:22,
        flexWrap:'wrap'}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:15,fontWeight:700}},this.t('dsoHist')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('dsoHistSub'))),
      h('div',{style:{flex:1,minWidth:8}}),
      this.dfSearchBox(q,v=>this.set({dsoHistQ:v}),false,'dsoHistSearch'),
      h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:C.dark,background:C.tint,borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},
        this.fmt(rows.reduce((a,r)=>a+r.qty,0))+' pcs'),
      bulk);
    const note=t=>h('div',{style:{border:'1px solid '+C.border,borderRadius:13,background:C.white,
      padding:'34px 20px',textAlign:'center',color:C.faint,fontSize:13}},this.t(t));
    if(!all.length) return h('div',null,head,note('dsoHistEmpty'),
      this.renderDsoHandAsk(),this.renderDsoHandBulk());
    if(!rows.length) return h('div',null,head,note('dfNoHit'),
      this.renderDsoHandAsk(),this.renderDsoHandBulk());
    // Cot size = hop cac size co trong bang, xep theo SORDER; size la xep cuoi.
    const zs=this.SORDER.filter(z=>rows.some(r=>r.sizes&&r.sizes[z]));
    rows.forEach(r=>Object.keys(r.sizes||{}).forEach(z=>{ if(zs.indexOf(z)<0) zs.push(z); }));
    const body=rows.map((r,i)=>{ const bg=i%2?'#f7f9f3':C.white, at=this.dsoHandAt(r);
      const hq=this.dsoHandedQty(r), rem=r.qty-hq;
      return h('tr',{key:r.key},
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.dsoDay(r.day)),
        line?null:h('td',{style:{...td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},r.line),
        h('td',{style:{...td,background:bg,fontFamily:mono,wordBreak:'break-all'}},r.style),
        h('td',{style:{...td,background:bg,fontFamily:mono,whiteSpace:'nowrap'}},r.po),
        h('td',{style:{...td,background:bg,fontWeight:700,color:C.dark,whiteSpace:'nowrap'}},r.color),
        ...zs.map(z=>h('td',{key:'z'+z,style:{...td,background:bg,textAlign:'right',fontFamily:mono,
          color:r.sizes[z]?C.ink:'#dfe3da',whiteSpace:'nowrap'}}, r.sizes[z]?this.fmt(r.sizes[z]):'')),
        h('td',{style:{...td,background:bg,textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,whiteSpace:'nowrap'}},this.fmt(r.qty)),
        // Chua giao -> nut giao; giao mot phan -> the vang + nut giao not; giao xong -> the xanh
        h('td',{style:{...td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('span',{style:{display:'inline-flex',alignItems:'center',gap:7}},
            hq?h('button',{title:this.t('bgView'),onClick:()=>this.dsoSlipOpen(this.dsoRowSlipLast(r)),
              style:{fontSize:11,fontWeight:700,borderRadius:999,padding:'3px 9px',whiteSpace:'nowrap',
                cursor:'pointer',fontFamily:'inherit',color:at?'#2f7d32':'#8a6d1f',
                background:at?'#e6f2e2':'#fdf6e8',border:'1px solid '+(at?'#cfe3b4':'#f0e3c8')},
              'style-hover':{background:at?'#d9ecd2':'#f8eed6'}},
              at?(this.t('dsoHanded')+' \u00b7 '+this.recvTime(at))
                :(this.t('dsoHanded')+' '+this.fmt(hq)+'/'+this.fmt(r.qty))):null,
            rem?h('button',{onClick:()=>this.dsoSlipOpen(this.dsoRowSlipNew(r)),
              style:{border:'1px solid '+C.primary,background:C.white,color:C.dark,borderRadius:8,padding:'5px 11px',
                fontSize:11.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap'},
              'style-hover':{background:C.tint}},
              hq?(this.t('dsoHandOver')+' \u00b7 '+this.fmt(rem)):this.t('dsoHandOver')):null,
            hq?h('button',{title:this.t('dsoUndoHand'),onClick:()=>this.dsoRowUndo(r),
              style:{border:'none',background:'none',color:'#c0392b',cursor:'pointer',padding:0,fontSize:14,
                lineHeight:1,fontFamily:'inherit'}},'\u00d7'):null))); });
    return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,overflow:'hidden'}},
        h('div',{className:'yscroll',style:{overflow:'auto',maxHeight:this.dsoHistH('done')}},
          h('table',{style:{width:'100%',minWidth:((line?760:860)+zs.length*54)+'px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,paddingLeft:14}},this.t('dsoColDay')),
              line?null:h('th',{style:th},this.t('lsCol1')),
              h('th',{style:th},this.t('lsCol2')),
              h('th',{style:th},this.t('dsoColPo')),
              h('th',{style:th},this.t('dsoColColor')),
              ...zs.map(z=>h('th',{key:'z'+z,style:{...th,textAlign:'right',padding:'9px 8px'}},z)),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoColQty')),
              h('th',{style:{...th,borderRight:'none'}},this.t('lsCol10')))),
            h('tbody',null,body)))),
      this.renderDsoHandAsk(),this.renderDsoHandBulk());
  }

  // ==== Chon so luong giao sang hoan thien ==================================
  // Tren: con lai CHUA GIAO gop theo SIZE (moi ngay, moi ma hang trong pham vi
  // dang xem). Duoi: dien so luong muon giao cho tung size -> Xac nhan -> phieu.
  renderDsoHandBulk(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const b=this.state.dsoHandBulk; if(!b) return null;
    const close=()=>this.set({dsoHandBulk:null});
    const p=this.dsoBulkPool(), has=!!(p&&p.qty);
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,padding:'15px 20px',flex:'none',
        borderBottom:'1px solid '+C.line}},
      h('div',{style:{width:36,height:36,borderRadius:10,background:C.tint,color:C.dark,flex:'none',
          display:'flex',alignItems:'center',justifyContent:'center'}},
        h('svg',{width:19,height:19,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M5 12h14M13 6l6 6-6 6'}))),
      h('div',{style:{minWidth:0,marginRight:'auto'}},
        h('div',{style:{fontSize:16,fontWeight:700}},this.t('dsoHandOver')),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:2}},this.t('dsoHandAllSub'))),
      h('button',{title:this.t('dsoClose'),onClick:close,
        style:{border:'1px solid '+C.border,background:C.white,color:C.sub,borderRadius:9,width:30,height:30,
          flex:'none',cursor:'pointer',fontSize:17,lineHeight:1,padding:0,fontFamily:'inherit'},
        'style-hover':{background:C.tint}},'\u00d7'));
    let bodyEl;
    if(!has) bodyEl=h('div',{style:{padding:'52px 24px',textAlign:'center',color:C.faint,
      fontSize:13.5}},this.t('dsoNoUnhanded'));
    else {
      const zs=this.dsoSizeList(p.sizes), gTot=this.dsoBulkQty();
      const got=z=>{ const v=(b.qty||{})[z]; return v==null?'':String(v); };
      // Con lai theo size + pham vi dang gom (chuyen / ngay)
      const cards=h('div',{style:{padding:'18px 20px 0'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:9,flexWrap:'wrap'}},
          h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('bkPend')),
          h('div',{style:{flex:1,minWidth:8}}),
          h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:C.dark,background:C.tint,
            borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},this.fmt(p.qty)+' pcs')),
        h('div',{style:{display:'flex',gap:9,flexWrap:'wrap'}},
          zs.map(([z,q])=>h('div',{key:'c'+z,style:{flex:'none',minWidth:66,border:'1px solid '+C.border,
              borderRadius:11,background:C.white,padding:'8px 12px',textAlign:'center'}},
            h('div',{style:{fontSize:11,fontWeight:700,letterSpacing:'.4px',color:C.sub}},z),
            h('div',{style:{fontSize:19,fontWeight:700,fontFamily:mono,color:C.ink,marginTop:2,
              lineHeight:1}},this.fmt(q))))),
        h('div',{style:{fontSize:11.5,color:C.faint,marginTop:10}},
          this.t('bgLine')+': '+p.lines.join(' + ')+'  \u00b7  '+this.t('bkDays')+': '
          +(p.days.length>1?(this.dsoDay(p.days[0])+' \u2192 '+this.dsoDay(p.days[p.days.length-1]))
            :this.dsoDay(p.days[0]))));
      // Bang nhap so luong giao
      const th={padding:'9px 12px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',color:C.sub,
        textAlign:'center',background:'#f8faf3',borderBottom:'1px solid '+C.border,whiteSpace:'nowrap'};
      const td={padding:'7px 12px',fontSize:13,textAlign:'center',borderTop:'1px solid '+C.line};
      const inp={width:92,padding:'6px 8px',textAlign:'center',fontFamily:mono,fontSize:13.5,fontWeight:700,
        color:C.ink,border:'1px solid '+C.border,borderRadius:8,background:C.white};
      const grid=h('div',{style:{padding:'18px 20px 4px'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:9}},
          h('div',{style:{fontSize:10.5,fontWeight:700,letterSpacing:'.5px',color:C.faint}},this.t('bkGive')),
          h('div',{style:{flex:1,minWidth:8}}),
          h('button',{onClick:()=>this.dsoBulkFill(true),
            style:{...this.btn('ghost'),padding:'5px 10px',fontSize:11.5},
            'style-hover':{background:C.tint}},this.t('bkAll')),
          h('button',{onClick:()=>this.dsoBulkFill(false),
            style:{...this.btn('ghost'),padding:'5px 10px',fontSize:11.5},
            'style-hover':{background:C.tint}},this.t('bkNone'))),
        h('div',{style:{border:'1px solid '+C.border,borderRadius:12,overflow:'hidden'}},
          h('table',{style:{width:'100%',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,borderRight:'1px solid '+C.border,width:'34%'}},this.t('dsoColSize')),
              h('th',{style:{...th,borderRight:'1px solid '+C.border,width:'33%'}},this.t('bkLeft')),
              h('th',{style:th},this.t('bkGive')))),
            h('tbody',null,
              zs.map(([z,q],i)=>h('tr',{key:'r'+z},
                h('td',{style:{...td,...(i?{}:{borderTop:'none'}),borderRight:'1px solid '+C.line,
                  fontWeight:700,fontSize:14}},z),
                h('td',{style:{...td,...(i?{}:{borderTop:'none'}),borderRight:'1px solid '+C.line,
                  fontFamily:mono,color:C.sub}},this.fmt(q)),
                h('td',{style:{...td,...(i?{}:{borderTop:'none'})}},
                  h('input',{type:'text',inputMode:'numeric',value:got(z),placeholder:'0',
                    onChange:e=>this.dsoBulkSet(z,e.target.value,q),style:inp})))),
              h('tr',{key:'tot'},
                h('td',{style:{...td,borderTop:'1px solid '+C.border,borderRight:'1px solid '+C.line,
                  background:C.tint,fontWeight:700,fontSize:12.5}},this.t('bkTot')),
                h('td',{style:{...td,borderTop:'1px solid '+C.border,borderRight:'1px solid '+C.line,
                  background:C.tint,fontFamily:mono,color:C.sub}},this.fmt(p.qty)),
                h('td',{style:{...td,borderTop:'1px solid '+C.border,background:C.tint,fontFamily:mono,
                  fontWeight:700,fontSize:15,color:gTot?C.dark:C.faint}},this.fmt(gTot)))))));
      bodyEl=h('div',{className:'yscroll',style:{overflow:'auto',flex:1,minHeight:130}},cards,grid);
    }
    const sel=has?this.dsoBulkQty():0;
    const foot=h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'12px 20px',flex:'none',
        borderTop:'1px solid '+C.line,background:'#f8faf3',flexWrap:'wrap'}},
      has?h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:sel?C.dark:C.faint,
        whiteSpace:'nowrap'}},this.fmt(sel)+' pcs '+this.t('bkSel')):null,
      h('div',{style:{flex:1,minWidth:8}}),
      h('button',{onClick:close,style:this.btn('ghost')},this.t('psCancel')),
      has?h('button',{disabled:!sel,onClick:()=>this.dsoBulkOk(),
        style:{...this.btn('primary'),...(sel?{}:{opacity:.45,cursor:'not-allowed'})}},
        this.t('bkNext'),
        h('svg',{width:14,height:14,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2},
          h('path',{d:'M9 6l6 6-6 6'}))):null);
    return h('div',{onClick:close,style:{position:'fixed',inset:0,background:'rgba(24,28,22,.5)',
        backdropFilter:'blur(2px)',display:'flex',alignItems:'center',justifyContent:'center',
        zIndex:86,padding:24}},
      h('div',{onClick:ev=>ev.stopPropagation(),style:{width:'min(680px,96vw)',maxHeight:'92vh',
          display:'flex',flexDirection:'column',background:C.white,borderRadius:18,
          boxShadow:'0 30px 70px rgba(0,0,0,.34)',overflow:'hidden'}},
        head,bodyEl,foot));
  }

  // ==== Bang lich su hang loi: 1 dong = 1 lan ghi (ngay/size/ma loi) ====
  // Size la 1 COT rieng (khong bung ra nhieu cot nhu bang hoan thanh) vi con
  // phai cho cot Ly do -- bung size ra nua thi bang qua rong.
  renderDsoDefHistory(line){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const all=this.dsoDefHistory(line), q=this.state.dsoDefQ||'';
    const rows=all.filter(r=>this.dsoRowHit(r,q,r.at+' '+r.code+' '+this.dsoDefName(r.code)));
    const th={padding:'9px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,
      background:'#f8faf3',whiteSpace:'nowrap',position:'sticky',top:0,zIndex:1};
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,
      borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:10,marginTop:26,
        flexWrap:'wrap'}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:15,fontWeight:700}},this.t('dsoDefHist')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('dsoDefHistSub'))),
      h('div',{style:{flex:1,minWidth:8}}),
      all.length?this.dfSearchBox(q,v=>this.set({dsoDefQ:v}),false,'dsoHistSearch'):null,
      rows.length?h('button',{title:this.t('dsoDefExpTip'),onClick:()=>this.dsoDefExport(line),
        style:{border:'1px solid '+C.border,background:C.white,color:C.primary,borderRadius:8,
          padding:'6px 12px',fontSize:12,fontWeight:700,fontFamily:'inherit',cursor:'pointer',
          whiteSpace:'nowrap'},'style-hover':{background:C.tint}},this.t('exportXls')):null,
      h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
        border:'1px solid #eccfca',borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},
        this.fmt(rows.reduce((a,r)=>a+r.qty,0))+' pcs'));
    const note=t=>h('div',{style:{border:'1px solid '+C.border,borderRadius:13,background:C.white,
      padding:'34px 20px',textAlign:'center',color:C.faint,fontSize:13}},this.t(t));
    if(!all.length) return h('div',null,head,note('dsoDefHistEmpty'));
    if(!rows.length) return h('div',null,head,note('dfNoHit'));
    const body=rows.map((r,i)=>{ const bg=i%2?'#f7f9f3':C.white, nm=this.dsoDefName(r.code);
      return h('tr',{key:r.key},
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.dsoDay(r.day)),
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:700,whiteSpace:'nowrap',
          color:r.at?C.dark:C.faint}},r.at||'\u2014'),
        line?null:h('td',{style:{...td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},r.line),
        h('td',{style:{...td,background:bg,fontFamily:mono,wordBreak:'break-all'}},r.style),
        h('td',{style:{...td,background:bg,fontFamily:mono,whiteSpace:'nowrap'}},r.po),
        h('td',{style:{...td,background:bg,fontWeight:700,color:C.dark,whiteSpace:'nowrap'}},r.color),
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:700,whiteSpace:'nowrap'}},r.size),
        h('td',{style:{...td,background:bg}},
          h('span',{style:{display:'inline-flex',alignItems:'center',gap:8,flexWrap:'wrap'}},
            h('span',{style:{fontSize:11,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
              border:'1px solid #eccfca',borderRadius:999,padding:'2px 8px',whiteSpace:'nowrap'}},r.code),
            h('span',{style:{fontWeight:600,wordBreak:'break-word'}},nm||'\u2014'))),
        h('td',{style:{...td,background:bg,borderRight:'none',textAlign:'right',fontFamily:mono,
          fontWeight:700,fontSize:14,whiteSpace:'nowrap'}},this.fmt(r.qty))); });
    return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,overflow:'hidden'}},
        h('div',{className:'yscroll',style:{overflow:'auto',maxHeight:this.dsoHistH('def')}},
          h('table',{style:{width:'100%',minWidth:(line?910:1010)+'px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,paddingLeft:14}},this.t('dsoColDay')),
              h('th',{style:th},this.t('dsoColTime')),
              line?null:h('th',{style:th},this.t('lsCol1')),
              h('th',{style:th},this.t('lsCol2')),
              h('th',{style:th},this.t('dsoColPo')),
              h('th',{style:th},this.t('dsoColColor')),
              h('th',{style:th},this.t('dsoColSize')),
              h('th',{style:th},this.t('dsoColReason')),
              h('th',{style:{...th,borderRight:'none',textAlign:'right'}},this.t('dsoColDefQty')))),
            h('tbody',null,body)))));
  }

  dsoSummary(){ const at={}, out=[];
    this.dsoHistory().forEach(r=>{ const k=r.day+'|'+r.line;
      if(!at[k]){ at[k]={key:k,day:r.day,line:r.line,done:0,handed:0}; out.push(at[k]); }
      at[k].done+=r.qty;
      at[k].handed+=this.dsoHandedQty(r); });
    return out; }   // dsoHistory da sap ngay giam dan, chuyen tang dan

  // Bang tong hop o cap Daily Sewing Output (truoc khi chon chuyen)
  // ==== Bang tong hop: chi hien 5 dong, con lai cuon ====================
  // Chieu cao 1 dong KHONG doan theo padding duoc: bang hang loi co chip ma loi
  // nen dong cao hon bang san luong, lai con doi theo font/zoom cua may. Nen do
  // that 5 dong dau + dau bang + dong TONG tu DOM.
  // Do xong nho vao _tblH roi ve lai dung 1 lan; lan sau do ra so cu -> dung,
  // khong lap vo han. Bo qua chenh lech <= 1px cho khoi rung khi hien thanh cuon.
  DSO_MAXROWS=5;
  _tblH={};
  // ref gan TRUOC componentDidMount -> _mounted van false, goi forceUpdate thang
  // se bi bo qua va so do vua do khong bao gio duoc dung. Hoan 1 tick, tien the
  // gop ca 2 bang vao chung mot lan ve lai.
  tblSync(){ clearTimeout(this._tblT);
    this._tblT=setTimeout(()=>{ if(this._mounted) this.forceUpdate(); },0); }
  dsoTblRef(key,nRows){ return el=>{
    if(!el) return;
    const cur=this._tblH[key];
    if(nRows<=this.DSO_MAXROWS){            // it dong -> bo gioi han, hien het
      if(cur!==undefined){ delete this._tblH[key]; this.tblSync(); }
      return; }
    const hd=el.querySelector('thead tr'), ft=el.querySelector('tfoot tr'), tb=el.querySelector('tbody');
    if(!hd||!ft||!tb) return;
    const rows=[].slice.call(tb.children,0,this.DSO_MAXROWS);
    if(rows.length<this.DSO_MAXROWS) return;
    const H=Math.ceil(hd.getBoundingClientRect().height+ft.getBoundingClientRect().height
      +rows.reduce((a,r)=>a+r.getBoundingClientRect().height,0));
    if(H>0&&(cur===undefined||Math.abs(cur-H)>1)){
      this._tblH[key]=H; this.tblSync(); } }; }

  renderDsoOverview(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const sum=this.dsoSummary();
    const th={padding:'9px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,
      background:'#f8faf3',whiteSpace:'nowrap',position:'sticky',top:0,zIndex:2};
    // Dong TONG ghim day khung: cuon giua bang van doc duoc tong so
    const tf={position:'sticky',bottom:0,zIndex:2};
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const tDone=sum.reduce((a,r)=>a+r.done,0), tHand=sum.reduce((a,r)=>a+r.handed,0);
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:10}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:15,fontWeight:700}},this.t('dsoOvw')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('dsoOvwSub'))),
      h('div',{style:{flex:1}}),
      h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:'#2f7d32',background:'#e6f2e2',
        border:'1px solid #cfe3b4',borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},
        this.t('dsoHanded')+' '+this.fmt(tHand)+' / '+this.fmt(tDone)+' pcs'));
    if(!sum.length) return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,background:C.white,padding:'30px 20px',
        textAlign:'center',color:C.faint,fontSize:13}},this.t('dsoHistEmpty')));
    const body=sum.map((r,i)=>{ const bg=i%2?'#f7f9f3':C.white, left=r.done-r.handed;
      return h('tr',{key:r.key},
        h('td',{style:{...td,background:bg,fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.dsoDay(r.day)),
        h('td',{style:{...td,background:bg,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},r.line),
        h('td',{style:{...td,background:bg,textAlign:'right',fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.fmt(r.done)),
        h('td',{style:{...td,background:bg,textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,
          color:r.handed?'#2f7d32':'#c3c8bf',whiteSpace:'nowrap'}},this.fmt(r.handed)),
        h('td',{style:{...td,background:bg,borderRight:'none',textAlign:'right',fontFamily:mono,fontWeight:600,
          color:left?'#946200':C.faint,whiteSpace:'nowrap'}},this.fmt(left))); });
    const foot=h('tr',null,
      h('td',{colSpan:2,style:{padding:'10px 12px',fontSize:11,fontWeight:700,letterSpacing:'.4px',
        color:'#cfe0be',background:C.dark,whiteSpace:'nowrap',...tf}},this.t('colTotal')),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:12.5,color:'#e6efdb',background:C.dark,...tf}},this.fmt(tDone)),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,color:'#fff',background:C.dark,...tf}},this.fmt(tHand)),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:12.5,color:'#e6efdb',background:C.dark,...tf}},this.fmt(tDone-tHand)));
    return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,overflow:'hidden'}},
        h('div',{className:'yscroll',ref:this.dsoTblRef('ovw',body.length),
            style:{overflowX:'auto',overflowY:'auto',maxHeight:this._tblH['ovw']}},
          h('table',{style:{width:'100%',minWidth:'620px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,paddingLeft:14}},this.t('dsoColDay')),
              h('th',{style:th},this.t('lsCol1')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoOvwDone')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoOvwHanded')),
              h('th',{style:{...th,borderRight:'none',textAlign:'right'}},this.t('dsoOvwLeft')))),
            h('tbody',null,body),
            h('tfoot',null,foot)))));
  }

  // ================= M-level board (andon toan man hinh) =================
  // target = gio lam * 60 * cong nhan / SMV * %Target cua bac M
  MLV_SLOTS=5;          // man hinh luon danh 5 o, bac hien tai o giua
  // Cung quy tac chon dong nhu prodLines(): uu tien dong DA co cau hinh trong
  // Line Setting. Lay dong dau vo dieu kien thi chuyen 2 style se doc cfg mac
  // dinh trong khi nguoi dung sua dong thu hai -> board lech han Line Setting.
  mlvRowOf(line){ const rows=this.getWeek().rows.filter(r=>this.normName(r.line)===line);
    if(!rows.length) return null; const st=this.state.lset||{};
    return rows.find(r=>st[this.lsKey(r)])||rows[0]; }
  // Cong thuc chinh; tra null khi thieu du lieu de o hien ': ()'
  mlvTarget(cfg,pct){ const hrs=parseFloat(cfg.hrs), w=Number(cfg.w), smv=parseFloat(cfg.smv);
    if(!(hrs>0)||!(w>0)||!(smv>0)||!(pct>0)) return null;
    return Math.floor(hrs*60*w/smv*(pct/100)); }
  mlvNum(v){ const n=parseFloat(String(v==null?'':v).replace(/[^0-9.]/g,'')); return isNaN(n)?0:n; }
  // Tong da lam cua ca chuyen (dung de xac dinh bac dang dat duoc)
  mlvDone(line){ let n=0; this.dsoSizeCards(line).forEach(c=>{ n+=this.dsoDoneOf(c); }); return n; }
  // K = (thu nhap 1 nguoi 9.5h / 9.5) * WORK HOURS cua line. Hien theo nghin.
  mlvK(inc,hrs){ const i=this.mlvNum(inc), h=this.mlvNum(hrs);
    return (i>0&&h>0)?(i/9.5*h):0; }
  // 5 o quanh bac dang dat duoc; thieu bac thi o do hien ': ()'.
  mlvSlots(line){ const r=this.mlvRowOf(line); if(!r) return {cfg:{},slots:[],cur:null};
    const cfg=this.lsGet(r);
    // Loai M cua chuyen = cot LOAI trong Line Setting (lsType suy tu SMV).
    // Cac BAC (Ms/M1/M2...) la cac dong chi tiet cua loai do: moi dong co %Target
    // rieng + thu nhap/1 nguoi (9.5h). Khong tim thay loai thi de trong, o hien
    // ': ()' -- tot hon la lay bua loai dau danh muc roi bao ra so sai.
    const ty=this.mtypeOf(r);
    const det=ty?this.mtDet(ty.id):[];
    let tiers=det.map(dd=>{ const nm=String(dd.name||'').trim();
      return {key:dd.id,name:nm?(/^m/i.test(nm)?nm:'M'+nm):'\u2014',
        pct:this.mlvNum(dd.tgt),inc:this.mlvNum(dd.inc),
        target:this.mlvTarget(cfg,this.mlvNum(dd.tgt)),kraw:this.mlvK(dd.inc,cfg.hrs)}; });
    // Sap tang dan theo %Target: no luon la so, con target co the null khi thieu
    // SMV/cong nhan -- sap theo target se day cac bac thieu du lieu len dau thang.
    tiers.sort((a,b)=>a.pct-b.pct);
    const done=this.mlvDone(line);
    let ci=-1; tiers.forEach((t,i)=>{ if(t.target!=null&&done>=t.target) ci=i; });
    if(ci<0) ci=0;                       // chua vuot bac nao -> dang o bac thap nhat
    const half=Math.floor(this.MLV_SLOTS/2), out=[];
    // tren xuong duoi: bac cao nhat truoc (giong anh: M2 tren, Ms duoi)
    for(let d=half;d>=-half;d--){ const t=tiers[ci+d];
      if(!t){ out.push({empty:true,key:'e'+d}); continue; }
      out.push({...t,cur:d===0}); }
    const cu=out.find(x=>x.cur)||null;
    return {cfg:cfg,row:r,type:ty,tiers:tiers,slots:out,cur:cu,done:done}; }
  // Chat luong tu dsoDefLog: don vi dat = da lam, loi = so lan ghi loi
  mlvQuality(line){ let def=0; const done=this.mlvDone(line), top={};
    const m=this.state.dsoDefLog||{};
    Object.keys(m).forEach(k=>{ const p=k.split('|'); if(p.length!==6||p[1]!==line) return;
      const o=m[k]||{}; Object.keys(o).forEach(code=>{ const n=Number(o[code])||0;
        def+=n; top[code]=(top[code]||0)+n; }); });
    const units=done+def;
    const t3=Object.keys(top).map(c=>({code:c,n:top[c]})).sort((a,b)=>b.n-a.n).slice(0,3);
    return {done:done,def:def,
      rate:units?(def/units*100):0,        // ti le loi tren tong don vi da kiem
      dhu:done?(def/done*100):0,           // loi tren 100 san pham dat
      top3:t3}; }
  // SAN LUONG / GIO lay thang tu LICH SU HOAN THANH cua chuyen: moi ban ghi
  // hoan thanh (ngay|chuyen|style|PO|mau|size) deu kem danh sach moc gio PASS
  // trong dsoPassLog, gom lai theo gio la ra bieu do. Cung nguon voi bang lich
  // su va voi so DA LAM -> khong bao gio lech nhau.
  // Loc chuyen giong mlvQuality: khoa 6 doan, doan[1] la ten chuyen.
  mlvHoursMap(line){ const m=this.state.dsoPassLog||{}, at={};
    Object.keys(m).forEach(key=>{ const p=key.split('|');
      if(p.length!==6||p[1]!==line) return;
      (m[key]||[]).forEach(t=>{ const b=p[0]+'|'+String(t).slice(0,2);   // 'YYYY-MM-DD|HH'
        at[b]=(at[b]||0)+1; }); });
    return at; }
  // 5 gio gan nhat, ke ca gio dang chay. Lui theo MOC THOI GIAN chu khong tru
  // so gio: qua nua dem van tra ve dung ngay cua gio do.
  mlvHours(line,n){ const at=this.mlvHoursMap(line), out=[], now=new Date();
    const k=n||this.MLV_SLOTS;
    for(let i=k-1;i>=0;i--){ const d=new Date(now.getTime()-i*3600000);
      const hh=String(d.getHours()).padStart(2,'0');
      out.push({h:d.getHours(),label:hh+':00',n:at[this.psFmtD(d)+'|'+hh]||0}); }
    return out; }
  // Roi khoi board thi PHAI tat: dong ho goi forceUpdate ca app moi giay, de chay
  // tiep thi moi trang khac cua app cung bi ve lai 1 lan/giay.
  mlvClockOff(){ if(this._mlvT){ clearInterval(this._mlvT); this._mlvT=null; } }
  mlvClock(){ if(!this._mlvT) this._mlvT=setInterval(()=>{ if(this._mounted) this.forceUpdate(); },1000);
    const d=new Date(), p=n=>String(n).padStart(2,'0');
    return {t:p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds()),
      d:p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()}; }
  // ---- Che do TV (toan man hinh) ----
  // Khong dua vao Fullscreen API mot minh: no bi chan trong kha nhieu tinh huong
  // (iframe khong co allow=fullscreen, cua so khong duoc focus, policy cua may) va
  // khi chan thi nem 'TypeError: not granted' -> bam nut khong ra gi ca.
  // Nen: che do TV la CSS phu kin viewport (luon chay duoc), con Fullscreen API
  // chi la them -- duoc thi an luon thanh dia chi cua trinh duyet.
  mlvIsFs(){ return !!this.state.mlvFs; }
  mlvNativeFs(){ const d=document; return !!(d.fullscreenElement||d.webkitFullscreenElement); }
  // Thoat fullscreen bang Esc/F11 -> tat luon che do TV cho khop trang thai
  mlvFsWatch(){ if(this._mlvFsH) return;
    this._mlvFsH=()=>{ if(!this._mounted) return;
      if(!this.mlvNativeFs()&&this.state.mlvFs) this.set({mlvFs:false});
      else this.forceUpdate(); };
    document.addEventListener('fullscreenchange',this._mlvFsH);
    document.addEventListener('webkitfullscreenchange',this._mlvFsH); }
  mlvFsOff(){ if(!this._mlvFsH) return;
    document.removeEventListener('fullscreenchange',this._mlvFsH);
    document.removeEventListener('webkitfullscreenchange',this._mlvFsH);
    this._mlvFsH=null; }
  mlvFsToggle(){ const on=!this.state.mlvFs, d=document, el=this._mlvEl;
    try{
      if(on){ const rq=el&&(el.requestFullscreen||el.webkitRequestFullscreen);
        if(rq){ const p=rq.call(el); if(p&&p.catch) p.catch(()=>{}); } }
      else if(this.mlvNativeFs()){ const ex=d.exitFullscreen||d.webkitExitFullscreen;
        if(ex){ const p=ex.call(d); if(p&&p.catch) p.catch(()=>{}); } }
    }catch(e){}
    this.set({mlvFs:on}); }
  mlvExit(){ this.mlvClockOff();
    if(this.mlvNativeFs()) this.mlvFsToggle();
    this.mlvFsOff(); this.set({mlvLine:null,mlvFs:false}); }

  // ================= Bang andon M-level =================
  // Bo cuc va TI LE lay theo anh mau 1690x887: moi co chu / khoang cach ben duoi
  // deu la so do trong anh, roi nhan he so k = be rong that / 1690. Nho vay ti le
  // giu nguyen du treo TV 4K hay xem trong cua so, khong phai keo gian cho day man.
  MLV_REF_W=1690; MLV_REF_H=887;
  // Khung noi dung luon dung ti le anh mau.
  //  - Toan man hinh: vua khit trong viewport, thua ra thanh vien den tren/duoi.
  //  - Trong cua so: an het be rong, cao suy ra tu ti le -> khong co vien den hai ben.
  mlvBox(fs){ const W0=this.MLV_REF_W, R=this.MLV_REF_H/W0, PADX=fs?0:14;
    const outer=(this._mlvEl&&this._mlvEl.clientWidth)||(fs?(window.innerWidth||W0):W0);
    const wMax=Math.max(520,outer-PADX*2);
    const w=fs?Math.min(wMax,Math.round((window.innerHeight||Math.round(W0*R))/R)):wMax;
    return {w:w,h:Math.round(w*R),k:w/W0,pad:PADX}; }
  renderMlvBoard(line){
    const h=React.createElement, mono="'IBM Plex Mono',monospace";
    const Y='#f5c518', R='#ff2d2d', W='#fff', G='#8b9099';
    const {cfg,row,slots,cur}=this.mlvSlots(line);
    const q=this.mlvQuality(line), ck=this.mlvClock();
    const fs=this.mlvIsFs(); this.mlvFsWatch();
    const B=this.mlvBox(fs), k=B.k;
    const px=n=>Math.max(9,Math.round(n*k));   // co chu
    const sp=n=>Math.max(1,Math.round(n*k));   // khoang cach
    const tgt=cur&&cur.target!=null?cur.target:null;
    const big=(v,c,sz)=>h('span',{style:{fontSize:px(sz),fontWeight:800,color:c,lineHeight:.92,
      letterSpacing:'-0.03em',fontFamily:'inherit'}},v);
    const btn=(label,fn)=>h('button',{key:label,onClick:fn,
      style:{background:'#1b1b1b',color:W,border:'1px solid #4a4a4a',borderRadius:sp(9),
        padding:sp(7)+'px '+sp(15)+'px',fontSize:px(20),fontWeight:700,fontFamily:'inherit',
        cursor:'pointer',whiteSpace:'nowrap'}},label);
    // ---- SAN LUONG / GIO ----
    // Khong ve vach dinh muc nua, nhung dinh muc/gio VAN dung de:
    //   - to mau cot: vang = dat nhip gio, do = duoi nhip
    //   - lam thang do: cot duoi dinh muc thi phai thap that, khong phong len cho day
    const wh=this.mlvNum(cfg.hrs), pace=(tgt!=null&&wh>0)?Math.round(tgt/wh):null;
    const bars=this.mlvHours(line);
    const peak=Math.max(pace||0,...bars.map(x=>x.n),1);
    const BODY=sp(292), NUM=px(20), AVAIL=BODY-NUM-sp(6), GAP=sp(14);
    const chart=h('div',{style:{flex:'1 1 0',minWidth:0}},
      h('div',{style:{fontSize:px(27),fontWeight:800,letterSpacing:'2px',color:G,
        marginBottom:sp(16)}},this.t('mlvPerHour')),
      h('div',{style:{display:'flex',gap:GAP,alignItems:'flex-end',height:BODY}},
        bars.map(x=>{ const ok=pace!=null?x.n>=pace:x.n>0;
          return h('div',{key:x.label,title:this.t('mlvHourTip'),
              style:{flex:1,minWidth:0,display:'flex',flexDirection:'column',
                justifyContent:'flex-end',gap:sp(6)}},
            h('div',{style:{fontSize:NUM,fontWeight:800,fontFamily:mono,textAlign:'center',
              lineHeight:1,color:x.n?(ok?Y:R):W}},this.fmt(x.n)),
            h('div',{style:{height:x.n?Math.max(3,Math.round(x.n/peak*AVAIL)):0,
              background:ok?Y:R,borderRadius:sp(3)+'px '+sp(3)+'px 0 0'}})); })),
      h('div',{style:{height:2,background:'#e8e8e8',margin:'0 0 '+sp(6)+'px'}}),
      h('div',{style:{display:'flex',gap:GAP}},
        bars.map(x=>h('div',{key:x.label,style:{flex:1,minWidth:0,textAlign:'center',
          fontSize:px(19),fontWeight:700,color:W,fontFamily:mono}},x.label))));
    // ---- CHAT LUONG ----
    // 1 hang cua o CHAT LUONG: nhan ben trai, so ben phai cung. Top 3 dung lai
    // dung khuon nay -> 3 so lan mac loi thang hang voi Ti le loi / DHU.
    // Nhan dai (ma loi - ten loi) thi cat bang '...', so ben phai khong bi day di.
    const qRow=(label,val,mb,key)=>h('div',{key:key||label,style:{display:'flex',
        justifyContent:'space-between',alignItems:'baseline',gap:sp(12),marginBottom:sp(mb)}},
      h('span',{style:{fontSize:px(28),fontWeight:700,color:W,flex:'1 1 auto',minWidth:0,
        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},label),
      h('span',{style:{fontSize:px(36),fontWeight:800,color:Y,fontFamily:mono,
        flex:'none'}},val));
    const qual=h('div',{style:{flex:'1 1 0',minWidth:0}},
      h('div',{style:{fontSize:px(27),fontWeight:800,letterSpacing:'2px',color:G,
        marginBottom:sp(16)}},this.t('mlvQual')),
      qRow(this.t('mlvRate'),q.rate.toFixed(1)+'%',14),
      qRow('DHU',q.dhu.toFixed(1),18),
      h('div',{style:{fontSize:px(27),fontWeight:800,color:W,marginBottom:sp(8)}},this.t('mlvTop3')),
      q.top3.length
        // 'ma loi - ten loi' ben trai, so lan mac loi ben phai cung. Ma loi giu
        // font mono cho de doi chieu voi Thu vien loi; ten loi thieu thi chi hien ma.
        ? q.top3.map((x,i)=>{ const nm=this.dsoDefName(x.code);
            return qRow(h('span',null,
                h('span',{style:{fontFamily:mono,fontWeight:800}},x.code),
                nm?' - '+nm:''),
              this.fmt(x.n), i===q.top3.length-1?0:10, x.code); })
        : h('div',{style:{fontSize:px(27),color:G}},'\u2014'));
    // ---- khung noi dung: header + hero ben trai, target + bac M ben phai, day la 2 o duoi ----
    const box=h('div',{style:{width:B.w,height:B.h,margin:'0 auto',position:'relative',
        display:'flex',flexDirection:'column',padding:sp(20)+'px '+sp(30)+'px '+sp(18)+'px'}},
      h('div',{style:{position:'absolute',top:0,right:0,zIndex:2,display:'flex',gap:sp(8)}},
        btn(this.t(fs?'mlvExitFull':'mlvFull'),()=>this.mlvFsToggle()),
        btn(this.t('mlvSwitch'),()=>this.mlvExit())),
      h('div',{style:{display:'flex',alignItems:'flex-start',gap:sp(24)}},
        // cot trai: gio / to+style / DA LAM - TARGET
        h('div',{style:{flex:'1 1 0',minWidth:0}},
          h('div',{style:{display:'flex',alignItems:'baseline',gap:sp(16)}},
            h('span',{style:{fontSize:px(44),fontWeight:800,color:Y,fontFamily:mono}},ck.t),
            h('span',{style:{fontSize:px(34),fontWeight:700,color:W,fontFamily:mono}},ck.d)),
          h('div',{style:{display:'flex',alignItems:'baseline',gap:sp(22),marginTop:sp(10),
              flexWrap:'wrap'}},
            h('span',{style:{fontSize:px(46),fontWeight:800,color:Y}},
              this.t('mlvTeam')+' '+String(line).replace(/^LINE\s*/i,'')+' / '+line),
            h('span',{style:{fontSize:px(44),fontWeight:800,color:Y,fontFamily:mono}},
              (row&&row.style)||'\u2014')),
          // DA LAM / TARGET la so quan trong nhat cua bang -> to nhat, to hon
          // ca so target do ben phai. 168 la muc con du cho ca truong hop
          // 4 chu so ca 2 ben ('1,234 / 1,234') ma khong dam vao cot bac M.
          h('div',{style:{textAlign:'center',marginTop:sp(52)}},
            h('span',{style:{display:'inline-flex',alignItems:'baseline',gap:sp(30),
                whiteSpace:'nowrap'}},
              big(this.fmt(q.done),R,168), big('/',W,112),
              big(tgt==null?'\u2014':this.fmt(tgt),W,168)))),
        // cot phai: target lon + 5 bac M
        h('div',{style:{flex:'0 0 auto',textAlign:'right',marginTop:sp(56)}},
          h('div',null,big(tgt==null?'\u2014':this.fmt(tgt),R,132)),
          h('div',{style:{marginTop:sp(14)}},
            slots.map(sl=>sl.empty
              ? h('div',{key:sl.key,style:{fontSize:px(32),fontWeight:800,color:W,
                  fontFamily:mono,lineHeight:1.4}},': ()')
              : h('div',{key:sl.key,
                  title:sl.kraw?(this.t('mlvIncTip')+': '+this.fmt(Math.round(sl.kraw))+' VND'):undefined,
                  style:{fontSize:px(32),fontWeight:800,fontFamily:mono,lineHeight:1.4,
                    color:sl.cur?W:R}},
                  (sl.cur?(this.fmt(Number(cfg.w)||0)+'\u00a0\u00a0'):'')+sl.name+' : '
                    // chua khai bao thu nhap -> '\u2014', khong phai 'K' tro tron
                    +(sl.kraw?(this.fmt(Math.round(sl.kraw/1000))+'K'):'\u2014')
                    +' ('+(sl.target==null?'':this.fmt(sl.target))+')'))))),
      // KHONG ep chieu cao hang duoi: ep 440 thi noi dung chi cao ~362, phan
      // thua nam BEN TRONG hang -> hut mot dai den ngay duoi chart. De hang tu
      // co theo noi dung, marginTop:'auto' day no xuong sat day khung.
      h('div',{style:{display:'flex',gap:sp(30),marginTop:'auto'}},chart,qual));
    return h('div',{ref:el=>{ this._mlvEl=el; },'data-screen-label':'DSO M-level Board',
      style:{background:'#000',color:W,overflow:'hidden',
        ...(fs
          ? {position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,borderRadius:0,
             display:'flex',alignItems:'center',justifyContent:'center',padding:0}
          : {position:'relative',borderRadius:14,padding:B.pad})}},
      box);
  }

  // Chia theo tung line giong man Production
  renderDsoMlv(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const list=this.prodLines();
    if(this.state.mlvLine&&list.some(x=>x.line===this.state.mlvLine)) return this.renderMlvBoard(this.state.mlvLine);
    this.mlvClockOff();
    if(!list.length) return h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty'));
    return h('div',{style:{padding:'16px 18px 20px'}},
      h('div',{style:{fontSize:12,color:C.faint,marginBottom:11}},this.t('mlvPick')),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(238px,1fr))',gap:12}},
        list.map(x=>{ const {cfg,cur}=this.mlvSlots(x.line);
          const tg=cur&&cur.target!=null?cur.target:null;
          return h('div',{key:x.line,onClick:()=>this.set({mlvLine:x.line}),title:this.t('mlvOpen'),
            style:{border:'1px solid '+C.border,borderRadius:14,background:'#101010',color:'#fff',cursor:'pointer',
              padding:'13px 15px',minHeight:104,display:'flex',flexDirection:'column',justifyContent:'space-between',gap:12},
            'style-hover':{borderColor:C.primary}},
            h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}},
              h('div',{style:{fontSize:16,fontWeight:800,color:'#f5c518',fontFamily:mono}},x.line),
              h('div',{style:{fontSize:11,fontWeight:700,color:'#8b9099'}},cur?cur.name:'\u2014')),
            h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:10}},
              h('div',{style:{fontSize:22,fontWeight:800,color:'#ff2d2d',fontFamily:mono}},
                this.fmt(this.mlvQuality(x.line).done)),
              h('div',{style:{fontSize:15,fontWeight:700,color:'#fff',fontFamily:mono}},
                '/ '+(tg==null?'\u2014':this.fmt(tg))))); })));
  }

  // ==== Tong hop hang loi theo CHUYEN -- cho trang Daily Sewing Output ====
  // Gop MOI ngay lai. 'Da kiem' = pass + fail, ti le loi tinh tren tong da kiem.
  dsoFailByLine(){ const at={}, out=[];
    const get=n=>{ if(!at[n]){ at[n]={line:n,pass:0,fail:0,by:{}}; out.push(at[n]); } return at[n]; };
    const dm=this.state.dsoDone||{};
    Object.keys(dm).forEach(k=>{ const q=Number(dm[k])||0; if(q<=0) return;
      const p=k.split('|'); if(p.length===6) get(p[1]).pass+=q; });
    const fm=this.state.dsoDefLog||{};
    Object.keys(fm).forEach(k=>{ const p=k.split('|'); if(p.length!==6) return;
      const a=get(p[1]), o=fm[k]||{};
      Object.keys(o).forEach(c=>{ const q=Number(o[c])||0; if(q<=0) return;
        a.fail+=q; a.by[c]=(a.by[c]||0)+q; }); });
    out.forEach(a=>{ const u=a.pass+a.fail; a.rate=u?(a.fail/u*100):0;
      a.top=Object.keys(a.by).map(c=>({code:c,n:a.by[c]}))
        .sort((x,y)=>y.n-x.n||String(x.code).localeCompare(String(y.code)))[0]||null; });
    // Chuyen loi NHIEU NHAT len dau -- bang nay de soi chat luong, khong phai tra cuu
    return out.sort((a,b)=>b.fail-a.fail||String(a.line).localeCompare(String(b.line))); }
  dsoPct1(v){ return (Math.round((Number(v)||0)*10)/10).toFixed(1)+'%'; }

  renderDsoFailOverview(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.dsoFailByLine();
    const th={padding:'9px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',
      color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,
      background:'#f8faf3',whiteSpace:'nowrap',position:'sticky',top:0,zIndex:2};
    // Dong TONG ghim day khung: cuon giua bang van doc duoc tong so
    const tf={position:'sticky',bottom:0,zIndex:2};
    // Mau nen dat o <tr> de :hover ca dong hien duoc (bam 1 dong -> mo chuyen)
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,
      borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const tPass=rows.reduce((a,r)=>a+r.pass,0), tFail=rows.reduce((a,r)=>a+r.fail,0);
    const tRate=(tPass+tFail)?(tFail/(tPass+tFail)*100):0;
    const head=h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:10,marginTop:26}},
      h('div',{style:{minWidth:0}},
        h('div',{style:{fontSize:15,fontWeight:700}},this.t('dsoFailOvw')),
        h('div',{style:{fontSize:12,color:C.faint,marginTop:2}},this.t('dsoFailOvwSub'))),
      h('div',{style:{flex:1}}),
      h('span',{style:{fontSize:12,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
        border:'1px solid #eccfca',borderRadius:999,padding:'4px 11px',whiteSpace:'nowrap'}},
        this.t('dsoFail')+' '+this.fmt(tFail)+' \u00b7 '+this.dsoPct1(tRate)));
    if(!rows.length) return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,background:C.white,padding:'30px 20px',
        textAlign:'center',color:C.faint,fontSize:13}},this.t('dsoFailOvwEmpty')));
    const body=rows.map((r,i)=>{ const bg=i%2?'#f7f9f3':C.white, nm=r.top?this.dsoDefName(r.top.code):'';
      return h('tr',{key:r.line,onClick:()=>this.set({dsoLine:r.line}),title:this.t('dsoOpenLine'),
          style:{cursor:'pointer',background:bg},'style-hover':{background:C.tint}},
        h('td',{style:{...td,paddingLeft:14,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},r.line),
        h('td',{style:{...td,textAlign:'right',fontFamily:mono,fontWeight:600,whiteSpace:'nowrap'}},this.fmt(r.pass)),
        h('td',{style:{...td,textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,
          color:r.fail?'#a3271b':'#c3c8bf',whiteSpace:'nowrap'}},this.fmt(r.fail)),
        h('td',{style:{...td,textAlign:'right',fontFamily:mono,fontWeight:700,
          color:r.rate?'#946200':C.faint,whiteSpace:'nowrap'}},this.dsoPct1(r.rate)),
        h('td',{style:{...td,borderRight:'none'}}, r.top
          ? h('span',{style:{display:'inline-flex',alignItems:'center',gap:8,flexWrap:'wrap'}},
              h('span',{style:{fontSize:11,fontWeight:700,fontFamily:mono,color:'#a3271b',background:'#fdecea',
                border:'1px solid #eccfca',borderRadius:999,padding:'2px 8px',whiteSpace:'nowrap'}},r.top.code),
              h('span',{style:{fontWeight:600,wordBreak:'break-word'}},nm||'\u2014'),
              h('span',{style:{fontSize:11.5,fontFamily:mono,color:C.faint,whiteSpace:'nowrap'}},
                '\u00d7'+this.fmt(r.top.n)))
          : h('span',{style:{color:C.faint}},'\u2014'))); });
    const foot=h('tr',null,
      h('td',{style:{padding:'10px 12px',fontSize:11,fontWeight:700,letterSpacing:'.4px',
        color:'#cfe0be',background:C.dark,whiteSpace:'nowrap',...tf}},this.t('colTotal')),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:12.5,
        color:'#e6efdb',background:C.dark,...tf}},this.fmt(tPass)),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:14,
        color:'#fff',background:C.dark,...tf}},this.fmt(tFail)),
      h('td',{style:{padding:'10px 10px',textAlign:'right',fontFamily:mono,fontWeight:700,fontSize:12.5,
        color:'#e6efdb',background:C.dark,...tf}},this.dsoPct1(tRate)),
      h('td',{style:{background:C.dark,...tf}}));
    return h('div',null,head,
      h('div',{style:{border:'1px solid '+C.border,borderRadius:13,overflow:'hidden'}},
        h('div',{className:'yscroll',ref:this.dsoTblRef('fail',body.length),
            style:{overflowX:'auto',overflowY:'auto',maxHeight:this._tblH['fail']}},
          h('table',{style:{width:'100%',minWidth:'660px',borderCollapse:'collapse'}},
            h('thead',null,h('tr',null,
              h('th',{style:{...th,paddingLeft:14}},this.t('lsCol1')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoPass')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoFail')),
              h('th',{style:{...th,textAlign:'right'}},this.t('dsoFailRate')),
              h('th',{style:{...th,borderRight:'none'}},this.t('dsoTopDef')))),
            h('tbody',null,body),
            h('tfoot',null,foot)))));
  }

  renderDsoProd(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const list=this.prodLines();
    if(this.state.dsoLine&&list.some(x=>x.line===this.state.dsoLine)) return this.renderDsoLineDetail(this.state.dsoLine);
    if(!list.length) return h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty'));
    const show=v=>(v===''||v==null)?'\u2014':String(v);
    // 1 goc = nhan nho + so; align phai cho 2 goc ben phai
    const corner=(label,val,right)=>h('div',{style:{minWidth:0,textAlign:right?'right':'left'}},
      h('div',{style:{fontSize:9.5,fontWeight:700,letterSpacing:'.5px',color:C.faint,whiteSpace:'nowrap'}},label),
      h('div',{style:{fontSize:15,fontWeight:700,fontFamily:mono,color:C.ink,marginTop:2,whiteSpace:'nowrap'}},val));
    const cardGrid=h('div',{style:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(238px,1fr))',gap:12}},
      list.map(x=>h('div',{key:x.line,onClick:()=>this.set({dsoLine:x.line}),title:this.t('dsoOpenLine'),
        style:{border:'1px solid '+C.border,borderRadius:14,background:C.white,boxShadow:C.shadow,cursor:'pointer',
          padding:'13px 15px',minHeight:116,display:'flex',flexDirection:'column',justifyContent:'space-between',gap:14},
        'style-hover':{borderColor:C.primary}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}},
          h('div',{style:{fontSize:16,fontWeight:700,color:C.primary,fontFamily:mono,whiteSpace:'nowrap'}},x.line),
          corner(this.t('lsCol3'),show(x.cfg.w),true)),
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:10}},
          corner(this.t('lsCol4'),show(x.cfg.hrs),false),
          corner(this.t('lsCol6'),show(x.cfg.smv),true)))));
    return h('div',{style:{padding:'16px 18px 20px'}},
      this.renderDsoOverview(),
      this.renderDsoFailOverview(),
      h('div',{style:{fontSize:15,fontWeight:700,margin:'24px 0 4px'}},this.t('dsoLines')),
      h('div',{style:{fontSize:12,color:C.faint,marginBottom:11}},this.t('dsoLinesSub')),
      cardGrid);
  }

  renderLineSetting(){
    const h=React.createElement, C=this.C, mono="'IBM Plex Mono',monospace";
    const rows=this.getWeek().rows;
    if(!rows.length) return h('div',{style:{padding:'56px 24px',textAlign:'center',color:C.faint,fontSize:13.5}},this.t('demandEmpty'));
    const th={padding:'10px 10px',fontSize:10.5,fontWeight:700,letterSpacing:'.4px',textTransform:'uppercase',color:C.sub,textAlign:'left',borderBottom:'2px solid '+C.border,borderRight:'1px solid '+C.line,background:'#f8faf3',whiteSpace:'nowrap'};
    const td={padding:'8px 10px',fontSize:12.5,borderTop:'1px solid '+C.line,borderRight:'1px solid '+C.line,verticalAlign:'middle'};
    const lock={...td,opacity:.7,cursor:'default'};
    const inp={width:'100%',border:'1.5px solid '+C.primary,borderRadius:7,padding:'5px 7px',fontSize:12.5,fontFamily:mono,fontWeight:600,color:C.ink,background:C.white,boxSizing:'border-box'};
    const gbtn=(label,on,extra)=>h('button',{onClick:on,style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:8,padding:'4px 10px',fontSize:11.5,fontWeight:700,fontFamily:'inherit',cursor:'pointer',whiteSpace:'nowrap',...(extra||{})},'style-hover':{background:C.tint}},label);
    const body=rows.map((r,i)=>{
      const k=this.lsKey(r), v=this.lsGet(r), ed=this.state.lsEdit===k, bg=i%2?'#f7f9f3':C.white;
      const num=(field,ph,fn)=>ed
        ? h('input',{type:'text',inputMode:'decimal',value:v[field]==null?'':v[field],placeholder:ph,
            onChange:e=>this.lsSet(r,{[field]:this[fn||'lsNum'](e.target.value)}),style:{...inp,textAlign:'center'}})
        : (v[field]===''||v[field]==null?'\u2014':String(v[field]));
      return h('tr',{key:k},
        h('td',{title:this.t('tipPlanCol'),style:{...lock,background:C.tint,fontWeight:700,color:C.primary,whiteSpace:'nowrap'}},this.normName(r.line)),
        h('td',{title:this.t('tipPlanCol'),style:{...lock,background:bg,fontFamily:mono,wordBreak:'break-all'}},r.style||'\u2014'),
        h('td',{style:{...td,background:bg,textAlign:'center',fontFamily:mono}},num('w','0')),
        h('td',{style:{...td,background:bg,textAlign:'center',fontFamily:mono}},num('hrs','9.5','lsDec1')),
        h('td',{style:{...td,background:bg,textAlign:'center',color:C.faint,fontFamily:mono}},v.date||'\u2014'),
        h('td',{title:this.t('lsDec1Tip'),style:{...td,background:bg,textAlign:'center',fontFamily:mono}},num('smv','0','lsDec1')),
        h('td',{title:this.t('lsTypeTip'),style:{...td,background:bg,textAlign:'center'}}, ed
          ? h('select',{value:this.lsTypeLabel(r),disabled:true,onChange:()=>{},
              style:{...inp,border:'1px solid '+C.border,color:C.sub,background:'#f1f2ef',cursor:'not-allowed',appearance:'auto'}},
              h('option',{value:this.lsTypeLabel(r)},this.lsTypeLabel(r)||'\u2014'))
          : (this.lsTypeLabel(r)||'\u2014')),
        h('td',{style:{...td,background:bg,textAlign:'center',fontFamily:mono,fontWeight:700}}, ed
          ? h('input',{type:'text',inputMode:'numeric',value:v.tgt==null?'':v.tgt,placeholder:'0',
              title:this.t('lsPctTip'),onChange:e=>this.lsSet(r,{tgt:this.lsPct(e.target.value)}),style:{...inp,textAlign:'center'}})
          : (v.tgt===''||v.tgt==null?'\u2014':v.tgt+'%')),
        h('td',{style:{...td,background:bg}}, v.file
          ? h('span',{style:{display:'inline-flex',alignItems:'center',gap:7,minWidth:0}},
              h('svg',{width:13,height:13,viewBox:'0 0 24 24',fill:'none',stroke:C.primary,strokeWidth:2,style:{flex:'none'}},h('path',{d:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'}),h('path',{d:'M14 2v6h6'})),
              h('span',{style:{fontWeight:600,wordBreak:'break-all'}},v.file.name),
              h('span',{style:{flex:'none',fontSize:10.5,color:C.faint,fontFamily:mono}},this.lsFileSize(v.file.size)),
              h('button',{title:this.t('lsFileDel'),onClick:()=>this.lsFileDel(r),style:{flex:'none',border:'none',background:'none',color:'#c0392b',cursor:'pointer',padding:0,fontSize:14,lineHeight:1,fontFamily:'inherit'}},'\u00d7'))
          : h('span',{style:{color:C.faint}},'\u2014')),
        h('td',{style:{...td,background:bg,borderRight:'none',whiteSpace:'nowrap'}},
          h('div',{style:{display:'flex',gap:6,alignItems:'center'}},
            ed?gbtn(this.t('lsDone'),()=>this.lsDone(r),{border:'1px solid '+C.primary,background:C.tint})
              :gbtn(this.t('lsEdit'),()=>this.set({lsEdit:k})),
            h('label',{title:this.t('lsImportTip'),style:{border:'1px solid '+C.border,background:C.white,color:C.dark,borderRadius:8,padding:'4px 10px',fontSize:11.5,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'},'style-hover':{background:C.tint}},
              this.t('lsImport'),
              h('input',{type:'file',accept:'.xlsx,.xls,.csv',style:{display:'none'},
                onChange:e=>{ const f=e.target.files&&e.target.files[0]; e.target.value=''; if(f) this.lsImport(r,f); }})))));
    });
    return h('div',{className:'yscroll',style:{overflowX:'auto'}},
      h('table',{style:{width:'100%',minWidth:'1180px',borderCollapse:'collapse'}},
        h('thead',null,h('tr',null,
          h('th',{style:{...th,paddingLeft:22}},this.t('lsCol1')),
          h('th',{style:th},this.t('lsCol2')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol3')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol4')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol5')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol6')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol7')),
          h('th',{style:{...th,textAlign:'center'}},this.t('lsCol8')),
          h('th',{style:th},this.t('lsCol9')),
          h('th',{style:{...th,borderRight:'none'}},this.t('lsCol10')))),
        h('tbody',null,body)));
  }

  renderDsoBody(){
    const h=React.createElement; const tab=this.state.dsoTab||'cfg';
    if(tab!=='mlv') this.mlvClockOff();
    return h('div',{ref:this.scrollRef,className:'yscroll',style:{flex:1,overflow:'auto',padding:'24px 30px 40px'}},
      this.renderTitle('dsoTitle','S-05-SEWOUT-DAILY · UI Proto'),
      this.tabBar(this.DSO_TABS,tab,id=>this.set({dsoTab:id,edit:null}),false),
      tab==='prod'?this.dsoCard('dsoProdPanel','dsoProdSub','DSO Production',this.renderDsoProd())
      :tab==='alert'?this.renderDsoAlerts()
      :tab==='mlv'?this.renderDsoMlv()
      :this.renderDsoSettings());
  }

  reconcileWeeks(){
    const keys=[]; Object.values(this.MONTHS).forEach(ws=>ws.forEach(w=>keys.push(w)));
    const w={...(this.state.weeks||{})}; let ch=false;
    // Bản lưu cũ còn mã hàng dính mô tả từ file KHSX — làm sạch cả dữ liệu đã lưu
    const fix={};
    Object.keys(w).forEach(k=>{ const rows=(w[k]&&w[k].rows)||[]; let dirty=false;
      const nr=rows.map(r=>{ const c=this.psCode(r.style); if(c===r.style) return r; fix[r.style]=c; dirty=true; return {...r,style:c}; });
      if(dirty){ w[k]={...w[k],rows:nr}; ch=true; } });
    if(Object.keys(fix).length){
      const sub=s=>{ let v=String(s==null?'':s); Object.keys(fix).forEach(bad=>{ if(v.indexOf(bad)>=0) v=v.split(bad).join(fix[bad]); }); return v; };
      const remap=o=>{ if(!o) return o; const out={}; Object.keys(o).forEach(k2=>{ out[sub(k2)]=o[k2]; }); return out; };
      this.state.cap=remap(this.state.cap);
      const daily={...(this.state.daily||{})};
      Object.keys(daily).forEach(dk=>{ daily[dk]=(daily[dk]||[]).map(r=>(r&&r.k&&sub(r.k)!==r.k)?{...r,k:sub(r.k)}:r); });
      this.state.daily=daily; }
    let reseed=false;
    keys.forEach(k=>{ const cur=w[k];
      if(cur&&cur.rows&&cur.rows.length&&!cur.demo&&!cur.auto) return;   // tuần đã sửa tay -> giữ nguyên
      const rows=this.psPlanRows(k); if(!rows.length&&cur) return;
      if(cur&&cur.demo) reseed=true;
      if(cur&&cur.auto&&JSON.stringify(cur.rows)===JSON.stringify(rows)) return;
      w[k]={rows,auto:true}; ch=true; });
    if(ch) this.state.weeks=w;
    const ci=keys.indexOf(this.CURWK), wi=keys.indexOf(this.state.week);
    if(wi<0||(ci>=0&&wi<ci)){ this.state.week=this.CURWK; ch=true; }
    if(this.state.openMonth!==String(this.state.week).split(' · ')[0]){ this.state.openMonth=String(this.state.week).split(' · ')[0]; ch=true; }
    if(ch){ if(this.state.capTurns) this.state.capTurns=this.allocTurns();
      if(reseed||!Object.keys(this.state.bundle||{}).length) this.state.bundle=this.initBundle((this.state.weeks[this.CURWK]||{rows:[]}).rows); }
    if(this._mounted&&ch) this.forceUpdate(); }
  // ==== Tác nghiệp cắt cho đơn chưa upload file — sinh 1 lần, dùng chung mọi màn ====
  psCode(code){ let s=String(code||'').trim();
    s=s.split('(')[0].trim();
    s=s.replace(/\s*\/\s*PO[-\s]*[\d,\s]*$/i,'');
    const m=s.match(/^(.*?[A-Z0-9&])(?=[A-Z][a-z])/); if(m&&m[1].length>=4) s=m[1];
    return s.replace(/[\s&\/+-]+$/,'').trim()||String(code||''); }
  brandForStyle(code){ const st=String(code||'').toUpperCase().replace(/\s+/g,''); if(!st) return '';
    let b=''; this.psActiveOrders().forEach(o=>{ if(!b&&String(o.code||'').toUpperCase().replace(/\s+/g,'')===st) b=this.brandOf(o); });
    if(!b) Object.keys(this.MES).forEach(k=>{ if(!b&&(this.MES[k]||[]).some(x=>String(x).toUpperCase().replace(/\s+/g,'')===st)) b=k; });
    return b==='OTHER'?'':b; }
  // Gợi ý thương hiệu cho form thêm đơn tay — đơn đã có trong kế hoạch + bảng màu thương hiệu
  psBrands(){ const s=[]; const add=o=>{ const b=this.brandOf(o); if(b&&b!=='OTHER'&&s.indexOf(b)<0) s.push(b); };
    this.psActiveOrders().forEach(add); this.psAllOrders().forEach(add); return s; }
  psStyles(brand){ const s=[]; const add=o=>{ const c=this.psCode(o.code); if(c&&(!brand||this.brandOf(o)===brand)&&s.indexOf(c)<0) s.push(c); };
    this.psActiveOrders().forEach(add); this.psAllOrders().forEach(add); return s; }

}

  RT.boot(Sewing, { primaryColor: '#8FC93A', density: 'Comfortable' }, 'yic.mes.sewing');
})();
