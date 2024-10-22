// 打开或创建数据库  数据库名是MockDatabase  版本号是1
const request = indexedDB.open('MockDatabase', 1);

// 如果数据库需要更新的时候就执行这些代码
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


    const mockData = { url: '/api/test', response: { data: 'Test data' } };
    store.put(mockData);  // 插入或更新数据


    // 事务完成的时候触发，表示数据已经成功存储
    transaction.oncomplete = function () {
        console.log('Data has been stored!');
    };
};

// 查询数据
request.onsuccess = function (event) {
    const db = event.target.result;
    // 开启一个只读事务
    const transaction = db.transaction('mockData', 'readonly');
    const store = transaction.objectStore('mockData');
    // 通过url作为键来查询数据,   这里查询url为'/api/test'的数据
    const query = store.get('/api/test');

    // 事务完成的时候触发，表示数据已经成功查询
    query.onsuccess = function () {
        console.log('Data from IndexedDB:', query.result);
    };
};
