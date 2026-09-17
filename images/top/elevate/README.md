# ELEVATE「一歩先へ」画像

## HEROの空写真

`sky-blue.jpg` はPexelsの青空写真をローカル保存したものです（2400 × 1188）。出典：https://www.pexels.com/photo/white-cloudy-blue-sky-at-daytime-216596/ 。HEROではCSSによるトリミングとスクロール連動の表示範囲変更を行います。以下の人物写真とは異なり、生成画像ではありません。以前の `sky.jpg` は未使用です。

内蔵 `image_gen` で新規生成したイメージ写真です。実在社員の写真ではありません。生成PNGは元の保存場所に残し、サイトにはJPEG（1536 × 1024、品質86）として保存しています。JPEG変換以外の画像加工は行っていません。トリミングはCSSのobject-fit/background-sizeで行います。

- `people.jpg`：前を向く人物。HERO右端、お仕事紹介。
- `team.jpg`：自然なチームの会話。HERO左端、人材事業。
- `technology.jpg`：技術者の仕事風景。HERO中央、DX事業。

## 最終生成プロンプト

### people.jpg

Use case: photorealistic-natural. Create one landscape 3:2 editorial photograph for a Japanese staffing and technology company website, ELEVATE. A Japanese woman around 30 in a pale blue blouse, waist-up, walking confidently through a bright modern office atrium, candid three-quarter profile looking toward the upper right, natural small optimistic smile, authentic skin texture, dark shoulder-length hair. Quiet glass architectural lines, soft morning daylight, off-white concrete, light blue sky reflections. Premium understated Japanese corporate editorial photography, warm human feeling, cool neutral whites and pale blue color grade, no exaggerated stock-photo posing. Subject near center, enough room above head and around shoulders for portrait cropping. Absolutely NO text, lettering, logos, watermark, graphic effects, borders or collage. This is a single full-bleed real-looking photograph. Return a saved image asset usable in the local website project.

### team.jpg

Use case: photorealistic-natural. Asset: full-bleed 3:2 landscape editorial photograph for Japanese staffing company ELEVATE. Three Japanese professionals ages late 20s to early 40s having a friendly practical work discussion at a light oak desk in a contemporary bright office, one woman in off-white knit and two men in relaxed navy and light blue shirts. Candid real teamwork, focus on attentive expressions, working hands, notebook and a laptop with indistinct screen, no staged handshake or looking into camera. Soft window daylight, pale blue and ivory tones, subtle natural film texture, premium quiet Japanese corporate editorial style. Medium-wide framing with people grouped near center and usable space around edges, clean modern glass interior. Realistic anatomy. Single photograph, no collage, no typography, no readable screen text, no logos, no watermark, no purple decorative shapes.

### technology.jpg

Use case: photorealistic-natural. A single landscape 3:2 premium Japanese editorial photograph for the technology side of ELEVATE staffing and DX website. Close thoughtful working scene: Japanese male software engineer age early 30s in light blue cotton shirt, three quarter side view at a clean pale oak desk using a silver laptop and large monitor, his face visible naturally on the right side of composition, hands naturally typing, sunlight through glass, soft out-of-focus modern office behind, off-white and slate blue colors matching a calm human-centered corporate campaign. Monitor shows abstract blurred application windows without legible writing. Show technology as a normal tool, not sci-fi. Real skin texture, relaxed focus, candid not posed, clean generous composition, convincing editorial photography. No text, logos, watermarks, blue holograms, neon, purple shapes, borders, collage.
