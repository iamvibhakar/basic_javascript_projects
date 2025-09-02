// Elements
    const blob = document.getElementById('blob');

    const inputs = {
      height: document.getElementById('height'),
      width:  document.getElementById('width'),
      tlx: document.getElementById('tlx'),
      tly: document.getElementById('tly'),
      trx: document.getElementById('trx'),
      try: document.getElementById('try'),
      brx: document.getElementById('brx'),
      bry: document.getElementById('bry'),
      blx: document.getElementById('blx'),
      bly: document.getElementById('bly'),
    };

    const outs = {
      tlx: document.getElementById('tlxOut'),
      tly: document.getElementById('tlyOut'),
      trx: document.getElementById('trxOut'),
      try: document.getElementById('tryOut'),
      brx: document.getElementById('brxOut'),
      bry: document.getElementById('bryOut'),
      blx: document.getElementById('blxOut'),
      bly: document.getElementById('blyOut'),
    };

    const cssOut   = document.getElementById('cssOut');
    const copyBtn  = document.getElementById('copyBtn');
    const sharpBtn = document.getElementById('sharpBtn');

    // Build radius string
    function buildRadius() {
      const v = {
        tlx: +inputs.tlx.value, tly: +inputs.tly.value,
        trx: +inputs.trx.value, try: +inputs.try.value,
        brx: +inputs.brx.value, bry: +inputs.bry.value,
        blx: +inputs.blx.value, bly: +inputs.bly.value
      };
      return `${v.tlx}% ${v.trx}% ${v.brx}% ${v.blx}% / ${v.tly}% ${v.try}% ${v.bry}% ${v.bly}%`;
    }

    function updateOutputs() {
      for (const k of Object.keys(outs)) outs[k].textContent = inputs[k].value;

      // Keep size within visible area (cap to 80% of left column)
      const maxDim = Math.min(520, Math.max(80, +inputs.width.value));
      blob.style.width  = Math.max(40, +inputs.width.value) + 'px';
      blob.style.height = Math.max(40, +inputs.height.value) + 'px';

      const radius = buildRadius();
      blob.style.borderRadius = radius;
      cssOut.textContent = `border-radius: ${radius};`;
    }

    function randInt(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }

    function generateSharpish() {
      const pick = () => (Math.random() < 0.5 ? randInt(0, 30) : randInt(70, 100));
      inputs.tlx.value = pick(); inputs.tly.value = pick();
      inputs.trx.value = pick(); inputs.try.value = pick();
      inputs.brx.value = pick(); inputs.bry.value = pick();
      inputs.blx.value = pick(); inputs.bly.value = pick();

      inputs.width.value  = randInt(120, 360);
      inputs.height.value = randInt(120, 360);
      updateOutputs();
    }

    // Events
    Object.values(inputs).forEach(el => el.addEventListener('input', updateOutputs));
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cssOut.textContent);
        alert('CSS code copied!');
      } catch {
        const ta = document.createElement('textarea');
        ta.value = cssOut.textContent;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        alert('CSS code copied!');
      }
    });
    sharpBtn.addEventListener('click', generateSharpish);
    // Init
    updateOutputs();

    // Optional: keep everything visible on very small screens by scaling controls
    function adaptLayout() {
      const h = window.innerHeight;
      // if very short, reduce slider height (we already used compact-range)
      // but prevent any page scroll: ensure body overflow hidden
      document.body.style.overflow = 'hidden';
    }
    window.addEventListener('resize', adaptLayout);
    adaptLayout();