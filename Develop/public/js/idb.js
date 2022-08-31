/* S T A N D A R D I Z I N G  B R O W S E R S */

const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;

const database = "budget";
const objectStore = "transactions";

const request = indexedDB.open(database, 1);

request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore(objectStore, { autoIncrement: true });
};

// M A K I N G  S U R E  T H E  A P P  I S  O N L I N E
request.onsuccess = ({ target }) => {
  db = target.result;
  if (navigator.onLine) {
  }
};

// E R R O R  M E S S A G E
request.onerror = function (event) {
  console.log("Mistakes were made! " + event.target.errorCode);
};

// S A V E  R E C O R D
function saveRecord(record) {
  const transaction = db.transaction([objectStore], "readwrite");
  const store = transaction.objectStore(objectStore);
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction([objectStore], "readwrite");
  const store = transaction.objectStore(objectStore);
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction([objectStore], "readwrite");
          const store = transaction.objectStore(objectStore);
          store.clear();
        });
    }
  };
}

// L I S T E N E R  F O R  O N L I N E  S T A T U S
window.addEventListener("online", checkDatabase);
