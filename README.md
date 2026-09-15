# ELEVATE サイト初期構成

添付のサイトマップに合わせた19ページの静的HTML・CSS・JavaScriptの初期セットです。ビルドは不要です。TOPのインタビューには同梱のSwiperを使用します。本文・画像・フォームの送信処理は未実装です。

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
| AI導入サービス AI-LINK | `/service/ai/` | `service/ai/index.html` |
| お仕事紹介をご希望の方 | `/introduction/` | `introduction/index.html` |
| 総合人材派遣サービス | `/introduction/staffing/` | `introduction/staffing/index.html` |
| フリーランスエンジニア ELEVATE | `https://elevate-works.jp/lp/` | 外部の既存LPへ遷移 |
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

AI-LINKはサービス階層を揃え、`service/ai/index.html` としています。旧ファイルからは新しいURLへ転送します。

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

フォームページも現時点では初期HTMLのみです。公開前に各ページの内容、正式な会社情報、入力項目・バリデーション・送信先を実装してください。

## 共通ホバーアニメーション

`commn/css/common.css` で管理します。各ページで以下のクラスを付けて使います。

```html
<!-- 画像だけを0.3秒で少し薄くする（子孫のimgが対象） -->
<a class="hover-image" href="service/index.html">
  <img src="images/top/service-card-01.webp" alt="サービス内容">
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

- 本文の見出し・文章・画像・フォーム行は、画面に入ったとき一度だけ左右からフェードインします。複数要素は少しずつ時間をずらします。`data-reveal` を付けた親要素はまとまりとして動かし、`data-reveal="left"` / `"right"` で方向を指定できます。
- PCのホイール操作には軽い慣性を加え、共通背景・装飾にはパララックスを適用します。フォームや内側のスクロール、拡大操作は標準動作を維持します。スマホと動きを減らす設定では慣性・パララックスを無効にします。
- 各ページの最初の`h1`はマスクが開くように表示し、主要CTAはマウス位置へわずかに追従します。
- サービス・事業・インタビュー系のカードは、カーソル位置に応じた浅い3D傾斜と光沢を表示します。任意の要素には`data-tilt`、対象外にするカードには`data-no-tilt`を指定できます。
- 丸い背景装飾はカーソルへ遅れて追従します。内部ページへの移動時は紫のグラデーションで画面をつなぎ、同一ページのアンカー・外部リンク・別タブは通常どおり動作します。任意のリンクを対象外にする場合は`data-no-transition`を指定します。
- `hover-lift`：ホバー・キーボードフォーカス時に4px浮き上がります。
- 共通ヘッダーは `position: sticky` で上部に固定し、スクロールすると影を表示します。アンカーリンクの位置は実際のヘッダー高に合わせて調整します。

処理は `commn/js/common.js`、スタイルは `commn/css/common.css` で管理します。動きを減らす設定では登場アニメーションを省略します。JavaScript無効時も本文は表示されます。

## 社員インタビュー

Swiper 12.1.4（MIT）を `commn/vendor/swiper/` に同梱しています。
公式ガイド：https://swiperjs.com/get-started

`index.html` の `.swiper-wrapper` 内に `.swiper-slide` とカードを追加します。
カードの `data-interview` は1からの連番とし、`js/script.js` の `stories` に対応する3つの回答を追加してください。
画像・タイトル・職種はカードからモーダルに反映されます。4・5枚目は既存画像を再利用した仮カードで、全モーダルの本文はサンプルです。

PCは3枚、タブレットは2枚、スマートフォンは約1枚を表示します。矢印・ページネーション・スワイプで操作できます。
モーダルは閉じるボタン、背景クリック、Escキーで閉じ、元のカードにフォーカスを戻します。

NEWSは遷移しないテキスト表示です。ページトップボタンはFV下端が固定ヘッダーの下に入ると右下に表示されます。SCROLLアイコンはホバー・フォーカス時に下へ6px動きます。

## TOPのオープニング

`css/loading.css` と `js/loading.js` で管理します。同じタブで最初にTOPを開いたときだけ約6秒再生します。`sessionStorage` に記録し、再読み込み・他ページからの再訪・SKIP後は省略します。
「人の力と技術力。」「働く未来を創造する。」→粒子の飛散→「働くその先へ」→本文の順で表示します。
Canvasの文字ピクセルを粒子の座標に変換しています。文言は `first` と `last`、タイミングは `draw` 内で変更できます。
SKIP・Escで終了できます。動きを減らす設定では省略し、JavaScript無効時も本文を表示します。描画エラーや8秒経過時にも終了します。

## セクションの装飾背景

TOPの背景は現在、bodyの `page-art` クラスでページ全体に固定配置しています。各セクションの `section-art` は外し、共通の一枚を見せています。濃度は `--page-art-opacity`（PC: 0.65、スマートフォン: 0.45）で変更できます。FVのメインビジュアル・ヘッダー・フッターは既存の背景を重ねて表示します。

SP（767px以下）のページ共通背景は `images/common/section-background-sp.webp` に切り替わります。

HERO内の高さ・文字・ボタン・余白は `clamp()` で下限と上限を持たせています。中間幅で過度に縮小したり、幅広のスマートフォンで過大になったりしない設定です。SPは縦並びと画像の縦横比から高さが決まります。

## SPメニュー

767px以下では本文と同じ淡い背景画像・ネイビー文字の全画面メニューを表示します。リンクの順次表示、Web登録・お問い合わせ導線、背景のスクロール停止とinert化、Tabキーのフォーカス循環、Escで閉じる操作に対応します。横向きなど高さが足りない画面ではメニュー内をスクロールできます。768px以上へ広げた際は閉じて通常ナビゲーションへ戻します。

ホバー演出は768px以上かつマウス等でホバー可能な端末に限定しています。SPではメニュー開閉・登場演出とキーボードのフォーカス表示を維持します。

## サービスサブメニュー

768px以上でヘッダーの「サービス内容」をホバーまたはキーボードフォーカスすると、総合人材派遣サービスとシステムエンジニアリングサービスへのリンクを表示します。項目は `commn/js/common.js` の `services` で、表示は `commn/css/site-shell.css` で共通管理しています。

## 浮遊する背景画像

TOPの `.floating-background` 内に6枚の装飾画像を配置しています。`commn/css/common.css` の各 `nth-child` で位置・サイズ・濃度・移動距離・周期を変更できます。17〜26秒の異なる周期で緩やかに浮遊します。SPは小さく薄くし、動きを減らす設定では静止します。メニュー・モーダル・ローディング中は一時停止します。表示用画像は `images/common/floating-orb-01.webp` 〜 `06.webp` です。

TOPと共通背景は表示用にWebPを使用し、元のPNGは再編集用ソースとして残しています。
