//这里面的log在对应matches页面的检查视图就可以了
//这个content必须在特定的界面


console.log('执行了内容脚本');



// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    // if (message.action === "modifyResponse") {
    //     console.log('在content里面接收到了消息');
    //     const data = message.data;
    //     // 这里可以通过修改页面的 DOM 或者覆盖请求的数据
    //     console.log("修改后的数据:", data);
    //     document.body.innerHTML += `<div>Modified Data: ${JSON.stringify(data)}</div>`;
    // }
    if (message.action === "injectFakeData") {
        console.log("接收到假数据", message.data);
    }
    sendResponse({ status: "Message received" });
});



//创建一个选择框并且插入
//创建页面函数
// function createPage() {
//     //创建包含拖拽元素的页面容器
//     const page = document.createElement('div')
//     page.id = 'cj_move_page'
//     const h3 = document.createElement('h3')
//     h3.id = 'cj_move_h3'
//     const bt1 = document.createElement('button')
//     bt1.id = 'cj_move_bt1'
//     bt1.innerText = '消息通知'
//     page.appendChild(bt1)
//     h3.innerText = 'My Plugin'
//     page.appendChild(h3)
//     document.body.appendChild(page)
//     bt1.addEventListener('click', () => {
//         // content与serviceworker通信
//         chrome.runtime.sendMessage({
//             action: "fromContent",
//             message: "hello from content"
//         })
//         chrome.runtime.sendMessage({
//             action: "fromContentFetch"
//         })
//     })
//     console.log('执行了createPage函数');

//     chrome.runtime.onMessage.addListener((e) => {
//         console.log('e从popup传到content的代码', e)
//     })
//     chrome.runtime.onConnect.addListener(mess => {
//         console.log('contentjs中的res.onMessage.addListener', mess);
//         res.postMessage('contentjs中的res.onMessage.addListener')

//     })
// }
// createPage()




