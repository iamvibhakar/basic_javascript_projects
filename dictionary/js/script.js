function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;

    const typeStyles = {
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    notification.className += ` ${typeStyles[type] || typeStyles.info}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.remove('translate-x-full'), 100);

    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const input = document.getElementById('searchInput');
const btn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const pronounceBtn = document.getElementById('pronounceBtn');
const langSelect = document.getElementById('langSelect');

const placeholder = document.getElementById('placeholder');
const content = document.getElementById('content');
const wordEl = document.getElementById('word');
const phoneticEl = document.getElementById('phonetic');
const partOfSpeechEl = document.getElementById('partOfSpeech');
const meaningsEl = document.getElementById('meanings');
const examplesEl = document.getElementById('examples');
const translationsEl = document.getElementById('translations');

function showPlaceholder() {
    placeholder.classList.remove('hidden');
    content.classList.add('hidden');
}

function showContent() {
    placeholder.classList.add('hidden');
    content.classList.remove('hidden');
}

async function fetchDefinition(word) {
    const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Definition not found');
        const data = await res.json();
        return data;
    } catch (e) {
        return null;
    }
}

async function translateText(text, target) {
    if (!target) return null;
    try {
        const res = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: text, source: 'en', target, format: 'text' })
        });
        if (!res.ok) throw new Error('Translate failed');
        const json = await res.json();
        return json.translatedText;
    } catch (e) {
        return null;
    }
}

function speak(text) {
    if (!('speechSynthesis' in window)) return showNotification('Speech not supported', 'warning');
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
}

function renderDefinition(data, word) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        wordEl.textContent = word;
        phoneticEl.textContent = '';
        partOfSpeechEl.textContent = '';
        meaningsEl.innerHTML = `<p class="text-gray-600">No definition found.</p>`;
        examplesEl.textContent = '';
        translationsEl.textContent = '';
        showContent();
        return;
    }

    const entry = data[0];
    wordEl.textContent = entry.word || word;
    phoneticEl.textContent = entry.phonetic || (entry.phonetics && entry.phonetics[0] && entry.phonetics[0].text) || '';

    const meaning = entry.meanings && entry.meanings[0];
    partOfSpeechEl.textContent = meaning ? meaning.partOfSpeech : '';

    const meaningsHtml = entry.meanings.map(m => {
        const defs = m.definitions.map((d, i) => `
    <div class="mb-3">
        <div class="text-sm font-medium">${i + 1}. ${d.definition}</div>
        ${d.example ? `<div class=\"text-gray-500 text-sm mt-1\">"${d.example}"</div>` : ''}
    </div>
    `).join('');
        return `
    <div class="p-3 border rounded-lg bg-gray-50">
        <div class="text-sm text-gray-600 font-semibold mb-2">${m.partOfSpeech}</div>
        ${defs}
    </div>
    `;
    }).join('<div class="h-3"></div>');

    meaningsEl.innerHTML = meaningsHtml;

    const examples = [];
    entry.meanings.forEach(m => m.definitions.forEach(d => { if (d.example) examples.push(d.example); }));
    examplesEl.textContent = examples.length ? `Example: ${examples[0]}` : '';

    translationsEl.textContent = '';

    showContent();
}

async function doSearch() {
    const q = input.value.trim();
    if (!q) return showNotification('Please enter a word to search', 'warning');

    placeholder.innerHTML = `<div class="py-10 text-center">Searching <strong>${q}</strong>...</div>`;
    placeholder.classList.remove('hidden');
    content.classList.add('hidden');

    const def = await fetchDefinition(q);
    renderDefinition(def, q);

    const target = langSelect.value;
    if (target) {
        translationsEl.textContent = 'Translating...';
        const baseText = (def && def[0] && def[0].meanings && def[0].meanings[0] && def[0].meanings[0].definitions[0] && def[0].meanings[0].definitions[0].definition) || q;
        const t = await translateText(baseText, target);
        translationsEl.textContent = t ? t : 'Translation not available.';
    }
}

btn.addEventListener('click', doSearch);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
clearBtn.addEventListener('click', () => { input.value = ''; showPlaceholder(); translationsEl.textContent = ''; meaningsEl.innerHTML = ''; examplesEl.textContent = ''; });

pronounceBtn.addEventListener('click', () => {
    const text = wordEl.textContent || input.value.trim();
    if (!text) return showNotification('Nothing to pronounce', 'warning');
    speak(text);
});

showPlaceholder();
