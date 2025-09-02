// ---------- Color utility functions (hex <-> rgb <-> hsl) ----------
function clamp(v, a = 0, b = 1) { return Math.min(b, Math.max(a, v)); }

function hexToRgb(hex) {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(ch => ch + ch).join('');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    const toHex = n => {
        const s = Math.round(clamp(n, 0, 255)).toString(16);
        return s.length === 1 ? '0' + s : s;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
}

function rgbToHsl(r, g, b) {
    // r,g,b in 0..255
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h = h * 60;
    }
    return { h: (h + 360) % 360, s: clamp(s, 0, 1), l: clamp(l, 0, 1) };
}

function hslToRgb(h, s, l) {
    // h in [0,360), s,l in [0,1]
    h = (h % 360 + 360) % 360;
    if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hk = h / 360;
    const t = (n) => {
        let x = hk + n;
        if (x < 0) x += 1;
        if (x > 1) x -= 1;
        if (x < 1 / 6) return p + (q - p) * 6 * x;
        if (x < 1 / 2) return q;
        if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
        return p;
    };
    return {
        r: Math.round(t(0) * 255),
        g: Math.round(t(-1 / 3) * 255),
        b: Math.round(t(1 / 3) * 255)
    };
}

function hslToHex(h, s, l) {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// ---------- Palette generation algorithms ----------
// receives base in hex, count number, scheme string
function generatePalette(baseHex, count, scheme) {
    const { r, g, b } = hexToRgb(baseHex);
    const baseHsl = rgbToHsl(r, g, b);
    const h = baseHsl.h, s = baseHsl.s, l = baseHsl.l;
    const out = [];

    if (scheme === 'complementary') {
        // spread colors symmetric between base hue and its complement
        for (let i = 0; i < count; i++) {
            // interpolate hue between h and h+180 by fraction
            const t = (count === 1) ? 0 : i / (count - 1);
            const targetHue = (h + 180 * t) % 360;
            // keep saturation near base but vary lightness slightly
            const ll = clamp(l * (0.85 + 0.3 * Math.abs(t - 0.5)), 0.07, 0.95);
            out.push(hslToHex(targetHue, clamp(s * (0.85 + 0.3 * (0.5 - Math.abs(t - 0.5)))), ll));
        }
    } else if (scheme === 'analogous') {
        // pick a slice around base hue (±30°)
        const spread = 60;
        for (let i = 0; i < count; i++) {
            const t = count === 1 ? 0.5 : i / (count - 1);
            const targetHue = (h - spread / 2) + spread * t;
            const ll = clamp(l * (0.9 + 0.2 * (Math.sin(t * Math.PI))), 0.06, 0.95);
            out.push(hslToHex(targetHue, clamp(s * (0.9)), ll));
        }

    } else if (scheme === 'triadic') {
        // distribute hues across the triadic positions: h, h+120, h+240
        for (let i = 0; i < count; i++) {
            const triIndex = i % 3;
            const group = Math.floor(i / 3);
            const offset = (group / (Math.ceil(count / 3))) * 12; // tiny shift per group
            const targetHue = (h + triIndex * 120 + offset) % 360;
            // vary lightness gently across set
            const ll = clamp(0.25 + 0.65 * (i / (Math.max(1, count - 1))), 0.06, 0.95);
            out.push(hslToHex(targetHue, clamp(s * (0.9 + 0.08 * (triIndex - 1))), ll));
        }

    } else if (scheme === 'monochrome') {
        // same hue, vary lightness across range
        for (let i = 0; i < count; i++) {
            const t = (count === 1) ? 0.5 : i / (count - 1);
            const ll = clamp((0.95 - 0.8 * t), 0.02, 0.98);
            out.push(hslToHex(h, clamp(s * (0.6 + 0.5 * (1 - t))), ll));
        }

    } else if (scheme === 'split') {
        // split complement: h +/- 150
        const left = (h + 360 - 150) % 360;
        const right = (h + 150) % 360;
        for (let i = 0; i < count; i++) {
            const t = count === 1 ? 0.5 : i / (count - 1);
            const choose = (i % 2 === 0) ? left : right;
            // spread between chosen hue and base for visual variety
            const mixHue = (choose * (1 - t) + h * t) % 360;
            const ll = clamp(0.2 + 0.7 * (i / Math.max(1, count - 1)), 0.05, 0.97);
            out.push(hslToHex(mixHue, clamp(s * (0.85 + 0.2 * Math.abs(0.5 - t))), ll));
        }
    } else {
        // fallback: evenly spaced hues
        for (let i = 0; i < count; i++) {
            const targetHue = (h + (360 / count) * i) % 360;
            out.push(hslToHex(targetHue, s, l));
        }
    }

    return out;
}

// ---------- DOM wiring ----------
const baseColorInput = document.getElementById('baseColor');
const baseHexInput = document.getElementById('baseHex');
const countInput = document.getElementById('count');
const schemeSelect = document.getElementById('scheme');
const generateBtn = document.getElementById('generate');
const paletteWrap = document.getElementById('paletteWrap');
const copyBubble = document.getElementById('copyBubble');

// Sync color hex textbox when color input changes
baseColorInput.addEventListener('input', e => {
    baseHexInput.value = e.target.value.toLowerCase();
});

// If user edits hex text, try to reflect in color input
baseHexInput.addEventListener('change', () => {
    let v = baseHexInput.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-fA-F]{3}$/.test(v) || /^#[0-9a-fA-F]{6}$/.test(v)) {
        baseHexInput.value = v.toLowerCase();
        baseColorInput.value = v;
    } else {
        // revert to previous valid
        baseHexInput.value = baseColorInput.value;
    }
});

