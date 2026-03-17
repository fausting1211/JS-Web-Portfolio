document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const keywordInput = document.getElementById('keywordInput');
    const resultArea = document.getElementById('resultArea');
    const loadingDiv = document.getElementById('loading');
    const noDataDiv = document.getElementById('noData');
    const controlsBar = document.getElementById('controlsBar');
    const sortSelect = document.getElementById('sortSelect');

    let allProducts = [];

    searchBtn.addEventListener('click', performSearch);
    keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    sortSelect.addEventListener('change', () => {
        const sortType = sortSelect.value;
        sortProducts(sortType);
    });

    function performSearch() {
        const keyword = keywordInput.value.trim();
        if (!keyword) {
            alert("請輸入關鍵字！");
            return;
        }

        resultArea.innerHTML = '';
        resultArea.classList.add('hidden');
        noDataDiv.classList.add('hidden');
        controlsBar.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        searchBtn.disabled = true;
        sortSelect.value = "default";

        fetch('http://127.0.0.1:5000/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: keyword })
        })
            .then(response => response.json())
            .then(data => {
                loadingDiv.classList.add('hidden');
                searchBtn.disabled = false;

                if (data.status === 'empty' || data.data.length === 0) {
                    noDataDiv.classList.remove('hidden');
                } else {
                    allProducts = data.data;
                    resultArea.classList.remove('hidden');
                    controlsBar.classList.remove('hidden');
                    renderProducts(allProducts);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                loadingDiv.classList.add('hidden');
                searchBtn.disabled = false;
                alert("搜尋發生錯誤，請確認後端 etmall.py 是否已執行。");
            });
    }

    function sortProducts(type) {
        let sortedData = [...allProducts];

        if (type === 'asc') {
            sortedData.sort((a, b) => a.price_val - b.price_val);
        } else if (type === 'desc') {
            sortedData.sort((a, b) => b.price_val - a.price_val);
        }
        renderProducts(sortedData);
    }

    function renderProducts(products) {
        resultArea.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'card';

            // 判斷是否售完，產生對應的遮罩 HTML 與按鈕狀態
            let soldOutOverlay = '';
            let btnClass = 'card-btn';
            let btnText = '前往購買 <i class="fa-solid fa-arrow-up-right-from-square"></i>';

            if (product.is_soldout) {
                soldOutOverlay = `
                    <div class="soldout-mask">
                        <span class="soldout-text">銷售一空</span>
                    </div>
                `;
                btnClass += ' disabled'; // 讓按鈕變灰且不可點擊
                btnText = '已售完';
            }

            // 使用 card-img-box 包裹圖片與遮罩
            card.innerHTML = `
                <div class="card-img-box">
                    ${soldOutOverlay}
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="card-body">
                    <h3 class="card-title" title="${product.name}">${product.name}</h3>
                    <p class="card-price">${product.price_str}</p>
                    <a href="${product.link}" target="_blank" class="${btnClass}">${btnText}</a>
                </div>
            `;
            resultArea.appendChild(card);
        });
    }
});