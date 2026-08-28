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
