//这里面的log在扩展程序页面的检查视图Service Worker
// 判断是否要开启拦截
let modifyResponseEnabled = false;

// let detailsTest


// 要mock的请求的地址
let mockUrl = 'test'


// 注册一个监听器用于接受popup和content的消息
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    // 接受来自popup的消息
    if (message.action === 'fromPopup') {
        // 创建一个通知
        // chrome.notifications.create({
        //     type: "basic",
        //     title: "fromPopup",
        //     message: message.message,
        //     iconUrl: "../icons/index.png"
        // });
        // 开启拦截
        modifyResponseEnabled = true;

        // 将popup传递过来的url记录下来
        mockUrl = message.mockUrl
        
    }
// // 接受来自content的消息
//     else if (message.action === 'fromContent') {
//         console.log('进入了fromContent');
//         chrome.notifications.create({
//             type: "basic",
//             title: "fromContent",
//             message: message.message,
//             iconUrl: "../icons/index.png"
//         })}
})

// 请求之前要做的事情  现在这种方式好像行不通
    // chrome.webRequest.onBeforeRequest.addListener(
    //     (details) => {
    //         // 如果开启了拦截
    //         if(modifyResponseEnabled){
    //             const url = details.url;
    //             // 检查是否为要拦截的特定 URL
    //             if (url == mockUrl) {
    //                 // 从service_worker向content.js里面发送消息
    //                 // setTimeout(()=>{
    //                 //     chrome.tabs.sendMessage(details.tabId, {
    //                 //     action: "injectFakeData",
    //                 //     data: {
    //                 //         tags: ["MockTag1", "MockTag2", "MockTag3"]
    //                 //     }
    //                 // }, (response) => {
    //                 //     console.log(response);
    //                 //     if (chrome.runtime.lastError) {
    //                 //         console.error("发送消息失败:", chrome.runtime.lastError);
    //                 //     } else {
    //                 //         console.log("收到 content script 的回复:", response);
    //                 //     }
    //                 // });
    //                 // },500)
    //                 // // 从service_worker向popup.js发送消息
    //                 // setTimeout(()=>{
    //                 //     chrome.runtime.sendMessage({ action: "fromServiceWorker", message:true });
    //                 // },500)
                    
    //                  // 将改请求屏蔽掉
    //                 return { cancel:  true};
    //             }
    //         // 如果不是目标请求，继续发送原请求
    //         return { cancel: false };
    //     // 如果没有开启拦截 
    //     }else{
    //             console.log('没有开启mock数据');
                
    //         }
    //     },
    //     // 过滤器，表示拦截所有 URL 请求
    //     { urls: ['<all_urls>'] },
    //     // 阻塞模式，确保拦截并有机会取消请求
    //     ['blocking']
    // );


// 打开或创建数据库  数据库名是MockDatabase  版本号是1


// const file = new File(["Hello, world!"], "hello world.txt", {type: "text/plain;charset=utf-8"});
// FileSaver.saveAs(file);
// console.log(file);

const request = indexedDB.open('MockDatabase', 1);
// IndexedDB 允许多个版本的数据库。如果版本号与现有数据库不同，则会触发 onupgradeneeded 事件，用于进行数据库的结构变更（如添加新的 objectStore)
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    // 创建一个名为mockData的对象仓库  可以理解为创建了一个表  keyPath: 'url' 表示这个存储中的每个记录都有一个唯一的键 url
    const store = db.createObjectStore('mockData', { keyPath: 'url' });
};


// 插入数据   onsuccess 事件：这个事件会在数据库成功打开或创建后触发。
request.onsuccess = function (event) {
    const db = event.target.result;
    // 开启一个事务，所有操作必须在事务内执行。  'readwrite' 表示这是一个读写事务，允许插入、修改或删除数据。
    const transaction = db.transaction('mockData', 'readwrite');
    // 指定要操作的对象仓库  即mockData
    const store = transaction.objectStore('mockData');

    // 定义一个mock对象
    const mockData = {
        // url是键  response是值
        url: mockUrl,
        response: "mocks/test.json",
    };
    
    store.put(mockData);  
    // 事务完成的时候触发，表示数据已经成功存储
    transaction.oncomplete = function () {
        console.log('Data has been stored!');
    };
};
// 查询数据
// request.onsuccess = function (event) {
//     const db = event.target.result;
//     // 开启一个只读事务
//     const transaction = db.transaction('mockData', 'readonly');
//     const store = transaction.objectStore('mockData');
//     // 通过url作为键来查询数据,   这里查询url为'/api/test'的数据
//     const query = store.get('/api/test');
//     // 事务完成的时候触发，表示数据已经成功查询
//     query.onsuccess = function () {
//         console.log('Data from IndexedDB:', query.result);
//     };
// };



// const mockData = {
//     "http://4947c105.r7.vip.cpolar.cn/api/getCameraIdAndNumberByRoad": {
//         "file": "mocks/test.js"
//     },
//     "http://4947c105.r7.vip.cpolar.cn/api/getRoadNames": {
//         "file": "mocks/test.js"
//     }
// }



// 全局变量存储mockData
let cachedMockData = {};

// 插件启动时从 IndexedDB 预加载数据   把数据从IndexedDB中拿到cachedMockData
const preloadDataFromIndexedDB = () => {
    const request = indexedDB.open('MockDatabase', 1);

    request.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction('mockData', 'readonly');
        const store = transaction.objectStore('mockData');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = function () {
            const result = getAllRequest.result;
            result.forEach(item => {
                cachedMockData[item.url] = item.response;
            });
            // console.log('Preloaded Data from IndexedDB:', cachedMockData);
        };
    };

    request.onerror = function (event) {
        console.error('Failed to load data from IndexedDB:', event);
    };
};

