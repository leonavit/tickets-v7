# מדריך הטמעה לחברת הפיתוח — Tickets

מסמך זה מתאר **בדיוק** איך האב־טיפוס הנוכחי בנוי, אילו ספריות בשימוש, איך העיצוב מוטמע, ואיך ה־JavaScript עובד.  
המטרה: לשחזר את חוויית המשתמש והעיצוב במערכת הייצור (React / Next / backend) בלי לנחש.

**מה זה הפרויקט:** אב־טיפוס סטטי אינטראקטיבי (HTML + CSS + JS, בלי build).  
**שפה וכיוון:** עברית, `dir="rtl"`, `lang="he"`.  
**קובץ הכניסה:** [`index.html`](../index.html)

---

## תוכן עניינים

1. [הרצה מקומית](#1-הרצה-מקומית)
2. [מה הוחלט בעיצוב (גרסה נעולה)](#2-מה-הוחלט-בעיצוב-גרסה-נעולה)
3. [מבנה הקבצים](#3-מבנה-הקבצים)
4. [ספריות JavaScript](#4-ספריות-javascript)
5. [ספריות וקבצי CSS](#5-ספריות-וקבצי-css)
6. [טוקני עיצוב (Design tokens)](#6-טוקני-עיצוב-design-tokens)
7. [כיצד להטמיע את העיצוב](#7-כיצד-להטמיע-את-העיצוב)
8. [רכיבי UI מרכזיים](#8-רכיבי-ui-מרכזיים)
9. [הנחיות JavaScript](#9-הנחיות-javascript)
10. [ניתוב ומסכים](#10-ניתוב-ומסכים)
11. [מודל נתונים](#11-מודל-נתונים)
12. [זרימת רכישה ובחירת מושבים](#12-זרימת-רכישה-ובחירת-מושבים)
13. [נכסים (Assets)](#13-נכסים-assets)
14. [נקודות שבירה (Breakpoints)](#14-נקודות-שבירה-breakpoints)
15. [נגישות ותנועה מופחתת](#15-נגישות-ותנועה-מופחתת)
16. [מיפוי לייצור](#16-מיפוי-לייצור)
17. [מה לא לכלול בייצור](#17-מה-לא-לכלול-בייצור)

---

## 1. הרצה מקומית

אין npm / webpack / Vite. פתיחה דרך שרת סטטי (לא `file://`, בגלל מודולים ווידאו):

```bash
python3 -m http.server 8000
# ואז: http://127.0.0.1:8000/index.html
```

`intro.html` הוא מסך הקדמה ישן לסקירת UX בלבד — **לא חלק מהמוצר הנעול**.

---

## 2. מה הוחלט בעיצוב (גרסה נעולה)

האב־טיפוס כלל בעבר פאנל «הגדרות אתר» להדגמה מול הלקוח. הפאנל **הוסר**. הערכים הבאים הם ברירת המחדל הקבועה:

| נושא | ערך נעול |
|------|----------|
| פלטה | כהה בלבד (`body.theme-palette-dark`) |
| לוגו | `assets/images/logo.png` בכל המשטחים (האדר, תפריט מובייל, פוטר) |
| מבנה כרטיסיות | **מופעים פופולריים מיוחד**: Cover Flow + כרטיס פליפ בדסקטופ (≥961px). בשאר הקרוסלות ובקטלוג — כרטיס רגיל |
| אנימציית כותרות | Staggered Letters (פיצול לאותיות + `gsap.from`) |
| מועדים בעמוד מופע | כמות בינונית: 5 מועדים בזמינות גבוהה + נמוכה + אזלו + פרה־סייל |
| שער התחברות לאתר | אין (האתר נפתח ישירות) |

אין לבחור בין גרסאות לוגו, פלטות בהירות, או מבני כרטיסיות חלופיים.

---

## 3. מבנה הקבצים

```
index.html                 ← SPA: האדר/פוטר קבועים + כל המסכים כ־.screen
css/
  styles.css               ← ליבה: טוקנים, האדר, כרטיסים, טפסים, פוטר, מובייל
  home2.css                ← הירו סליידר (hero-v2)
  home3.css                ← פריסת האדר v3: לוגו/ניווט, חיפוש בשורה נפרדת
  seats-hall.css           ← מפת אולם, זום, סיכום בחירה
  intro.css                ← רק intro.html (לא לייצור)
js/
  app.js                   ← נתונים מדומים, ניתוב, כרטיסים, סל, מועדים, קרוסלות
  seats-hall.js            ← בחירת אזור/מושבים באולם המקומי
  home2-hero.js            ← סליידר הירו
  header-search-toggle.js  ← פתיחה/סגירת חיפוש בהאדר + תפריט מובייל (GSAP)
  search-dropdowns.js      ← דרופדאונים למיקום/קטגוריה
  text-animations.js       ← אנימציית כותרות
  category-lottie.js       ← אייקוני קטגוריה Lottie
  category-carousel.js     ← קרוסלת קטגוריות במובייל
  vendor/gsap.min.js       ← GSAP 3.12.7
  vendor/ScrollTrigger.min.js
  vendor/lottie.min.js     ← lottie-web (bodymovin)
  seatsio/                 ← POC ל־Seats.io
  seatmap/                 ← POC ל־Seatmap.pro + fallback
  data/venue-seats.js      ← נתוני אולם מדומים
assets/
  images/logo.png          ← הלוגו היחיד
  images/favicon.png
  icons/                   ← SVG להאדר, כרטיסים, רשתות
  events/1.jpg … 48.jpg    ← תמונות מופעים לפי id
  hero/                    ← סליידים, וידאו רקע, ניוזלטר
  lottie/                  ← JSON/JS של אנימציות קטגוריה
  categories/              ← SVG קטגוריה (גיבוי)
```

סדר טעינת CSS ב־`index.html` (חובה לשמור את הסדר — קבצים מאוחרים דורסים מוקדמים):

1. `css/styles.css`
2. `css/seats-hall.css`
3. `css/home2.css`
4. `css/home3.css`

סדר טעינת JS (חובה — תלויות):

1. `https://cdn.lordicon.com/lordicon.js`
2. `js/app.js`
3. `js/seats-hall.js`
4. `js/home2-hero.js`
5. `js/vendor/gsap.min.js`
6. `js/header-search-toggle.js` (דורש `window.gsap`)
7. `js/search-dropdowns.js`
8. `js/vendor/ScrollTrigger.min.js`
9. `js/text-animations.js` (דורש GSAP; רושם ScrollTrigger אם קיים)
10. `js/vendor/lottie.min.js`
11. `assets/lottie/music-notes.js` → `window.CATEGORY_LOTTIE_MUSIC`
12. `assets/lottie/standup-mic.js` → `window.CATEGORY_LOTTIE_STANDUP`
13. `assets/lottie/culture-mic.js` → `window.CATEGORY_LOTTIE_CULTURE`
14. `assets/lottie/sports-ball.js` → `window.CATEGORY_LOTTIE_SPORTS`
15. `assets/lottie/kids-cannon.js` → `window.CATEGORY_LOTTIE_KIDS`
16. `js/category-lottie.js`
17. `js/category-carousel.js`

---

## 4. ספריות JavaScript

**אין React / Vue / jQuery / lodash.** הכל Vanilla JS ב־IIFE.

### 4.1 GSAP 3.12.7 — מקומי

| קובץ | תפקיד |
|------|--------|
| `js/vendor/gsap.min.js` | ליבת האנימציה. רישיון: [GSAP Standard License](https://gsap.com/standard-license) |
| `js/vendor/ScrollTrigger.min.js` | תוסף גלילה. נרשם ב־`text-animations.js` אם קיים |

**איפה בשימוש בפועל:**

- `js/text-animations.js` — `gsap.from` על אותיות כותרת (`y: 50`, `stagger: 0.03`, `duration: 0.6`, `ease: "back.out(1.7)"`). כותרות מוסתרות עד כניסה ל־viewport (`.gsap-text-pending { opacity: 0 }`). באדג' «המכירה בקרוב»: `gsap.to` גלי (Wavy Baseline).
- `js/header-search-toggle.js` — אנימציית כפתור חיפוש; כניסת לוגו בתפריט מובייל (`y: 48 → 0`).

בייצור: להתקין `gsap@3.12.7` (או תואם 3.12) ולשמור את אותם פרמטרים. אם אין רישיון Club, ה־Standard License מכסה שימוש באתר.

### 4.2 lottie-web (bodymovin) — מקומי

`js/vendor/lottie.min.js` חושף `window.lottie`.

טעינה: `lottie.loadAnimation({ container, renderer: "svg", loop: false, autoplay: false, animationData })`.

מפתחות גלובליים אחרי טעינת קבצי הנתונים:

| מפתח DOM `data-category-lottie-key` | משתנה גלובלי |
|-------------------------------------|--------------|
| `music` | `window.CATEGORY_LOTTIE_MUSIC` |
| `standup` | `window.CATEGORY_LOTTIE_STANDUP` |
| `culture` | `window.CATEGORY_LOTTIE_CULTURE` |
| `sports` | `window.CATEGORY_LOTTIE_SPORTS` |
| `kids` | `window.CATEGORY_LOTTIE_KIDS` |

התנהגות חובה:

- פריים 0 שקוף — במנוחה לעצור **בפריים האחרון** (`goToAndStop(last)`).
- בסקשן «מה תרצו לראות היום» צבע סגול ב־JSON מוחלף ללבן (`recolorLottiePurpleToWhite`).
- ניגון ב־hover / כניסה ל־viewport; במובייל — ניגון לפריט שבמרכז הקרוסלה.

### 4.3 Lordicon — CDN

```html
<script src="https://cdn.lordicon.com/lordicon.js"></script>
```

Web Component: `<lord-icon src="https://cdn.lordicon.com/….json" …>`.

| מזהה קובץ | שימוש | צבעים בפרוטוטייפ |
|-----------|--------|-------------------|
| `nhvkplrv.json` | כפתור «למופעים בקטגוריה» בקרוסלות (נוצר ב־`renderHome`) | `primary:#ffffff,secondary:#ffffff` |
| `jqgudngh.json` | אייקון קטגוריית ילדים בדף הבית (כרטיס אחד) | `primary:#ffffff,secondary:#e72173` |
| `rhmbrqqg.json` | מסך הצלחת רכישה | לבן מלא, `trigger="loop"` |
| `ojbonimq.json` | כרטיס טלפון ביצירת קשר | `primary:#ffffff,secondary:#e72173` |
| `xldbursn.json` | כפתור חזרה לראש הפוטר | `primary:#ffffff`, `state="hover-slide"` |

בייצור: אפשר להמשיך ב־CDN או להוריד JSON מקומית. לשמור `colors` ו־`trigger` כמו באב־טיפוס.

### 4.4 Seats.io — אופציונלי (POC)

CDN לפי אזור, למשל `https://cdn-eu.seatsio.net/chart.js`.  
הגדרה: `js/seatsio/config.js` → `window.TicketsSeatsioConfig`.  
מתאם: `js/seatsio/adapter.js`.  
**אסור** לשים secret key בפרונט. מפתח workspace ציבורי בלבד.  
פירוט: [`docs/SEATSIO-POC-REPORT.md`](SEATSIO-POC-REPORT.md).

### 4.5 Seatmap.pro — אופציונלי (POC)

```
https://cdn.jsdelivr.net/npm/@seatmap.pro/renderer/+esm
```

הגדרה: `js/seatmap/config.js`. ברירת מחדל `mode: "auto"` — בלי מפתחות נופל ל־fallback מקומי.  
פירוט: [`docs/SEATMAP-PRO-REPORT.md`](SEATMAP-PRO-REPORT.md).

### 4.6 Google Fonts — Assistant

נטען מתוך `css/styles.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&display=swap');
```

משקלים בשימוש: 300–800. משקל טיפוסי לכותרות/כפתורים: **800**.

בייצור: `@font-face` עצמי או אותו `@import`, עם `font-display: swap`.

---

## 5. ספריות וקבצי CSS

**אין Bootstrap, Tailwind, Normalize או Reset חיצוני.**  
יש CSS מותאם במלואו + `@import` לגופן.

| קובץ | אחריות |
|------|---------|
| `styles.css` | `:root` טוקנים, טיפוגרפיה, האדר/ניווט/מגה־תפריט, כרטיסי מופע, קרוסלות, פוטר, טפסים, מובייל, אנימציות GSAP (`.gsap-char`) |
| `home2.css` | `.hero.hero-v2` — שכבות סליידים, טקסט, נקודות התקדמות |
| `home3.css` | `.site-header-v3` — שורת לוגו/ניווט + שורת חיפוש כ־overlay מתחת להאדר |
| `seats-hall.css` | מפת האולם, זום, פאנל סיכום, מובייל sticky |

כללים גלובליים שחייבים להישאר:

```css
html { overflow-x: hidden; }
body { margin: 0; font-family: var(--font); background: var(--bg); color: var(--page-fg); }
.screen { display: none; }
.screen.active { display: block; }
.hidden { display: none !important; }
```

רוחב תוכן:

- רגיל: `.container` = `min(1400px, calc(100% - 36px))`
- הירו מופע / רכישה / התחברות: `min(1160px, calc(100% - 36px))`

פינות כרטיסים וכפתורים: `--radius: 16px` לרכיבים גדולים; כפתורים `border-radius: 11px`; כרטיס מופע `17px`.

---

## 6. טוקני עיצוב (Design tokens)

ערכים **נעולים** מתוך `:root` ב־`css/styles.css` (הפלטה הכהה):

```css
:root {
  --font: 'Assistant', Arial, sans-serif;
  --bg: #03051A;              /* רקע body */
  --surface: #ffffff;         /* משטחי כרטיס/טופס לבנים */
  --ink: #03051A;             /* טקסט על רקע בהיר (כרטיסים) */
  --page-fg: #f5f2ff;         /* טקסט על רקע כהה */
  --muted: #a8a4b8;
  --line: #3d3560;
  --dash: #b0aec0;
  --search-bg: #03051A;
  --header-bg: #03051A;
  --header-fg: #ffffff;
  --carousel-bg-a: #03051A;
  --carousel-bg-b: #03051A;
  --categories-bg: #03051A;
  --footer-bg: #03051A;
  --carousel-heading-a: #ffffff;
  --carousel-btn-a: #f00358;
  --carousel-heading-b: #ffffff;
  --carousel-btn-b: #f00358;
  --chrome-bg: #03051A;
  --soft: #1d1640;
  --dark: #232321;
  --brand-dark: #f00358;
  --brand-pink: #f00358;
  --brand-border: #f00358;
  --brand-gradient: #f00358;  /* מילוי אחיד — לא גרדיאנט דו־צבעי */
  --radius: 16px;
  --shadow: 0 12px 34px rgba(0,0,0,.08);
  --header-search-h: 0px;
}
```

צבעי מותג קשיחים שמופיעים גם מחוץ לטוקנים:

| שימוש | ערך |
|--------|------|
| מותג / כפתור ראשי / כותרות קטגוריה | `#f00358` |
| קו תחתון בהאדר (גרדיאנט שקוף→ורוד→שקוף) | `#f00358` ב־42%–58% |
| לב מועדפים פעיל | `#fc226b` |
| WhatsApp | `#25d366` |
| כרטיס קטגוריה (גבול) | `1px solid #f00358`, רקע `#0a0d26` |
| כרטיס מופע (גבול) | `#2b2d3d` על רקע לבן |

**חשוב:** `--ink` כהה במכוון — כרטיסי המופע לבנים עם טקסט כהה, גם כשהאתר כהה.

גוף העמוד חייב לכלול:

```html
<body class="theme-palette-dark">
```

יש כללי CSS שתלויים במחלקה הזו (ניווט אזור אישי, קטגוריות, כותרות related).

---

## 7. כיצד להטמיע את העיצוב

### 7.1 שלב א׳ — שלד המסמך

```html
<html lang="he" dir="rtl">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" type="image/png" href="assets/images/favicon.png">
```

במסך מושבים האב־טיפוס מחליף זמנית ל־`maximum-scale=1, user-scalable=no` (`setSeatsPageZoomLock`). בייצור: לשקול חלופה נגישה יותר, אבל הזום במפה דורש מניעת pinch כפול עם הדפדפן.

### 7.2 שלב ב׳ — העברת טוקנים

להעתיק את בלוק `:root` כלשונו ל־CSS של הייצור (או ל־theme object ב־JS שמייצר את אותם custom properties על `document.documentElement`).  
לא לערבב פלטה בהירה.

### 7.3 שלב ג׳ — האדר (חובה v3)

המבנה הנעול:

```
header.site-header.site-header-v3
  .header-top-row          ← גובה 74px, רקע --header-bg
    .container.header-inner  ← grid: 1fr auto 1fr  (לוגו | ניווט | פעולות)
  .header-search-row       ← position:absolute מתחת לשורה; לא דוחף את ההירו
```

- לוגו: `<img src="assets/images/logo.png" alt="Tickets">`, גובה `40px`, `object-fit: contain`.
- אייקוני האדר (חיפוש/משתמש/עגלה): SVG שחור → לבן ב־CSS:

```css
.header-actions .header-button img {
  filter: brightness(0) invert(1);
}
```

- קו ורוד דק בתחתית `.header-top-row::after` (גרדיאנט אופקי).
- ניווט ממורכז; פעולות בצד הנגדי ללוגו (ב־RTL: לוגו בימין, פעולות בשמאל).

חיפוש: לא בשורה קבועה מתחת להירו. הוא **פאנל נפתח** (`#headerSearchRow.is-open`). בדף הבית, אחרי גלילה ≥100px הפאנל מקבל שטיפה שקופה (`color-mix` עם `--search-bg`).

### 7.4 שלב ד׳ — טיפוגרפיה

| רכיב | גודל / משקל |
|------|-------------|
| ניווט ראשי | 21.6px, weight 600 |
| כותרת הירו | `clamp(42px, 6vw, 70px)` |
| כותרת סקשן קרוסלה | 34px, weight 800, צבע `--carousel-heading-*` |
| שם קטגוריה בכרטיס | 35px (בית) / 28px (מגה־תפריט), weight 800, צבע `#f00358` |
| כותרת כרטיס מופע | weight 800 על `--ink` |
| כפתור `.btn` | weight 800, padding `11px 17px`, radius 11px |

קו תחתון לקישורים (ניווט, מגה, פוטר): `background-image: linear-gradient(currentColor, currentColor)` שמתרחב ב־hover מימין לשמאל (מתאים ל־RTL).

### 7.5 שלב ה׳ — כפתורים

```css
.btn.primary {
  background: var(--brand-gradient, #f00358);
  color: #fff;
  border-color: var(--brand-border, #f00358);
}
.btn.secondary { background: #fff; color: #1d104a; }
.btn.wide { width: 100%; }
```

אין גרדיאנט ורוד־סגול דו־צבעי. המילוי אחיד `#f00358`.

### 7.6 שלב ו׳ — העברת רכיבים לפי מחלקות

להעתיק מחלקות 1:1 מהאב־טיפוס (או למפות ב־design system עם אותם שמות). הרכיבים הקריטיים מפורטים בסעיף 8.  
אם עובדים ב־React: כל בלוק HTML עם המחלקות הקיימות + CSS כמו שהוא, ורק אחר כך לפצל לקומפוננטות.

### 7.7 שלב ז׳ — RTL

- `dir="rtl"` על `html`.
- Grid/flex כבר מתיישרים אוטומטית.
- חיצים בקרוסלה: ב־RTL `scrollBy({ left: negative })` לדפדוף «הבא» — כך זה ממומש ב־`initCarousels`.
- Cover Flow: `offset * 172px` על ציר X — לבדוק ויזואלית ב־RTL אחרי מיגרציה.

### 7.8 שלב ח׳ — אימות ויזואלי

לפני סגירת ספרינט עיצוב, להשוות מול האב־טיפוס:

1. האדר כהה, לוגו 40px, קו ורוד.
2. הירו עם טקסט ממורכז אנכית ושלוש נקודות התקדמות.
3. חמש קטגוריות עם אייקון Lottie ושם ורוד.
4. סקשן «הכי פופולריים» ב־Cover Flow בדסקטופ.
5. קרוסלות נוספות כרטיס לבן רגיל.
6. פוטר כהה עם אותו לוגו.

---

## 8. רכיבי UI מרכזיים

### 8.1 כרטיס מופע רגיל — `.event-card`

מבנה:

```
article.event-card
  .event-media          ← גובה 220px, img cover
    .favorite-btn       ← לב, שמאל עליון
    .presale-ribbon     ← רק אם isFullPresale
  .event-body
    h3
    ul.event-facts      ← מיקום + טווח תאריכים
    .event-availability ← נקודה ירוקה/כתומה + טקסט
    .event-footer
      .price
      button.btn.primary
```

מדיניות זמינות באב־טיפוס (דמו): `id % 2 === 0` → נמוכה, אחרת גבוהה. בייצור: מהשרת.

### 8.2 כרטיס פליפ — `.event-card-flip`

רק בסקשן הפופולרי בדסקטופ.

```
article.event-card.event-card-flip
  .event-card-inner          ← transform-style: preserve-3d; hover → rotateY(180deg)
    .event-card-face.event-card-front  ← תמונה + כותרת + תאריך
    .event-card-face.event-card-back   ← גוף כרטיס מלא
```

`perspective: 1200px`. מתחת ל־960px אין פליפ ב־hover (ובכל מקרה Cover Flow כבוי).

### 8.3 Cover Flow — דסקטופ בלבד

תנאי: `window.matchMedia('(min-width:961px)')`.

מחלקות על הקרוסלה: `event-carousel popular-coverflow-carousel popular-flip-carousel`.  
על הסקשן: `popular-coverflow-section flip-cards-section popular-flip-section`.

לוגיקה ב־`initCoverflowCarousels` (`js/app.js`):

- כרטיס פעיל במרכז; עד 3 כרטיסים לכל צד נראים.
- `translateX(offset * 172px) translateZ(-abs * 90px) rotateY(offset * -10deg) scale(max(0.7, 1 - abs * 0.1))`
- גרירה אופקית / חיצים / קליק על כרטיס צדדי מחליפים מרכז.
- מתחת ל־961px: אותה רשימה הופכת לקרוסלה אופקית רגילה (כרטיסים לא־פליפ).

בשינוי רוחב דרך ה־breakpoint האב־טיפוס קורא שוב ל־`renderHome()` + `initCarousels()`.

### 8.4 קרוסלה רגילה

`.carousel-shell` > `.event-carousel` (CSS grid אוטומטי לרוחב כרטיס) + `.carousel-side-arrow.prev/.next`.  
חיצים `disabled` בקצוות (`syncCarouselArrows`). גרירת pointer בדסקטופ.

### 8.5 קטגוריות

חמישה כרטיסים: מוזיקה, סטנדאפ, תרבות, ילדים, ספורט.  
לחיצה: `data-category="music|standup|culture|kids|sports"` → סינון קטלוג.

במובייל (≤960px): קרוסלה אינסופית (`category-carousel.js`), פריט אמצעי ממורכז בטעינה (תרבות, אינדקס 2), autoplay כל 5 שניות (נעצר באינטראקציה / `prefers-reduced-motion`).

### 8.6 הירו בית

`.hero.hero-v2` (שכבות מלאות) בתוך פריסת v3.  
מרווח: `js/home2-hero.js`, `INTERVAL = 5500`.  
אירוע אחרי החלפת שקופית: `tickets:heroSlide` (כדי שאנימציית הכותרת תרוץ מחדש).

### 8.7 שורות מועדים — `.show-row`

עמוד מופע, טאב «מועדים»:

- תאריך גדול (`font-size: 2em`) + יום/שעה + אולם.
- סטטוס: `high-stock-label` / `low-stock-label` / `sold-out-label` (צהוב מסובב) / שעון פרה־סייל.
- `data-show-action="seats|queue|waitlist|presale-interest"`.

זמינות נמוכה → אוברליי תור (`#queueOverlay`). לחיצה על רקע ריק מדלגת למושבים.  
אזלו → מודל רשימת המתנה.

### 8.8 מגה־תפריט קטגוריות

`.nav-item.has-mega` נפתח ב־hover/focus-within בדסקטופ.  
רקע כהה שקוף + blur. חמש עמודות עם כרטיס קטגוריה + קישורים.

---

## 9. הנחיות JavaScript

### 9.1 דפוס כללי

כל מודול הוא IIFE. אין מערכת מודולים (`import`/`export`) מלבד Seatmap.pro ESM בטעינה דינמית.  
`app.js` עטוף ב־`(function(){ … })();` ומשתנים פנימיים לא מיוצאים, מלבד כמה `window.*` למושבים.

### 9.2 ניתוב — חובה לשחזר את החוזה

פונקציה: `route(id, fromHash)`.

- מסך = `location.hash` בלי `#`, חלק ראשון לפני `/`.
- כל מסך הוא `<section class="screen" id="…">`. פעיל = מחלקה `active`.
- `data-route="events"` על קישור/כפתור קורא ל־`route('events')`.
- `tickets` ב־hash ממופה ל־`account` + טאב `tickets`.

אלgorיתם:

1. להסיר `active` מכל `.screen`.
2. להוסיף `active` ל־`#${screen}` או `#home`.
3. `body.seats-flow-active` כש־`screen === 'seats'`.
4. נעילת זום בדף מושבים.
5. סגירת חיפוש בהאדר במסכי `event` / `seats`.
6. סנכרון הירו בזרימת רכישה (`seats|cart|login|details|payment`).
7. `history.pushState` / `replaceState` לפי `fromHash`.
8. ב־`home`: גלילה לראש (`lockHomeScrollTop`). במעבר מסך אחר: גלילה לראש.

האזנה: `hashchange` + `popstate`.

### 9.3 מאפייני data (API של ה־DOM)

| מאפיין | פעולה |
|--------|--------|
| `data-route` | ניווט למסך |
| `data-open-event="{id}"` | פתיחת עמוד מופע (שומר `sessionStorage.ticketsActiveEventId`) |
| `data-favorite-id` | הוספה/הסרה ממועדפים |
| `data-category` | סינון קטלוג + מעבר ל־`#events` |
| `data-show-action` | seats / queue / waitlist / presale-interest |
| `data-account-tab` | טאב באזור אישי |
| `data-events-range` | all / today / week / month |
| `data-category-lottie-key` | music / standup / culture / sports / kids |
| `data-remove-cart` | הסרת פריט מהסל |
| `data-logout` | טוסט התנתקות (דמו) |
| `data-auth-switch` | login / register במסך התחברות לרכישה |

### 9.4 אירועים מותאמים

| אירוע | מתי | מאזינים |
|-------|-----|---------|
| `tickets:homeRendered` | סוף `renderHome()` | `text-animations.js` מרענן כותרות |
| `tickets:heroSlide` | החלפת שקופית הירו | אנימציית כותרת הירו |
| `tickets:presaleBadge` | אחרי `syncEventPage` | אנימציית באדג' פרה־סייל |

בייצור: אחרי רינדור מחדש של קרוסלות הבית **חובה** לפלוט אירוע שקול, אחרת הכותרות לא יונפשו / יישארו שקופות (`.gsap-text-pending`).

### 9.5 אחסון מקומי (דמו בלבד)

| מפתח | סוג | תוכן |
|------|-----|------|
| `ticketsFavorites` | localStorage | מערך id־ים |
| `ticketsCartV6` | localStorage | פריטי סל `{ id, eventId, title, image, seat, price }` |
| `ticketsActiveEventId` | sessionStorage | מופע פתוח |
| `ticketsCartHoldEndsV6` | sessionStorage | תום השהיית 10 דקות למושבים |

עמלת שירות בדמו: 5 ₪ לפריט. קופון: כל מחרוזת לא־ריקה נותנת 10% מהסכום (לפני עמלה) — אין רשימת קופונים אמיתית.

### 9.6 רנדור בית — חוקים

`renderHome()` ב־`js/app.js`:

- סדר סקשנים: פופולריים → קרובים → סטנדאפ → ילדים → ספורט → תרבות.
- סקשנים זוגיים/אי־זוגיים מקבלים `.section` / `.section.alt` (אותו רקע כהה בפלטה הנעולה, אבל הכותרות/כפתורים משתמשים בזוג טוקנים A/B).
- פופולריים: עד 12 כרטיסים; אם חסרים — השלמה ממופעים אחרים.
- Cover Flow + פליפ **רק** אם פופולריים **וגם** דסקטופ.
- כפתור «למופעים בקטגוריה» עם Lordicon לבן.

אחרי הרנדור: `initCarousels()` (Cover Flow + גרירה).

### 9.7 אנימציית טקסט — פרטים מדויקים

סלקטורים:

- הירו פעיל: `.hero-v2-text.is-active h1`
- כותרות קרוסלה: `#homeSections .section-header .heading-icon h2`
- כותרת קטגוריות: `.categories-section .section-header h2`

פיצול: כל תו ב־`<span class="gsap-char">`, רווח עם `.is-space`.  
`aria-label` על הכותרת המקורית.  
אם `prefers-reduced-motion: reduce` — בלי אנימציה, טקסט מלא מיד.

### 9.8 חיפוש בהאדר

`js/header-search-toggle.js`:

- מובייל לחיפוש/תפריט: `max-width: 1179px`.
- תפריט המבורגר: פאנל `.mobile-nav`, אנימציית לוגו מלמטה.
- סגירה ב־Escape, ב־route, בהתנתקות.

`js/search-dropdowns.js`: ב־`max-width: 900px` הפאנלים מועברים ל־`document.body` (`position: fixed`) כדי שלא ייחתכו תחת blur/transform של ההאדר.

### 9.9 קרוסלת קטגוריות מובייל

`max-width: 960px`. שיבוט כרטיסים ללולאה אינסופית. אחרי שיבוט: לאפס `data-lottie-bound` ולקרוא ל־`refreshCategoryLotties` אם קיים.

---

## 10. ניתוב ומסכים

| Hash | `id` של `.screen` | תוכן |
|------|-------------------|------|
| `#home` | `home` | הירו, קטגוריות, קרוסלות, ניוזלטר |
| `#events` | `events` | קטלוג + פילטר תאריך |
| `#event` / `#event/dates` / `#event/info` | `event` | מופע: מועדים / מידע |
| `#seats` | `seats` | בחירת אזור ומושבים |
| `#cart` | `cart` | סל + קופון + טיימר 10 דק׳ |
| `#login` | `login` | התחברות/הרשמה **לרכישה** (לא שער אתר) |
| `#details` | `details` | פרטי מזמין |
| `#payment` | `payment` | תשלום דמו |
| `#success` | `success` | אישור + ניוזלטר |
| `#account` / `#account/tickets` וכו׳ | `account` | אזור אישי |
| `#tickets` | ממופה ל־`account/tickets` | |
| `#contact` | `contact` | צור קשר |
| `#faq` | `faq` | שאלות נפוצות |
| `#regulations` | `regulations` | תקנון |
| `#privacy` | `privacy` | פרטיות |
| `#terms` | `terms` | תנאי שימוש |
| `#accessibility` | `accessibility` | נגישות |

זרימת רכישה המצופה:

```
מופע → מועד → [תור / המתנה] → מושבים → סל → התחברות → פרטים → תשלום → הצלחה
```

טאבי אזור אישי (`data-account-tab`): `tickets` | `favorites` | `orders` | `profile`  
פאנלים: `#ticketsPanel`, `#favoritesPanel`, `#ordersPanel`, `#profilePanel`.

---

## 11. מודל נתונים

אובייקט מופע באב־טיפוס (`js/app.js` מערך `events`):

```ts
{
  id: number;                 // 1…48, תואם assets/events/{id}.jpg
  title: string;
  category: string;           // "מופעים פופולריים" | "מופעים קרובים" | "סטנדאפ" | "ילדים" | "ספורט" | "תרבות"
  genre: string;              // לסינון קטלוג
  city: string;
  venue: string;
  date: string;               // "DD.MM.YYYY"
  time: string;               // "HH:MM"
  price: number;              // 0 = כניסה חופשית
  availability: string;
  image?: string;             // אופציונלי; ברירת מחדל לפי id
  isFullPresale?: boolean;
  presaleStartAt?: string;    // ISO
  subtitle?: string;
  dates?: { d: string; m: string; time?: string }[];
}
```

מיפוי קטגוריה ל־`data-category`:

```
music → genre === 'מוזיקה'
standup → סטנדאפ
culture → תרבות
kids → ילדים
sports → ספורט
popular → category === 'מופעים פופולריים'
upcoming → category === 'מופעים קרובים'
```

תמונה: `assets/events/${id}.jpg`. גלריית פוסטר: התמונה + שתי תמונות id הבאות מודולו 48.

בייצור: להחליף את המערך ב־API, **לשמור** את שמות השדות שכרטיס/עמוד מופע מצפים להם או לעשות adapter.

---

## 12. זרימת רכישה ובחירת מושבים

שלוש שכבות אפשריות:

1. **אולם מקומי (ברירת מחדל ויזואלית באב־טיפוס)** — `js/seats-hall.js` + SVG מניפה. מחירים 199 / 259. סינון נגישות, זום, מסך מלא. כלל: לא להשאיר מושב יחיד ריק (`hasOrphanEmptySeat`).
2. **Seats.io** — אם יש `workspaceKey` + `eventKey`.
3. **Seatmap.pro** — אם יש `publicKey` + `eventId`.

`js/data/venue-seats.js` מגדיר אולם דמו, מחלקות מחיר (169–319), ועמלה 5 ₪.

טיימר סל: 10 דקות מבחירת מושבים. ב־0: איפוס בחירה + טוסט.

מסך התחברות `#login` הוא **שלב ברכישה**, לא שער לאתר.

---

## 13. נכסים (Assets)

| נתיב | שימוש |
|------|--------|
| `assets/images/logo.png` | הלוגו היחיד |
| `assets/images/favicon.png` | favicon + apple-touch-icon |
| `assets/icons/*.svg` | חיפוש, משתמש, עגלה, לב, מיקום, לוח שנה, שעון, PDF, רשתות, וכו׳ |
| `assets/events/{1-48}.jpg` | תמונות כרטיס/פוסטר |
| `assets/hero/slide-1.jpg` (+ סליידים נוספים בהירו) | הירו בית |
| `assets/hero/events-bg.mp4` + `.png` | רקע עמוד קטלוג/צור קשר |
| `assets/hero/event-bg.mp4` | רקע עמוד מופע וזרימת רכישה |
| `assets/hero/newsletter-bg.jpg` | בלוק ניוזלטר / הצלחה |
| `tickets/*.pdf` | כרטיסים דיגיטליים לדוגמה |

לוגו: לא להחליף בגרסאות ישנות (`logo-cutout` וכו׳ — הוסרו).

---

## 14. נקודות שבירה (Breakpoints)

להשתמש **באותם** ערכים, לא ב־768/1024 גנריים.

| רוחב | מה קורה |
|------|---------|
| **≥961px** | Cover Flow לפופולריים; האדר 74px; 4 עמודות קטלוג; 5 כרטיסים בקרוסלה |
| **≤1179px** | האדר 60px; לוגיקת חיפוש/תפריט מובייל ב־`header-search-toggle.js` |
| **≤960px** | תפריט המבורגר; קרוסלת קטגוריות; 2 עמודות קטלוג; כרטיסי קרוסלה ~חצי רוחב; Cover Flow/פליפ כבויים; פוטר בעמודות מוערמות |
| **≤900px** | דרופדאוני חיפוש ב־portal ל־`body`; הסתרת חיצי קרוסלה בחלק מהכללים |
| **≤640px / 600px** | עמודה אחת לקטלוג; כיווץ שעונים וטפסים |

גובה האדר:

- דסקטופ: **74px** קשיח (`.header-inner`, `.nav-trigger`)
- ≤1179px: **60px** (`.site-header-v3 .header-inner`)

---

## 15. נגישות ותנועה מופחתת

חובה לכבד:

```css
@media (prefers-reduced-motion: reduce) { … }
```

ו־`matchMedia('(prefers-reduced-motion: reduce)')` ב־JS:

- בלי GSAP על כותרות / לוגו מובייל / באדג'.
- בלי autoplay הירו מתקדם עם אנימציית טבעת (יש נתיב סטטי).
- בלי autoplay קרוסלת קטגוריות.
- פוסטר מופע בלי interval אם reduce.

עוד באב־טיפוס:

- `aria-label` על לוגו, חיצים, מועדפים, שורות מועדים.
- נקודות זמינות עם `title`.
- פיצול אותיות: `aria-hidden` על הספאנים, `aria-label` על הכותרת.

צבעי סטטוס:

- זמינות גבוהה — נקודה ירוקה.
- זמינות נמוכה — כתומה.
- אזלו — תווית צהובה מסובבת (`rotate(-6deg)`).

---

## 16. מיפוי לייצור

המלצת הטמעה פרקטית:

1. **לייצר Design Tokens** (CSS variables או theme) 1:1 מהטבלה בסעיף 6.
2. **להעתיק את ארבעת קבצי ה־CSS** כבסיס, או לפצל לקומפוננטות תוך שמירת שמות מחלקות בשלב הראשון.
3. **לבנות Layout**: `html[dir=rtl]` + האדר v3 + `.screen` / router מקביל.
4. **לחבר GSAP + Lottie + Lordicon** באותם פרמטרים.
5. **להחליף `events[]` ב־API**; לשמור חוזה השדות לכרטיס.
6. **להחליף סל/מועדפים/רכישה** ב־backend; לשמור את סדר המסכים והטיימר.
7. **לבחור ספק מושבים** (מקומי / Seats.io / Seatmap.pro) מאחורי adapter — ה־UI של הסיכום נשאר זהה.

ספריות מומלצות לייצור (מקבילות למה שיש כאן):

| באב־טיפוס | בייצור |
|-----------|---------|
| GSAP 3.12.7 + ScrollTrigger | `gsap` + `ScrollTrigger` אותה גרסה |
| lottie-web | `lottie-web` / `lottie-react` |
| Lordicon CDN | אותו CDN או JSON מקומי |
| Assistant מ־Google Fonts | אותם משקלים |
| Seats.io / Seatmap.pro | לפי בחירת מוצר, מאחורי אותו adapter |

אין צורך ב־CSS framework. אם מוסיפים Tailwind — להגדיר את הטוקנים ב־`theme.extend` **לפי הערכים כאן**, לא לפי ברירות Tailwind.

---

## 17. מה לא לכלול בייצור

- פאנל «הגדרות אתר» / בחירת לוגו / פלטה בהירה.
- `intro.html` כחלק מהמוצר.
- נתונים מדומים ומפתחות POC בצד הלקוח מעבר למפתח ציבורי של מפת מושבים.
- תלות ב־`localStorage` כמקור אמת לסל אחרי שיש שרת.
- README הישן מזכיר `index2.html` / `index3.html` / מצב הדגמה — **לא בגרסה הנעולה**. הקובץ החי הוא `index.html` עם `home3` + `hero-v2`.

---

## נספח א׳ — Lordicon: הטמעה

```html
<script src="https://cdn.lordicon.com/lordicon.js"></script>

<lord-icon
  src="https://cdn.lordicon.com/nhvkplrv.json"
  trigger="loop"
  state="hover-scale"
  colors="primary:#ffffff,secondary:#ffffff"
  style="width:28px;height:28px">
</lord-icon>
```

ב־React: `import lottie from 'lottie-web'` + ספריית Lordicon הרשמית, או `<lord-icon>` אחרי טעינת הסקריפט ב־`_document` / layout.

## נספח ב׳ — GSAP כותרות (העתק מדויק)

```js
gsap.from(charSpans, {
  y: 50,
  opacity: 0,
  stagger: 0.03,
  duration: 0.6,
  ease: "back.out(1.7)",
  immediateRender: true,
  overwrite: true,
});
```

להפעיל רק כשהאלמנט נכנס ל־viewport (`IntersectionObserver`, threshold ≈ 0.35). עד אז: `opacity: 0` על הכותרת השלמה.

## נספח ג׳ — מסמכים נלווים

- [`docs/SEATSIO-POC-REPORT.md`](SEATSIO-POC-REPORT.md) — מפת מושבים Seats.io
- [`docs/SEATMAP-PRO-REPORT.md`](SEATMAP-PRO-REPORT.md) — Seatmap.pro
- [`AUDIT.md`](../AUDIT.md) — אודיט ישן יותר; במקרה של סתירה **הקוד הנוכחי וקובץ זה גוברים**
