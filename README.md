# 消防設備士 甲種第4類 学習ノート（初期版）

個人利用向けのスマホ対応PWAスターターです。学習履歴はIndexedDBに保存し、サーバーへ送信しません。

## 現在含まれるもの
- 1問ずつの演習とまとめて解答
- 即時採点・解説表示
- 回答履歴と分野別正答率
- 間違い復習・苦手分野からの演習
- ブックマーク
- JSONバックアップ・復元
- 問題JSONの取り込み
- PWA設定（インストール・オフラインキャッシュの基礎）
- 初期サンプル問題12問（独自作成の動作確認用。公式過去問ではなく、全範囲を網羅しない）

## 必要環境
Node.js 20.19+ または 22.12+ を推奨。

## 起動
```bash
npm install
npm run dev
```
ターミナルに表示されたローカルURLを開いてください。

## ビルド確認
```bash
npm run build
npm run preview
```

## Cloudflare Pagesへの公開
1. このフォルダーをGitHubリポジトリに登録。
2. Cloudflare PagesでGitHubリポジトリを接続。
3. Build command: `npm run build`
4. Build output directory: `dist`
5. 公開後、HTTPSのURLをスマホで開き、ブラウザの「ホーム画面に追加」を実行。

このアプリはURLにアクセスできる人ならアプリ自体を開けます。問題データも配信物に含まれます。学習履歴は端末内保存です。アクセス制限が必要な情報は保存しないでください。

## 問題JSON形式
JSON配列、または `{ "questions": [...] }` を取り込めます。各問題に以下の項目を指定してください。
```json
{
  "id": "unique-id",
  "category": "基礎的知識（電気）",
  "kind": "オリジナル類題",
  "type": "choice",
  "prompt": "問題文",
  "choices": ["選択肢A", "選択肢B"],
  "answer": 0,
  "explanation": "解説",
  "source": "出典・根拠",
  "verified": false
}
```
`answer` は選択肢の0始まりの番号です。IDが同じ問題を取り込むと上書きされます。法令・規格を含む問題は、根拠資料・確認日・改正影響の記録を整備してから本格利用してください。

## 初期版の制約・未完了項目
- 初期問題は動作確認用であり、受験対策としての網羅性や法令の最新性を保証しません。
- 模擬試験は初期問題から科目別に抽出するデモです。実際の公式出題数・配点・実技形式を正確に再現するには、公式資料を確認したうえで問題バンクを拡充する必要があります。
- 試験時間カウントダウン、実技の記述・製図の本格採点、問題の年度フィルター、復習間隔の最適化、端末間同期は未実装です。
- IndexedDBはブラウザのストレージ削除等で消える可能性があるため、定期的にバックアップしてください。
- ビルド・実機・Cloudflareへのデプロイは、このZIP作成時点では実行確認していません。


## 画像付き・記述式問題データ

問題JSONでは `type` (`choice` / `numeric` / `written`)、`imageUrl`、`imageUrls`、`answerStatus` (`verified` / `unconfirmed` / `needs_review`) を使用できます。`verified: false` または `answerStatus` が未確認・要確認の問題は採点対象外として表示し、正誤を学習履歴に保存しません。

画像は `imageUrl` / `imageUrls` に data URL として含めると、ブラウザのIndexedDB内に保存でき、GitHubリポジトリへ参考書画像を追加せずに済みます。参考書画像や問題本文を公開する場合は、利用許諾・著作権を確認してください。

例:
```json
[{"id":"custom-kantei-001","category":"鑑別","kind":"過去問参考","type":"written","prompt":"画像の機器名を答えなさい。","imageUrls":["data:image/jpeg;base64,..."],"answer":"機器名","explanation":"確認済みの解説","source":"出典・ページなど","verified":true,"answerStatus":"verified"}]
```
