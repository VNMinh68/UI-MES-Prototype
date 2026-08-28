}

  /* ==========================================================================
     HOAN THIEN (FINISHING) — logic rieng cua module
     --------------------------------------------------------------------------
     Ba man hinh:
       Nhan hang hoan thien     (page 'finIn')  — 2 tab: hang may / phu lieu
       Tinh trang hoan thien    (page 'finSt')  — Ui -> Kiem cuoi -> Dong goi -> Nhap kho TP
       Ke hoach xuat hang       (page 'fgShip') — lo xuat theo ma hang · PO

     Du lieu vao: seed.js (window.FINISHING_SEED) trong cung thu muc. Phieu ban giao
     SF-… nam san trong seed (`slips`) — module KHONG doc state cua module MAY nua.

       slips  -> xac nhan nhan tung to        (state.finRecv)
              -> 4 cong doan                  (state.finStage)
              -> lo xuat theo ma hang · PO    (state.fgRows)

     Moi cong doan khong vuot duoc so cua cong doan lien truoc; sua cong doan truoc
     xuong thap thi cac cong doan sau tu tut theo.
     ========================================================================== */
  var SEED = window.FINISHING_SEED || {};
  window.MES_SEED_DATA = SEED;                 // nguon cho nut "Xuat anh chup"
  window.MES_SEED = SEED.snapshot || null;     // anh chup du lieu nguoi dung (co the null)

class Finishing extends MESCore {
