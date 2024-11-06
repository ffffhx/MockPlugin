// 用来操作数据库的函数
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
        // 实例化这个对象的时候打开数据库，并且用.then确保数据仓库打开成功
        this.openDB().then(() => {
            console.log('数据库已准备好使用');
        }).catch(error => {
            console.error('打开数据库失败:', error);
        });
    }


    // 打开数据库
    openDB() {
        return new Promise((resolve, reject) => {
            // 打开数据库，如果没有那就创建
            const request = indexedDB.open(this.dbName, this.version);
            // 数据库打开成功的回调函数
            request.onsuccess = (event) => {
                this.db = event.target.result; //db就是数据库对象
                console.log('数据仓库打开成功');

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

                resolve(this.db);
            };
            // 数据库打开失败的回调函数
            request.onerror = function (event) {
                console.log('数据库打开失败');
                reject(event.target.error);
            };
            // 数据库版本更新的回调函数   (版本号有更新才会触发这个更新时候的回调函数)   当数据库不存在（首次创建数据库的时候）也会触发
            request.onupgradeneeded = (event) => {
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
                console.log('数据获取成功', event.target.result);
                mockInfo = event.target.result
                resolve(mockInfo); // 返回获取的数据
            };

            request.onerror = (event) => {
                console.error('数据获取失败');
                reject(event);
            };
        });
    }


    // 更新数据
    updateData() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], 'readwrite')
                .objectStore(this.storeName)
                .put(this.data);//没有就增加，有则更新
            request.onsuccess = (event) => {
                console.log('更新数据成功');
                resolve();
            };
            request.onerror = (event) => {
                console.log('更新数据失败');
                reject(event.target.error);
            };
        })

    }

    // 修改次数
    changeTimes(elementToEdit) {
        let data = {
            urlId: elementToEdit.urlId,
            ifOpen: elementToEdit.ifOpen,
            mockName: elementToEdit.mockName,
            mockUrl: elementToEdit.mockUrl,
            mockTimes: elementToEdit.mockTimes,
            responseData: elementToEdit.responseData,
        }
        updateData(db, 'mockDataStore', data);//更新数据
    }



}


// 实例化这个类的时候会自动的打开数据库
const mockDB = new MockDBManager('mockDataBase', 'mockDataStore', 1);

