const ageBtn = document.getElementById('ageBtn');
const result = document.getElementById('result');
const initialTitle = document.querySelector('.initial-title');
const messageModule = document.getElementById('messageModule');
const messageForm = document.getElementById('messageForm');
const messageName = document.getElementById('messageName');
const messageContent = document.getElementById('messageContent');
const messageList = document.getElementById('messageList');
const decorContainer = document.getElementById('decorContainer'); // 装饰容器

// 核心配置
const totalImgCount = 63;
const imgFolder = "images";
const imgFormat = "jpg";
const imgPerGroup = 9;
const popInterval = 150;
const stayTime = 1000;
const fadeOutTime = 800;
const textShowTime = 3000; // 文字显示时长
let groupIndex = 1;
const maxGroupNum = Math.ceil(totalImgCount / imgPerGroup);
let timers = [];

// 页面加载时：1. 渲染留言 2. 生成漂浮装饰
window.onload = function() {
    renderMessageList();
    createFloatDecor(); // 启动漂浮装饰生成
};

// 新增：生成漂浮装饰（爱心+光点，提升娱乐性）
function createFloatDecor() {
    // 定时生成装饰元素（每300毫秒生成一个）
    setInterval(() => {
        const decorTypes = ['heart', 'dot']; // 两种装饰类型
        const randomType = decorTypes[Math.floor(Math.random() * decorTypes.length)];
        const decor = document.createElement('div');

        // 设置装饰类型和样式
        if (randomType === 'heart') {
            decor.className = 'heart-decor';
            decor.innerHTML = '❤️'; // 爱心图标
        } else {
            decor.className = 'dot-decor';
        }

        // 随机位置（水平）、大小、动画时长
        const randomLeft = Math.floor(Math.random() * 100); // 0-100vw
        const randomSize = Math.random() * 10 + 10; // 10-20px
        const randomDelay = Math.random() * 5; // 0-5秒延迟
        const randomDuration = Math.random() * 10 + 5; // 5-15秒漂浮时长

        // 应用样式
        decor.style.left = `${randomLeft}vw`;
        decor.style.fontSize = `${randomSize}px`;
        decor.style.animationDelay = `${randomDelay}s`;
        decor.style.animationDuration = `${randomDuration}s`;

        // 添加到容器
        decorContainer.appendChild(decor);

        // 动画结束后移除元素，避免内存占用
        setTimeout(() => {
            decor.remove();
        }, (randomDelay + randomDuration) * 1000);
    }, 300);
}

// 按钮点击事件
ageBtn.onclick = () => {
    // 清除定时器
    timers.forEach(timer => clearTimeout(timer));
    timers = [];

    // 移除旧图片容器
    const allOldContainers = document.querySelectorAll('.image-container');
    allOldContainers.forEach(container => container.remove());

    // 重置组索引
    groupIndex = 1;

    // 隐藏元素
    ageBtn.classList.add('hide');
    initialTitle.classList.add('hide');
    result.classList.add('hide');
    messageModule.classList.add('hide');

    // 启动图片播放
    showImageGroupWithSinglePop(groupIndex);
};

// 单组图片逐个弹出
function showImageGroupWithSinglePop(groupNum) {
    const allOldContainers = document.querySelectorAll('.image-container');
    allOldContainers.forEach(container => container.remove());
    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';
    document.body.appendChild(imgContainer);

    const startImgIndex = (groupNum - 1) * imgPerGroup + 1;
    let imgIndexes = [];
    for (let i = 0; i < imgPerGroup; i++) {
        let idx = startImgIndex + i;
        if (idx > totalImgCount) {
            break;
        }
        imgIndexes.push(idx);
    }

    for (let i = 0; i < imgIndexes.length; i++) {
        const timer = setTimeout(() => {
            const img = document.createElement('img');
            img.src = `./${imgFolder}/${imgIndexes[i]}.${imgFormat}`;
            img.alt = `我的回忆${imgIndexes[i]}`;
            imgContainer.appendChild(img);

            img.onload = () => {
                img.classList.add('active');
            };
            img.onerror = () => {
                img.src = `https://picsum.photos/400/400?random=${imgIndexes[i]}`;
                img.classList.add('active');
            };
        }, i * popInterval);
        timers.push(timer);
    }

    const totalPopTime = (imgIndexes.length - 1) * popInterval;
    const timer = setTimeout(() => {
        imgContainer.style.opacity = 0;

        const fadeTimer = setTimeout(() => {
            imgContainer.remove();

            if (groupNum < maxGroupNum) {
                groupNum++;
                showImageGroupWithSinglePop(groupNum);
            } else {
                timers.forEach(t => clearTimeout(t));
                timers = [];

                // 显示文字
                result.classList.remove('hide');
                result.innerHTML = "被爱的人会疯狂长出血肉<br/>感谢一年来有你们的陪伴";

                // 文字隐藏后显示留言板
                const textHideTimer = setTimeout(() => {
                    result.classList.add('hide');
                    messageModule.classList.remove('hide');
                }, textShowTime);
                timers.push(textHideTimer);
            }
        }, fadeOutTime);
        timers.push(fadeTimer);
    }, totalPopTime + stayTime);
    timers.push(timer);
}

// 留言提交
messageForm.onsubmit = function(e) {
    e.preventDefault();

    const nickName = messageName.value.trim();
    const content = messageContent.value.trim();

    if (!nickName || !content) {
        alert("昵称和留言内容不能为空！");
        return;
    }

    const messageObj = {
        id: Date.now(),
        nickName: nickName,
        content: content,
        time: getCurrentTime()
    };

    saveMessageToLocal(messageObj);
    messageForm.reset();
    renderMessageList();
    alert("留言提交成功！");
};

// 保存留言到本地
function saveMessageToLocal(messageObj) {
    let messageArr = JSON.parse(localStorage.getItem("my19thMessages")) || [];
    messageArr.unshift(messageObj);
    localStorage.setItem("my19thMessages", JSON.stringify(messageArr));
}

// 渲染留言列表
function renderMessageList() {
    let messageArr = JSON.parse(localStorage.getItem("my19thMessages")) || [];
    messageList.innerHTML = "";

    messageArr.forEach(item => {
        const singleMessage = document.createElement("div");
        singleMessage.className = "single-message";
        singleMessage.innerHTML = `
            <p class="message-nickname">${item.nickName}</p>
            <p class="message-text">${item.content}</p>
            <p class="message-time">${item.time}</p>
        `;
        messageList.appendChild(singleMessage);
    });
}

// 获取当前时间
function getCurrentTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const hour = now.getHours().toString().padStart(2, "0");
    const minute = now.getMinutes().toString().padStart(2, "0");
    const second = now.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}