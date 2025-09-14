window.onload = () => {
    eel.get_portfolio()(function(data) {
        const assetsByType = data.assets;
        const totalValue = data.total_value;
        const portfolioGrowth = data.portfolio_growth;

        // Форматирование итоговых значений
        const balanceall = document.querySelector('.balanceall_h2 span');
        balanceall.textContent = `${totalValue.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ₽`;
        if (totalValue < 0){
            balanceall.classList.add('minus');
        } else{
            balanceall.classList.add('plus');
        }
        document.querySelector('.balancein_h2 span').textContent = `${portfolioGrowth.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ₽`;

        if (portfolioGrowth < 0){
            document.querySelector('.balancein_h2 span').classList.add('minus');
        } else{
            document.querySelector('.balancein_h2 span').classList.add('plus');
        }

        if (!assetsByType || Object.keys(assetsByType).length === 0) {
            document.getElementById('empty').style.display = 'block';
            return;
        }

        function renderAssets(containerSelector, assets) {
        const tbody = document.querySelector(containerSelector);
        tbody.innerHTML = '';

        if (assets.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="7" style="text-align:center; font-style: italic;">нет данных</td>`;
            tbody.appendChild(tr);
            return;
        }

        function calculatePercent(current, target) {
            if (target === 0) return '0%';
            const percent = (current / target) * 100;
            return percent > 100 ? '100%' : percent.toFixed(2) + '%'; 
        }

        task = 0;

        assets.forEach(a => {
            if(a.ticker === 'RUB000UTSTOM'){
                document.querySelector('.balancerub_h2 span').textContent = `${a.balance.toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 0})} ₽`;
                if (a.balance < 0){
                    document.querySelector('.balancerub_h2 span').classList.add('minus');
                } else{
                    document.querySelector('.balancerub_h2 span').classList.add('plus');
                }
                return;
            }
            const tr = document.createElement('tr');
            if(a.ticker == 'TPAY'){
                task = 5000;
            } else if(a.ticker == 'LQDT'){
                task = 250000;
            } else if(a.ticker == 'RU000A10BF48'){
                task = 2500;
            } else if(a.ticker == 'SU29025RMFS2'){
                task = 2500;
            } else if(a.ticker == 'USD000UTSTOM'){
                task = 1000000;
            }

            const currentBalance = a.balance; 
            const target = task;               

            const percent = calculatePercent(currentBalance, target);

            tr.innerHTML = `
                <td>${a.name}</td>
                <td>${a.balance.toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td>${a.current_price.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${a.total_value.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="${a.profit_loss >= 0 ? 'plus' : 'minus'}">${a.profit_loss.toLocaleString('ru-RU', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>${a.balance.toLocaleString('ru-RU', {minimumFractionDigits: 0, maximumFractionDigits: 0})}/${task}</td>
                <td>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${percent}; background-color: #f63a0f;"></div>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }


        renderAssets('#stocks-table tbody', assetsByType.stocks);
        renderAssets('#bonds-table tbody', assetsByType.bonds);
        renderAssets('#etfs-table tbody', assetsByType.etfs);
        renderAssets('#currencies-table tbody', assetsByType.currencies);
    });
}
