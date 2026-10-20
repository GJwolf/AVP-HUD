# AVP-HUD-Test · Stage 2 操作與驗收

在原有 GitHub Pages 專案新增互動透明 HUD，沒有建立第二個專案。`index.html` 保留已成功的外觀、透明 CSS、心電圖與模擬更新。新增 `interactive.html` 使用同一配色與資訊階層。

使用者已在 AVP 的 Translucent → Custom → Style: Transparent 實機確認 Stage 1 透明效果。Stage 2 尚待依本文件進行桌面視覺與實機驗收。

## 檔案與入口

```text
index.html             原版透明 HUD，保持原樣
interactive.html       Stage 2 互動 HUD
assets/hud.css         互動頁樣式，不載入到原版
assets/state.js        預設值、驗證、狀態恢復、模擬資料
assets/app.js          DOM 更新、事件、模式、localStorage
.nojekyll              GitHub Pages 靜態檔案
README.md              入口說明及 Stage 1 留存文件
STAGE2.md              本文件
TEST-REPORT.md         驗證結果與限制
tests/                 可選程式驗證，網頁不載入
scripts/preview.cjs    可選本機靜態預覽工具，不是產品後端
```

直接開啟同一網站的 `/interactive.html`。原版首頁不自動跳轉、不增加導航元件，保留已成功的畫面；互動頁設定區有返回原版的連結。

## 功能與操作

- 首次進入為 **HUD 顯示模式**，傷患 A01、HR 78、SpO₂ 98、模擬穩定。頁面背景與 HUD／數值區底色均透明。保留一個至少 52px 高的「設定／輸入」按鈕，沒有覆蓋整片 HUD 的點擊區。
- **設定／輸入模式**提供標準 HTML Text、Number、Select、Textarea。傷患編號 1–32 字；HR 0–300 整數；SpO₂ 0–100 整數；備註最多 500 字。這些是測試格式範圍，不是醫療判讀規則。
- 有效輸入立即同步 HUD；空白、非整數或超範圍數字顯示錯誤，HUD 與儲存保留上一筆有效值。空白編號亦同。透過 `textContent` 顯示資料，不當作 HTML 執行。
- 手動編輯任一傷患欄位立即暫停假資料更新（無效數值編輯亦同），避免覆蓋輸入。模式切換不會自動啟動或暫停模擬。
- 假資料預設暫停，可啟動每 2 秒／5 秒更新。啟動立即產生一筆資料，後續覆蓋 HR、SpO₂ 與狀態，保留編號與備註。穩定：HR 76–82、SpO₂ 97–99；需關注：HR 112–120、SpO₂ 91–93。狀態由情境指定，非警報演算法。
- 心電圖沿用固定 SVG 折線，非即時波形，不與 HR 同步。未使用 Canvas 繪製文字。
- 獨立互動區測試 Button 計數、文字回顯、數字驗證、Select、Checkbox、Range Slider、Textarea，模式切換另有次數回饋。測試值不改變傷患資料、不儲存，重新整理清空。
- 可調 HUD 最大寬度、文字大小、間距比例、HUD 底色不透明度、數值區底色不透明度與文字陰影；背景預設透明，可明確選綠幕／暗底比較。只有設定區有局部深色底，切回 HUD 即隱藏。

## 重置規則

| 操作 | 顯示設定 | 傷患資料 | 模擬 |
| --- | --- | --- | --- |
| 重置 HUD（未勾清除） | 1120px、文字 100%、版面比例 100%、兩層底色 0%、透明背景、陰影開啟、HUD 模式 | 保留最後有效輸入 | 暫停；頻率與情境回預設 |
| 重置 HUD（勾清除） | 同上 | 恢復 A01 範例 | 同上 |
| 恢復所有預設值 | 同上 | 恢復 A01 範例 | 同上 |

清除資料意指恢復虛構範例，不是留空。重置會儲存結果，不使用 `localStorage.clear()`，不影響同來源其他程式。獨立互動測試區只在重新載入時清空。

「CSS 縮放比例」以 `--layout-scale` 的間距尺寸倍率實作，重置為 1；不使用 `transform: scale()` 或 CSS `zoom` 放大整張頁面。宿主 Zoom、瀏覽器縮放與系統縮放不在本頁控制範圍。

## 本機儲存

