console.log('执行了popup脚本');

// 这是获取到的各种html元素
const mockTimesInput = document.querySelector('.mockTimes')
const mockResponseInput = document.querySelector('.mockResponse')
const confirmMock = document.querySelector('.confirmMock')
const ifOpenInput = document.querySelector('.ifOpen')
const openPopupBtn = document.querySelector('.openPopup')
const cancelPopupBtn = document.querySelector('.cancelPopupBtn')
const mockUrlInput = document.querySelector('.mockUrl')
const backMockInfo = document.querySelector('.backMockInfo')
const savePopupBtn = document.querySelector('.savePopupBtn')
const mockNameInput = document.querySelector('.mockName')
const changeMockName = document.querySelector('.changeMockName')
const changeMockUrl = document.querySelector('.changeMockUrl')
const changeMockTimes = document.querySelector('.changeMockTimes')
const changeMockResponse = document.querySelector('.changeMockResponse')
const deleteLiUpBtn = document.querySelector('.deleteLiUpBtn')
const liUp = document.querySelector('.liUp')
const closeLiUpBtn = document.querySelector('.closeLiUpBtn')
const changeMockStateBtn = document.querySelector('.changeMockStateBtn')
const liUpMockContentChange = document.querySelector('.liUpMockContentChange')
const addTimesBtn = document.querySelector('.addTimesBtn')
let db; //声明一个数据库对象
let mockInfo = []; //这个用来存储数据库中的数据
let allValid = true;

let elementToEdit = {};



// 给表单添加上提交事件，如果点击form表单里面的提交按钮，就会执行这个函数


function validateIfNull() {

}



// 表单校验的函数
function validatePopupForm() {
    console.log('执行了validatePopupForm');
    // 获取所有需要验证的元素
    const inputs = document.querySelectorAll('.ifOpen, .mockName, .mockUrl, .mockTimes, .mockResponse');
    // 验证是否为空
    inputs.forEach(input => {
        // trim() 只会删除字符串两端的空白字符，不会影响中间的内容。  先判断是否都输入了
        if (!input.value.trim()) {
            allValid = false;
            input.style.border = '1px solid red'; // 高亮未填充的输入框
            return
        } else {
            input.style.border = ''; // 清除高亮
        }
    });
    // 细节的验证  比如必须是true或者false之类的
    validateDetails()
}

function validateDetails() {
    const parsedValue = Number(mockTimesInput.value);
    if (!(ifOpenInput.value === 'true' || ifOpenInput.value === 'false')) {
        alert('必须填写true或者false');
        allValid = false
        ifOpenInput.style.border = '1px solid red'; // 高亮未填充的输入框
        return
    }
    if (isNaN(parsedValue)) {
        alert('必须填写数字')
        allValid = false
        mockTimesInput.style.border = '1px solid red'; // 高亮未填充的输入框
        return
    }
    allValid = true
}



