const BASE_URL = "/inventory";
let currentType = 'car';
let skip = 0;
const limit = 10;

async function fetchInventory() {
    const tableBody = document.getElementById('tableBody');
    const tableHeader = document.getElementById('tableHeader');
    const statusInfo = document.getElementById('statusInfo');
    
    // 1. Get filter values
    const brand = document.getElementById('brandInput').value;
    const year = document.getElementById('yearInput').value;
    const maxPrice = document.getElementById('priceInput').value;

    // 2. Build URL with Query Parameters
    let url = `${BASE_URL}/${currentType}?limit=${limit}&skip=${skip}`;
    if (brand) url += `&brand=${encodeURIComponent(brand)}`;
    if (year) url += `&year=${year}`;
    if (maxPrice) url += `&max_price=${maxPrice}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Server responded with an error");
        
        const data = await response.json(); // Data is { total: X, results: [...] }
        const results = data.results;
        const total = data.total;

        statusInfo.innerText = `Showing ${skip + 1} - ${Math.min(skip + limit, total)} of ${total.toLocaleString()} ${currentType}s`;

        if (results.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="100%" style="text-align:center; padding: 40px;">No vehicles found matching your filters.</td></tr>`;
            return;
        }

        // 3. Build Table Headers
        const cols = Object.keys(results[0]);
        tableHeader.innerHTML = cols.map(c => `<th>${c.replace('_', ' ')}</th>`).join('');

        // 4. Build Table Rows
        tableBody.innerHTML = results.map(item => `
            <tr>
                ${cols.map(c => {
                    let val = item[c] ?? 'N/A';
                    // Format price as currency if the column is 'price'
                    if (c === 'price' && val !== 'N/A') {
                        val = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
                    }
                    return `<td>${val}</td>`;
                }).join('')}
            </tr>
        `).join('');

        // 5. Update Pagination Buttons
        document.getElementById('prevBtn').disabled = (skip === 0);
        document.getElementById('nextBtn').disabled = (skip + limit >= total);
        document.getElementById('pageIndicator').innerText = `Page ${Math.floor(skip/limit) + 1}`;

    } catch (err) {
        console.error("Fetch error:", err);
        statusInfo.innerText = "⚠️ Error: Could not connect to the API.";
    }
}

// Control Functions
function changeType(type) {
    currentType = type;
    resetFilters(false); // Reset inputs but don't call fetch yet
    skip = 0;
    fetchInventory();
}

function applyFilters() {
    skip = 0; // Reset to page 1 on search
    fetchInventory();
}

function resetFilters(shouldFetch = true) {
    document.getElementById('brandInput').value = '';
    document.getElementById('yearInput').value = '';
    document.getElementById('priceInput').value = '';
    if (shouldFetch) {
        skip = 0;
        fetchInventory();
    }
}

function changePage(step) {
    skip += (step * limit);
    fetchInventory();
}

// Initial Load
fetchInventory();