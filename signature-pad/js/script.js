// Get elements
const canvas = document.getElementById('sigCanvas');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const previewArea = document.getElementById('previewArea');
const savedImg = document.getElementById('savedImg');
const downloadLink = document.getElementById('downloadLink');

// Set up 2D context with DPR handling for crisp lines
function resizeCanvasToDisplaySize() {
    const dpr = window.devicePixelRatio || 1;
    // use clientWidth/Height to set internal resolution
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(300, rect.width); // minimum width fallback
    const height = Math.max(150, rect.height);
    // set backing store size in device pixels
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    // set CSS size
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    // optional: draw a faint background (we keep it transparent for saving)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
}

// initialize
function initCanvas() {
    resizeCanvasToDisplaySize();
    // white background for prettier saved PNG (optional)
    const ctx = canvas.getContext('2d');
    // leave transparent background; if you want white, uncomment:
    // ctx.fillStyle = "#fff"; ctx.fillRect(0,0,canvas.width, canvas.height);
}

window.addEventListener('resize', () => {
    // preserve drawing when resizing by copying to temp canvas
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tctx = temp.getContext('2d');
    tctx.drawImage(canvas, 0, 0);
    initCanvas();
    const ctx = canvas.getContext('2d');
    ctx.drawImage(temp, 0, 0);
});

initCanvas();

// Drawing state
let drawing = false;
let lastX = 0, lastY = 0;

const ctx = canvas.getContext('2d');

function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    } else {
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
}

function startDrawing(e) {
    e.preventDefault();
    drawing = true;
    const p = getPointerPos(e);
    lastX = p.x;
    lastY = p.y;
}

function stopDrawing(e) {
    if (!drawing) return;
    drawing = false;
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPointerPos(e);
    ctx.strokeStyle = '#111827'; // default dark stroke
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
}

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

// Clear button
clearBtn.addEventListener('click', () => {
    const rect = canvas.getBoundingClientRect();
    // clear with CSS size coordinates (not device pixels)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // hide preview
    previewArea.classList.add('hidden');
    savedImg.src = '';
});

// Save button: create PNG and show preview + download
saveBtn.addEventListener('click', () => {
    // create a copy canvas with correct CSS pixel size to export without DPR issues
    const rect = canvas.getBoundingClientRect();
    const exportCanvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    exportCanvas.width = Math.round(rect.width * dpr);
    exportCanvas.height = Math.round(rect.height * dpr);
    const ectx = exportCanvas.getContext('2d');
    // attach white background for better visibility on some viewers
    ectx.fillStyle = '#ffffff';
    ectx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    // draw original scaled into export canvas
    ectx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const dataURL = exportCanvas.toDataURL('image/png');

    // show preview
    savedImg.src = dataURL;
    previewArea.classList.remove('hidden');

    // trigger download
    downloadLink.href = dataURL;
    downloadLink.download = 'signature.png';
    downloadLink.click();
});

// Clicking preview opens the image in new tab
savedImg.addEventListener('click', () => {
    if (!savedImg.src) return;
    window.open(savedImg.src, '_blank');
});

// initialize once more on load to ensure correct sizing
window.addEventListener('load', initCanvas);