// 用于创建或者打开数据库的函数 第一个参数是数据库名称  第二个参数是表名称 第三个参数是版本号
function openDB(dbName, storeName, version = 1) {
    return new Promise((resolve, reject) => {
        let db
        // 打开数据库，如果没有那就创建
        const request = indexedDB.open(dbName, version);
        // 数据库打开成功的回调函数
        request.onsuccess = function (event) {
            db = event.target.result; //db就是数据库对象
            console.log('数据仓库打开成功');
            resolve(db);
        };
        // 数据库打开失败的回调函数
        request.onerror = function (event) {
            console.log('数据库打开失败');

        };
        // 数据库版本更新的回调函数   (版本号有更新才会触发这个更新时候的回调函数)   当数据库不存在（首次创建数据库的时候）也会触发
        request.onupgradeneeded = function (event) {
            console.log('数据仓库版本更新');
            db = event.target.result;//数据库对象
            // 创建存储库  第一个才参数代表需要创建的存储库的名称
            // 第二个参数是配置对象，keyPath: 'url' 表示这个存储中的每个记录都有一个主键： url
            const objectStore = db.createObjectStore(storeName, { keyPath: 'urlId', autoIncrement: true });
            console.log('数据仓库版本更新成功');
            // 创建索引   如果不创建索引，只能通过主键  创建了三个索引，同时也意味着插入数据的时候这三个索引不得为空，必须有数据
            // objectStore.createIndex('urlId', 'urlId', { unique: true , autoIncrement: true}); //不可重复  主键是不可重复的  自增
            objectStore.createIndex('ifOpen', 'ifOpen', { unique: false }); //可以重复 是否开启这个接口
            objectStore.createIndex('mockName', 'mockName', { unique: false }); //这个接口的名称是什么
            objectStore.createIndex('mockUrl', 'mockUrl', { unique: false }); //这个接口的url是什么
            objectStore.createIndex('mockTimes', 'mockTimes', { unique: false }); //mock几次
            objectStore.createIndex('responseData', 'responseData', { unique: false }); //想要的响应值是什么
        };
    })
}

// 插入数据  第一个参数是db实例   第二个参数是表名  第三个参数是要插入的数据（必须要存在索引的几个键值对）
function insertData(db, storeName, data) {
    //  request是事务对象
    const request = db.transaction([storeName], 'readwrite')  //   指定表格名称和操作格式 第一个参数是表名  第二个参数是操作模式
        .objectStore(storeName) //仓库对象  （表对象）
        .add(data);

    // 成功回调函数  数据插入成功的时候会调用
    request.onsuccess = function (event) {
        console.log('数据插入成功');
    };

    // 失败回调函数
    request.onerror = function (event) {
        console.log('数据插入失败', event.target.error.name, event.target.error.message);
    };
}

// 通过主键读取数据  db是数据库对象，storeName是仓库名（表名）， key是主键
function getDataByKey(db, storeName, key) {
    const request = db.transaction([storeName], 'readonly') //声明事务
        .objectStore(storeName)  //仓库对象
        .get(key);  //通过主键获取数据
    request.onsuccess = function (event) {
        console.log('主键查询结果', request.result);

    }
    request.onerror = function (event) {
        console.log('事务失败');

    }
}



// 获取所有数据的函数
function fetchData(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('mockDataStore', 'readonly');
        const objectStore = transaction.objectStore('mockDataStore');
        const request = objectStore.getAll();

        request.onsuccess = function () {
            const result = request.result; // 得到的所有数据
            console.log(result, 'result');

            const mockInfo = [];
            result.forEach(item => {
                mockInfo.push(item);
                // console.log('mockInfo', mockInfo);
            });

            resolve(mockInfo); // 返回获取的数据
        };

        request.onerror = function (event) {
            reject('Failed to fetch data: ' + event.target.errorCode);
        };
    });
}

// 预加载数据   把数据从IndexedDB中拿到mockInfo
function preloadDataFromIndexedDB() {
    // 使用 openDB 函数
    return openDB('mockDataBase', 'mockDataStore', 1)
        .then(db => {
            console.log('打开成功');
            return fetchData(db); // 获取数据
        })
        .then(res => {
            // 在这里可以处理获取到的 mockInfo
            mockInfo = res;
            console.log('最终获取的 mockInfo:', mockInfo);
            createUlNdLi()
        })
        .catch(error => {
            console.error(error);
        });
};
// 在插件启动时执行预加载
preloadDataFromIndexedDB();





// 通过主键删除数据  传入数据库实例 仓库名称 主键名称
function deleteDB(db, storeName, key) {
    const request = db.transaction([storeName], 'readwrite')
        .objectStore(storeName)
        .delete(key);
    request.onsuccess = function (event) {
        console.log('数据删除成功');
    };
    request.onerror = function (event) {
        console.log('数据删除失败');
    };
}



