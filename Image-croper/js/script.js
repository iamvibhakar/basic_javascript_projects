// Basic crop box drag + resize + crop to canvas
        const sourceImage = document.getElementById('sourceImage');
        const cropBox = document.getElementById('cropBox');
        const cropContainer = document.getElementById('cropContainer');
        const fileInput = document.getElementById('fileInput');
        const previewCanvas = document.getElementById('previewCanvas');
        const rotateBtn = document.getElementById('rotateBtn');
        const flipBtn = document.getElementById('flipBtn');
        const previewBtn = document.getElementById('previewBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        let dragging = false;
        let resizing = false;
        let start = {};
        let mode = null; // 'move' or handle name
        let aspect = null; // e.g. 16/9 or null for free
        let rotation = 0; // degrees
        let flipped = false;

        // Allow user to open their own file
        fileInput.addEventListener('change', (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            const url = URL.createObjectURL(f);
            sourceImage.src = url;
            sourceImage.onload = () => {
                cropContainer.classList.remove('hidden');
                cropBox.classList.remove('hidden');
                const w = sourceImage.naturalWidth;
                const h = sourceImage.naturalHeight;
                const displayW = sourceImage.width;
                const displayH = sourceImage.height;
                cropBox.style.width = Math.min(300, displayW * 0.6) + 'px';
                cropBox.style.height = cropBox.style.width;
                cropBox.style.left = ((displayW - parseFloat(cropBox.style.width)) / 2) + 'px';
                cropBox.style.top = ((displayH - parseFloat(cropBox.style.height)) / 2) + 'px';
            }
        });

        // make cropBox movable
        cropBox.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            const target = e.target;
            if (target.classList.contains('handle')) {
                resizing = true;
                mode = Array.from(target.classList).find(c => c !== 'handle');
            } else {
                dragging = true;
                mode = 'move';
            }
            start.x = e.clientX; start.y = e.clientY;
            const rect = cropBox.getBoundingClientRect();
            start.left = rect.left; start.top = rect.top; start.width = rect.width; start.height = rect.height;
            cropBox.setPointerCapture(e.pointerId);
        });

        window.addEventListener('pointermove', (e) => {
            if (!dragging && !resizing) return;
            const wrapRect = sourceImage.getBoundingClientRect();
            const dx = e.clientX - start.x; const dy = e.clientY - start.y;
            if (mode === 'move') {
                let newLeft = start.left + dx - wrapRect.left;
                let newTop = start.top + dy - wrapRect.top;
                // clamp
                newLeft = Math.max(0, Math.min(newLeft, wrapRect.width - start.width));
                newTop = Math.max(0, Math.min(newTop, wrapRect.height - start.height));
                cropBox.style.left = newLeft + 'px';
                cropBox.style.top = newTop + 'px';
            } else if (resizing) {
                let newLeft = start.left - wrapRect.left;
                let newTop = start.top - wrapRect.top;
                let newW = start.width; let newH = start.height;
                const minSize = 40;
                const handle = mode;
                // handle corners and edges
                if (handle.includes('e')) {
                    newW = Math.max(minSize, start.width + dx);
                }
                if (handle.includes('s')) {
                    newH = Math.max(minSize, start.height + dy);
                }
                if (handle.includes('w')) {
                    newW = Math.max(minSize, start.width - dx);
                    newLeft = newLeft + dx;
                }
                if (handle.includes('n')) {
                    newH = Math.max(minSize, start.height - dy);
                    newTop = newTop + dy;
                }
                // aspect lock
                if (aspect && aspect !== 'free') {
                    const [aw, ah] = aspect.split(':').map(Number);
                    if (aw && ah) {
                        const ratio = aw / ah;
                        // choose which dimension to follow (prefer width unless vertical drag larger)
                        if (Math.abs(dx) > Math.abs(dy)) {
                            newH = newW / ratio;
                        } else {
                            newW = newH * ratio;
                        }
                    }
                }
                // clamp to image bounds
                if (newLeft < 0) { newW += newLeft; newLeft = 0; }
                if (newTop < 0) { newH += newTop; newTop = 0; }
                if (newLeft + newW > wrapRect.width) newW = wrapRect.width - newLeft;
                if (newTop + newH > wrapRect.height) newH = wrapRect.height - newTop;

                cropBox.style.left = newLeft + 'px';
                cropBox.style.top = newTop + 'px';
                cropBox.style.width = newW + 'px';
                cropBox.style.height = newH + 'px';
            }
        });

        window.addEventListener('pointerup', (e) => {
            dragging = false; resizing = false; mode = null;
        });

        // aspect buttons
        document.querySelectorAll('.aspect-btn').forEach(b => {
            b.addEventListener('click', () => {
                document.querySelectorAll('.aspect-btn').forEach(x => x.classList.remove('bg-indigo-600', 'text-white'));
                b.classList.add('bg-indigo-600', 'text-white');
                const a = b.dataset.aspect;
                if (a === 'free') aspect = null; else aspect = a;
                // adjust crop box to new aspect ratio keeping center
                if (aspect) {
                    const [aw, ah] = aspect.split(':').map(Number);
                    if (aw && ah) {
                        const ratio = aw / ah;
                        const rect = cropBox.getBoundingClientRect();
                        const wrapRect = sourceImage.getBoundingClientRect();
                        let newW = rect.width; let newH = rect.height;
                        if (newW / newH > ratio) {
                            newW = newH * ratio;
                        } else {
                            newH = newW / ratio;
                        }
                        const left = Math.max(0, Math.min(rect.left - wrapRect.left + (rect.width - newW) / 2, wrapRect.width - newW));
                        const top = Math.max(0, Math.min(rect.top - wrapRect.top + (rect.height - newH) / 2, wrapRect.height - newH));
                        cropBox.style.width = newW + 'px';
                        cropBox.style.height = newH + 'px';
                        cropBox.style.left = left + 'px';
                        cropBox.style.top = top + 'px';
                    }
                }
            });
        });

        // rotate
        rotateBtn.addEventListener('click', () => {
            rotation = (rotation + 90) % 360;
            sourceImage.style.transform = `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`;
        });
        // flip horizontal
        flipBtn.addEventListener('click', () => {
            flipped = !flipped;
            sourceImage.style.transform = `rotate(${rotation}deg) scaleX(${flipped ? -1 : 1})`;
        });

        function cropToCanvas() {
            const imgRect = sourceImage.getBoundingClientRect();
            const boxRect = cropBox.getBoundingClientRect();
            // compute crop area in image natural pixels
            const sx = (boxRect.left - imgRect.left) * (sourceImage.naturalWidth / imgRect.width);
            const sy = (boxRect.top - imgRect.top) * (sourceImage.naturalHeight / imgRect.height);
            const sw = boxRect.width * (sourceImage.naturalWidth / imgRect.width);
            const sh = boxRect.height * (sourceImage.naturalHeight / imgRect.height);

            // prepare canvas
            const canvas = previewCanvas;
            canvas.width = Math.round(sw);
            canvas.height = Math.round(sh);
            const ctx = canvas.getContext('2d');
            ctx.save();
            // handle flip and rotation for drawing from natural image
            // For simplicity, apply transform on context if rotation or flip present
            if (rotation !== 0 || flipped) {
                // create an offscreen canvas to draw transformed source then crop from it
                const off = document.createElement('canvas');
                off.width = sourceImage.naturalWidth; off.height = sourceImage.naturalHeight;
                const ox = off.getContext('2d');
                ox.save();
                // translate to center
                ox.translate(off.width / 2, off.height / 2);
                if (rotation) ox.rotate(rotation * Math.PI / 180);
                ox.scale(flipped ? -1 : 1, 1);
                // draw image centered
                ox.drawImage(sourceImage, -sourceImage.naturalWidth / 2, -sourceImage.naturalHeight / 2);
                ox.restore();
                // copy the crop area from off canvas
                const imgData = off.getContext('2d').getImageData(Math.round(sx), Math.round(sy), Math.round(sw), Math.round(sh));
                ctx.putImageData(imgData, 0, 0);
            } else {
                ctx.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            }
            ctx.restore();
        }

        previewBtn.addEventListener('click', () => {
            cropToCanvas();
        });

        downloadBtn.addEventListener('click', () => {
            cropToCanvas();
            const link = document.createElement('a');
            link.download = 'crop.png';
            link.href = previewCanvas.toDataURL('image/png');
            link.click();
        });

        // initial aspect selection set to 1:1
        document.querySelector('.aspect-btn[data-aspect="1:1"]').click();

        // prevent image dragging ghost
        sourceImage.addEventListener('dragstart', e => e.preventDefault());