}

  /* ==========================================================================
     MAY (SEWING) — logic rieng cua module
     --------------------------------------------------------------------------
     Hai man hinh:
       Ke hoach may            (page 'sewing')  — 3 tab: tuan / nhu cau BTP / phieu BTP
       San luong may hang ngay (page 'dso')     — cai dat, chuyen, M-level, hang loi

     Du lieu vao: seed.js (window.SEWING_SEED) trong cung thu muc. Module KHONG doc
     du lieu cua module nao khac; phieu ban giao phat hanh o day la dau ra, module
     HOAN THIEN co ban seed rieng cua no.
     ========================================================================== */
  var SEED = window.SEWING_SEED || {};
  window.MES_SEED_DATA = SEED;                 // nguon cho nut "Xuat anh chup"
  window.MES_SEED = SEED.snapshot || null;     // anh chup du lieu nguoi dung (co the null)

class Sewing extends MESCore {
