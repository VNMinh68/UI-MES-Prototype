}

  /* ==========================================================================
     XUAT NPL (MATERIAL OUT) — logic rieng cua module
     --------------------------------------------------------------------------
     Hai man hinh, cung mot khung:
       Fabric Out  (page 'fabOut')   — xuat VAI xuong nha cat
       Trims Out   (page 'trimOut')  — xuat PHU LIEU xuong chuyen may

     Du lieu vao: seed.js (window.MATERIAL_SEED) trong cung thu muc.

       fabric / trims -> 1 dong = 1 ma nguyen lieu cua (ma hang | PO)
                         SL CAN sinh tu dinh muc x so san pham cua tac nghiep cat
       issues         -> phieu xuat kho MO-YYYYMMDD-NNN da phat hanh
                         cong lai thanh cot DA XUAT; CON LAI = SL CAN - DA XUAT

     Bam vao 1 dong la mo so phieu xuat cua chinh dong do: xem lai tung to, phat
     hanh to moi, hoac go bo to vua phat nham. Module KHONG doc du lieu cua MAY
     hay HOAN THIEN — moi so lieu deu dong bang trong seed cua chinh no.
     ========================================================================== */
  var SEED = window.MATERIAL_SEED || {};
  window.MES_SEED_DATA = SEED;                 // nguon cho nut "Xuat anh chup"
  window.MES_SEED = SEED.snapshot || null;     // anh chup du lieu nguoi dung (co the null)

class MaterialOut extends MESCore {