// 打开输入mock接口的弹窗
function openPopup() {
    document.querySelector('.popup').style.display = 'block';
    console.log('执行了openUp');
}
openPopupBtn.addEventListener('click', openPopup);

// 关闭输入mock接口的弹窗
function cancelPopup() {
    document.querySelector('.popup').style.display = 'none';
}
cancelPopupBtn.addEventListener('click', cancelPopup);

function handleAddTimesClick() {
    console.log('1111111');
    addTimes(elementToEdit);
    // 删除之后重新加载数组里面的东西
    preloadDataFromIndexedDB().then(() => { });
}


// 给删除按钮添加点击事件  点击之后将该元素删除
deleteLiUpBtn.addEventListener('click', handleDeleteClick)

// 给修改按钮添加点击事件  如果打开，点击之后就关闭，如果关闭，点击之后就打开
changeMockStateBtn.addEventListener('click', handleChangeStateClick)

// 给关闭按钮添加点击事件
closeLiUpBtn.addEventListener('click', handleCloseClick);

// 给增加次数按钮绑定事件
addTimesBtn.addEventListener('click', handleAddTimesClick)


function handleCloseClick() {
    console.log('1');
    hiddenLiUp()
    console.log(elementToEdit, 'elementHanlde');

}

// 删除一条数据的函数
function handleDeleteClick() {
    console.log('1111111');

    // 删除数据
    deLete(elementToEdit.urlId);
    // 删除之后重新加载数组里面的东西
    preloadDataFromIndexedDB().then(() => {
        // 关闭弹窗
        hiddenLiUp()
    }
    )
}


//  修改开启状态的函数
function handleChangeStateClick() {
    console.log('执行了关闭的函数');

    console.log(elementToEdit, 'elementelementelementelementelementelement');
    // 实际上是新增加了一个mock数据
    upDate(elementToEdit)
    // // deLete(element.urlId);将原先的mock数据删除掉
    preloadDataFromIndexedDB().then(() => {
        // 关闭弹窗
        hiddenLiUp()
    })
}


// 创建ul标签和li标签的函数
function createUlNdLi() {

    // map循环创建li元素
    backMockInfo.innerHTML = '';
    for (let index = 0; index < mockInfo.length; index++) {
        // 每一个element对象都是一个mock的详细数据
        const element = mockInfo[index];
        const keys = Object.keys(element).sort();
        // 创建li元素
        const lis = Object.values(element).map((item, index) => {
            if (index === 4) {
                return `<li class="operateLi">详细</li>`
            } else {
                return `<li>${element[keys[index]]}</li>`;
            }
        });
        // 创建ul元素并且添加名称
        const oneMockportUl = document.createElement('ul');
        oneMockportUl.className = 'backTitle';
        // 将li元素添加到ul
        oneMockportUl.innerHTML = lis.join('');
        // 将ul添加到backMockInfo
        backMockInfo.appendChild(oneMockportUl);



        // 将相应内容添加到页面上
        function addResponseInnerHTML() {
            liUpMockContentChange.innerHTML = '';
            liUpMockContentChange.innerHTML = element.responseData
        }
        addResponseInnerHTML()

        // 给详细按钮添加点击事件  点击之后给弹出的详情页的三个按钮也会添加点击事件
        oneMockportUl.querySelector('.operateLi').addEventListener('click', () => {
            elementToEdit = element;
            // 打开弹窗
            openLiUp();
        })
        // oneMockportUl.querySelector('.operateLi').removeEventListener('click', () => {
        //     // 打开弹窗
        //     openLiUp();
        //     // 给删除按钮添加点击事件  点击之后将该元素删除
        //     deleteLiUpBtn.removeEventListener('click', handleDeleteClick);
        //     deleteLiUpBtn.addEventListener('click', handleDeleteClick)

        //     // 给修改按钮添加点击事件  如果打开，点击之后就关闭，如果关闭，点击之后就打开
        //     changeMockStateBtn.removeEventListener('click', handleChangeStateClick);
        //     changeMockStateBtn.addEventListener('click', handleChangeStateClick)

        //     // 给关闭按钮添加点击事件
        //     closeLiUpBtn.removeEventListener('click', handleCloseClick);
        //     closeLiUpBtn.addEventListener('click', handleCloseClick)
        // })
    }
}
// 实际就是修改信息
async function upDate(elementToEdit) {
    let data = {
        urlId: elementToEdit.urlId,
        ifOpen: !elementToEdit.ifOpen,
        mockName: elementToEdit.mockName,
        mockUrl: elementToEdit.mockUrl,
        mockTimes: elementToEdit.mockTimes,
        responseData: elementToEdit.responseData,
    }
    await openDB('mockDataBase', 'mockDataStore', 1).then((db) => {
        db = db // 将数据库对象赋值给db
        updateData(db, 'mockDataStore', data);//插入数据
    });
}


