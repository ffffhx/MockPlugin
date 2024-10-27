// 在popup页面右键检查可以看得到元素
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
const inputs = document.querySelectorAll('.ifOpen, .mockName, .mockUrl, .mockTimes, .mockResponse');


let mockInfo = []; //这个用来存储数据库中的数据

let allValid = true;//用来判断是否通过表单校验

let elementToEdit = {}; //用来存储要修改的数据


// 验证是输入框里面否为空的函数
function validateIfNull() {
    inputs.forEach(input => {
        if (!input.value.trim()) {
            allValid = false;
            input.style.border = '1px solid red'; // 高亮未填充的输入框
        } else {
            input.style.border = ''; // 清除高亮
        }
    });
}

// 细节的验证  比如必须是true或者false之类的
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

// 表单校验的函数
function validatePopupForm() {
    // 验证是输入框里面否为空的函数
    validateIfNull()
    // 细节的验证
    validateDetails()
}


// 在插件启动时执行预加载
preloadDataFromIndexedDB();



// 打开输入mock接口的弹窗的函数
function openPopup() {
    document.querySelector('.popup').style.display = 'block';
}



// 关闭输入mock接口的弹窗的函数
function cancelPopup() {
    document.querySelector('.popup').style.display = 'none';
}

// 将响应内容先清空然后添加到页面上
function addResponseInnerHTML(element) {
    liUpMockContentChange.innerHTML = '';
    liUpMockContentChange.innerHTML = element.responseData
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

        // 将响应内容先清空然后添加到页面上
        addResponseInnerHTML(element)

        // 给详细按钮添加点击事件  点击之后给弹出的详情页的三个按钮也会添加点击事件
        oneMockportUl.querySelector('.operateLi').addEventListener('click', () => {
            elementToEdit = element;
            // 打开弹窗
            openLiUp();
        })

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
    updateData(db, 'mockDataStore', data);//更新数据
}


// 增加点击次数的函数
async function addTimes(elementToEdit) {
    elementToEdit.mockTimes++
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





// 增加mock次数的函数
function handleAddTimesClick() {
    addTimes(elementToEdit);
}

//  修改开启状态的函数
function handleChangeStateClick() {
    // 实际上是新增加了一个mock数据
    upDate(elementToEdit)
    preloadDataFromIndexedDB().then(() => {
        // 关闭弹窗
        hiddenLiUp()
    })
}




// 点击删除某条数据并且重新加载
function handleDeleteClick() {
    // 删除数据
    deleteData(elementToEdit.urlId);
    // 删除之后重新加载数组里面的东西
    preloadDataFromIndexedDB().then(() => {
        // 关闭弹窗
        hiddenLiUp()
    }
    )
}

// 将LiUp隐藏的函数
function hiddenLiUp() {
    liUp.style.display = 'none';
}
// 打开LiUp的函数
function openLiUp() {
    liUp.style.display = 'block';
}

// 保存按钮需要执行的函数  包括表单校验，插入数据更新数据和关闭弹窗
function savePopup() {
    // 先进行表单校验
    validatePopupForm();
    // 如果没有通过表单校验
    if (!allValid) {
        alert('请规范填写所有字段');
        return
    } else {
        // 插入一条Mock数据
        addInsert()
        // 重新预加载数据
        preloadDataFromIndexedDB();
        // 创建更新li标签
        createUlNdLi()
        // 关闭弹窗
        cancelPopup()
    }
}

// 从popup中相service_worker中发送信息
function sendMessageToServiceWorker() {
    chrome.runtime.sendMessage({
        action: "fromPopup",
        modifyResponseEnabled: true
    });
}

// 给打开弹窗按钮(添加Mock)添加点击事件
openPopupBtn.addEventListener('click', openPopup);

// 给关闭弹窗按钮（关闭）添加点击事件
cancelPopupBtn.addEventListener('click', cancelPopup);

// 给删除按钮添加点击事件  点击之后将该元素删除
deleteLiUpBtn.addEventListener('click', handleDeleteClick)

// 给修改按钮添加点击事件  如果打开，点击之后就关闭，如果关闭，点击之后就打开
changeMockStateBtn.addEventListener('click', handleChangeStateClick)

// 给关闭按钮添加点击事件
closeLiUpBtn.addEventListener('click', hiddenLiUp);

// 给增加次数按钮绑定事件
addTimesBtn.addEventListener('click', handleAddTimesClick)

// 给保存按钮添加点击事件
savePopupBtn.addEventListener('click', savePopup);

//点击进行Mock之后执行的事件：  popup与serviceworker通信  把需要拦截的次数、对应的api告诉serviceworker
confirmMock.addEventListener('click', sendMessageToServiceWorker);

