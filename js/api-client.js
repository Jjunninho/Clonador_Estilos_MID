// js/api-client.js
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const STORAGE_KEY = 'groq_api_key';

// ============================================================
// GERENCIAMENTO DA CHAVE API
// ============================================================

function getGroqKey() {
  return localStorage.getItem(STORAGE_KEY) || null;
}

function saveGroqKey(key) {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function clearGroqKey() {
  localStorage.removeItem(STORAGE_KEY);
  updateApiKeyStatusEl();
}

function updateApiKeyStatusEl() {
  const el = document.getElementById('api-key-status');
  if (!el) return;
  const key = getGroqKey();
  el.textContent = key ? ('Chave: ' + key.slice(0, 8) + '...') : 'Chave não configurada';
  el.style.color  = key ? '#4ade80' : '#f87171';
}

// ============================================================
// MODAL DE CONFIGURAÇÃO DA CHAVE
// ============================================================

function injectModalStyles() {
  if (document.getElementById('groq-modal-style')) return;
  const style = document.createElement('style');
  style.id = 'groq-modal-style';
  style.textContent = `
    #groq-key-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      font-family: 'Press Start 2P', 'Courier New', monospace;
    }
    #groq-key-box {
      background: #001500;
      border: 2px solid #00ff41;
      border-radius: 4px;
      padding: 32px 28px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 0 40px rgba(0,255,65,0.25);
    }
    #groq-key-box h2 {
      color: #00ff41;
      font-size: 11px;
      margin: 0 0 12px;
      letter-spacing: 1px;
    }
    #groq-key-box p {
      color: #aaa;
      font-size: 9px;
      line-height: 1.8;
      margin: 0 0 6px;
    }
    #groq-key-box a {
      color: #00ff41;
      font-size: 9px;
    }
    #groq-key-box .groq-warning {
      background: rgba(255,200,0,0.08);
      border: 1px solid #ffcc00;
      border-radius: 2px;
      padding: 10px;
      margin: 14px 0;
      color: #ffcc00;
      font-size: 8px;
      line-height: 1.9;
    }
    #groq-key-input {
      width: 100%;
      box-sizing: border-box;
      background: #000e00;
      border: 1px solid #00ff41;
      border-radius: 2px;
      color: #00ff41;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 10px 12px;
      margin: 16px 0 8px;
      outline: none;
    }
    #groq-key-input:focus { border-color: #4ade80; box-shadow: 0 0 8px rgba(0,255,65,0.3); }
    #groq-key-error {
      color: #f87171;
      font-size: 8px;
      min-height: 14px;
      margin-bottom: 10px;
    }
    #groq-key-save {
      width: 100%;
      background: #00ff41;
      color: #000e00;
      border: none;
      border-radius: 2px;
      font-family: 'Press Start 2P', monospace;
      font-size: 10px;
      padding: 12px;
      cursor: pointer;
      letter-spacing: 1px;
    }
    #groq-key-save:hover { background: #4ade80; }
    #groq-key-dismiss {
      display: block;
      text-align: center;
      margin-top: 12px;
      color: #555;
      font-size: 8px;
      cursor: pointer;
      background: none;
      border: none;
      font-family: inherit;
      width: 100%;
    }
    #groq-key-dismiss:hover { color: #888; }
  `;
  document.head.appendChild(style);
}

function showKeyModal(resolve) {
  injectModalStyles();

  const overlay = document.createElement('div');
  overlay.id = 'groq-key-overlay';
  overlay.innerHTML = `
    <div id="groq-key-box">
      <h2>🔑 CHAVE API GROQ NECESSÁRIA</h2>
      <p>Esta página usa a API da Groq para análise musical com IA.</p>
      <p>A chave é <strong style="color:#fff">gratuita</strong> e fica salva apenas no seu navegador (localStorage) — nunca é enviada a nenhum servidor externo.</p>

      <div class="groq-warning">
        ⚠ Por segurança, nunca compartilhe sua chave.<br>
        Ela será usada somente nesta página, neste navegador.
      </div>

      <p>Obtenha sua chave gratuita em:<br>
        <a href="https://console.groq.com/keys" target="_blank" rel="noopener">
          ▶ console.groq.com/keys
        </a>
      </p>

      <input id="groq-key-input" type="text" placeholder="gsk_..." autocomplete="off" spellcheck="false">
      <div id="groq-key-error"></div>

      <button id="groq-key-save">SALVAR E CONTINUAR</button>
      <button id="groq-key-dismiss">Cancelar (a geração falhará sem a chave)</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const input   = overlay.querySelector('#groq-key-input');
  const errEl   = overlay.querySelector('#groq-key-error');
  const saveBtn = overlay.querySelector('#groq-key-save');
  const dismiss = overlay.querySelector('#groq-key-dismiss');

  input.focus();

  function doSave() {
    const val = input.value.trim();
    if (!val.startsWith('gsk_') || val.length < 20) {
      errEl.textContent = 'Chave inválida. Deve começar com "gsk_" e ter mais de 20 caracteres.';
      return;
    }
    saveGroqKey(val);
    updateApiKeyStatusEl();
    document.body.removeChild(overlay);
    resolve(val);
  }

  saveBtn.addEventListener('click', doSave);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSave(); });
  dismiss.addEventListener('click', () => {
    document.body.removeChild(overlay);
    resolve(null); // caller vai lançar erro
  });
}

function requireGroqKey() {
  return new Promise(resolve => {
    const key = getGroqKey();
    if (key) { resolve(key); return; }
    showKeyModal(resolve);
  });
}

// ============================================================
// CHAMADA À API
// ============================================================

export async function callGroq(system, user, temperature = 0.8) {
  const key = await requireGroqKey();
  if (!key) throw new Error('Chave API não configurada. Configure em console.groq.com/keys');

  const resp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      max_tokens: 2500,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   }
      ]
    })
  });

  if (!resp.ok) {
    const err = await resp.text();
    // Chave inválida/expirada → limpa e pede nova na próxima vez
    if (resp.status === 401) {
      clearGroqKey();
      throw new Error('Chave API inválida ou expirada (401). Recarregue a página e insira uma nova chave.');
    }
    throw new Error(`API ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return data.choices[0].message.content.trim();
}

// ============================================================
// PROMPT DO COMPOSITOR (inalterado)
// ============================================================
export function getComposerSystemPrompt(targetTicks, extra = '') {
  return `Você é um compositor especializado em trilhas retrô de videogame (8-bit / 16-bit estilo NES).

Gere uma melodia procedural energética adequada para gameplay contínuo.

REGRAS OBRIGATÓRIAS:
1. Responda SOMENTE com JSON puro — ZERO markdown, ZERO explicação
2. Use exatamente estes campos: "nota", "inicio", "duracao", "velocidade"
3. Velocidade sempre entre 80 e 110
4. Duração total EXATA deve ser ${targetTicks} ticks
5. 480 ticks = 1 batida
6. Gere entre 32 e 64 notas
7. A soma de todas as durações deve ser exatamente ${targetTicks}

ESTILO RETRÔ (OBRIGATÓRIO):
- Tonalidade: Lá menor natural
- Centro tonal: nota 69 (Lá)
- Estrutura em loop perfeito (a última nota deve conectar naturalmente à primeira)
- Crie um motivo rítmico de 3–5 notas e reutilize-o com variação de altura
- Use principalmente durações 240 e 480 ticks
- Inclua pelo menos 2 saltos maiores que 5 semitons
- Use contorno melódico em arco (subida até o meio e resolução)
- Evite notas longas demais (máximo 960 ticks)
- Energia constante, adequada para fase de ação

Referência de notas:
57=A grave
60=Dó
62=Ré
64=Mi
65=Fá
67=Sol
69=Lá (tônica)
71=Si
72=Dó agudo

Formato de saída EXATO:
{"notas":[{"nota":69,"inicio":0,"duracao":240,"velocidade":95}]}${extra}`;
}

// Expõe ao HTML para o botão "Trocar chave"
window.groqClearKey = () => {
  clearGroqKey();
  showKeyModal(key => {
    if (key) console.log('[Groq] Nova chave salva.');
  });
};
