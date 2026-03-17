# JS-Web-Portfolio

本儲存庫蒐集了使用 JavaScript、HTML、CSS 以及 Python (Flask、Selenium) 建立的網頁相關專案，作為前端與後端整合開發的作品集。

## 專案列表

### [01_Prime_Number_Generator](./01_Prime_Number_Generator/)
純前端專案，使用 JavaScript 與 DOM 操作，達成質數產生器的功能，展現基礎的演算法邏輯與前端畫面渲染能力。

### [02_Youbike_Map_Integration](./02_Youbike_Map_Integration/)
前後端分離的地圖整合專案。前端使用 HTML/CSS/JS 與 Leaflet.js 繪製互動式地圖，後端使用 Python Flask 架設 Web API，介接新北市 Youbike 即時剩餘數量資料，並將站點資訊視覺化。

### [03_EC_Mall_Scraper](./03_EC_Mall_Scraper/)
電商網頁爬蟲與搜尋介面實作。後端使用 Python Flask 搭配 Selenium (無頭模式) 動態爬取電商網站商品評價與價格資訊，並提供 API 供前端非同步搜尋與展示。

## 開發與執行環境

本專案支援 Python 3.x，如需執行 02 或 03 專案之後端服務，請先安裝必要套件：

```bash
pip install -r requirements.txt
```

使用的主要技術棧：
- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Leaflet.js
- **Backend:** Python, Flask, Flask-CORS
- **Scraping:** Selenium, BeautifulSoup4, Webdriver Manager
