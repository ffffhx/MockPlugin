// Manifest V2 版本
// 在插件的背景页可以看得到控制台
// Manifest V2 不支持 ES6 模块（如 import 和 export 语法）。



console.log('进入了service worker');

// 判断是否要开启拦截
let modifyResponseEnabled = false;

// cachedMockData用于存放mock数据
let mockInfo = []

// 声明一个全局的数据库对象
// let db


class MockDBManager {
    constructor(dbName, storeName, version = 1) {
        this.dbName = dbName
        this.storeName = storeName
        this.version = version
        this.db = null  //用来存储数据库实例
        this.openDB().
            then(db => {
                console.log('数据库打开成功', db);
            }).catch(error => {
                console.log('数据库打开失败', error);
            })
    }


    // 打开数据库
    openDB() {
        return new Promise((resolve, reject) => {
            // 打开数据库，如果没有那就创建
            const request = indexedDB.open(this.dbName, this.version);
            // 数据库打开成功的回调函数
            request.onsuccess = function (event) {
                this.db = event.target.result; //db就是数据库对象
                console.log('数据仓库打开成功');
                resolve(this.db);
            };
            // 数据库打开失败的回调函数
            request.onerror = function (event) {
                console.log('数据库打开失败');
                reject(event.target.error);
            };
            // 数据库版本更新的回调函数   (版本号有更新才会触发这个更新时候的回调函数)   当数据库不存在（首次创建数据库的时候）也会触发
            request.onupgradeneeded = function (event) {
                console.log('数据仓库版本更新');
                this.db = event.target.result;//数据库对象
                // 创建存储库  第一个才参数代表需要创建的存储库的名称
                // 第二个参数是配置对象，keyPath: 'url' 表示这个存储中的每个记录都有一个主键： url
                this._createObjectStore();
            };
        })
    }

    // 创建存储库（创建表）
    _createObjectStore() {
        const objectStore = this.db.createObjectStore(this.storeName, { keyPath: 'urlId', autoIncrement: true });
        console.log('数据仓库版本更新成功');
        // 创建索引
        objectStore.createIndex('ifOpen', 'ifOpen', { unique: false }); //可以重复 是否开启这个接口
        objectStore.createIndex('mockName', 'mockName', { unique: false }); //这个接口的名称是什么
        objectStore.createIndex('mockUrl', 'mockUrl', { unique: false }); //这个接口的url是什么
        objectStore.createIndex('mockTimes', 'mockTimes', { unique: false }); //mock几次
        objectStore.createIndex('responseData', 'responseData', { unique: false }); //想要的响应值是什么
    }



    preloadDataFromIndexedDB() {
        return new Promise((resolve, reject) => {
            this.fetchAllData()
                .then(data => resolve(data))
                .catch(error => {
                    console.error('数据库打开失败:', error);
                    reject(error);
                });
        });
    }

    // 获取所有数据
    fetchAllData() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject('数据库尚未打开');
                return;
            }
            const transaction = this.db.transaction(this.storeName, 'readonly');
            const objectStore = transaction.objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onsuccess = (event) => {
                console.log('数据获取成功');
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('数据获取失败');
                reject(event);
            };
        });
    }
}


// 实例化这个类的时候会自动的打开数据库
const mockDB = new MockDBManager('mockDataBase', 'mockDataStore', 1);









// 注册一个监听器用于接受popup和content的消息
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    // 接受来自popup的消息
    if (message.action === 'fromPopup') {
        // 收到消息之后开始执行mock功能
        modifyResponseEnabled = message.modifyResponseEnabled;
        console.log('接收到了消息，准备开始mock功能', modifyResponseEnabled);
        // alert('接收到了消息，准备开始mock功能')
    }

})


// // 更新数据
// function updateData(db, storeName, data) {
//     return new Promise((resolve, reject) => {
//         const request = db.transaction([storeName], 'readwrite')
//             .objectStore(storeName)
//             .put(data);//没有就增加，有则更新
//         request.onsuccess = function (event) {
//             console.log('更新数据成功');
//             resolve();
//         };
//         request.onerror = function (event) {
//             console.log('更新数据失败');
//             reject(event.target.error);
//         };
//     })

// }

// // 修改次数
// function changeTimes(elementToEdit) {
//     let data = {
//         urlId: elementToEdit.urlId,
//         ifOpen: elementToEdit.ifOpen,
//         mockName: elementToEdit.mockName,
//         mockUrl: elementToEdit.mockUrl,
//         mockTimes: elementToEdit.mockTimes,
//         responseData: elementToEdit.responseData,
//     }
//     updateData(db, 'mockDataStore', data);//更新数据
// }







