let captchaText = "";

function generateCaptcha() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    captchaText = "";
    for (let i = 0; i < 6; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById("captcha").textContent = captchaText;
}

function validateCaptcha() {
    const input = document.getElementById("captchaInput").value.trim();
    const message = document.getElementById("message");

    if (input === captchaText) {
        message.textContent = "✅ Captcha Verified Successfully!";
        message.className = "mt-3 text-green-600 font-semibold";
    } else {
        message.textContent = "❌ Incorrect Captcha. Try Again!";
        message.className = "mt-3 text-red-600 font-semibold";
        generateCaptcha(); // refresh captcha after wrong attempt
    }
    document.getElementById("captchaInput").value = "";
}

// Generate captcha on page load
window.onload = generateCaptcha;