// // 模拟 API 响应
// const test = {
//     "data": [
//         { "cameraId": "C313333", "cameraNumber": 1 },
//         { "cameraId": "C332", "cameraNumber": 2 },
//         { "cameraId": "C333", "cameraNumber": 3 },
//         { "cameraId": "C375", "cameraNumber": 4 }
//     ]
// };

// // 使用 fetch 拦截请求并返回模拟的 JSON 响应
// function mockFetch() {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve({
//                 json: () => Promise.resolve(test)  // 将 test 对象作为 JSON 响应
//             });
//         }, 500);  // 模拟延迟
//     });
// }

// // 使用 mockFetch 代替真实的 fetch 请求
// mockFetch().then(response => response.json())
//     .then(data => {
//         console.log('模拟的JSON响应:', data);
//     });
const test = JSON.stringify("你好")