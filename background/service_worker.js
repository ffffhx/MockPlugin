console.log('进入了service worker');

// 判断是否要开启拦截
let modifyResponseEnabled = false;


// 更新数据  和增加数据几乎一样，只是把add换成了put
function updateData(db, storeName, data) {
    const request = db.transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .put(data);//没有就增加，有则更新
    request.onsuccess = function (event) {
        console.log('数据更新成功');
    };
    request.onerror = function (event) {
        console.log('数据更新失败');
    };
}




// 注册一个监听器用于接受popup和content的消息
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    // 接受来自popup的消息
    if (message.action === 'fromPopup') {
        // 收到消息之后开始执行mock功能
        modifyResponseEnabled = message.modifyResponseEnabled;
        console.log('接收到了消息，准备开始mock功能',modifyResponseEnabled);
        
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

let cachedMockData = []
// 预加载数据   把数据从IndexedDB中拿到cachedMockData
const preloadDataFromIndexedDB = () => {
    const request = indexedDB.open('mockDataBase', 1);  //打开这个数据库
    request.onsuccess = function (event) {  //打开成功之后执行的回调函数
        const db = event.target.result;
        const request = db.transaction('mockDataStore', 'readonly')  //   指定表格名称和操作格式 第一个参数是表名  第二个参数是操作模式
        .objectStore('mockDataStore') //仓库对象  （表对象）
        .getAll();
        // getAll()方法成功之后的回调函数
        request.onsuccess = function () {
            const result = request.result;   //得到的所有数据
            console.log(result,'result');
            
            result.forEach(item => {
                cachedMockData.push(item)
                console.log('cachedMockData',cachedMockData);
                
            });
            
        };
    };
    request.onerror = function (event) {
        console.error('Failed to load data from IndexedDB:', event);
    };
};
// 在插件启动时执行预加载
preloadDataFromIndexedDB();

// 拦截请求并返回 mock 数据
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        // 如果进行了拦截
        if(modifyResponseEnabled){
            const url = details.url;
            // 从预加载的 cachedMockData 中查找数据
            // console.log('进入了请求拦截器',cachedMockData);
            
            // console.log(cachedMockData[url],'cachedMockData[url]');
            // console.log(cachedMockData.responseData,'cachedMockData.responseData');
            
            // if(modifyResponseEnabled){
    
            // }
            for(let i=0;i<cachedMockData.length;i++){
                // 如果开启
                if(cachedMockData[i].ifOpen){
                    if(cachedMockData[i].mockUrl === url){
                        console.log(cachedMockData[i].responseData,'cachedMockData[i].responseData');
                        // if(cachedMockData[i].mockTimes > 0){
                        //     cachedMockData[i].mockTimes--
                            // 然后要在数据库里面更新一下
                            return {
                                redirectUrl: 'data:application/json,' + encodeURIComponent(cachedMockData[i].responseData)
                            };
                        // }else{
                        //     return null
                        // }
                    }
                }else{
                    console.log('该条请求未开启拦截');
                    
                }

            }

            return {};  // 如果没有匹配项，继续正常请求
        }else{
            console.log('还没有开启拦截功能');
            
        }
        
    },
    { urls: ['<all_urls>'] },
    ['blocking']
);





// // 设置 webRequest 监听器
// chrome.webRequest.onCompleted.addListener(
//     async (details) => {
//         // if (!modifyResponseEnabled) return;
//         detailsTest = details
//         console.log(detailsTest, 'detailsTest');

//         console.log('执行了onCompleted的回调函数');
//         const url = details.url;
//         if (url === 'http://ajax-api.itheima.net/api/province') {
//             console.log('监听了重定向之前的请求');
//             // return {
//             //     redirectUrl: "https://example.com/new-api-endpoint"
//             // };
//             // // 发起请求以获取和修改响应数据
//             // const response = await fetch(url);
//             // console.log(response, 'response');

//             // // let data = await response.json();

//             // // 修改响应数据
//             // // data.subjects[0].title = '123123'

//             // // 将修改后的数据发送到 content script 进行注入
//             // chrome.tabs.sendMessage(1, { action: "modifyResponse", data });

//             // 重置状态，确保用户每次都需重新确认
//             // modifyResponseEnabled = false;
//         }
//         if (url === 'chrome-extension://inlaecfhijpdenaffblejkfoflmkjgbm/mocks/test.json') {
//             console.log('检测了重定向之后的请求');

//         }
//     },
//     { urls: ['<all_urls>'] }
// );











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


// chrome.webRequest.onCompleted.addListener(
//     function (request) {
//         console.log('12312312312');
//         const myDate = Date.now();
//         console.log(myDate, 'myDateJs');
        
//         // var url = request.url;
//         // var data = "This is the data you want to return";

//         // var request = new XMLHttpRequest();
//         // request.open("GET", url, true);
//         // request.onreadystatechange = function () {
//         //     // if (request.readyState == 4 && request.status == 200)
//         //     //     request.send();
//         // };
//         // request.send(data);

//         // function handleResponse(response) {
//         //     // 这里你可以修改请求的URL和返回的数据
//         //     request = new XMLHttpRequest();
//         //     request.open("GET", url, true);
//         //     request.onreadystatechange = function () {
//         //         if (request.readyState == 4 && request.status == 200)
//         //             request.send(data);
//         //     };
//         //     request.send();
//         // }

//         // chrome.webRequest.onCompleted.removeListener(handleResponse);
//     },
//     { urls: ['<all_urls>'] },
//     ["extraHeaders"]
// );
