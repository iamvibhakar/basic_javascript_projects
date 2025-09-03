// Text Formatter Tool JavaScript

class TextFormatter {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.findInput = document.getElementById('findInput');
        this.replaceInput = document.getElementById('replaceInput');
        this.formatSelect = document.getElementById('formatSelect');
        this.formatBtn = document.getElementById('formatBtn');
        this.replaceBtn = document.getElementById('replaceBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.charCount = document.getElementById('charCount');
        this.wordCount = document.getElementById('wordCount');

        this.originalText = this.textInput.value;

        this.initializeEventListeners();
        this.updateCounts();
    }

    initializeEventListeners() {
        // Format button click
        this.formatBtn.addEventListener('click', () => this.formatText());

        // Replace button click
        this.replaceBtn.addEventListener('click', () => this.replaceText());

        // Reset button click
        this.resetBtn.addEventListener('click', () => this.resetText());

        // Update counts on text input
        this.textInput.addEventListener('input', () => this.updateCounts());

        // Format on select change
        this.formatSelect.addEventListener('change', () => {
            if (this.formatSelect.value !== 'none') {
                this.formatText();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.formatText();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.replaceText();
                        break;
                    case 'z':
                        e.preventDefault();
                        this.resetText();
                        break;
                }
            }
        });
    }

    updateCounts() {
        const text = this.textInput.value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

        this.charCount.textContent = `Characters: ${charCount}`;
        this.wordCount.textContent = `Words: ${wordCount}`;
    }

    formatText() {
        const selectedFormat = this.formatSelect.value;
        if (selectedFormat === 'none') {
            this.showNotification('Please select a formatting option', 'warning');
            return;
        }

        const text = this.textInput.value;
        let formattedText = '';

        switch (selectedFormat) {
            case 'uppercase':
                formattedText = text.toUpperCase();
                break;
            case 'lowercase':
                formattedText = text.toLowerCase();
                break;
            case 'titlecase':
                formattedText = this.toTitleCase(text);
                break;
            case 'sentencecase':
                formattedText = this.toSentenceCase(text);
                break;
            case 'camelcase':
                formattedText = this.toCamelCase(text);
                break;
            case 'pascalcase':
                formattedText = this.toPascalCase(text);
                break;
            case 'snakecase':
                formattedText = this.toSnakeCase(text);
                break;
            case 'kebabcase':
                formattedText = this.toKebabCase(text);
                break;
        }

        this.textInput.value = formattedText;
        this.textInput.classList.add('text-updated');
        setTimeout(() => this.textInput.classList.remove('text-updated'), 500);

        this.updateCounts();
        this.showNotification(`Text converted to ${selectedFormat}`, 'success');
    }

    replaceText() {
        const findText = this.findInput.value;
        const replaceText = this.replaceInput.value;

        if (!findText) {
            this.showNotification('Please enter text to find', 'warning');
            return;
        }

        const text = this.textInput.value;
        const regex = new RegExp(this.escapeRegExp(findText), 'gi');
        const newText = text.replace(regex, replaceText);

        if (text === newText) {
            this.showNotification('No matches found', 'info');
            return;
        }

        this.textInput.value = newText;
        this.textInput.classList.add('text-updated');
        setTimeout(() => this.textInput.classList.remove('text-updated'), 500);

        this.updateCounts();
        this.showNotification(`Replaced ${(text.match(regex) || []).length} occurrence(s)`, 'success');
    }

    resetText() {
        this.textInput.value = this.originalText;
        this.findInput.value = '';
        this.replaceInput.value = '';
        this.formatSelect.value = 'none';

        this.textInput.classList.add('text-updated');
        setTimeout(() => this.textInput.classList.remove('text-updated'), 500);

        this.updateCounts();
        this.showNotification('Text reset to original', 'info');
    }

    // Text formatting helper methods
    toTitleCase(text) {
        return text.replace(/\w\S*/g, (txt) =>
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    toSentenceCase(text) {
        return text.toLowerCase().replace(/(^\w|\.\s+\w)/g, (txt) =>
            txt.toUpperCase()
        );
    }

    toCamelCase(text) {
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    toPascalCase(text) {
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
            return word.toUpperCase();
        }).replace(/\s+/g, '');
    }

    toSnakeCase(text) {
        return text.replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('_');
    }

    toKebabCase(text) {
        return text.replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('-');
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;

        // Set notification styles based on type
        const typeStyles = {
            success: 'bg-green-500 text-white',
            warning: 'bg-yellow-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white'
        };

        notification.className += ` ${typeStyles[type] || typeStyles.info}`;
        notification.textContent = message;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// Additional utility functions
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

function downloadText(text, filename = 'formatted-text.txt') {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TextFormatter();

    // Add copy and download buttons dynamically
    const buttonContainer = document.querySelector('.flex.flex-col.sm\\:flex-row.gap-4.justify-center');

    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy Text';
    copyBtn.className = 'bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-105';
    copyBtn.addEventListener('click', () => {
        const text = document.getElementById('textInput').value;
        copyToClipboard(text);
        // Show notification
        const formatter = new TextFormatter();
        formatter.showNotification('Text copied to clipboard!', 'success');
    });

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.className = 'bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 ease-in-out transform hover:scale-105';
    downloadBtn.addEventListener('click', () => {
        const text = document.getElementById('textInput').value;
        downloadText(text);
        // Show notification
        const formatter = new TextFormatter();
        formatter.showNotification('Text downloaded!', 'success');
    });

    buttonContainer.appendChild(copyBtn);
    buttonContainer.appendChild(downloadBtn);
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TextFormatter, copyToClipboard, downloadText };
}