async function addTimes(elementToEdit) {
    console.log(elementToEdit.mockTimes, 'elementToEdit');

    elementToEdit.mockTimes++

    let data = {
        urlId: elementToEdit.urlId,
        ifOpen: elementToEdit.ifOpen,
        mockName: elementToEdit.mockName,
        mockUrl: elementToEdit.mockUrl,
        mockTimes: elementToEdit.mockTimes,
        responseData: elementToEdit.responseData,
    }
    await openDB('mockDataBase', 'mockDataStore', 1).then((db) => {
        db = db // 将数据库对象赋值给db
        updateData(db, 'mockDataStore', data);//插入数据
    });
}


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



// 将LiUp隐藏的函数
function hiddenLiUp() {
    liUp.style.display = 'none';
}
function openLiUp() {
    liUp.style.display = 'block';
}


// 将数据插入数据库的函数
async function inSert() {
    let data = {
        // urlId: 12,
        ifOpen: ifOpenInput.value,
        mockName: mockNameInput.value,
        mockUrl: mockUrlInput.value,
        mockTimes: mockTimesInput.value,
        responseData: mockResponseInput.value
    }
    await openDB('mockDataBase', 'mockDataStore', 1).then((db) => {
        db = db // 将数据库对象赋值给db
        insertData(db, 'mockDataStore', data);//插入数据
    });
}
// 删除数据的函数  传入urlId
function deLete(id) {
    openDB('mockDataBase', 'mockDataStore', 1).then((db) => {
        db = db // 将数据库对象赋值给db
        deleteDB(db, 'mockDataStore', id);
        // console.log(element.urlId, 'element.urlId');
        console.log('执行了删除操作');
    })
}
// 点击保存之后  执行的函数
function savePopup() {
    // 先进行表单校验
    validatePopupForm();
    // 如果没有通过表单校验
    if (!allValid) {
        console.log('没有通过表单校验，进入了if');
        console.log('所有字段必须都被填写', allValid);
        alert('请规范填写所有字段');
        return
    } else {
        console.log('通过了表单校验，进入了else');

        // 插入数据
        inSert()
        // 更新数据
        preloadDataFromIndexedDB();
        // 创建更新li标签
        createUlNdLi()
        // 关闭弹窗
        cancelPopup()
    }
}
savePopupBtn.addEventListener('click', savePopup);

//点击确认后执行的事件：  popup与serviceworker通信  把需要拦截的次数、对应的api告诉serviceworker
confirmMock.addEventListener('click', () => {
    chrome.runtime.sendMessage({
        action: "fromPopup",
        modifyResponseEnabled: true
    });
});



// 接收到来自 Service Worker 的消息
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "fromServiceWorker") {
//         // 处理消息
//         console.log(message.message, 'message.message');
//         if (message.message) {
//             backDiv.innerHTML = mockResponseInput.value
//         }
//     }
//     sendResponse({ status: "Popup received the message" });
// });


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
