from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import urllib.parse
import time

app = Flask(__name__, static_folder=".", static_url_path="", template_folder=".")
CORS(app)


def get_driver():
    options = webdriver.ChromeOptions()
    options.add_argument(
        "--headless"
    )  # 開發時建議先註解掉 headless 以觀察狀況，穩定後可開啟
    options.add_argument("--disable-gpu")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    )
    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=options
    )


def scrape_data(keyword):
    driver = get_driver()
    all_results = []

    try:
        encoded_keyword = urllib.parse.quote(keyword)
        url = f"https://www.etmall.com.tw/Search?keyword={encoded_keyword}"
        driver.get(url)

        # 檢查查無商品
        try:
            WebDriverWait(driver, 3).until(
                EC.presence_of_element_located(
                    (By.CLASS_NAME, "n-search__without-result")
                )
            )
            return None
        except:
            pass

        current_page = 1

        while True:
            print(f"正在爬取第 {current_page} 頁...")
            try:
                # 等待商品載入
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "li.product"))
                )

                # 捲動觸發圖片載入
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1.5)

                soup = BeautifulSoup(driver.page_source, "html.parser")
                product_items = soup.select("li.product")

                for item in product_items:
                    try:
                        name = item.select_one(".n-name").get_text(strip=True)

                        # 價格處理
                        price_tag = item.select_one(".n-final-price")
                        if price_tag:
                            raw_price = price_tag.get_text(strip=True).replace(",", "")
                            price_val = int(raw_price) if raw_price.isdigit() else 0
                            price_str = f"${price_tag.get_text(strip=True)}"
                        else:
                            price_val = 0
                            price_str = "$0"

                        link_tag = item.select_one("a.n-pic")
                        link = (
                            "https://www.etmall.com.tw" + link_tag.get("href")
                            if link_tag
                            else "#"
                        )

                        img_tag = item.select_one("img")
                        img_link = img_tag.get("src") or img_tag.get("data-original")
                        if img_link and img_link.startswith("//"):
                            img_link = "https:" + img_link

                        # 偵測是否銷售一空
                        soldout_tag = item.select_one(".n-soldout")
                        is_soldout = True if soldout_tag else False

                        all_results.append(
                            {
                                "name": name,
                                "price_str": price_str,
                                "price_val": price_val,
                                "link": link,
                                "image": img_link,
                                "is_soldout": is_soldout,
                            }
                        )
                    except:
                        continue

                try:
                    next_btn = driver.find_element(By.CSS_SELECTOR, "a[title='下一頁']")
                    if "n-pager--disable" in next_btn.get_attribute("class"):
                        print("已到達最後一頁，爬蟲結束。")
                        break

                    driver.execute_script("arguments[0].click();", next_btn)
                    current_page += 1
                    time.sleep(2)
                except:
                    print("找不到下一頁按鈕或翻頁錯誤，停止爬取。")
                    break
            except:
                print("頁面載入逾時，停止爬取。")
                break

    except Exception as e:
        print(f"Error: {e}")
        return []
    finally:
        driver.quit()

    return all_results


@app.route("/api/search", methods=["POST"])
def api_search():
    data = request.get_json()
    keyword = data.get("keyword")
    if not keyword:
        return jsonify({"status": "error", "message": "請輸入關鍵字"})

    results = scrape_data(keyword)

    if results is None:
        return jsonify({"status": "empty", "data": []})

    return jsonify({"status": "success", "data": results})


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