function clearPalette() {
    paletteWrap.innerHTML = '';
}

function showCopyBubble(text, rect) {
    copyBubble.textContent = text;
    copyBubble.style.left = (rect.left + rect.width / 2) + 'px';
    copyBubble.style.top = (rect.top + rect.height / 2) + 'px';
    copyBubble.classList.add('show');

    setTimeout(() => {
        copyBubble.classList.remove('show');
    }, 900);
}

function createSwatch(hex) {
    const outer = document.createElement('div');
    outer.className = 'relative rounded-2xl shadow-md p-6 swatch flex flex-col items-center justify-center';
    outer.style.background = '#fff';
    outer.style.minHeight = '120px';

    const box = document.createElement('div');
    box.className = 'w-full h-28 rounded-lg';
    box.style.background = hex;
    box.setAttribute('aria-label', hex);

    const labelWrap = document.createElement('div');
    labelWrap.className = 'mt-4 w-full flex items-center justify-between gap-3';

    const hexText = document.createElement('div');
    hexText.className = 'text-sm font-semibold';
    hexText.textContent = hex.toUpperCase();

    const copyBtn = document.createElement('button');
    copyBtn.className = 'px-3 py-1 rounded-md text-sm font-medium border';
    copyBtn.textContent = 'Copy';

    copyBtn.addEventListener('click', async (ev) => {
        try {
            await navigator.clipboard.writeText(hex);
            // show bubble near the button
            const rect = copyBtn.getBoundingClientRect();
            showCopyBubble('Copied ' + hex.toUpperCase(), rect);
        } catch (err) {
            // fallback: select text
            const dummy = document.createElement('textarea');
            dummy.value = hex;
            document.body.appendChild(dummy);
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
            const rect = copyBtn.getBoundingClientRect();
            showCopyBubble('Copied', rect);
        }
    });

    // click swatch to copy as well
    box.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(hex); } catch (e) { /* ignore */ }
        const rect = box.getBoundingClientRect();
        showCopyBubble(hex.toUpperCase(), rect);
    });

    labelWrap.appendChild(hexText);
    labelWrap.appendChild(copyBtn);

    outer.appendChild(box);
    outer.appendChild(labelWrap);

    return outer;
}

function renderPalette(colors) {
    clearPalette();
    colors.forEach(hex => {
        const sw = createSwatch(hex);
        paletteWrap.appendChild(sw);
    });
}

// initial render
function initialGenerate() {
    const base = baseColorInput.value;
    const cnt = Math.max(2, Math.min(12, parseInt(countInput.value) || 5));
    const scheme = schemeSelect.value;
    const colors = generatePalette(base, cnt, scheme);
    renderPalette(colors);
}

generateBtn.addEventListener('click', initialGenerate);

// generate on load
window.addEventListener('load', initialGenerate);

// allow Enter on hex textbox to regenerate
baseHexInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') generateBtn.click(); });
// countInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') generateBtn.click(); });
// Ensure count input never goes below 2
countInput.addEventListener('input', () => {
    if (countInput.value < 2) countInput.value = 2;
});

schemeSelect.addEventListener('change', () => generateBtn.click());