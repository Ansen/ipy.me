/**
 * ipy.me - Python Online Runner
 * Powered by Pyodide
 */

// DOM Elements
const codeInput = document.getElementById('code');
const outputEl = document.getElementById('output');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const examplesSelect = document.getElementById('examples');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const execTimeEl = document.getElementById('exec-time');
const themeToggle = document.getElementById('theme-toggle');

// Theme Management
const THEME_KEY = 'ipy-theme';

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getCurrentTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
        return saved;
    }
    return 'auto'; // Follow system
}

function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'auto') {
        // Remove data-theme to let CSS media query handle it
        root.removeAttribute('data-theme');
        localStorage.removeItem(THEME_KEY);
    } else {
        root.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }
}

function toggleTheme() {
    const current = getCurrentTheme();
    let next;

    if (current === 'auto') {
        // Auto -> opposite of system
        next = getSystemTheme() === 'dark' ? 'light' : 'dark';
    } else if (current === 'light') {
        next = 'dark';
    } else {
        // dark -> auto
        next = 'auto';
    }

    applyTheme(next);
}

// Initialize theme
(function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
        applyTheme(saved);
    }
})();

// ========== Internationalization ==========
const langToggle = document.getElementById('lang-toggle');
const LANG_KEY = 'ipy-lang';

const translations = {
    zh: {
        'status.loading': '正在加载 Python...',
        'status.ready': 'Python 已就绪',
        'status.running': '运行中...',
        'status.error': '加载失败',
        'panel.code': '📝 代码',
        'panel.output': '💻 输出',
        'examples.select': '选择示例...',
        'examples.hello': 'Hello World',
        'examples.loop': '循环示例',
        'examples.function': '函数定义',
        'examples.list': '列表操作',
        'btn.run': '运行',
        'btn.clear': '清空输出',
        'footer.text': '由 Pyodide 驱动 · 代码在浏览器本地运行',
        'output.empty': '(无输出)',
        'output.enterCode': '请输入代码',
        'error.load': '加载 Pyodide 失败'
    },
    en: {
        'status.loading': 'Loading Python...',
        'status.ready': 'Python Ready',
        'status.running': 'Running...',
        'status.error': 'Load Failed',
        'panel.code': '📝 Code',
        'panel.output': '💻 Output',
        'examples.select': 'Select example...',
        'examples.hello': 'Hello World',
        'examples.loop': 'Loop Example',
        'examples.function': 'Functions',
        'examples.list': 'List Operations',
        'btn.run': 'Run',
        'btn.clear': 'Clear',
        'footer.text': 'Powered by Pyodide · Code runs locally in browser',
        'output.empty': '(no output)',
        'output.enterCode': 'Please enter code',
        'error.load': 'Failed to load Pyodide'
    }
};

let currentLang = localStorage.getItem(LANG_KEY) || 'en';

function t(key) {
    return translations[currentLang][key] || translations['en'][key] || key;
}

// Code examples - defined early so loadDefaultExample can use it
const examples = {
    default: {
        zh: `print("Hello, ipy.me! \ud83c\udf89")

# \u8bd5\u8bd5\u8fd9\u4e9b\uff1a
name = "Python"
print(f"\u6b22\u8fce\u6765\u5230 {name} \u7684\u4e16\u754c\uff01")

# \u8ba1\u7b97
result = sum(range(1, 101))
print(f"1 \u5230 100 \u7684\u548c\u662f\uff1a{result}")`,
        en: `print("Hello, ipy.me! \ud83c\udf89")

# Try these:
name = "Python"
print(f"Welcome to the world of {name}!")

# Calculate
result = sum(range(1, 101))
print(f"Sum of 1 to 100 is: {result}")`
    },

    hello: {
        zh: `print("Hello, World! \ud83c\udf0d")
print("\u6b22\u8fce\u6765\u5230 ipy.me\uff01")`,
        en: `print("Hello, World! \ud83c\udf0d")
print("Welcome to ipy.me!")`
    },

    loop: {
        zh: `# \u5faa\u73af\u793a\u4f8b
for i in range(1, 6):
    print(f"\u7b2c {i} \u6b21\u5faa\u73af")

# \u5217\u8868\u63a8\u5bfc\u5f0f
squares = [x**2 for x in range(1, 11)]
print(f"1-10 \u7684\u5e73\u65b9\uff1a{squares}")`,
        en: `# Loop example
for i in range(1, 6):
    print(f"Loop iteration {i}")

# List comprehension
squares = [x**2 for x in range(1, 11)]
print(f"Squares from 1-10: {squares}")`
    },

    function: {
        zh: `# \u5b9a\u4e49\u51fd\u6570
def greet(name):
    return f"\u4f60\u597d\uff0c{name}\uff01\u6b22\u8fce\u5b66\u4e60 Python\uff01"

def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

# \u8c03\u7528\u51fd\u6570
print(greet("\u5f00\u53d1\u8005"))
print(f"5 \u7684\u9636\u4e58\u662f\uff1a{calculate_factorial(5)}")`,
        en: `# Define functions
def greet(name):
    return f"Hello, {name}! Welcome to Python!"

def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

# Call functions
print(greet("Developer"))
print(f"Factorial of 5 is: {calculate_factorial(5)}")`
    },

    list: {
        zh: `# \u5217\u8868\u64cd\u4f5c
fruits = ["\u82f9\u679c", "\u9999\u8549", "\u6a59\u5b50", "\u8461\u8404"]

print("\u539f\u59cb\u5217\u8868\uff1a", fruits)
print("\u7b2c\u4e00\u4e2a\u6c34\u679c\uff1a", fruits[0])
print("\u6700\u540e\u4e00\u4e2a\u6c34\u679c\uff1a", fruits[-1])

# \u6dfb\u52a0\u5143\u7d20
fruits.append("\u897f\u74dc")
print("\u6dfb\u52a0\u897f\u74dc\u540e\uff1a", fruits)

# \u5217\u8868\u957f\u5ea6
print(f"\u5171\u6709 {len(fruits)} \u79cd\u6c34\u679c")

# \u904d\u5386
print("\\n\u6240\u6709\u6c34\u679c\uff1a")
for i, fruit in enumerate(fruits, 1):
    print(f"  {i}. {fruit}")`,
        en: `# List operations
fruits = ["Apple", "Banana", "Orange", "Grape"]

print("Original list:", fruits)
print("First fruit:", fruits[0])
print("Last fruit:", fruits[-1])

# Add element
fruits.append("Watermelon")
print("After adding Watermelon:", fruits)

# List length
print(f"Total {len(fruits)} fruits")

# Iterate
print("\\nAll fruits:")
for i, fruit in enumerate(fruits, 1):
    print(f"  {i}. {fruit}")`
    }
};

