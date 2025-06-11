var DateTime = luxon.DateTime;
let chartInstance = null;
let currentSymbol = null;

async function loadCoins() {
    try {
        const res = await fetch("https://api.exir.io/v2/constants");
        const data = await res.json();

        const coins = data.coins;
        const pairs = data.pairs;
        const tableRight = document.getElementById("tableRight");
        const tableLeft = document.getElementById("tableLeft");

        let index = 1;
        for (const pairKey in pairs) {
            const pair = pairs[pairKey];
            const [first, second] = pairKey.split("-");
            const firstCoin = coins[first];
            const secondCoin = coins[second];

            const row = document.createElement("tr");

            row.innerHTML = `
            <th>${index++}</th>
            <td>
            <img src="${firstCoin.logo}" alt="${first}" title="${first}" width="30"; />
            <img src="${secondCoin.logo}" alt="${second}" title="${second}" width="30";/>
            </td>
            <td>${first}</td>
            <td>${second}</td>
            <td>${pair.min_price}</td>
            <td>${pair.max_price}</td>
          `;

            row.addEventListener("click", () => {
                const clickedPair = pairKey;
                currentSymbol = clickedPair;
                drawChart(clickedPair);
            });

            tableRight.appendChild(row);
        }

        let number = 1;
        for (const item in coins) {
            const coin = coins[item];

            const row = document.createElement("tr");
            row.innerHTML = `
            <th>${number++}</th>
            <td><img src="${coin.logo}" alt="${coin.fullname}" width="30" height="30" /></td>
            <td>${coin.fullname}</td>
            <td>${coin.estimated_price}</td>
            <td>${coin.market_cap}</td>
          `;

            tableLeft.appendChild(row);
        }

    } catch (err) {
        console.error("Failed to load coin data:", err);
    }
}
loadCoins();
async function drawChart(symbol) {

    const interval = document.getElementById('resolution').value;
    const resolution = interval + 'D';
    const from = document.getElementById('startDate').value;
    const to = document.getElementById('endDate').value;
    let from1 = new Date(from);
    let to1 = new Date(to);

    const userInput = {};
    if (symbol) userInput.symbol = symbol;
    if (resolution) userInput.resolution = resolution;
    if (from) userInput.from = Math.floor(from1.getTime() / 1000);
    if (to) userInput.to = Math.floor(to1.getTime() / 1000);

    const defaultParams = {
        symbol: 'btc-usdt',
        resolution: "1D",
        from: 1616987453,
        to: 1619579513,
    };

    const params = {
        symbol: typeof userInput.symbol === 'string' ? userInput.symbol : defaultParams.symbol,
        resolution: typeof userInput.resolution === 'string' ? userInput.resolution : defaultParams.resolution,
        from: typeof userInput.from === 'number' ? userInput.from : defaultParams.from,
        to: typeof userInput.to === 'number' ? userInput.to : defaultParams.to,
    };

    try {
        const res = await fetch(`https://api.exir.io/v2/chart?symbol=${params.symbol}&resolution=${params.resolution}&from=${params.from}&to=${params.to}`);
        const data = await res.json();

        let dates = [];
        let volumes = [];
        let interval = parseInt((params.resolution).split('D')[0]);
        let i = 0;
        for (const item of data) {
            volumes.push(item.volume)
            let isoDate = (item.time).split('T');
            dates.push(isoDate[0])
            i++;
        }
        let uniqueDates = [...new Set(dates)];

        let newVolumes = [];

        for (let i = 0; i < volumes.length; i += interval) {
            let sliced = volumes.slice(i, i + interval);
            let sum = sliced.reduce((acc, val) => acc + val, 0);
            let average = sum / sliced.length;
            newVolumes.push(average);
        }

        let newDates = [];
        for (let i = 0; i < uniqueDates.length; i += interval) {
            let sliced = uniqueDates.slice(i, i + interval);
            const timestamps = sliced.map(dateStr => new Date(dateStr).getTime());
            const sum = timestamps.reduce((acc, val) => acc + val, 0);
            const avgTimestamp = sum / timestamps.length;
            const avgDate = new Date(avgTimestamp).toISOString().split('T')[0];
            newDates.push(avgDate);
        }

        // const dates = data.map()

        delete ctx;
        const ctx = document.getElementById('myChart');

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: newDates,
                datasets: [{
                    label: symbol,
                    data: newVolumes,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
}

function updateChart() {
    if (currentSymbol) {
        drawChart(currentSymbol);
    }
}