let db;

// Create a new request for a database
const request = indexed.db.open('BudgetDB', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("BudgetStore", { autoIncrement: true });
};

request.onerror = function (event) {
    console.log("There has been an error retrieving your data", event.target.errorCode);
};




