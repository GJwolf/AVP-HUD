# Apple Vision Pro 透明 HUD PoC

目前已套用 AVP Translucent 強制透明 CSS：頁面背景及 .hud 容器固定透明，因此下述綠幕／暗底選單與面板底色不透明度暫時不會改變外觀。設定面板、內部分隔線及文字陰影仍保留；可隱藏設定面板進行 HUD 測試。

純 HTML / CSS / JavaScript，無外部依賴、無建置步驟。全部程式在 `index.html`，可直接開啟，也可放在 GitHub Pages。內容為繁體中文。

## 功能

- 傷患 A01、HR（bpm）、SpO₂（%）與文字狀態。
- 透明、綠幕（#00FF00）、暗底三種頁面背景。
- 面板底色不透明度 0–100%、字級 85–140%、文字陰影。
- 穩定／需關注兩組模擬情境，每 2 秒或 5 秒更新，可暫停。
- 設定可收合或隱藏，提供獨立「顯示設定」按鈕；窄視窗響應式排版。
- 支援鍵盤操作與可見焦點；重新載入會恢復預設，無 cookies、分析追蹤或網路請求。

## GitHub Pages 發布（網頁操作）

1. 建立 GitHub repository，例如 `avp-hud-poc`。一般免費帳號可使用公開 repository；不要上傳真實傷患資料。
2. 解壓 ZIP，把 **index.html、README.md、.nojekyll 三個檔案**放到 repository 根目錄，再提交到 `main`。不要多包一層資料夾；若檔案選擇器隱藏 `.nojekyll`，可用 GitHub「Add file → Create new file」建立同名空檔。
3. 開啟 repository 的 **Settings → Pages**。
4. 在 **Build and deployment → Source** 選 **Deploy from a branch**。
5. Branch 選 `main`，資料夾選 **/(root)**，按 **Save**。
6. 等待部署完成；可在 Actions 檢查 `pages build and deployment`。Pages 設定頁會提供正式網址，通常為 `https://你的帳號.github.io/avp-hud-poc/`。
7. 在 AVP 瀏覽器開啟該 HTTPS 網址；之後更新 `main` 的檔案會重新部署。

`.nojekyll` 用於略過 Jekyll 處理。若遇到 404，檢查檔名大小寫 `index.html`、根目錄位置、分支及部署狀態。此專案不需要 npm、Actions 設定檔或 API 金鑰。

官方說明：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## AVP 比較流程

1. 分別在 Translucent 與 ∞Browser 開啟同一個 Pages 網址，記錄 App 版本、visionOS 版本、視窗大小、環境光及宿主的透明設定。
2. 選「透明」，把面板不透明度調到 0%，隱藏設定；觀察數字周圍是否能看到真實環境。頁首、按鈕與文字仍會存在。
3. 顯示設定，依序比較綠幕與暗底。綠幕模式下避免把綠色波形或狀態的色鍵損失誤認為網頁故障；如宿主提供色鍵容差設定，另行記錄。
4. 依環境調整面板不透明度、字級與陰影。先用穩定情境，再切換需關注情境，確認狀態文字與數值仍能清楚辨識。
5. 同時記錄「頁面背景」「宿主視窗背景」「是否有色鍵去背」三件事，避免把不同層次的效果混為一談。

## 透明限制

**網頁透明不等於 visionOS 視窗透明。** 本頁將 html/body 設為透明，但瀏覽器的原生視窗或 WebView 仍可能提供不透明底色。CSS 無法強制移除宿主背景，也不能直接取得環境攝影機影像、改變系統透視或控制 Digital Crown。

∞Browser 的開發者頁面列出 transparent widgets；實際效果仍需依安裝版本及設定實機驗證：https://arno.app/infinity_browser_presskit

Translucent 在此為測試目標，不保證任何特定版本的透明或色鍵功能。綠幕僅是實心 #00FF00 背景；**本頁沒有色鍵去背功能**。宿主若無相應功能，就只會看到綠色。暗底作為可讀性基準。

這是一般 2D 網頁，沒有 WebXR、沉浸式空間定位、世界錨點或原生 visionOS API。設定區刻意有深色底，測試純 HUD 時請隱藏設定。

## 模擬資料與使用界線

穩定示範：HR 76–82、SpO₂ 97–99；需關注示範：HR 112–120、SpO₂ 91–93。狀態由選定的情境決定，並非醫療警報演算法。波形為固定裝飾線，與數值無同步關係。暫停停止定時更新；手動切換情境仍會產生一筆新資料。

全部資料為隨機示範，不連接感測器、不儲存或上傳資料，不供診斷或臨床決策。公開 Pages 適合放此模擬 PoC，不應加入個人健康資料。

## 驗收清單

- 切換三種背景，確認頁面背景與面板透明度可分別調整。
- 暫停後等待超過更新間隔，確認時間與數字不再自動改變；繼續後恢復。
- 切換兩種情境，確認數字範圍及文字狀態改變。
- 調整字級、陰影、更新頻率，測試隱藏／顯示與重設。
- 在手機窄視窗、桌面與 AVP 分別檢查文字、控制項及橫向溢位。
- 透明透視與色鍵效果需在實際 AVP 宿主 App 驗證；桌面預覽無法證明 visionOS 的效果。
