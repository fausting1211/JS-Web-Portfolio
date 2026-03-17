# YouBike 2.0 Map Integration

此專案為前後端整合的互動式地圖應用，可即時查詢台北市 YouBike 2.0 的站點狀態與剩餘車輛資訊。

## 系統架構

1. **Frontend (前端)**
   - 使用 HTML、CSS 與純 JavaScript 所構建的響應式網頁介面。
   - 整合 **Leaflet.js** 達到地圖動態標記與操作功能。
   - 利用 `fetch` 非同步呼叫後端 API，並具備定時自動更新功能。
2. **Backend (後端)**
   - 使用 Python 與 **Flask** 輕量級框架實作 API。
   - 負責向北市府開放資料平台索取資料、進行跨來源資源共用 (CORS) 處理，並回傳格式化後的 JSON 給前端。

## 如何執行

1. 確保已安裝專案根目錄中的 `requirements.txt`：
   ```bash
   pip install -r ../requirements.txt
   ```
2. 啟動後端 Flask API：
   ```bash
   python app.py
   ```
3. 開啟網頁：
   直接在瀏覽器打開放有 `index.html` 的路徑，或者使用 VS Code 的 Live Server 套件開啟。地圖與標記資訊將自動載入。