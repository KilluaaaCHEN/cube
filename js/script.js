// 初始化函数
function init() {
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

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.step-nav-item');

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // 先移除所有导航项的 active
            navLinks.forEach(l => l.classList.remove('active'));
            // 给当前点击的这个加 active
            this.classList.add('active');
            // 让浏览器照常跳转锚点
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const navLinks = Array.from(document.querySelectorAll('.step-nav-item'));
    if (!navLinks.length) return;

    // 根据 href 获取当前 index
    function getIndexByHash(hash) {
        const idx = navLinks.findIndex(link => link.getAttribute('href') === hash);
        return idx >= 0 ? idx : 0;
    }

    // 设置当前激活项并滚动到对应步骤
    function activateByIndex(index) {
        if (index < 0 || index >= navLinks.length) return;
        const link = navLinks[index];
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        // 高亮导航
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // 滚动到对应步骤（使用锚点默认行为会有跳闪，改用 scrollIntoView）
        target.scrollIntoView({ behavior: 'auto', block: 'start' });

        // 如果你有 scroll-margin-top，可以再微调：
        // window.scrollBy(0, -80); // 根据 navbar 高度调整
    }

    // 初始化：根据当前 hash 或第1项
    let currentIndex = getIndexByHash(window.location.hash || navLinks[0].getAttribute('href'));

    // 点击导航：高亮并更新 currentIndex
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // 阻止默认锚点跳转，避免和 scrollIntoView 冲突
            currentIndex = index;
            activateByIndex(currentIndex);
            // 同步地址栏 hash（可选）
            history.replaceState(null, '', this.getAttribute('href'));
        });
    });

    // 键盘事件：上/下箭头切换
    document.addEventListener('keydown', function (e) {
        // 只处理 ArrowUp / ArrowDown
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (currentIndex < navLinks.length - 1) {
                currentIndex++;
                activateByIndex(currentIndex);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                activateByIndex(currentIndex);
            }
        }
    });
});