// // 用于创建或者打开数据库的函数 第一个参数是数据库名称  第二个参数是表名称 第三个参数是版本号
// function openDB(dbName, storeName, version = 1) {
//     return new Promise((resolve, reject) => {
//         // 打开数据库，如果没有那就创建
//         const request = indexedDB.open(dbName, version);
//         // 数据库打开成功的回调函数
//         request.onsuccess = function (event) {
//             db = event.target.result; //db就是数据库对象
//             console.log('数据仓库打开成功');
//             resolve(db);
//         };
//         // 数据库打开失败的回调函数
//         request.onerror = function (event) {
//             console.log('数据库打开失败');
//         };
//         // 数据库版本更新的回调函数   (版本号有更新才会触发这个更新时候的回调函数)   当数据库不存在（首次创建数据库的时候）也会触发
//         request.onupgradeneeded = function (event) {
//             console.log('数据仓库版本更新');
//             db = event.target.result;//数据库对象
//             // 创建存储库  第一个才参数代表需要创建的存储库的名称
//             // 第二个参数是配置对象，keyPath: 'url' 表示这个存储中的每个记录都有一个主键： url
//             const objectStore = db.createObjectStore(storeName, { keyPath: 'urlId', autoIncrement: true });
//             console.log('数据仓库版本更新成功');
//             // 创建索引   如果不创建索引，只能通过主键  创建了三个索引，同时也意味着插入数据的时候这三个索引不得为空，必须有数据
//             // objectStore.createIndex('urlId', 'urlId', { unique: true , autoIncrement: true}); //不可重复  主键是不可重复的  自增
//             objectStore.createIndex('ifOpen', 'ifOpen', { unique: false }); //可以重复 是否开启这个接口
//             objectStore.createIndex('mockName', 'mockName', { unique: false }); //这个接口的名称是什么
//             objectStore.createIndex('mockUrl', 'mockUrl', { unique: false }); //这个接口的url是什么
//             objectStore.createIndex('mockTimes', 'mockTimes', { unique: false }); //mock几次
//             objectStore.createIndex('responseData', 'responseData', { unique: false }); //想要的响应值是什么
//         };
//     })
// }


// // 预加载数据：这个函数的功能就是打开数据库，并且把数据拿出来
// const preloadDataFromIndexedDB = () => {
//     // 使用 openDB 函数
//     return openDB('mockDataBase', 'mockDataStore', 1)
//         .then(db => {
//             console.log('打开成功');
//             return fetchAllData(db, 'mockDataStore'); // 获取数据
//         })
//         .catch(error => {
//             console.error(error);
//         });
// };




// // 获取所有数据的函数
// function fetchAllData(db, storeName) {
//     return new Promise((resolve, reject) => {
//         const request = db.transaction([storeName], 'readwrite')
//             .objectStore(storeName)
//             .getAll();
//         request.onsuccess = function () {
//             const result = request.result; // 得到的所有数据
//             console.log(result, 'result');
//             mockInfo = result
//             resolve(mockInfo); // 返回获取的数据
//         };
//         request.onerror = function (event) {
//             reject('Failed to fetch data: ' + event.target.errorCode);
//         };
//     });
// }











// 在插件启动时执行预加载
chrome.runtime.onStartup.addListener(() => {
    mockDB.preloadDataFromIndexedDB();
    console.log('刷新了页面');

});
// 在插件安装完成后执行预加载
chrome.runtime.onInstalled.addListener(() => {
    mockDB.preloadDataFromIndexedDB();
    console.log('刷新了页面');

});
// 在插件每次刷新页面的时候执行预加载
chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete') {
            mockDB.preloadDataFromIndexedDB();
            console.log('刷新了页面');

        }
    }
);



// 拦截请求并返回 mock 数据
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        console.log('检测到了请求');

        // fetchAllData(db, 'mockDataStore');
        // 如果进行了拦截
        // if (modifyResponseEnabled) {
        const url = details.url;
        // 这些数据用的都是预缓存的数据，即cachedMockData
        console.log('预缓存数据', mockInfo);

        for (let i = 0; i < mockInfo.length; i++) {
            console.log('预缓存数据', mockInfo);

            // 如果开启
            if (mockInfo[i].ifOpen) {
                console.log('已开请求拦截功能');
                if (mockInfo[i].mockUrl === url) {
                    console.log('url正确');
                    if (mockInfo[i].mockTimes > 0) {
                        console.log('次数足够');
                        mockInfo[i].mockTimes--
                        // changeTimes(mockInfo[i])
                        console.log('拦截成功,剩余次数:', mockInfo[i].mockTimes);
                        // alert('拦截成功，剩余拦截次数' + mockInfo[i].mockTimes);
                        // 然后要在数据库里面更新一下
                        return {
                            // data:application/json是 dataUrl的前缀，表示MIME类型
                            // encodeURIComponent(mockInfo[i].responseData)// 解释: 这里使用了 encodeURIComponent 来对数据进行 URL 编码，将数据中的特殊字符（例如空格、冒号、逗号等）转换为可以安全用于 URL 的格式。
                            redirectUrl: 'data:application/json,' + encodeURIComponent(mockInfo[i].responseData)
                        };
                    } else {
                        console.log('次数为0,请增加次数');
                        // alert('次数为0,请增加次数');
                        return
                    }
                }
            } else {
                console.log('未开启该条请求的拦截');
            }
        }
        return {};  // 如果没有匹配项，继续正常请求
        // }
        // else {
        //     console.log('还没有开启拦截功能');

        // }

    },
    { urls: ['<all_urls>'] },
    ['blocking']
);