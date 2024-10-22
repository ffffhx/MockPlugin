// 这里的面的log在popup的弹出界面上点击右键点击检查里面的控制台


console.log('执行了popup脚本');

const mockTimes = document.querySelector('.mockTimes')
const mockDataContent = document.querySelector('.mockDataContent')
const confirmMock = document.querySelector('.confirmMock')
const backDiv = document.querySelector('.backDiv')
const openPopupBtn = document.querySelector('.openPopup')
const cancelPopupBtn = document.querySelector('.cancelPopupBtn')
const mockApi = document.querySelector('.mockApi')
const backMockInfo = document.querySelector('.backMockInfo')
const savePopupBtn = document.querySelector('.savePopupBtn')
// Function to open the popup


// 打开该弹窗
function openPopup() {
    document.querySelector('.popup').style.display = 'block';
    console.log('执行了openUp');
}
openPopupBtn.addEventListener('click', openPopup);



// 关闭弹窗
function cancelPopup() {
    document.querySelector('.popup').style.display = 'none';
}
cancelPopupBtn.addEventListener('click', cancelPopup);



// // 保存数据
// function savePopup() {
//     console.log('执行了savePopup');
//     const oneMockport = document.createElement('ul');
//     oneMockport.className = 'oneMockport';
//     for (let i = 0; i < 5; i++) {
//         const li = document.createElement('li');
//         li.className = `li${i}`;
//         oneMockport.appendChild(li);
//         console.log(li.className, 'li.className');

//     }
//     backMockInfo.appendChild(oneMockport);

//     const li0 = document.querySelector('.li0');
//     li0.innerHTML = '删除';
//     const li1 = document.querySelector('.li1');
//     li1.innerHTML = '是否开启';
//     const li2 = document.querySelector('.li2');
//     li2.innerHTML = '接口名称';
//     const li3 = document.querySelector('.li3');
//     li3.innerHTML = '接口地址';
//     const li4 = document.querySelector('.li4');
//     li4.innerHTML = '操作';
// }
// savePopupBtn.addEventListener('click', savePopup)


const mockArr = [];

// 保存数据
function savePopup() {
    let mockInfo = [];
    // ulArr.push(1)
    console.log('执行了savePopup');
    // backMockInfo.innerHTML = '';
    // 这个数组用来存放关于mock的信息以便渲染
    mockInfo.push('开始')
    mockInfo.push('test2')
    mockInfo.push(mockApi.value)
    mockInfo.push('结束')
    mockInfo.push('')
    // ulArr.map(item => `<ul></ul>`)
    const oneMockport = document.createElement('ul');
    oneMockport.className = 'backTitle';

    const lis = mockInfo.map((item, index) => {
        return `<li>${item}</li>`
    })
    mockArr.push(mockInfo);

    oneMockport.innerHTML = lis.join('');
    backMockInfo.appendChild(oneMockport);
    console.log(mockArr);
    
}
savePopupBtn.addEventListener('click', savePopup);

// const mockInfo = [];
// // 保存数据
// function savePopup() {
//     console.log('执行了savePopup');
//     // 这个数组用来存放关于mock的信息以便渲染
//     mockInfo.push('开始')
//     mockInfo.push('test2')
//     mockInfo.push(mockApi.value)
//     mockInfo.push('结束')
//     mockInfo.push('')
//     console.log(mockInfo, 'mockInfo');

//     // 清空之前的内容，避免重复添加
//     // backMockInfo.innerHTML = '';  

//     const oneMockport = document.createElement('ul');
//     oneMockport.className = 'backTitle';

//     for (let i = 0; i < mockInfo.length; i++) {
//         const li = document.createElement('li');
//         li.className = 'li';
//         oneMockport.appendChild(li);
//     }

//     backMockInfo.appendChild(oneMockport);

//     const lis = document.querySelectorAll('.li');

//     for (let i = 0; i < lis.length; i++) {
//         // 检查 mockInfo[i] 是否存在或为空字符串
//         lis[i].innerHTML = mockInfo[i] !== undefined && mockInfo[i] !== '' ? mockInfo[i] : '空数据';
//         console.log(mockInfo[i], 'mockInfo[i]');
//     }
//     // mockInfo.splice(0, 5);
// }
// savePopupBtn.addEventListener('click', savePopup);



//点击确认后执行的事件：  popup与serviceworker通信  把需要拦截的次数、对应的api告诉serviceworker
confirmMock?.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: 'fromPopup',
        message: mockTimes.value,
        mockApi: mockApi.value
    })
    console.log(mockDataContent.value, 'mockDataContent.value');
})


// 接收到来自 Service Worker 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fromServiceWorker") {
        // 处理消息
        console.log(message.message, 'message.message');
        if (message.message) {
            backDiv.innerHTML = mockDataContent.value
        }
    }
    sendResponse({ status: "Popup received the message" });
});


// // popup页面获取cookie
// const cookies = await chrome.cookies.getAll({ domain: '.lkcoffee.com' });
// console.log(cookies, 'popup cookies');
// const urlCookies = chrome.cookies.getAll({ url: 'https://leaptest03.lkcoffee.com/' });
// console.log(urlCookies, 'popup urlCookies');



// //获取tab数据
// async function findDoubanTab() {
//     console.log('执行了findDoubanTab函数');
//     const [tab] = await chrome.tabs.query({
//         url: ['https://movie.douban.com/*'],
//         active: true,
//         currentWindow: true
//     });
//     if (tab) {
//         //Popup向content发送消息 使用tabs.sendMessage
//         chrome.tabs.sendMessage(tab.id, {
//             action: 'fromPopup2Content'
//         })

//         //popup向content发送消息 使用tabs.connect
//         const connect = chrome.tabs.connect(tab.id, {
//             name: 'fromPopup2Content'
//         })
//         console.log(connect, 'connect');
//         connect.postMessage('这里是弹出框页面')
//         connect.onMessage.addListener((message) => {
//             console.log(message, 'message');
//         })
//     } else {
//         // 如果不是对应的网页
//         console.log("No matching tab found.");
//     }
// }
