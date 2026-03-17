# E-Commerce Mall Web Scraper

此專案為結合後端動態網頁爬蟲與前端非同步搜尋顯示的應用展示。

## 系統架構

1. **Backend (後端)**
   - 採用 **Python Flask** 作為 Web 伺服器提供 RESTful API 端點 (`/api/search`)。
   - 整合 **Selenium** 與 **BeautifulSoup4**，在無頭模式 (Headless) 下模擬真實瀏覽器行為，解決動態加載的電商網頁內容爬取問題。
   - 自動捲動頁面與等待目標元素載入，並解析商品名稱、價格、圖片及商品連結。
2. **Frontend (前端)**
   - 使用 HTML、CSS 與 JavaScript (Fetch API) 實作搜尋介面。
   - 處理使用者輸入的關鍵字後，發送非同步請求至後端，並將爬取回傳的 JSON 結果動態渲染為商品卡片列表。

## 如何執行

1. 確保已安裝專案根目錄中的 `requirements.txt`：
   ```bash
   pip install -r ../requirements.txt
   ```
2. 啟動後端 Flask API：
   ```bash
   python app.py
   ```
3. 打開前端對應的網頁：
   在瀏覽器中開啟 `index.html` 進行搜尋測試。

**注意：**
- 初次開啟需要較長的爬蟲等待時間，因為 Selenium 必須啟動瀏覽器進行動態資料抓取加載。
- 若網頁結構更動可能導致欄位解析失敗，可依據需求調整 Selenium 定位的 CSS Selector。
