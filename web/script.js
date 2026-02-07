const BASE_URL = "https://autohero-api-hemil-eucbagezcqg3cbe4.canadacentral-01.azurewebsites.net/inventory";
let currentType = 'car';
let skip = 0;
const limit = 10; // Matches your FastAPI default

async function fetchInventory() {
    const tableBody = document.getElementById('tableBody');
    const tableHeader = document.getElementById('tableHeader');
    const statusInfo = document.getElementById('statusInfo');
    
    try {
        // We add the limit and skip to the URL as "Query Parameters"
        const url = `${BASE_URL}/${currentType}?limit=${limit}&skip=${skip}`;
        const response = await fetch(url);
        const data = await response.json(); // Data is { total: X, results: [...] }

        const results = data.results;
        const total = data.total;

        statusInfo.innerText = `Showing ${skip + 1} - ${Math.min(skip + limit, total)} of ${total} ${currentType}s`;

        // 1. Headers
        if (results.length > 0) {
            const cols = Object.keys(results[0]);
            tableHeader.innerHTML = cols.map(c => `<th>${c.toUpperCase()}</th>`).join('');
            
            // 2. Rows
            tableBody.innerHTML = results.map(item => `
                <tr>${cols.map(c => `<td>${item[c] ?? ''}</td>`).join('')}</tr>
            `).join('');
        }

        // Handle button states
        document.getElementById('prevBtn').disabled = (skip === 0);
        document.getElementById('nextBtn').disabled = (skip + limit >= total);
        document.getElementById('pageIndicator').innerText = `Page ${Math.floor(skip/limit) + 1}`;

    } catch (err) {
        statusInfo.innerText = "⚠️ Error loading data from Azure.";
        console.error(err);
    }
}

function changeType(type) {
    currentType = type;
    skip = 0; // Reset to first page
    fetchInventory();
}

function changePage(step) {
    skip += (step * limit);
    fetchInventory();
}

// Initial load
fetchInventory();