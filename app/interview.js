/*
 * Excel-Drills – KI-Interviewerin im Case-Modus (Chat-Komponente, ohne Abhängigkeiten).
 *
 * Einbinden auf der Assessment-Ergebnisseite:
 *   <link rel="stylesheet" href="../assets/interview.css">
 *   <script src="interview.js" defer></script>
 *   window.ExcelDrillsInterview.mount(container, { assessment, role, score, answersSummary, endpoint })
 *
 * role: 'consulting' | 'accounting'. endpoint ist optional (Standard: ENDPOINT unten).
 * Der Premium-Code kommt aus localStorage (gleicher Schlüssel wie app/app.js); die Prüfung macht der Server.
 */
(function (root) {
  'use strict';

  var ENDPOINT = 'https://uijlrixalisqbcgivccn.supabase.co/functions/v1/interview';
  var STORAGE_KEY = 'excelDrillsKey';          // wie STORAGE_KEY in app/app.js
  var PREMIUM_URL = '../premium.html';
  var MAX_ROUNDS = 6;
  var TIMEOUT_MS = 35000;
  var MAX_INPUT = 1500;

  var PERSONAS = {
    consulting: {
      name: 'Frau Keller', title: 'Partnerin, Strategieberatung', initials: 'FK',
      intro: 'Frau Keller stellt Ihnen Rückfragen zu Ihrem Modell: Warum diese Zahl? Was passiert, wenn der Preis sinkt? Wie sagen Sie das dem CEO?'
    },
    accounting: {
      name: 'Herr Bianchi', title: 'Leiter Rechnungswesen', initials: 'HB',
      intro: 'Herr Bianchi stellt Ihnen Rückfragen zu Ihrer Auswertung: Warum dieser Betrag? Was ändert sich beim Stichtag? Wie erklären Sie das der Geschäftsleitung?'
    }
  };

  var CRITERIA = [
    { key: 'struktur', label: 'Struktur' },
    { key: 'zahlenverstaendnis', label: 'Zahlenverständnis' },
    { key: 'annahmen', label: 'Annahmen' },
    { key: 'kommunikation', label: 'Kommunikation' }
  ];

  var ERRORS = {
    network: 'Die Verbindung hat nicht geklappt. Prüfen Sie Ihr Internet und versuchen Sie es nochmals.',
    timeout: 'Die Antwort dauert zu lange. Bitte versuchen Sie es nochmals.',
    401: 'Ihr Premium-Code wurde nicht akzeptiert. Öffnen Sie den Freischalt-Link aus Ihrer Kaufbestätigung nochmals.',
    429: 'Sie haben heute das Tageslimit für Interviews erreicht. Morgen geht es weiter.',
    generic: 'Die Interviewerin ist gerade nicht erreichbar. Bitte versuchen Sie es in einer Minute nochmals.'
  };

  function track(name, props) {
    try { if (typeof root.ExcelDrillsTrack === 'function') root.ExcelDrillsTrack(name, props); } catch (e) { /* ignorieren */ }
  }

  function readKey() {
    var k = null;
    try { k = root.localStorage.getItem(STORAGE_KEY); } catch (e) { k = null; }
    k = k ? String(k).trim().toUpperCase() : '';
    if (!k) return '';
    // Lokale Vorprüfung, falls app/keys.js geladen ist (der Server prüft ohnehin)
    var Keys = root.ExcelDrillsKeys;
    if (Keys && typeof Keys.isValid === 'function' && !Keys.isValid(k)) return '';
    return k;
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function button(label, cls, onClick) {
    var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  }

  // POST mit Zeitlimit. Rückgabe Promise<{ ok, status, data }>, wirft nie.
  // Publishable Key (öffentlich, siehe assets/leads-config.js): erfüllt die JWT-Prüfung des Gateways.
  // Die eigentliche Zugangsprüfung macht die Function über den Premium-Code.
  var PUBLISHABLE_KEY = 'sb_publishable_jtC1RxHTZq84yrxItckk8Q_iz_19kyU';
  function authHeaders() {
    var key = (root.ExcelDrillsLeads && root.ExcelDrillsLeads.key) || PUBLISHABLE_KEY;
    return { 'content-type': 'application/json', 'apikey': key, 'Authorization': 'Bearer ' + key };
  }

  function post(url, payload) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;
    return fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        return { ok: res.ok, status: res.status, data: data };
      });
    }, function (err) {
      return { ok: false, status: err && err.name === 'AbortError' ? 'timeout' : 'network', data: null };
    }).then(function (r) { if (timer) clearTimeout(timer); return r; });
  }

  function errorText(status) {
    if (status === 'timeout') return ERRORS.timeout;
    if (status === 'network') return ERRORS.network;
    return ERRORS[status] || ERRORS.generic;
  }

  function mount(container, opts) {
    if (!container || !container.appendChild) throw new Error('ExcelDrillsInterview.mount: container fehlt');
    opts = opts || {};
    var role = String(opts.role || '').toLowerCase();
    if (!PERSONAS[role]) role = 'consulting';
    var persona = PERSONAS[role];
    var endpoint = opts.endpoint || ENDPOINT;
    var state = { transcript: [], busy: false, done: false, startedTracked: false };

    container.innerHTML = '';
    var box = el('section', 'iv');
    box.setAttribute('aria-label', 'Interview mit ' + persona.name);
    container.appendChild(box);

    /* ---------- Intro ---------- */
    function renderIntro() {
      box.innerHTML = '';
      state = { transcript: [], busy: false, done: false, startedTracked: false };
      var head = el('div', 'iv-head');
      var avatar = el('div', 'iv-avatar', persona.initials);
      avatar.setAttribute('aria-hidden', 'true');
      var who = el('div', 'iv-who');
      who.appendChild(el('strong', null, persona.name));
      who.appendChild(el('span', 'iv-muted', persona.title));
      head.appendChild(avatar); head.appendChild(who);
      box.appendChild(head);

      box.appendChild(el('h3', 'iv-title', 'Interview im Case-Modus'));
      box.appendChild(el('p', null, persona.intro));
      var facts = el('ul', 'iv-facts');
      facts.appendChild(el('li', null, 'Dauer ca. 5 Minuten, höchstens ' + MAX_ROUNDS + ' Fragen'));
      facts.appendChild(el('li', null, 'Antworten Sie frei, wie im echten Interview. Mit «fertig» beenden Sie früher.'));
      facts.appendChild(el('li', null, 'Am Schluss: Bewertung in 4 Kriterien und 2 konkrete Verbesserungen'));
      box.appendChild(facts);

      var key = readKey();
      if (!key) {
        var hint = el('p', 'iv-premium');
        hint.appendChild(document.createTextNode('Das Interview ist Teil von Premium. '));
        var a = el('a', null, 'Premium ansehen');
        a.href = PREMIUM_URL;
        hint.appendChild(a);
        box.appendChild(hint);
        return;
      }
      box.appendChild(el('p', 'iv-muted iv-small', 'Premium-Funktion. Ihre Antworten werden zur Auswertung an die KI (Anthropic Claude) gesendet und nicht gespeichert.'));
      var start = button('Interview starten', 'btn-large', function () { startInterview(key); });
      box.appendChild(start);
    }

    /* ---------- Chat ---------- */
    var log, form, input, sendBtn, finishBtn, status, progress;

    function renderChat() {
      box.innerHTML = '';
      var head = el('div', 'iv-head');
      var avatar = el('div', 'iv-avatar', persona.initials);
      avatar.setAttribute('aria-hidden', 'true');
      var who = el('div', 'iv-who');
      who.appendChild(el('strong', null, persona.name));
      who.appendChild(el('span', 'iv-muted', persona.title));
      progress = el('span', 'iv-progress iv-muted');
      head.appendChild(avatar); head.appendChild(who); head.appendChild(progress);
      box.appendChild(head);

      log = el('div', 'iv-log');
      log.setAttribute('role', 'log');
      log.setAttribute('aria-live', 'polite');
      box.appendChild(log);

      status = el('p', 'iv-status');
      status.setAttribute('role', 'status');
      status.hidden = true;
      box.appendChild(status);

      form = el('form', 'iv-form');
      input = el('textarea', 'iv-input');
      input.rows = 3;
      input.maxLength = MAX_INPUT;
      input.placeholder = 'Ihre Antwort …';
      input.setAttribute('aria-label', 'Ihre Antwort');
      input.addEventListener('keydown', function (ev) {
        // Enter sendet, Shift+Enter macht eine neue Zeile
        if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); submit(); }
      });
      var actions = el('div', 'iv-actions');
      sendBtn = button('Senden', '', submit);
      finishBtn = button('Interview beenden', 'btn-secondary', function () { send('fertig'); });
      actions.appendChild(sendBtn); actions.appendChild(finishBtn);
      form.appendChild(input); form.appendChild(actions);
      form.addEventListener('submit', function (ev) { ev.preventDefault(); submit(); });
      box.appendChild(form);
    }

    function addBubble(who, text) {
      var b = el('div', 'iv-msg iv-msg-' + who);
      if (who === 'interviewer') b.appendChild(el('span', 'iv-sr', persona.name + ': '));
      else b.appendChild(el('span', 'iv-sr', 'Sie: '));
      String(text).split(/\n{2,}/).forEach(function (para) { b.appendChild(el('p', null, para)); });
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
      return b;
    }

    function setBusy(on) {
      state.busy = on;
      if (sendBtn) sendBtn.disabled = on;
      if (finishBtn) finishBtn.disabled = on;
      if (input) input.disabled = on;
      var typing = log && log.querySelector('.iv-typing');
      if (on && log && !typing) {
        typing = el('div', 'iv-msg iv-msg-interviewer iv-typing');
        typing.setAttribute('aria-label', persona.name + ' schreibt');
        typing.appendChild(el('span', 'iv-dot')); typing.appendChild(el('span', 'iv-dot')); typing.appendChild(el('span', 'iv-dot'));
        log.appendChild(typing);
        log.scrollTop = log.scrollHeight;
      } else if (!on && typing) {
        typing.parentNode.removeChild(typing);
      }
    }

    function showError(msg) {
      if (!status) return;
      status.textContent = msg;
      status.hidden = !msg;
    }

    function updateProgress() {
      if (!progress) return;
      var asked = state.transcript.filter(function (t) { return t.role === 'interviewer'; }).length;
      progress.textContent = state.done ? 'Abgeschlossen' : 'Frage ' + Math.min(asked, MAX_ROUNDS) + ' von ' + MAX_ROUNDS;
    }

    function payload(key) {
      return {
        assessment: opts.assessment, role: role, score: opts.score, answersSummary: opts.answersSummary,
        transcript: state.transcript, accessKey: key
      };
    }

    function handleReply(r, onFail) {
      setBusy(false);
      if (!r.ok || !r.data || typeof r.data.reply !== 'string') {
        showError(errorText(r.status));
        if (onFail) onFail();
        return;
      }
      showError('');
      if (r.data.reply) {
        state.transcript.push({ role: 'interviewer', text: r.data.reply });
        addBubble('interviewer', r.data.reply);
      }
      if (r.data.done) finish(r.data.assessmentNote);
      else { updateProgress(); if (input) input.focus(); }
    }

    var currentKey = '';

    function startInterview(key) {
      currentKey = key;
      renderChat();
      updateProgress();
      if (!state.startedTracked) { track('interview_start', { rolle: role }); state.startedTracked = true; }
      setBusy(true);
      post(endpoint, payload(key)).then(function (r) {
        handleReply(r, function () {
          // Start fehlgeschlagen: Knopf zum erneuten Versuch
          form.hidden = true;
          var retry = button('Nochmals versuchen', '', function () {
            retry.parentNode.removeChild(retry); form.hidden = false; showError(''); setBusy(true);
            post(endpoint, payload(currentKey)).then(function (r2) { handleReply(r2, function () { form.hidden = true; box.appendChild(retry); }); });
          });
          box.appendChild(retry);
        });
      });
    }

    function submit() {
      var text = (input.value || '').trim();
      if (!text) { input.focus(); return; }
      send(text);
    }

    function send(text) {
      if (state.busy || state.done) return;
      showError('');
      var bubble = addBubble('candidate', text);
      state.transcript.push({ role: 'candidate', text: text });
      input.value = '';
      setBusy(true);
      post(endpoint, payload(currentKey)).then(function (r) {
        handleReply(r, function () {
          // Antwort zurücknehmen, damit sie erneut gesendet werden kann
          state.transcript.pop();
          if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
          if (text !== 'fertig') input.value = text;
          input.focus();
        });
      });
    }

    /* ---------- Abschluss ---------- */
    function finish(note) {
      state.done = true;
      updateProgress();
      if (form) form.hidden = true;
      var card = el('div', 'iv-result');
      card.appendChild(el('h3', 'iv-title', 'Ihre Bewertung'));
      if (note && note.scores) {
        var total = 0;
        var list = el('dl', 'iv-scores');
        CRITERIA.forEach(function (c) {
          var v = Math.max(1, Math.min(5, Math.round(Number(note.scores[c.key]) || 1)));
          total += v;
          var row = el('div', 'iv-score');
          row.appendChild(el('dt', null, c.label));
          var dd = el('dd');
          var meter = el('span', 'iv-meter');
          meter.setAttribute('aria-hidden', 'true');
          for (var i = 1; i <= 5; i++) meter.appendChild(el('span', 'iv-pip' + (i <= v ? ' on' : '')));
          dd.appendChild(meter);
          dd.appendChild(el('span', 'iv-points', v + ' / 5'));
          row.appendChild(dd);
          list.appendChild(row);
        });
        card.appendChild(el('p', 'iv-total', 'Total ' + total + ' von 20 Punkten'));
        card.appendChild(list);
        var fb = Array.isArray(note.feedback) ? note.feedback.slice(0, 2) : [];
        if (fb.length) {
          card.appendChild(el('h4', null, 'Zwei Verbesserungen für das nächste Mal'));
          var ol = el('ol', 'iv-feedback');
          fb.forEach(function (f) { ol.appendChild(el('li', null, String(f))); });
          card.appendChild(ol);
        }
        track('interview_done', { rolle: role, punkte: total });
      } else {
        card.appendChild(el('p', 'iv-muted', 'Die Punkte konnten diesmal nicht ausgewertet werden. Das Fazit oben gilt trotzdem.'));
        track('interview_done', { rolle: role, punkte: 0 });
      }
      card.appendChild(button('Nochmals', 'btn-secondary', renderIntro));
      box.appendChild(card);
      card.scrollIntoView && card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    renderIntro();
    return { reset: renderIntro, element: box };
  }

  root.ExcelDrillsInterview = { mount: mount, ENDPOINT: ENDPOINT };
})(typeof window !== 'undefined' ? window : globalThis);
