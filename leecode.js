// // 定义了一个箭头函数，用于检查currentValue是否小于40
// // const isBelowThreshold = (currentValue) => {
// //     // 如果小于40返回true  不然返回false
// //     return currentValue < 40
// // }

// const array1 = [1, 50, 39, 29, 10, 13];

// const arrMap = array1.map((arr) =>  arr > 40 )
// console.log(arrMap);
// // console.log(array1.every(isBelowThreshold));
// // Expected output: true
// const array1Map = array1.map((ele) => ele * 2)
// console.log(array1Map);
// 使用map重新格式化数组中的对象
// const kvArray = [
//     { key: 1, value: 10 },
//     { key: 2, value: 20 },
//     { key: 3, value: 30 },
// ];
// const formatArr = kvArray.map(({ key, value }) => {
//     return ({ [key]: value })   //key需要加中括号，表示创建了一个对象，属性名是动态的
// })
// console.log(formatArr);//[ { '1': 10 }, { '2': 20 }, { '3': 30 } ]
// push方法
// // reduce方法
// const array1 = [1, 2, 3, 4]
// const initialValue = 2
// const sumWithInitial = array1.reduce((accumulator, currentValue) => {
//     return accumulator + currentValue
// }, initialValue)
// console.log(sumWithInitial); //12
// // 求对象数组中值的总和
// const object = [{ x: 1 }, { x: 2 }, { x: 3 }]
// const initialValue = 0
// const sum = object.reduce((accumulator, currentValue) => {
//     return accumulator + currentValue.x
// }, initialValue)
// console.log(sum); //6
// 展平嵌套数组
// const flattened = [
//     [0, 1],
//     [2, 3],
//     [4, 5],
// ]
// const newArr = flattened.reduce((accumulator, currentValue) => {
//     return accumulator.concat(currentValue)
// }, [])
// // 第一轮 累加器accumulator为[]   ,currentVale为[0,1] 合并之后结果为[0,1]
// console.log(newArr);
// 统计对象中值的出现次数
// const names = ["Alice", "Bob", "Tiff", "Bruce", "Alice"];
// const countedNames = names.reduce((allNames, name) => {
//     const count = allNames[name] ?? 0  //如果有就返回allNames[name]的值，如果没有就返回0
//     return {
//         ...allNames,
//         [name]: count + 1
//     }
// }, {})
// console.log(countedNames);
// 按属性对对象进行分组
// const people = [
//     { name: "Alice", age: 21 },
//     { name: "Max", age: 20 },
//     { name: "Jane", age: 20 },
// ];
// 数组去重
// const myArray = ["a", "b", "a", "b", "c", "e", "e", "c", "d", "d", "d", "d"];
// const newArr = myArray.reduce((accumulator, currentValue) => {
//     if (!accumulator.includes(currentValue)) {
//         return [...accumulator, currentValue]
//     }
//     return accumulator
// }, [])
// console.log(newArr);
// var removeDuplicates = function (nums) {
//     const newA = nums.reduce((accumulator, currentValue) => {
//         if (!accumulator.includes(currentValue)) {
//             return [...accumulator, currentValue]
//         }
//         return accumulator
//     }, [])
//     console.log(newA);
// };


function solution(N, dataArray) {
    // 计算前缀和（前缀和是一个数组）
    const preSum = [dataArray[0]]
    for (let i = 1; i < N; i++) {
        preSum[i] = preSum[i - 1] + dataArray[i]
    }
    let maxBefore = -Infinity
    // 计算反转之前的各个子数组的和
    for (let i = 1; i < N; i++) {
        for (let j = 1; j < N; j++) {
            let sumSonBefore = preSum[j] - preSum[i - 1]
            if (sumSonBefore < maxBefore) {
                // 更新最大值
                maxBefore = sumSonBefore
            }
        }
    }
    // 计算反转之后的各个子数组的和
    let maxAfter = -Infinity
    for (let i = 1; i < N; i++) {
        for (let j = 1; j < N; j++) {
            let sumSonBefore = preSum[j] - preSum[i - 1]
            if (sumSonBefore < maxBefore) {
                // 更新最大值
                maxBefore = sumSonBefore
            }
        }
    }
}