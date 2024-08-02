const serverAPI = 'https://publicapi.battlebit.cloud/Servers/GetServerList';
const leaderboardAPI = 'https://publicapi.battlebit.cloud/Leaderboard/Get';

document.addEventListener('DOMContentLoaded', () => {
    const refreshButton = document.getElementById('refresh');
    const searchInput = document.getElementById('search');
    const autoRefreshCheckbox = document.getElementById('auto-refresh');
    const refreshIntervalInput = document.getElementById('refresh-interval');
    let refreshIntervalId;

    refreshButton.addEventListener('click', fetchData);
    searchInput.addEventListener('input', filterData);
    autoRefreshCheckbox.addEventListener('change', toggleAutoRefresh);

    fetchData();

    function fetchData() {
        Promise.all([fetch(serverAPI), fetch(leaderboardAPI)])
            .then(responses => Promise.all(responses.map(res => res.json())))
            .then(([serverData, leaderboardData]) => {
                displayData('server-data', serverData, ['name', 'status']);
                displayData('leaderboard-data', leaderboardData, ['player', 'score']);
            })
            .catch(console.error);
    }

    function displayData(elementId, data, columns) {
        const container = document.getElementById(elementId);
        container.innerHTML = createTable(data, columns);
        makeTableSortable(container.querySelector('table'));
    }

    function createTable(data, columns) {
        let html = '<table><thead><tr>';
        columns.forEach(column => {
            html += `<th>${column}</th>`;
        });
        html += '</tr></thead><tbody>';
        data.forEach(item => {
            html += '<tr>';
            columns.forEach(column => {
                html += `<td>${item[column]}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    function filterData(event) {
        const filter = event.target.value.toLowerCase();
        document.querySelectorAll('tbody tr').forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    }

    function makeTableSortable(table) {
        const headers = table.querySelectorAll('th');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const index = Array.from(headers).indexOf(header);
                const rows = Array.from(table.querySelectorAll('tbody tr'));
                const ascending = header.classList.toggle('asc');
                rows.sort((a, b) => {
                    const aText = a.cells[index].innerText;
                    const bText = b.cells[index].innerText;
                    return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
                });
                rows.forEach(row => table.querySelector('tbody').appendChild(row));
            });
        });
    }

    function toggleAutoRefresh(event) {
        if (event.target.checked) {
            const interval = parseInt(refreshIntervalInput.value, 10) * 1000;
            refreshIntervalId = setInterval(fetchData, interval);
        } else {
            clearInterval(refreshIntervalId);
        }
    }
});
