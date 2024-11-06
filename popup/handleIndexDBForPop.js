let mockInfo = []; //这个用来存储数据库中的数据

class mockDbManager {
    constructor(dbName, storeName, version = 1) {
        this.dbName = dbName
        this.storeName = storeName
        this.version = version
        this.db = null
        // openDB是异步的  preloadDataFromIndexedDB也是异步的
        this.openDB().then(() => {
            this.preloadDataFromIndexedDB()
            console.log('数据库已准备好使用', this.db);
        }).catch(error => {
            console.error('打开数据库失败:', error);
        });
    }


    // 打开数据库
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onsuccess = (event) => {
                this.db = event.target.result
                console.log('数据库仓库打开成功', this.db);
                resolve(this.db)
            }
            request.onerror = (event) => {
                console.log('数据库仓库打开失败');
                reject(event.target.error)
            }
            request.onupgradeneeded = (event) => {
                this.db = event.target.result
                this._createObjectStore()
            }
        })
    }

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

    addData(data) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], 'readwrite')
                .objectStore(this.storeName)
                .add(data);
            request.onsuccess = function () {
                console.log('数据插入成功');
                resolve();
            };
            request.onerror = function (event) {
                console.log('数据插入失败', event.target.error.name, event.target.error.message);
                reject(event.target.error);
            };
        })
    }

    fetchAllData() {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], 'readonly')
                .objectStore(this.storeName)
                .getAll();
            request.onsuccess = () => {
                console.log('数据获取成功', request.result);
                mockInfo = request.result
                resolve(request.result); // 返回获取的数据
            };
            request.onerror = (event) => {
                console.error('数据获取失败');
                reject(event);
            };
        })
    }

    deleteByKey(key) {
        return new Promise((resolve, reject) => {
            const request = this.db.transaction([this.storeName], 'readwrite')
                .objectStore(this.storeName)
                .delete(key);
            request.onsuccess = function (event) {
                console.log('数据删除成功', event.target);
                resolve();
            };
            request.onerror = function (event) {
                console.log('数据删除失败');
                reject(event.target.error);
            };
        })

    }




    updateData(data) {
        return new Promise((resolve, reject) => {
            console.log(this.db, 'this.db');

            const request = this.db.transaction([this.storeName], 'readwrite')
                .objectStore(this.storeName)
                .put(data);//没有就增加，有则更新
            request.onsuccess = (event) => {
                console.log('数据更新成功', event.target);
                this.preloadDataFromIndexedDB()
                resolve();
            };
            request.onerror = (event) => {
                console.log('数据更新失败');
                reject(event.target.error);
            };
        })

    }



    // 预加载数据的函数
    preloadDataFromIndexedDB() {
        return new Promise((resolve, reject) => {
            this.fetchAllData()
                .then(res => {
                    console.log(res, 'res');
                    console.log(createUlNdLi, 'createUlNdLi');

                    createUlNdLi()
                    resolve(res)
                })
                .catch(error => {
                    console.log(this.db, 'this.db');

                    console.error(error);
                });
        })
    };
}



function addInsert() {
    let data = {
        ifOpen: ifOpenInput.value,
        mockName: mockNameInput.value,
        mockUrl: mockUrlInput.value,
        mockTimes: mockTimesInput.value,
        responseData: mockResponseInput.value
    }
    mockDb.addData(data);//插入数据
}




const mockDb = new mockDbManager('mockDataBase', 'mockDataStore', 1)












// // 用于处理数据库的js文件，为popup.js服务
// let db; //声明一个全局的数据库对象
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
//         // 数据库版本更新的回调函数(版本号有更新才会触发这个更新时候的回调函数)。 当数据库不存在（首次创建数据库的时候）也会触发
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


// // 插入数据  第一个参数是db实例   第二个参数是表名  第三个参数是要插入的数据（必须要存在索引的几个键值对）
// function addData(db, storeName, data) {
//     return new Promise((resolve, reject) => {
//         const request = db.transaction([storeName], 'readwrite')
//             .objectStore(storeName)
//             .add(data);
//         request.onsuccess = function () {
//             console.log('数据插入成功');
//             resolve();
//         };
//         request.onerror = function (event) {
//             console.log('数据插入失败', event.target.error.name, event.target.error.message);
//             reject(event.target.error);
//         };
//     });
// }


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


// // 通过主键删除数据  传入数据库实例 仓库名称 主键名称
// function deleteByKey(db, storeName, key) {
//     const request = db.transaction([storeName], 'readwrite')
//         .objectStore(storeName)
//         .delete(key);
//     request.onsuccess = function (event) {
//         console.log('数据删除成功', event.target);
//     };
//     request.onerror = function (event) {
//         console.log('数据删除失败');
//     };
// }

// // 更新数据的函数
// function updateData(db, storeName, data) {
//     const request = db.transaction([storeName], 'readwrite')
//         .objectStore(storeName)
//         .put(data);//没有就增加，有则更新
//     request.onsuccess = function (event) {
//         console.log('数据更新成功', event.target);
//         preloadDataFromIndexedDB()
//     };
//     request.onerror = function (event) {
//         console.log('数据更新失败');
//     };
// }



// // 预加载数据的函数
// function preloadDataFromIndexedDB() {
//     // 使用 openDB 函数
//     return openDB('mockDataBase', 'mockDataStore', 1)
//         .then(db => {
//             console.log('打开成功');
//             return fetchAllData(db, 'mockDataStore'); // 获取数据
//         })
//         .then(res => {
//             console.log(res, 'res');
//             createUlNdLi()
//         })
//         .catch(error => {
//             console.error(error);
//         });
// };


// 以下这几个函数需要打开数据库之后再进行一些操作






// // 删除数据的函数
// mockDb.deleteByKey(db, 'mockDataStore', id);