localStorage key 為 `avp-hud-test.stage2.v1`。自動保存模式、最大寬度、文字與版面比例、兩層底色、背景模式、陰影、最近有效傷患資料、模擬開關、頻率與情境。重新載入時驗證後恢復，異常欄位以預設替代；不保存時間戳、獨立互動區或清除資料勾選。

儲存被禁用或配額不足時，頁面仍可操作並顯示提示，重新整理可能遺失。損壞 JSON 回預設。不同瀏覽器、App、網站來源、隱私模式與裝置不共用；不提供多分頁同步，多分頁同時操作時最後寫入者留存。

**localStorage 只保存網頁設定**，無法恢復 Translucent Transparent Style、App Zoom、visionOS 視窗實際大小、位置或朝向。它是本機明文儲存，請只輸入虛構資料。本頁沒有資料上傳、分析服務、外部 CDN／字型、後端、Unity 或感測器連接。

## CSS 注意事項與自適應策略

1. `html, body` 預設 `background: transparent !important`；沒有整頁黑底，不使用容器 `opacity: 0`，`.hud, .hud *` 保持 `opacity: 1`。
2. `.hud` 使用 `rgba(5,18,29,var(--panel-alpha))`，數值卡使用 `--metric-alpha`，預設都為 0。只改背景 alpha，不影響文字與波形。
3. **不要將 Stage 1 的 `.hud { background: transparent !important; }` 再貼入 Stage 2 的 App Override**，會覆蓋透明度滑桿。Translucent 的 Clear 若包含 `.hud` 或 `.metric`，也可能覆蓋本頁調整；需要可調底色時應讓本頁 CSS 控制。
4. 繼續使用已成功的 App Style: Transparent。不要套用 `.hud * { background: transparent !important; }` 清除所有子元素背景，會影響控制項可讀性。
5. 綠幕／暗底是明確選取的比較模式，以具體的選擇器覆寫背景；重置回透明。綠幕不會自行去背。
6. 使用 Grid、Flexbox、`clamp()`、container query 與 media query。最大寬度不超過視窗；容器寬 480px 以下單欄，舊瀏覽器有視窗 540px 以下的單欄後備。大視窗字級有上限。
7. 窗口太矮時允許垂直捲動，不壓成小字。編號與備註可換行，沒有固定頁面高度或強制鎖定長寬比；避免短視窗被固定比例裁切。不需要 ResizeObserver。
8. 控制項最小高度 52px，Checkbox 有整列 label 觸控區，保留鍵盤 focus outline；自動更新數值不透過 `aria-live` 每秒廣播打斷輸入。

## 更新現有 GitHub Pages

1. 解壓 ZIP，將 `interactive.html`、整個 `assets/` 與說明檔放入**現有 repository 的既有發布目錄**，保留 `index.html`、`.nojekyll`。可整批覆蓋本地版本再提交，不要多包一層資料夾。`tests/`、`scripts/` 是可選維護檔案。
2. 提交到目前 Pages 的發布分支；既有 `main` + `/(root)` 或 `/docs` 設定維持原樣，若來源是 `/docs`，檔案就放該目錄。
3. 等候既有 Pages deployment 成功。原版 URL 不變，互動版為 `https://帳號.github.io/現有repository/interactive.html`；若名稱為 AVP-HUD-Test，路徑即 `/AVP-HUD-Test/interactive.html`。
4. 在 Translucent Custom URL 開啟互動版，檢查標題 Stage 2 與 Style: Transparent；原版可保留作比較。若有快取，重新整理或關閉重開後檢查部署版本。

沒有 build step、npm 套件或 CDN，資源採相對路徑，適用 Pages 子路徑與 HTTPS。本次未登入 GitHub、未推送或部署遠端。

[GitHub Pages 官方說明](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)

## Windows 桌面驗收

可直接開 `interactive.html` 檢查顯示輸入，但不要把 `file://` 的儲存行為視為 Pages 驗證。若已安裝 Node，在根目錄執行 `node scripts/preview.cjs`，以 Edge／Chrome 開啟 `http://127.0.0.1:4173/interactive.html`；完成按 Ctrl+C。這只是可選本機靜態預覽，不是產品後端。

