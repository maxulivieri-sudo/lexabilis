let LEGGI = [];
let activeFilter = 'tutti';

const vigenzaMap = {
  'Vigente':                  { cls: 'v-Vigente',    txt: 'Vigente' },
  'Parzialmente modificata':  { cls: 'v-parziale',   txt: 'Parz. modificata' },
  'In fase di attuazione':    { cls: 'v-attuazione', txt: 'In attuazione' },
  'Abrogata':                 { cls: 'v-Abrogata',   txt: 'Abrogata' }
};

function sf(btn) {
  activeFilter = btn.dataset.f;
  document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function render() {
  const q = document.getElementById('si').value.toLowerCase().trim();
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  const results = LEGGI.filter(l => {
    const matchArea = activeFilter === 'tutti' || l.area === activeFilter || l.tags.includes(activeFilter);
    const matchQ = !q || [l.codice, l.titolo, l.descrizione, l.nota, ...l.tags].join(' ').toLowerCase().includes(q);
    return matchArea && matchQ;
  });

  document.getElementById('cl').innerHTML = `<strong>${results.length}</strong> leggi trovate`;

  if (!results.length) {
    grid.innerHTML = `<div class="empty">
      <svg width="50" height="50" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
      <p>Nessuna legge trovata per questa ricerca.</p>
    </div>`;
    return;
  }

  results.forEach((l, i) => {
    const vi = vigenzaMap[l.vigenza] || { cls: 'v-Vigente', txt: l.vigenza || 'Vigente' };
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${Math.min(i * 0.03, 0.3)}s`;

    const noteHtml = l.nota ? `
      <div class="cnote">
        <strong>Nota operativa</strong>
        ${escHtml(l.nota)}
      </div>` : '';

    const vigNotaHtml = l.vigenzaNota ? `<div class="vn">${escHtml(l.vigenzaNota)}</div>` : '';

    const btnPdf = l.urlPdf ? `
      <a class="btn bp" href="${escHtml(l.urlPdf)}" target="_blank" rel="noopener">
        <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        PDF
      </a>` : '';

    card.innerHTML = `
      <div class="cs s-${l.area}"></div>
      <div class="cb">
        <div class="ct">
          <div class="cc">${escHtml(l.codice)}</div>
          <div class="cbadges">
            <span class="by">${l.anno}</span>
            <span class="bv ${vi.cls}">${vi.txt}</span>
          </div>
        </div>
        ${vigNotaHtml}
        <div class="ctitle">${escHtml(l.titolo)}</div>
        <div class="cdesc">${escHtml(l.descrizione)}</div>
        ${noteHtml}
        <div class="ctags">
          ${l.tags.map(t => `<span class="tag t-${t}">${t}</span>`).join('')}
        </div>
      </div>
      <div class="cf">
        ${l.urlNormattiva ? `<a class="btn bn" href="${escHtml(l.urlNormattiva)}" target="_blank" rel="noopener">
          <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          ${labelFonte(l.urlNormattiva)}
        </a>` : ''}
        ${l.urlGazzetta ? `<a class="btn bg" href="${escHtml(l.urlGazzetta)}" target="_blank" rel="noopener">
          <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Gazzetta Uff.
        </a>` : ''}
        ${btnPdf}
      </div>`;

    grid.appendChild(card);
  });
}

function labelFonte(url) {
  if (!url) return 'Testo ufficiale';
  if (url.includes('normattiva.it'))   return 'Testo su Normattiva';
  if (url.includes('salute.gov.it'))   return 'Testo su Ministero Salute';
  if (url.includes('mim.gov.it') || url.includes('istruzione.it')) return 'Testo su Ministero Istruzione';
  if (url.includes('lavoro.gov.it'))   return 'Testo su Ministero Lavoro';
  if (url.includes('eur-lex.europa'))  return 'Testo su EUR-Lex';
  if (url.includes('parlamento.it'))   return 'Testo su Parlamento';
  if (url.includes('gazzettaufficiale')) return 'Testo su Gazzetta Uff.';
  return 'Testo ufficiale';
}


function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadLeggi() {
  const grid = document.getElementById('grid');
  try {
    const res = await fetch('/.netlify/functions/leggi');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    LEGGI = await res.json();

    document.getElementById('totalCount').textContent = LEGGI.length;
    document.getElementById('statAnno').textContent = new Date().getFullYear();

    render();
  } catch (err) {
    grid.innerHTML = `<div class="error-state">
      <svg width="50" height="50" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>Errore nel caricamento dei dati. Riprova tra qualche istante.</p>
    </div>`;
    document.getElementById('cl').textContent = 'Errore di caricamento';
    console.error('LexAbilis error:', err);
  }
}

loadLeggi();
