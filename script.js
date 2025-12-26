// 存储原始公式和反向公式的状态
let isReversed = false;
let originalFormulas = new Map(); // 存储原始公式
let reversedFormulas = new Map(); // 存储反向公式

// 创建切换按钮
function createToggleButton() {
    const button = document.createElement('button');
    button.id = 'formula-toggle-btn';
    button.innerHTML = '🔁 反向公式';
    button.style.cssText = `
            position: fixed;
            top: 100px;
            right: 111px;
            z-index: 9999;
            padding: 30px 50px;
            background: linear-gradient(45deg, #4CAF50, #2196F3);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;

    button.addEventListener('mouseover', function () {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    });

    button.addEventListener('mouseout', function () {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });

    button.addEventListener('click', toggleFormulas);

    document.body.appendChild(button);
}

// 收集所有公式链接
function collectFormulas() {
    const formulaLinks = document.querySelectorAll('a[href*="/alg/"], a[href*="alg?"]');

    formulaLinks.forEach((link, index) => {
        const formulaText = link.textContent.trim();
        if (formulaText && !formulaText.includes('http')) {
            originalFormulas.set(index, {
                element: link,
                originalText: formulaText,
                reversedText: reverseFormula(formulaText)
            });
        }
    });

    console.log(`收集到 ${originalFormulas.size} 个公式`);
}

function reverseFormula(formula) {
    // 1. 先删除所有空格
    let noSpaces = formula.replace(/\s+/g, '');

    // 2. 分割公式为独立的标记（包括字母代码和括号）
    const codePattern = /([a-zA-Z](?:'|2)?|[\(\)])/g;
    const codes = [];
    let match;

    codePattern.lastIndex = 0;
    while ((match = codePattern.exec(noSpaces)) !== null) {
        codes.push(match[0]);
    }

    // 3. 反转顺序并处理字母代码（不处理括号）
    const reversedCodes = [];
    for (let i = codes.length - 1; i >= 0; i--) {
        const code = codes[i];

        // 如果是括号，保持原样
        if (code === '(' || code === ')') {
            reversedCodes.push(code);
            continue;
        }

        // 如果是字母代码，处理逆时针标记
        const base = code[0]; // 基础字母
        const suffix = code.slice(1); // 后缀部分

        let reversedCode;

        if (suffix === "'") {
            reversedCode = base; // 去掉'
        } else if (suffix === '2') {
            reversedCode = base + '2'; // 保持2
        } else {
            reversedCode = base + "'"; // 加上'
        }

        reversedCodes.push(reversedCode);
    }

    // 4. 用空格连接所有标记
    let result = reversedCodes.join(' ');

    // 5. 处理括号交换（保持你的原有逻辑）
    result = result
        .replace(/\(/g, 'right') // 交换括号
        .replace(/\)/g, 'left')
        .replace(/right/g, ')') // 交换括号
        .replace(/left/g, '(');

    // 6. 处理括号空格问题
    // (右边不要有空格，)左边不要有空格，仅限第一个空格
    result = result.replace(/\s*\)/g, ')'); // )左边不要有空格
    result = result.replace(/\(\s*/g, '('); // (右边不要有空格

    return result;
}

// 切换公式显示
function toggleFormulas() {
    const button = document.getElementById('formula-toggle-btn');

    if (!isReversed) {
        // 切换到反向公式
        originalFormulas.forEach((data, index) => {
            const link = data.element;
            link.textContent = data.reversedText;

            // 添加视觉反馈
            link.style.cssText = `
                    color: #e74c3c !important;
                    font-weight: bold !important;
                    transition: color 0.3s ease;
                `;
        });

        button.innerHTML = '🔁 复原公式';
        button.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
        isReversed = true;
    } else {
        // 切换回原始公式
        originalFormulas.forEach((data, index) => {
            const link = data.element;
            link.textContent = data.originalText;
            link.style.cssText = '';
        });

        button.innerHTML = '🔁 打乱公式';
        button.style.background = 'linear-gradient(45deg, #4CAF50, #2196F3)';
        isReversed = false;
    }
}

// 显示提示信息
function showNotification(message) {
    // 移除已有的提示
    const existingNotification = document.getElementById('formula-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'formula-notification';
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 150px;
            right: 20px;
            z-index: 10000;
            padding: 15px 25px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            border-radius: 10px;
            font-size: 14px;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            max-width: 200px;
        `;

    // 添加动画
    const style = document.createElement('style');
    style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// 初始化函数
function init() {
    collectFormulas();
    createToggleButton();
    // 监听键盘空格键事件
    document.addEventListener('keydown', function (event) {
        // 检查是否按下了空格键（keyCode 32 或 key ' '）
        if (event.code === 'Space' || event.key === ' ' || event.keyCode === 32) {
            // 阻止默认行为（如滚动页面）
            event.preventDefault();

            // 触发切换按钮的点击事件
            const toggleButton = document.getElementById('formula-toggle-btn');
            if (toggleButton) {
                toggleButton.click();
            }
        }
    });

}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

