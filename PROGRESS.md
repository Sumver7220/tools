# RP Lounge Manager — 開發進度

最後更新：2026-04-07

---

## 專案資訊

| 項目 | 說明 |
|------|------|
| 專案位置 | `D:/Sumver/Desktop/白飯/tools/` |
| 設計規格 | `docs/superpowers/specs/2026-04-07-rp-lounge-manager-design.md` |
| 實作計畫 | `docs/superpowers/plans/2026-04-07-rp-lounge-manager.md` |

## 技術架構

- React 18 + Vite + Tailwind CSS **v3**（鎖定 v3，npm 會自動裝 v4 不相容）
- Firebase Firestore + Firebase Auth（Email 登入）
- Cloudflare Pages 部署
- Vitest + @testing-library/react

---

## 完成進度

### Phase 1：Mock Data UI ✅

| Task | 說明 | 狀態 |
|------|------|------|
| 1 | Project Setup（Vite + Tailwind + Vitest） | ✅ |
| 2 | Salary Utilities TDD（`src/utils/salary.js`，9 tests） | ✅ |
| 3 | Date Key Utility TDD（`src/utils/dateKey.js`，3 tests） | ✅ |
| 4 | App Shell（Router + Layout + Sidebar） | ✅ |
| 5 | Employee Management Page（Mock Data） | ✅ |
| 6 | TimerCard Component TDD（5 tests） | ✅ |
| 7 | Timer Page（Mock Data） | ✅ |
| 8 | Champagne Records Page（Mock Data） | ✅ |
| 9 | Salary Calculation Page（Mock Data） | ✅ |

### Phase 2：Firebase 串接 ⏳

| Task | 說明 | 狀態 |
|------|------|------|
| 10 | Firebase Setup + Auth | ⏳ 等待使用者設定 Firebase |
| 11 | Firestore — Employee Management | ⏳ |
| 12 | Firestore — Timer Page | ⏳ |
| 13 | Firestore — Champagne Records | ⏳ |
| 14 | Firestore — Salary Page | ⏳ |

### Phase 3：部署

| Task | 說明 | 狀態 |
|------|------|------|
| 15 | Cloudflare Pages Deployment | ⏳ |

---

## Task 10 前置條件（手動步驟）

開始 Task 10 之前，需先完成以下 Firebase 設定：

1. 前往 [console.firebase.google.com](https://console.firebase.google.com) 建立新專案
2. 啟用 **Authentication → Sign-in method → Email/Password**
3. 建立 **Firestore Database**（選 test mode）
4. 前往 **Project Settings → Your apps → Web app** 複製 config
5. 在 `tools/` 根目錄建立 `.env` 檔，填入以下內容：

```
VITE_FIREBASE_API_KEY=你的值
VITE_FIREBASE_AUTH_DOMAIN=你的值
VITE_FIREBASE_PROJECT_ID=你的值
VITE_FIREBASE_STORAGE_BUCKET=你的值
VITE_FIREBASE_MESSAGING_SENDER_ID=你的值
VITE_FIREBASE_APP_ID=你的值
```

完成後告知 Claude，繼續執行 Task 10。

---

## 重要技術備註

- **React Router v7** 已安裝（計畫寫的是 v6），API 向後相容，無需修改程式碼
- **Firebase 12** 已安裝（計畫寫的是 v10），modular SDK API 相同，無需修改
- **TimerCard** 使用 `useRef`-based single interval（非計畫中的 per-render pattern，行為等效，5 tests 全過）
- **`src/test/setup.js`** 有 `asyncWrapper` patch，解決 `@testing-library/react` v16 + Vitest fake timers 相容性問題
