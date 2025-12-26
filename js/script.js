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
}

function reverseMove(move) {
    const base = move[0];
    const suffix = move.slice(1);

    if (suffix === "'") return base;
    if (suffix === '2') return base + '2';
    return base + "'";
}

// 把字符串拆成 token：字母手法 / 括号 / 数字
function tokenize(formula) {
    const tokens = [];
    const regex = /([a-zA-Z](?:'|2)?|\(|\)|\d+)/g;
    let m;
    while ((m = regex.exec(formula.replace(/\s+/g, ''))) !== null) {
        tokens.push(m[0]);
    }
    return tokens;
}

// 处理一个 token 序列，允许识别 ()2 结构
function reverseTokens(tokens) {
    // 先做一个扫描，把 ()2 变成一个块
    const blocks = [];
    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        if (t === '(') {
            // 找到匹配的 )
            let depth = 1;
            let j = i + 1;
            for (; j < tokens.length; j++) {
                if (tokens[j] === '(') depth++;
                else if (tokens[j] === ')') depth--;
                if (depth === 0) break;
            }
            const inner = tokens.slice(i + 1, j); // 括号内部
            let repeat = 1;

            // 如果后面紧跟数字 2 / 3 等，认为是整体重复
            if (tokens[j + 1] && /^\d+$/.test(tokens[j + 1])) {
                repeat = parseInt(tokens[j + 1], 10);
                i = j + 1;
            } else {
                i = j;
            }

            blocks.push({
                type: 'group',
                repeat,
                inner
            });
        } else if (t === ')' || /^\d+$/.test(t)) {
            // ) 或单独数字在正常语法下不会出现在这里，忽略
            continue;
        } else {
            // 普通 move
            blocks.push({
                type: 'move',
                move: t
            });
        }
    }

    // 反向 block 列表，并对每个 block 取逆
    const reversedBlocks = [];
    for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        if (b.type === 'move') {
            reversedBlocks.push({
                type: 'move',
                move: reverseMove(b.move)
            });
        } else if (b.type === 'group') {
            // 对 group 内部递归取逆
            const innerReversed = reverseTokens(b.inner);
            reversedBlocks.push({
                type: 'group',
                repeat: b.repeat,
                inner: innerReversed
            });
        }
    }

    // 把 block 重新拼回字符串
    const out = [];
    for (const b of reversedBlocks) {
        if (b.type === 'move') {
            out.push(b.move);
        } else {
            // group
            out.push('(' + b.inner.join(' ') + ')');
            if (b.repeat > 1) out.push(String(b.repeat));
        }
    }

    return out;
}

function reverseFormula(formula) {
    const tokens = tokenize(formula);
    const reversedTokens = reverseTokens(tokens);
    let result = reversedTokens.join(' ');

    // 删掉重复次数前面的空格，例如 ") 2" -> ")2"
    result = result.replace(/\)\s+(\d+)/g, ')$1');

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

