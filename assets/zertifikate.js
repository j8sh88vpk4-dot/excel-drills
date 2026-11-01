/* Excel-Drills: Zertifikatsseite (zertifikate/).
 * Checklisten «Was du zusätzlich in Excel selbst üben musst»: Häkchen im localStorage excelDrillsCertChecklist
 * { <key>: true }. Plausible: cert_open { zertifikat } beim Klick auf einen Kampagnen-Link. */
(function () {
  'use strict';
  var STORAGE = 'excelDrillsCertChecklist';

  function load() {
    try { var o = JSON.parse(window.localStorage.getItem(STORAGE) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
  }
  function save(o) { try { window.localStorage.setItem(STORAGE, JSON.stringify(o)); } catch (e) { /* privater Modus */ } }

  function updateCount(list) {
    var boxes = list.querySelectorAll('input[type="checkbox"]');
    var done = 0;
    for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) done++;
    var out = document.querySelector('[data-count="' + list.getAttribute('data-cert') + '"]');
    if (out) out.textContent = done ? done + ' von ' + boxes.length + ' Themen abgehakt' : '';
  }

  var state = load();
  var lists = document.querySelectorAll('.zt-check');
  for (var i = 0; i < lists.length; i++) {
    (function (list) {
      var boxes = list.querySelectorAll('input[type="checkbox"][data-key]');
      for (var j = 0; j < boxes.length; j++) boxes[j].checked = state[boxes[j].getAttribute('data-key')] === true;
      list.addEventListener('change', function (e) {
        var b = e.target;
        if (!b || !b.getAttribute || !b.getAttribute('data-key')) return;
        var s = load();
        if (b.checked) s[b.getAttribute('data-key')] = true; else delete s[b.getAttribute('data-key')];
        save(s);
        updateCount(list);
      });
      updateCount(list);
    })(lists[i]);
  }

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a.zt-camp-link[data-zertifikat]') : null;
    if (!a) return;
    try { if (typeof window.ExcelDrillsTrack === 'function') window.ExcelDrillsTrack('cert_open', { zertifikat: a.getAttribute('data-zertifikat') }); } catch (err) { /* ignorieren */ }
  });
})();
