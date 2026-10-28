# GitHub Pagesで無料公開する手順

## 1. 新しい公開リポジトリを作成
GitHubで **New repository** を選び、名前を `fire-equipment-4-study`、公開範囲を **Public** にして作成します。READMEや.gitignoreなどは追加せず空のリポジトリにします。

## 2. このフォルダーの中身をアップロード
このZIPを展開し、`fire-equipment-4-study` フォルダーの**中身すべて**をリポジトリのルートへアップロードします。`.github/workflows/deploy.yml` も含めてください。

## 3. GitHub Pagesを有効化
リポジトリの **Settings → Pages → Build and deployment** を開き、Sourceを **GitHub Actions** にします。

## 4. デプロイを確認
**Actions** タブで `Deploy study app to GitHub Pages` の実行を開き、build/deployが成功したらURLを開きます。通常は `https://<GitHubユーザー名>.github.io/fire-equipment-4-study/` 形式です。

## 重要
- 公開するのはソースコードとサンプル問題です。公開リポジトリに秘密情報を入れないでください。
- 学習履歴はブラウザ内に保存する設計です。ブラウザデータ消去や端末変更に備えて、アプリ内のバックアップ機能を使ってください。
- サンプル問題は動作確認用であり、公式過去問として検証されたものではありません。
- GitHub Actionsがビルドエラーを報告した場合、Actionsのログを確認して修正が必要です。
