const { DocumentStore } = require("ravendb");

// const store = new DocumentStore("http://localhost:8080", "payment-calculations");
const store = new DocumentStore("http://127.0.0.1:8080", "payment-calculations");

store.initialize();

async function testConnection() {
    const session = store.openSession();
    console.log("Session opened successfully.");
}

module.exports = testConnection;
