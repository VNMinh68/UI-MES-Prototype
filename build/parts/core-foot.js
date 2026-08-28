}

  /* ---- anh chup du lieu ------------------------------------------------------
     <module>/seed.js dat window.<SEEDVAR> = {..., snapshot:{ls, idb, ...}}. Module
     nhat phan `snapshot` ra window.MES_SEED. May nao mo module ma localStorage con
     trong thi nap thang phan `ls` vao truoc khi React dung component — restore()
     sau do doc nhu du lieu nguoi dung binh thuong. Phan blob trong IndexedDB nap
     bat dong bo o componentDidMount. */
  function seedStorage(key) {
    var S = window.MES_SEED;
    if (!S || !S.ls) return false;
    try {
      if (window.localStorage.getItem(key + '.noseed')) return false;
      if (window.localStorage.getItem(S.key || key) != null) return false;
      Object.keys(S.ls).forEach(function (k) { window.localStorage.setItem(k, S.ls[k]); });
      return true;
    } catch (e) { return false; }
  }

  function mount(Cls, props, key) {
    window.MES_SEED_FIRST = seedStorage(key);
    var el = document.getElementById('root');
    if (!el) { throw new Error('#root missing from index.html'); }
    var node = React.createElement(Cls, props);
    if (RD.createRoot) { RD.createRoot(el).render(node); } else { RD.render(node, el); }
  }

  function boot(Cls, props, key) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { mount(Cls, props, key); });
    } else {
      mount(Cls, props, key);
    }
  }

  window.MESRuntime = { React: React, RD: RD, icon: icon, shell: shell, DCLogic: DCLogic, boot: boot };
  window.MESCore = MESCore;
})();
