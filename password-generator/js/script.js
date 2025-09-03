document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const lengthSlider = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    const lowercaseCheckbox = document.getElementById('lowercase');
    const uppercaseCheckbox = document.getElementById('uppercase');
    const numbersCheckbox = document.getElementById('numbers');
    const symbolsCheckbox = document.getElementById('symbols');
    const generateBtn = document.getElementById('generateBtn');
    const passwordOutput = document.getElementById('passwordOutput');
    const strengthText = document.getElementById('strengthText');
    const strengthBar = document.getElementById('strengthBar');
    const copyBtn = document.getElementById('copyBtn');
    const entropyValue = document.getElementById('entropyValue');

    // Character sets
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Update length value display
    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
        generatePassword();
    });

    // Generate password when any checkbox changes
    [lowercaseCheckbox, uppercaseCheckbox, numbersCheckbox, symbolsCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', generatePassword);
    });

    // Generate password on button click
    generateBtn.addEventListener('click', generatePassword);

    // Copy password to clipboard
    copyBtn.addEventListener('click', () => {
        const password = passwordOutput.textContent;
        navigator.clipboard.writeText(password).then(() => {
            // Visual feedback for copy action
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✓ Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        });
    });

    // Generate password function
    function generatePassword() {
        let charset = '';
        if (lowercaseCheckbox.checked) charset += lowercase;
        if (uppercaseCheckbox.checked) charset += uppercase;
        if (numbersCheckbox.checked) charset += numbers;
        if (symbolsCheckbox.checked) charset += symbols;

        // If no character set is selected, show an alert and use all
        if (!charset) {
            alert('Please select at least one character type!');
            lowercaseCheckbox.checked = true;
            charset = lowercase + uppercase + numbers + symbols;
        }

        const length = parseInt(lengthSlider.value);
        let password = '';

        // Generate password
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        // Update password display
        passwordOutput.textContent = password;

        // Calculate and display password strength
        updatePasswordStrength(password, charset);
    }

    // Update password strength indicator
    function updatePasswordStrength(password, charset) {
        // Calculate entropy (measure of password strength)
        const charsetSize = charset.length;
        const passwordLength = password.length;
        const entropy = Math.log2(Math.pow(charsetSize, passwordLength));

        // Update entropy display
        entropyValue.textContent = `Entropy: ${Math.round(entropy)} bits`;

        // Determine strength level based on entropy
        let strength, width, color, text;

        if (entropy < 40) {
            strength = 'Weak';
            width = '33%';
            color = 'bg-red-500';
            text = 'text-red-600';
        } else if (entropy < 70) {
            strength = 'Medium';
            width = '66%';
            color = 'bg-yellow-500';
            text = 'text-yellow-600';
        } else {
            strength = 'Strong';
            width = '100%';
            color = 'bg-green-500';
            text = 'text-green-600';
        }

        // Update strength display
        strengthText.textContent = `Strength: ${strength}`;
        strengthText.className = `text-sm font-medium ${text}`;
        strengthBar.className = `${color} h-2.5 rounded-full`;
        strengthBar.style.width = width;
    }

    // Generate initial password on page load
    generatePassword();
});