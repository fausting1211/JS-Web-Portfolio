// 1. 初始化地圖
let map = L.map('map').setView([25.032969, 121.565418], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let layerGroup = L.layerGroup().addTo(map);
let userMarker = null;

// 2. 設定變數與語言包
const API_URL = 'http://127.0.0.1:5000/youbike';
let autoUpdateTimer = null;
let currentData = [];
let currentLang = 'zh';

const translations = {
    zh: {
        title: "YouBike 2.0 台北市即時資訊",
        locate: "定位目前位置",
        refresh: "手動更新資料",
        auto_update: "啟用自動更新 (每1分鐘)",
        col_status: "狀態",
        col_sno: "站點代號",
        col_sna: "站點名稱",
        col_area: "區域",
        col_addr: "地址",
        col_total: "總車位",
        col_rent: "可借",
        col_return: "可還",
        col_time: "更新時間",
        act_active: "啟用",
        act_disabled: "禁用",
        last_update: "最後更新: ",
        fail: "更新失敗",
        my_location: "您的目前位置"
    },
    en: {
        title: "YouBike 2.0 Taipei Live Info",
        locate: "My Location",
        refresh: "Refresh",
        auto_update: "Auto Update (1 min)",
        col_status: "Status",
        col_sno: "Station ID",
        col_sna: "Station Name",
        col_area: "District",
        col_addr: "Address",
        col_total: "Total",
        col_rent: "Rent",
        col_return: "Return",
        col_time: "Update Time",
        act_active: "Active",
        act_disabled: "Disabled",
        last_update: "Last Updated: ",
        fail: "Failed",
        my_location: "Your Current Location"
    }
};

// 3. 自訂 Icon 函式
function getCustomIcon(count, isActive) {
    let cssClass = 'custom-div-icon';

    if (!isActive) {
        cssClass += ' marker-gray';
    } else if (count == 0) {
        cssClass += ' marker-red';
    } else if (count < 5) {
        cssClass += ' marker-yellow';
    } else {
        cssClass += ' marker-green';
    }

    return L.divIcon({
        className: cssClass,
        html: `<span>${count}</span>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
}

function getLatestTime(obj) {
    const candidates = [
        obj.srcUpdateTime,
        obj.updateTime,
        obj.infoTime,
        obj.infoDate ? obj.infoDate + " 00:00:00" : null
    ].filter(Boolean);

    if (candidates.length === 0) return "";
    candidates.sort();
    return candidates[candidates.length - 1];
}

// 4. 取得資料
function fetchYouBikeData() {
    const timeSpan = document.getElementById('update-time');
    timeSpan.style.opacity = "0.5";

    fetch(API_URL, { method: "GET" })
        .then(response => response.json())
        .then(data => {
            currentData = data;
            renderData(data);

            let now = new Date();
            let locale = currentLang === 'zh' ? 'zh-TW' : 'en-US';
            timeSpan.textContent = now.toLocaleTimeString(locale);
            timeSpan.style.opacity = "1";
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            const t = translations[currentLang];
            timeSpan.textContent = t.fail;
        });
}

// 5. 渲染畫面
function renderData(arr) {
    layerGroup.clearLayers();
    let tbody = document.querySelector('table > tbody');
    tbody.innerHTML = '';

    let fragment = document.createDocumentFragment();
    let markers = [];
    const t = translations[currentLang];
    const isEn = currentLang === 'en';

    arr.forEach(obj => {
        const name = isEn ? obj.snaen : obj.sna;
        const area = isEn ? obj.sareaen : obj.sarea;
        const addr = isEn ? obj.aren : obj.ar;
        const isActive = obj.act === "1";
        const statusText = isActive ? t.act_active : t.act_disabled;
        const statusClass = isActive ? 'status-active' : 'status-disabled';
        const finalTime = getLatestTime(obj);

        // 表格列
        let tr = document.createElement("tr");
        if (!isActive) tr.style.opacity = "0.6";

        tr.innerHTML = `
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>${obj.sno}</td>
            <td>${name}</td>
            <td>${area}</td>
            <td class="addr-cell">${addr}</td>
            <td>${obj.Quantity || obj.quantity || '--'}</td> 
            <td style="font-weight:bold; color:${obj.available_rent_bikes > 0 ? 'green' : 'red'}">${obj.available_rent_bikes}</td>
            <td>${obj.available_return_bikes}</td>
            <td class="time-cell">${finalTime}</td>
        `;
        fragment.appendChild(tr);

        // 地圖標記
        if (obj.latitude && obj.longitude) {
            let marker = L.marker([obj.latitude, obj.longitude], {
                icon: getCustomIcon(obj.available_rent_bikes, isActive)
            });

            marker.bindPopup(`
                <span class="badge ${statusClass}">${statusText}</span><br>
                <br>
                <b>${name}</b><br>
                ${addr}<br>
                <hr>
                ${t.col_rent}: ${obj.available_rent_bikes}<br>
                ${t.col_return}: ${obj.available_return_bikes}<br>
                <small>${finalTime}</small>
            `);

            markers.push(marker);
        }
    });

    tbody.appendChild(fragment);
    markers.forEach(m => m.addTo(layerGroup));
}

// 6. 語言切換
function toggleLanguage() {
    currentLang = (currentLang === 'zh') ? 'en' : 'zh';

    document.getElementById('btn_lang').textContent = (currentLang === 'zh') ? '🌐 English' : '🌐 中文';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    // 時間顯示格式
    const timeSpan = document.getElementById('update-time');
    if (timeSpan.textContent && timeSpan.textContent !== translations.zh.fail && timeSpan.textContent !== translations.en.fail) {
        let now = new Date();
        let locale = currentLang === 'zh' ? 'zh-TW' : 'en-US';
        timeSpan.textContent = now.toLocaleTimeString(locale);
    }

    // 重新渲染資料
    if (currentData.length > 0) renderData(currentData);

    // 如果已經定位，更新定位點的 popup 語言
    if (userMarker) {
        const t = translations[currentLang];
        userMarker.setPopupContent(`<div style="text-align:center; font-weight:bold;">📍 ${t.my_location}</div>`);
    }
}

// 7. 定位功能
function locateUser() {
    if (!navigator.geolocation) {
        alert("不支援地理定位");
        return;
    }

    const btn = document.getElementById('btn_locate');
    const originalText = btn.innerHTML;
    const t = translations[currentLang];

    btn.innerHTML = "Locating...";
    btn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 16);

            if (userMarker) map.removeLayer(userMarker);

            userMarker = L.marker([latitude, longitude]).addTo(map);
            userMarker.bindPopup(`<div style="text-align:center; font-weight:bold;">📍 ${t.my_location}</div>`).openPopup();

            btn.innerHTML = originalText;
            btn.disabled = false;
        },
        (err) => {
            console.error(err);
            alert("定位失敗");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    );
}

// 8. 事件監聽
document.getElementById('btn_request').addEventListener('click', function () {
    fetchYouBikeData();
    if (document.getElementById('auto-update').checked) resetAutoUpdate();
});

document.getElementById('auto-update').addEventListener('change', function (e) {
    e.target.checked ? startAutoUpdate() : stopAutoUpdate();
});

document.getElementById('btn_lang').addEventListener('click', toggleLanguage);
document.getElementById('btn_locate').addEventListener('click', locateUser);

function startAutoUpdate() {
    if (autoUpdateTimer) clearInterval(autoUpdateTimer);
    autoUpdateTimer = setInterval(fetchYouBikeData, 60000);
}
function stopAutoUpdate() {
    if (autoUpdateTimer) clearInterval(autoUpdateTimer);
}
function resetAutoUpdate() {
    stopAutoUpdate();
    startAutoUpdate();
}

// 啟動
fetchYouBikeData();
startAutoUpdate();