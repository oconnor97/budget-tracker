
let db;
let budgetVersion;

// Create a new request for a database
const request = indexed.db.open('BudgetDB', budgetVersion || 1);

request.onupgradeneeded = function (event) {
    const { oldVersion } = event;
    const newVersion = event.newVersion || db.version;

    console.log(`DB updated from version ${oldversion} tp ${newVersion}`)


    db = event.target.result;
    if (db.objectStore.length === 0) {
        db.createObjectStore("BudgetStore", { autoIncrement: true });
    }
};

request.onerror = function (event) {
    console.log("There has been an error retrieving your data", event.target.errorCode);
};

function checkDatabase() {
    // opens a transaction on the BudgetStore
    let transaction = db.transaction(['BudgetStore'], 'readwrite');
    // Opens the BudgetStore object
    const store = transaction.objectStore('BudgetStore');
    // Gets all records from store
    const getAll = store.getAll()


    if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
            },
        })
            .then((response) => response.json())
            .then(() => {
                transaction = db.transaction(['BudgetStore'], 'readwrite')
                const currentStore = transaction.objectStore('BudgetStore')
                currentStore.clear()
            })
    }
}

request.onsuccess = function (event) {
    console.log('success');
    db = event.target.result;

    // Check if app is online before reading from db
    if (navigator.onLine) {
        console.log('Backend online!');
        checkDatabase();
    }
};

function saveRecord(record) {
    console.log('Save record invoked');
    const transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);

