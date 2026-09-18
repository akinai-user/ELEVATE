# ELEVATE コーポレートサイト

人材サービスとIT・DXサービスの2事業を軸にした、静的HTMLサイトです。
実行時のフレームワーク依存はありません。Python標準ライブラリで共通テンプレートからHTMLを生成します。
既存プロジェクトはNext.jsではないため、配信方式を維持したまま共通部品を一元化しました。

## 編集・生成

- `content/pages.json`：ページ一覧・タイトル・description・パンくず。
- `content/pages/`：各ページの本文。サイト内リンクと画像はルートからのパスで記述。
- `content/services.json`：2事業・6サービスの共通データ。メガメニュー、フッター、TOP／サービスTOPのカードで使用。
- `content/redirects.json`：旧URL → 新URL。
- `templates/layout.html`：HTMLの共通枠。
- `scripts/build-site.py`：ヘッダー、フッター、サービスパネルの共通コンポーネントとHTML生成。
- `commn/css/site.css`：新しい共通デザイン・レスポンシブ。
- `commn/css/subpages.css`：再利用している詳細本文・フォームの表示。
- `commn/js/site.js`：メニュー、テキストホバー、ページトップ、相談分野の引き継ぎ。
- `commn/js/subpages.js`：FAQ・ファイル選択・容量確認。

```sh
python3 scripts/build-site.py
python3 scripts/verify-site.py
node scripts/verify-interactions.cjs
python3 -m http.server 8000
```

`http://localhost:8000/` で確認できます。生成HTMLは相対リンクのためファイルを直接開くこともできます。
**生成されたHTMLを直接編集せず、`content/` または `templates/` を更新して再生成してください。**

## サイトマップ

```text
/
├ service/
│ ├ hr/
│ │ ├ staffing/       人材派遣
│ │ ├ recruitment/    人材紹介
│ │ └ outsourcing/    業務請負
│ └ it-dx/
│   ├ engineering/    システムエンジニアリング
│   ├ ai/             AI-LINK
│   └ development/    システム開発
├ cases/              開発支援例・対応領域
├ news/               既存のお知らせ
├ company/            会社の考え方・企業情報・拠点
├ introduction/       求職者の入口
│ ├ staffing/         派遣登録から就業まで
│ └ faq/
├ lp/                 フリーランスエンジニアの案件紹介・面談登録
├ web-registered/     派遣スタッフ登録
├ registered/         登録スタッフ向けの入口
├ advance-payment/    前払い申請
├ transportation-expenses/ 交通費申請
├ contact/            法人相談
└ privacy/
```

合計23ページ。別途、旧サービス6URLは移転ページとして維持しています。
転送は静的配信に対応したmeta refreshとJavaScript（クエリ・ハッシュ維持）です。
本番サーバーの設定が利用できる場合は、`content/redirects.json` を元にHTTP 301へ置き換えられます。

## 設計・コンテンツの扱い

[見直しの理由・変更内容](docs/site-redesign.md)、[変更前のページ一覧](docs/site-before.json)を参照してください。

- サービスTOP＝2事業横断の選択、事業TOP＝3サービスの比較、個別ページ＝内容・進め方・相談。
- 法人の相談と、求職者のお仕事紹介を分離。未確認の自社採用募集や代表メッセージは作成していません。
- 支援事例は従来のシステムエンジニアリング本文にあった内容から整理。顧客名・成果数値・新規実績は創作していません。
- 確認できる自社開発プロダクトはないため、その旨を開発ページに記載しています。AI-LINKは導入支援サービスです。
- サンプル社員インタビューと長いローディング・スクロール待機演出を廃止しました。
- 会社情報の重複は会社ページへ集約。数値は従来の会社ページを継承。古いLP側の異なる数値は削除。
- LPの重複キャンペーン訴求を整理。募集案件は「紹介例」として表示。
- 添付された空写真は軽量なJPEG（約276 KB）を使っています。原本PNGも保持。
- 過去の復元元データは `docs/content-baseline.json` に参考記録として残しています。今回の本文は再設計しているため全文一致検証の対象ではありません。

## フォーム

既存のフォーム送信先・name・値を保持しています。法人フォームは相談分野を既存のmessage欄へ反映し、選択項目だけで送信できないようにしています。
登録・申請・お問い合わせの実送信は行っていません。確認画面や送信完了は外部サーバー側の処理に依存します。

## 検証

`verify-site.py` は全ページと転送先、相対リンク、アンカー、画像・CSS参照、重複ID、HTMLタグ構造、h1、既存フォームの送信先とフィールドを検証します。
`verify-interactions.cjs` はDOMモックでメニュー、Escape、フォーカス循環、リサイズ時の解除、相談分野、空本文検証、スクロール進捗、動きを減らす設定、FAQ、添付容量を検証します。

2026-09-17：実ブラウザの操作は環境の自動承認で許可されず、実画面でのPC・タブレット・スマートフォンの描画確認は未実施です。レスポンシブのCSS分岐は600/900/1100pxで実装しています。
