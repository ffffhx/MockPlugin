// Manifest V2 版本
// 在插件的背景页可以看得到控制台
// Manifest V2 不支持 ES6 模块（如 import 和 export 语法）。



console.log('进入了service worker');

// 判断是否要开启拦截
let modifyResponseEnabled = false;


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

// 拦截请求并返回 mock 数据
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        console.log('检测到了请求');

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