// Load default example on page init
loadDefaultExample();

function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Update lang toggle button text
    langToggle.querySelector('span').textContent = currentLang === 'zh' ? 'EN' : '中';

    // Update HTML lang attribute
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';

    // Update placeholder
    const codeEl = document.getElementById('code');
    codeEl.placeholder = currentLang === 'zh' ? '在这里输入 Python 代码...' : 'Enter Python code here...';
}

function toggleLanguage() {
    currentLang = currentLang === 'zh' ? 'en' : 'zh';
    localStorage.setItem(LANG_KEY, currentLang);
    updatePageLanguage();
    // Update default example if code hasn't been modified
    loadDefaultExample();
}

// Load default example based on language
function loadDefaultExample() {
    if (examples.default && examples.default[currentLang]) {
        codeInput.value = examples.default[currentLang];
    }
}

// Initialize language
updatePageLanguage();

// Pyodide instance
let pyodide = null;

// Initialize Pyodide
async function initPyodide() {
    try {
        setStatus('loading', t('status.loading'));

        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });

        // Redirect stdout and stderr
        await pyodide.runPythonAsync(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.output = StringIO()
    
    def write(self, text):
        self.output.write(text)
    
    def flush(self):
        pass
    
    def getvalue(self):
        return self.output.getvalue()
    
    def clear(self):
        self.output = StringIO()

_stdout_capture = OutputCapture()
_stderr_capture = OutputCapture()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
        `);

        setStatus('ready', t('status.ready'));
        runBtn.disabled = false;

    } catch (error) {
        setStatus('error', t('status.error'));
        outputEl.textContent = `${t('error.load')}: ${error.message}`;
        outputEl.classList.add('error');
    }
}

// Set status indicator
function setStatus(state, text) {
    statusDot.className = 'status-dot ' + state;
    statusText.textContent = text;
}

// Run Python code
async function runCode() {
    const code = codeInput.value;

    if (!code.trim()) {
        outputEl.textContent = t('output.enterCode');
        outputEl.classList.remove('error');
        return;
    }

    setStatus('running', t('status.running'));
    runBtn.disabled = true;
    outputEl.textContent = '';
    outputEl.classList.remove('error');
    execTimeEl.textContent = '';

    const startTime = performance.now();

    try {
        // Clear previous output
        await pyodide.runPythonAsync(`
_stdout_capture.clear()
_stderr_capture.clear()
        `);

        // Execute user code
        await pyodide.runPythonAsync(code);

        // Get output
        const stdout = await pyodide.runPythonAsync('_stdout_capture.getvalue()');
        const stderr = await pyodide.runPythonAsync('_stderr_capture.getvalue()');

        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(3);

        if (stderr) {
            outputEl.textContent = stderr;
            outputEl.classList.add('error');
        } else if (stdout) {
            outputEl.textContent = stdout;
        } else {
            outputEl.textContent = t('output.empty');
            outputEl.style.color = 'var(--text-secondary)';
        }

        execTimeEl.textContent = `⏱ ${duration}s`;
        setStatus('ready', t('status.ready'));

    } catch (error) {
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(3);

        outputEl.textContent = error.message;
        outputEl.classList.add('error');
        execTimeEl.textContent = `⏱ ${duration}s`;
        setStatus('ready', t('status.ready'));
    }

    runBtn.disabled = false;
}

// Clear output
function clearOutput() {
    outputEl.textContent = '';
    outputEl.classList.remove('error');
    outputEl.style.color = '';
    execTimeEl.textContent = '';
}

// Load example
function loadExample(name) {
    if (examples[name] && examples[name][currentLang]) {
        codeInput.value = examples[name][currentLang];
    }
    examplesSelect.value = '';
}

// Event Listeners
runBtn.addEventListener('click', runCode);
clearBtn.addEventListener('click', clearOutput);
examplesSelect.addEventListener('change', (e) => loadExample(e.target.value));
themeToggle.addEventListener('click', toggleTheme);
langToggle.addEventListener('click', toggleLanguage);

// Keyboard shortcut: Ctrl/Cmd + Enter to run
codeInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!runBtn.disabled) {
            runCode();
        }
    }

    // Tab key for indentation
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeInput.selectionStart;
        const end = codeInput.selectionEnd;
        codeInput.value = codeInput.value.substring(0, start) + '    ' + codeInput.value.substring(end);
        codeInput.selectionStart = codeInput.selectionEnd = start + 4;
    }
});

// Initialize
initPyodide();