// 在插件启动时执行预加载
preloadDataFromIndexedDB();
// const test = { name: "John", age: 30 };
// const blob = new Blob([JSON.stringify(test)], { type: 'application/json' });

// const urlBlob = URL.createObjectURL(blob);
// console.log(urlBlob, 'urlBlob');


// 拦截请求并返回 mock 数据
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        const url = details.url;
        // 从预加载的 cachedMockData 中查找数据
        console.log('进入外层');
        // if(modifyResponseEnabled){

        // }
        if (cachedMockData[url]) {
            return {
                redirectUrl: chrome.runtime.getURL(cachedMockData[url])
            };
        }
        return {};  // 如果没有匹配项，继续正常请求
    },
    { urls: ['<all_urls>'] },
    ['blocking']
);
















// // 拦截请求并返回 mock 数据
// chrome.webRequest.onBeforeRequest.addListener(
//     (details) => {
//         const url = details.url;

//         // 从 IndexedDB 查询数据
//         const dbRequest = indexedDB.open('MockDatabase', 1);
//         dbRequest.onsuccess = function (event) {
//             const db = event.target.result;
//             const transaction = db.transaction('mockData', 'readonly');
//             const store = transaction.objectStore('mockData');
            
//             // 通过url作为键查询数据
//             const query = store.get(url);

//             query.onsuccess = function () {
//                 if (query.result) {
//                     // 如果数据库中有该URL对应的数据，返回 mock 响应
//                     const responseData = query.result.response;
//                     console.log('Data from IndexedDB:', responseData);
//                     return {
//                         redirectUrl: chrome.runtime.getURL(mockData2[url].file)
//                     };
//                 } else if (mockData2[url]) {
//                     // 如果 mockData2 里有该 URL，返回对应文件的重定向
//                     console.log(chrome.runtime.getURL(mockData2[url].file), '进入了if');
//                     return {
//                         redirectUrl: chrome.runtime.getURL(mockData2[url].file)
//                     };
//                 }
//             };
//         };
//     },
//     { urls: ['<all_urls>'] },
//     ['blocking']
// );





// //拦截请求并返回 mock 数据
// chrome.webRequest.onBeforeRequest.addListener(
//     (details)=>{
//         const url = details.url;
//         //如果mocks/mock-data.json文件里面包含了这个URL，返回 mock 响应
//         //如果mocks/mock-data.json文件里面没有这个URL，继续发送原请求
//         if(mockData2[url]){
//             console.log(chrome.runtime.getURL(mockData2[url].file),'进入了if');  // 打印出重定向的目标 URL
//             return {
//                 redirectUrl: chrome.runtime.getURL(mockData2[url].file)  //重定向到对应请求的文件
//             }
//         }},
//     { urls: ['<all_urls>'] },
//     ['blocking']//可以指定你要拦截的具体 API 请求["blocking"]
// )


















    // 设置 webRequest 监听器
// chrome.webRequest.onCompleted.addListener(
//     async (details) => {
//         // if (!modifyResponseEnabled) return;
//         detailsTest = details
//         console.log(detailsTest, 'detailsTest');

//         console.log('执行了onCompleted的回调函数');
//         const url = details.url;
//         if (url === 'http://b7aa869.r7.vip.cpolar.cn/api/robots?page=1&per_page=9999') {
//             console.log('执行了onCompleted的回调函数捕获到了指定的url');
//             return {
//                 redirectUrl: "https://example.com/new-api-endpoint"
//             };
//             // 发起请求以获取和修改响应数据
//             const response = await fetch(url);
//             console.log(response, 'response');

//             // let data = await response.json();

//             // 修改响应数据
//             // data.subjects[0].title = '123123'

//             // 将修改后的数据发送到 content script 进行注入
            // chrome.tabs.sendMessage(1, { action: "modifyResponse", data });

//             // 重置状态，确保用户每次都需重新确认
//             // modifyResponseEnabled = false;
//         }
//     },
//     { urls: ["*://movie.douban.com/*", "http://b7aa869.r7.vip.cpolar.cn/*"] }
// );



    // background.js
    // 使用declare  Api
    // // 定义规则
    // const initialRules = [
    //     {
    //         id: 2, //唯一标识符 用于chrome管理该规则
    //         priority: 1, // 优先级,在多个规则匹配的时候用于更高的优先级
    //         action: {
    //             type: "modifyHeaders",//指定规则操作类型为modifyHeaders，对请求的HTTP头进行修改
    //             requestHeaders: [  //定义要添加修改或者删除的请求头
    //                 {
    //                     header: "myheader",//指定要修改的请求头字段名称为myheader
    //                     operation: "set",//指定要修改的请求头字段的操作为set  其他可能的操作包括 append（追加）、remove（删除）等。
    //                     value: "myvalue"//指定要修改的请求头字段的值
    //                 }
    //             ]
    //         },
    //         condition: {
    //             urlFilter: "*://www.baidu.com/*",  //    *://前缀表示匹配所有协议（http和https）   movie.douban.com/*指定域名并且匹配所有路径
    //             resourceTypes: ["xmlhttprequest"]  //（通常是AJAX） 
    //         }
    //     }
    // ]    // 动态更新chrome扩展的网络请求拦截规则。首先获取当前的动态规则，然后移除旧的规则并添加新的规则
    // chrome.declarativeNetRequest.getDynamicRules((res) => {
    //     let rules = res.map(e => e.id)  //获取现有规则的id
    //     chrome.declarativeNetRequest.updateDynamicRules({
    //         addRules: initialRules, //添加新的规则
    //         removeRuleIds: rules //移除旧的规则
    //     })
    // })