1. 初次載入確認 HUD。進入設定輸入 B02、HR 120、SpO₂ 92、需關注、多行備註，確認立即同步。
2. SpO₂ 測 0、100（接受）及 101、-1、95.5、空白（拒絕並保留前值）。HR 測 0、300、301；編號測空白及長字串。
3. 啟動模擬，再手動編輯數字，等超過間隔，應暫停不覆蓋；再啟動應繼續變動。
4. 逐項操作獨立互動區，確認各欄回饋且不改 HUD。
5. 設寬度 640px、文字 140%、底色 50%，回 HUD 並重新整理，應恢復模式／設定／資料；在設定模式重新整理也應恢復設定模式。
6. 分別測未清資料重置、勾清資料重置、恢復所有預設值，核對重置規則表。
7. 測 320、480、768、1280px 視窗與短視窗，搭配文字 140% 及最窄 HUD；允許垂直捲動，不應嚴重橫向溢位或重疊。
8. 暗底作可讀性基準，再回透明、兩層底色 0%，確認沒有全頁黑色底板。

可選程式檢查：`node tests/state.test.cjs` 與 `node tests/app.test.cjs`。後者為 DOM mock，不是完整瀏覽器驗收。

## AVP Translucent 實機測試

記錄 visionOS／Translucent 版本、URL、環境光、App Zoom／Viewport 與視窗尺寸。

1. 原版先確認既有透明效果，再以 Style: Transparent 開互動版，背景透明且兩層底色 0%。觀察真實環境、數字、文字及波形。
2. 凝視與捏合「設定／輸入」。逐一測文字、數字、Select 與多行輸入的鍵盤呼出、游標編輯及鍵盤遮擋。系統若支援語音或外接鍵盤，可額外記錄；本頁不自行追蹤眼球或實作語音辨識。
3. 獨立互動區逐項測 Button、Input、Number、Select、Checkbox、Range Slider、Textarea，記錄命中率、滑桿精細操作及回饋。
4. 按底部「完成輸入，返回 HUD」，確認表單隱藏且資料保留，再進入設定確認模式切換回饋。
5. 手動移動、縮放視窗，檢查單欄、捲動、文字清晰度及圖表重疊。網頁不能阻止系統把手被誤觸。
6. 改亂寬度、字級、底色，再重置（先保留資料，再清除資料）。**實際空間視窗大小與位置未變是預期結果。**
7. 重新整理、關閉重開，分開記錄網頁設定恢復與 App Style／實際視窗幾何恢復，不可混為同一功能。
8. 用 AVP Safari 開同一 URL 測標準表單；Safari 的視窗底色可能不同，不保證有同等透明效果。

## Translucent 公開介面研究

查核日期 2026-10-20。

- [Customization](https://github.com/arfct/translucent/wiki/Customization)：列出 Transparent／Glass、CSS Clear／Hide／Override、Zoom（初始 viewport zoom）、Viewport width。
- [Metadata and Link Format](https://github.com/arfct/translucent/wiki/Metadata-and-Link-Format)：可用 `widget` meta 或自訂連結，宣告 `style`、`size`、`min`、`max`、`zoom`、`vw` 等配置。
- [Javascript APIs](https://github.com/arfct/translucent/wiki/Javascript-APIs)：有 `widget.postMessage` bridge 與 battery 範例；本次查閱未找到即時重置空間視窗位置／尺寸的公開 action，因此不呼叫猜測的 API。

官方列出的初始配置形式如下，**本頁未自動加入**，供另外實機測試：

```html
<meta name="widget" content="?v=1&amp;style=transparent&amp;size=1120x720">
```

也有 `widget-https://…?v=1&size=1120x720` 連結形式。這是宿主載入配置，不是網頁的一鍵重置，不能保證覆寫既有視窗；參數單位、既有 Custom 設定優先序、版本差異、重新開啟是否套用都需實機驗證。不能未經驗證就宣稱 `min/max` 可鎖住學生的系統縮放。優先保留目前已成功的 Transparent 設定。

## 純網頁限制

本頁不能鎖定或重置系統視窗位置、尺寸、朝向，不能停用系統移動／縮放把手，不能用 localStorage 控制 App Style／Zoom／Viewport，也不能控制 Digital Crown、透視、沉浸、系統鍵盤布局或世界錨定。未使用 WebXR 或原生 visionOS API。

**網頁透明不等於 visionOS 視窗透明。** 端到端效果來自網頁透明背景與使用者已驗證的 Translucent Transparent Style 配合。本階段不是正式醫療系統，不供臨床判斷。
