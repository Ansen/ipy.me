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

// Pyodide instance
let pyodide = null;

// Code examples
const examples = {
    hello: `print("Hello, World! 🌍")
print("欢迎来到 ipy.me！")`,

    loop: `# 循环示例
for i in range(1, 6):
    print(f"第 {i} 次循环")

# 列表推导式
squares = [x**2 for x in range(1, 11)]
print(f"1-10 的平方：{squares}")`,

    function: `# 定义函数
def greet(name):
    return f"你好，{name}！欢迎学习 Python！"

def calculate_factorial(n):
    if n <= 1:
        return 1
    return n * calculate_factorial(n - 1)

# 调用函数
print(greet("开发者"))
print(f"5 的阶乘是：{calculate_factorial(5)}")`,

    list: `# 列表操作
fruits = ["苹果", "香蕉", "橙子", "葡萄"]

print("原始列表：", fruits)
print("第一个水果：", fruits[0])
print("最后一个水果：", fruits[-1])

# 添加元素
fruits.append("西瓜")
print("添加西瓜后：", fruits)

# 列表长度
print(f"共有 {len(fruits)} 种水果")

# 遍历
print("\\n所有水果：")
for i, fruit in enumerate(fruits, 1):
    print(f"  {i}. {fruit}")`
};

// Initialize Pyodide
async function initPyodide() {
    try {
        setStatus('loading', '正在加载 Python...');
        
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
        
        setStatus('ready', 'Python 已就绪');
        runBtn.disabled = false;
        
    } catch (error) {
        setStatus('error', '加载失败');
        outputEl.textContent = `加载 Pyodide 失败: ${error.message}`;
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
        outputEl.textContent = '请输入代码';
        outputEl.classList.remove('error');
        return;
    }
    
    setStatus('running', '运行中...');
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
            outputEl.textContent = '(无输出)';
            outputEl.style.color = 'var(--text-secondary)';
        }
        
        execTimeEl.textContent = `⏱ ${duration}s`;
        setStatus('ready', 'Python 已就绪');
        
    } catch (error) {
        const endTime = performance.now();
        const duration = ((endTime - startTime) / 1000).toFixed(3);
        
        outputEl.textContent = error.message;
        outputEl.classList.add('error');
        execTimeEl.textContent = `⏱ ${duration}s`;
        setStatus('ready', 'Python 已就绪');
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
    if (examples[name]) {
        codeInput.value = examples[name];
    }
    examplesSelect.value = '';
}

// Event Listeners
runBtn.addEventListener('click', runCode);
clearBtn.addEventListener('click', clearOutput);
examplesSelect.addEventListener('change', (e) => loadExample(e.target.value));

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
