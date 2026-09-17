# ELEVATE サイト初期構成

添付のサイトマップに合わせた19ページの静的HTML・CSS・JavaScriptの初期セットです。ビルドは不要です。TOPのインタビューには同梱のSwiperを使用します。TOPには本文・画像を実装済みです。下層18ページは公開サイトの本文・フォーム項目を復元し、TOPに合わせた共通デザインを実装しています。フォームの送信先は既存の公開サイトを利用します（実送信は未検証）。

## 共通ファイル

ご指定の「commn」に統一しています（「common」表記のディレクトリは作成していません）。

- `commn/css/common.css`：リセット、基本レイアウト、共通ホバー、装飾背景。
- `commn/css/site-shell.css`：全ページ共通のヘッダー／フッター、パンくずリスト、スマートフォンメニュー。
- `commn/js/common.js`：共通処理（年表示、固定ヘッダー、スクロール演出）。
- `commn/template.html`：新規ページ用HTMLテンプレート。

各HTMLに日本語設定・文字コード・viewport・タイトル・description・共通ヘッダー／フッター・本文領域を配置しています。ページ固有の処理がない下層ページは、空のCSS／JavaScriptを読み込みません。ヘッダー／フッターのスタイルとスマートフォンメニュー処理は共通ファイルで管理します。HTML構造を変更する場合は各ページとテンプレートに反映してください。

## URL・ファイル一覧

| ページ | URL | HTML |
| --- | --- | --- |
| TOP | `/` | `index.html` |
| サービス内容 | `/service/` | `service/index.html` |
| 総合人材派遣サービス | `/service/staffing/` | `service/staffing/index.html` |
| 人材派遣 | `/service/staffing/staffing-agency/` | `service/staffing/staffing-agency/index.html` |
| 業務請負 | `/service/staffing/contract-work/` | `service/staffing/contract-work/index.html` |
| 人材紹介 | `/service/staffing/recruitment-agency/` | `service/staffing/recruitment-agency/index.html` |
| システムエンジニアリングサービス | `/service/engineering/` | `service/engineering/index.html` |
| AI導入サービス AI-LINK | `/service/engineering/ai-link-merged.html` | `service/engineering/ai-link-merged.html` |
| お仕事紹介をご希望の方 | `/introduction/` | `introduction/index.html` |
| 総合人材派遣サービス | `/introduction/staffing/` | `introduction/staffing/index.html` |
| フリーランスエンジニア ELEVATE | `/lp/` | `lp/index.html` |
| よくあるご質問 | `/introduction/faq/` | `introduction/faq/index.html` |
| 登録スタッフの方 | `/registered/` | `registered/index.html` |
| 前払い申請フォーム | `/advance-payment/` | `advance-payment/index.html` |
| 交通費申請フォーム | `/transportation-expenses/` | `transportation-expenses/index.html` |
| かんたんWeb登録 | `/web-registered/` | `web-registered/index.html` |
| 企業向けお問い合わせ | `/contact/` | `contact/index.html` |
| 会社概要 | `/company/` | `company/index.html` |
| プライバシーポリシー | `/privacy/` | `privacy/index.html` |

## ディレクトリと命名

各ページのディレクトリに `index.html` を配置しています。ページ固有のスタイルや処理が必要になった時点でCSS／JavaScriptを追加してください。TOP専用ファイルはルート直下の `css/style.css` と `js/script.js` です。

AI-LINKのみ添付のURLを優先し、`service/engineering/ai-link-merged.html` としています。

前払い申請・交通費申請・LPはサイトマップのURLどおりルート直下です。メニュー上の親子関係とURLのディレクトリ階層は必ずしも一致しません。

## 確認方法

`index.html` をブラウザで開くとTOPのページ一覧から全ページに移動できます。リンクはローカルで直接開ける相対パスです。

添付の `/service/` のようなURLでも確認する場合は、このフォルダで次を実行します（Python 3が必要です）。

```sh
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開きます。終了は `Ctrl+C` です。

## 編集・追加方法

1. 本文を各HTMLの `<main>` 内に追加し、タイトルとdescriptionを更新します。
2. 全ページ共通のデザインは `commn/css/common.css`、個別のデザインは各ページのCSSに記述します。
3. 共通処理は `commn/js/common.js`、個別の処理が必要な場合だけページ用JSを追加します。
4. ページ追加時は `commn/template.html` をコピーします。
5. テンプレートの相対パス（共通CSS・JS、ナビゲーション）を階層に合わせて修正します。

フォームの文言・入力項目・送信先は取得時の公開サイトに合わせています。確認画面・送信完了画面は既存サーバー側の処理に依存するため、公開前に接続確認が必要です。

## 共通ホバーアニメーション

`commn/css/common.css` で管理します。各ページで以下のクラスを付けて使います。

```html
<!-- 画像だけを0.3秒で少し薄くする（子孫のimgが対象） -->
<a class="hover-image" href="service/index.html">
  <img src="images/top/service-card-01.png" alt="サービス内容">
</a>

