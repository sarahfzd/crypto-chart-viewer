var DateTime = luxon.DateTime;

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


async function updateChart(volume, symbol) {

    const resolution = document.getElementById("resolution");
    var resolutionVal = (resolution.value) * 86400;
    const startDate = document.getElementById("startDate").value;
    const sdt = DateTime.fromISO(startDate);
    const sts = Math.floor(sdt.toSeconds());
    const endDate = document.getElementById("endDate").value;
    const edt = DateTime.fromISO(endDate);
    const ets = Math.floor(edt.toSeconds());
    const res = await fetch(`https://api.exir.io/v2/chart?symbol=${symbol}&resolution=${resolutionVal}&from=${sts}&to=${ets}`);
    const data = await res.json();

    console.log(data);

}

debugger;
async function drawChart(symbol) {

    var DateTime = luxon.DateTime;
    now = DateTime.now();
    later = now.minus({ days: 7 });
    const nowToSeconds = Math.floor(now.toSeconds());
    const laterToSeconds = Math.floor(later.toSeconds());

    const res = await fetch(`https://api.exir.io/v2/chart?symbol=${symbol}&resolution=1D&from=${laterToSeconds}&to=${nowToSeconds}`);
    const data = await res.json();
    const volumes = data.volume;

    for (const item in volumes) {
        const volume = volumes[item];

        alert("send")
        updateChart(volume, symbol);
    }
}
drawChart();



const ctx = document.getElementById('myChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
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