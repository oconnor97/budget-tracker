
let db;
let budgetVersion;

// Create a new request for a database
const request = indexedDB.open('BudgetDB', budgetVersion || 15);

request.onupgradeneeded = event => {
    console.log('Upgrade needed in IndexDB.');




    const { oldVersion } = event;
    const newVersion = event.newVersion || db.version;

    console.log(`DB has been updated from version ${oldVersion} to ${newVersion}`)


    db = event.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore("BudgetStore", { autoIncrement: true });
    }
};

request.onerror = function (event) {
    console.log("There has been an error retrieving your data", event.target.errorCode);
};

const checkDatabase = () => {
    // opens a transaction on the BudgetStore
    let transaction = db.transaction(['BudgetStore'], 'readwrite');
    // Opens the BudgetStore object
    const store = transaction.objectStore('BudgetStore');
    // Gets all records from store
    const getAll = store.getAll()


    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then(response => {
                    response.json();
                })
                .then(res => {
                    if (res.length !== 0) {
                        transaction = db.transaction(['BudgetStore'], 'readwrite');
                        const currentStore = transaction.objectStore('BudgetStore');
                        currentStore.clear();
                        console.log('Store is cleared');
                    }
                })
        }
    };
}

request.onsuccess = event => {
    console.log('success');
    db = event.target.result;

    // Check if app is online before reading from db
    if (navigator.onLine) {
        console.log('Backend online!');
        checkDatabase();
    }
};

const saveRecord = record => {
    console.log('Save record invoked');

    const transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);