<!-- テキストの下線を0.3秒で左から伸ばす -->
<a class="hover-underline" href="company/index.html">会社情報</a>
```

画像単体には `<img class="hover-image" ...>` と指定できます。
時間は `--hover-duration`（初期値 `0.3s`）、画像の透明度は `--hover-image-opacity`（初期値 `0.75`）で調整できます。
キーボードのフォーカス時にも適用します。タッチ操作ではホバーを適用せず、動きを減らす設定ではアニメーションを省略します。

ヘッダー・フッターのボタンや文字ロゴには `hover-fade` を使用します。
矢印を除き文字だけに下線を付ける場合は、リンクに `hover-trigger`、文字を囲む `span` に `hover-underline` を付けます。

## スクロール・カードの動き

- `data-reveal`：画面に入ったとき、一度だけ下からフェードインします。複数要素は少しずつ時間をずらします。
- `hover-lift`：ホバー・キーボードフォーカス時に4px浮き上がります。
- 下層の共通ヘッダーは `position: sticky` で上部に固定します。TOPは固定ヘッダーを初期状態で隠し、HERO全体の下端が画面上端を通過してから表示します。アンカーリンクの位置は実際のヘッダー高に合わせて調整します。

処理は `commn/js/common.js`、スタイルは `commn/css/common.css` で管理します。動きを減らす設定では登場アニメーションを省略します。JavaScript無効時も本文は表示されます。

## 社員インタビュー

Swiper 12.1.4（MIT）を `commn/vendor/swiper/` に同梱しています。
公式ガイド：https://swiperjs.com/get-started

`index.html` の `.swiper-wrapper` 内に `.swiper-slide` とカードを追加します。
カードの `data-interview` は1からの連番とし、`js/script.js` の `stories` に対応する3つの回答を追加してください。
画像・タイトル・職種はカードからモーダルに反映されます。4・5枚目は既存画像を再利用した仮カードで、全モーダルの本文はサンプルです。

PCは3枚、タブレットは2枚、スマートフォンは約1枚を表示します。矢印・ページネーション・スワイプで操作できます。
モーダルは閉じるボタン、背景クリック、Escキーで閉じ、元のカードにフォーカスを戻します。

NEWSは遷移しないテキスト表示です。ページトップボタンはFV下端が固定ヘッダーの下に入ると右下に表示されます。HEROの下矢印からNEWSへ移動できます。

## TOPのHERO（2026年9月更新）

最初の画面は「人の力と技術力。」「働く未来を創造する。」の2行だけを中央に表示します。空写真は初期状態では完全に隠れ、スクロールすると中央から画面いっぱいに広がります。コピーが白くなってからフェードアウトし、NEWSへ続きます。以前のCanvasオープニングは読み込んでいません。

- スタイルは `css/style.css`、スクロール進行度の制御は `js/design-motion.js` で管理します。
- 空写真は `images/top/elevate/sky-blue.jpg`。出典は同ディレクトリの `README.md` に記載しています。
- HERO内の下矢印はNEWSへ移動します。OSの「動きを減らす」設定とJavaScript無効時は固定表示で、スクロールのための長い領域も設けません。
- TOPは「HERO → NEWS → サービス → お仕事紹介 → インタビュー」の順序です。
- サービスは全幅背景写真と左右交互のパネル、お仕事紹介は縦書き見出し付きの写真パネル、インタビューは中央の人物を大きく見せるカルーセルです。
- 人物のイメージ写真と生成プロンプトは `images/top/elevate/README.md` に記録しています。

## SPメニュー

767px以下では本文と同じライトグレーの背景・チャコール文字の全画面メニューを表示します。リンクの順次表示、Web登録・お問い合わせ導線、背景のスクロール停止とinert化、Tabキーのフォーカス循環、Escで閉じる操作に対応します。横向きなど高さが足りない画面ではメニュー内をスクロールできます。768px以上へ広げた際は閉じて通常ナビゲーションへ戻します。

ホバー演出は768px以上かつマウス等でホバー可能な端末に限定しています。SPではメニュー開閉・登場演出とキーボードのフォーカス表示を維持します。

## 背景装飾

HEROは空写真の表示範囲をスクロールで広げます。サービス写真は2枚目のパネルが画面に入るとクロスフェードします。

## お仕事紹介メニューの表示

`section.seekers` はタイトルと3枚の写真パネルだけで構成しています。1101px以上のマウス環境ではホバーまたはTabフォーカスで対象の写真が広がります。タブレット・スマートフォン・タッチ端末では横スクロールで全カードを読めます。リンクは通常の1回クリック／タップで遷移します。自動切り替えはありません。


## 下層ページの原文復元（2026年9月17日）

Git履歴の下層本文は初期状態のTODOだったため、`https://elevate-works.jp/` の対応する18ページを復元元としています。本文・フォーム項目は言い換えず、改行以外のテキストが一致することを検証しています。取得URL・日付・照合用テキスト・入力項目は `docs/content-baseline.json` に保存しています。元サイトにある表記ゆれ・数値・案内もそのまま残しています。

- `commn/css/subpages.css`：TOPと共通の水色・チャコール・写真・余白、サービスカード、会社概要、FAQ、フォーム、LPのレスポンシブ表示。
- `commn/js/subpages.js`：FAQ開閉、添付ファイル選択、容量チェック。
- `images/pages/`：公開サイト本文で参照していた画像を保存。
- フォームは既存の公開サイトの送信先を保持。確認画面への遷移・実送信は行っていません。住所自動補完など、旧サイト固有の外部スクリプトは読み込んでいません。
- HEROは画面全体を使い、写真を含む領域が完全に画面外へ抜けたらヘッダーを表示。非表示中はフォーカス対象からも外します。上へ戻ると再び隠れます。

検証コマンド（追加パッケージ不要）：

```sh
python3 scripts/verify-content.py
node scripts/verify-interactions.cjs
```

18ページの原文・フォーム項目・ローカルリンク・IDと、ヘッダーの表示境界・戻りスクロール・リサイズ・FAQ開閉を検証します。この環境ではブラウザ操作が許可されず、実画面でのレイアウト確認は未実施です。
