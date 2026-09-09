# מדריך הטמעה — Tickets

מסמך זה מתאר את האב־טיפוס שיש לשחזר במערכת הייצור: מבנה, ספריות, עיצוב וחוזי JavaScript.

**סוג הפרויקט:** אב־טיפוס סטטי (HTML + CSS + JS, בלי build).  
**שפה וכיוון:** עברית, `dir="rtl"`, `lang="he"`.  
**קובץ הכניסה:** [`index.html`](../index.html)

זהו המוצר. אין וריאציות עיצוב, אין פלטות חלופיות, ואין פאנל הגדרות.

---

## תוכן עניינים

1. [הרצה מקומית](#1-הרצה-מקומית)
2. [עיצוב — מה לבנות](#2-עיצוב--מה-לבנות)
3. [מבנה הקבצים](#3-מבנה-הקבצים)
4. [ספריות JavaScript](#4-ספריות-javascript)
5. [קבצי CSS](#5-קבצי-css)
6. [טוקני עיצוב](#6-טוקני-עיצוב)
7. [כיצד להטמיע את העיצוב](#7-כיצד-להטמיע-את-העיצוב)
8. [רכיבי UI](#8-רכיבי-ui)
9. [הנחיות JavaScript](#9-הנחיות-javascript)
10. [ניתוב ומסכים](#10-ניתוב-ומסכים)
11. [מודל נתונים](#11-מודל-נתונים)
12. [זרימת רכישה ובחירת מושבים](#12-זרימת-רכישה-ובחירת-מושבים)
13. [נכסים](#13-נכסים)
14. [נקודות שבירה](#14-נקודות-שבירה)
15. [נגישות](#15-נגישות)
16. [מיפוי לייצור](#16-מיפוי-לייצור)

---

## 1. הרצה מקומית

אין npm / webpack / Vite. להריץ שרת סטטי (לא `file://`):

```bash
python3 -m http.server 8000
# http://127.0.0.1:8000/index.html
```

---

## 2. עיצוב — מה לבנות

| נושא | מימוש |
|------|--------|
| רקע האתר | כהה: `#03051A` |
| לוגו | `assets/images/logo.png` בהאדר, תפריט מובייל ופוטר |
| כרטיסי «הכי פופולריים» בדסקטופ (≥961px) | Cover Flow + כרטיס פליפ |
| שאר הקרוסלות וקטלוג המופעים | כרטיס לבן רגיל |
| כותרות (הירו, קרוסלות, קטגוריות) | פיצול לאותיות + GSAP stagger |
| מועדים בעמוד מופע | רשימה אנכית: 5 מועדים זמינים + נמוכה + אזלו + פרה־סייל |
| כניסה לאתר | ישירה — בלי שער התחברות. מסך `#login` הוא שלב ברכישה בלבד |

---

## 3. מבנה הקבצים

```
index.html                 SPA: האדר/פוטר קבועים + כל המסכים כ־.screen
css/
  styles.css               ליבה: טוקנים, האדר, כרטיסים, טפסים, פוטר, מובייל
  home2.css                סליידר הירו בדף הבית
  home3.css                האדר: שורת לוגו/ניווט + פאנל חיפוש
  seats-hall.css           מפת אולם, זום, סיכום בחירה
js/
  app.js                   נתונים מדומים, ניתוב, כרטיסים, סל, מועדים, קרוסלות
  seats-hall.js            בחירת אזור/מושבים באולם המקומי
  home2-hero.js            סליידר הירו
  header-search-toggle.js  פתיחה/סגירת חיפוש בהאדר + תפריט מובייל (GSAP)
  search-dropdowns.js      דרופדאונים למיקום/קטגוריה
  text-animations.js       אנימציית כותרות
  category-lottie.js       אייקוני קטגוריה Lottie
  category-carousel.js     קרוסלת קטגוריות במובייל
  vendor/gsap.min.js       GSAP 3.12.7
  vendor/ScrollTrigger.min.js
  vendor/lottie.min.js     lottie-web
  seatsio/                 POC ל־Seats.io
  seatmap/                 POC ל־Seatmap.pro
  data/venue-seats.js      נתוני אולם מדומים
assets/
  images/logo.png          הלוגו
  images/favicon.png
  icons/                   SVG להאדר, כרטיסים, רשתות
  events/1.jpg … 48.jpg    תמונות מופעים לפי id
  hero/                    סליידים, וידאו רקע, ניוזלטר
  lottie/                  JSON/JS של אנימציות קטגוריה
  categories/              SVG קטגוריה (גיבוי)
```

סדר טעינת CSS ב־`index.html` (חובה — קבצים מאוחרים דורסים מוקדמים):

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

שימוש:

- `js/text-animations.js` — `gsap.from` על אותיות כותרת (`y: 50`, `stagger: 0.03`, `duration: 0.6`, `ease: "back.out(1.7)"`). כותרות מוסתרות עד כניסה ל־viewport (`.gsap-text-pending { opacity: 0 }`). באדג' «המכירה בקרוב»: `gsap.to` גלי.
- `js/header-search-toggle.js` — אנימציית כפתור חיפוש; כניסת לוגו בתפריט מובייל (`y: 48 → 0`).

בייצור: `gsap@3.12.7` (או תואם 3.12) עם אותם פרמטרים.

### 4.2 lottie-web — מקומי

`js/vendor/lottie.min.js` חושף `window.lottie`.

```js
lottie.loadAnimation({
  container,
  renderer: "svg",
  loop: false,
  autoplay: false,
  animationData,
});
```

| מפתח DOM `data-category-lottie-key` | משתנה גלובלי |
|-------------------------------------|--------------|
| `music` | `window.CATEGORY_LOTTIE_MUSIC` |
| `standup` | `window.CATEGORY_LOTTIE_STANDUP` |
| `culture` | `window.CATEGORY_LOTTIE_CULTURE` |
| `sports` | `window.CATEGORY_LOTTIE_SPORTS` |
| `kids` | `window.CATEGORY_LOTTIE_KIDS` |

התנהגות:

- פריים 0 שקוף — במנוחה לעצור **בפריים האחרון** (`goToAndStop(last)`).
- בסקשן «מה תרצו לראות היום» צבע סגול ב־JSON מוחלף ללבן (`recolorLottiePurpleToWhite`).
- ניגון ב־hover / כניסה ל־viewport; במובייל — ניגון לפריט שבמרכז הקרוסלה.

### 4.3 Lordicon — CDN

```html
<script src="https://cdn.lordicon.com/lordicon.js"></script>
```

| מזהה קובץ | שימוש | צבעים |
|-----------|--------|--------|
| `nhvkplrv.json` | כפתור «למופעים בקטגוריה» בקרוסלות | `primary:#ffffff,secondary:#ffffff` |
| `jqgudngh.json` | אייקון קטגוריית ילדים בדף הבית | `primary:#ffffff,secondary:#e72173` |
| `rhmbrqqg.json` | מסך הצלחת רכישה | לבן מלא, `trigger="loop"` |
| `ojbonimq.json` | כרטיס טלפון ביצירת קשר | `primary:#ffffff,secondary:#e72173` |
| `xldbursn.json` | כפתור חזרה לראש הפוטר | `primary:#ffffff`, `state="hover-slide"` |

### 4.4 Seats.io — אופציונלי (POC מושבים)

CDN לפי אזור, למשל `https://cdn-eu.seatsio.net/chart.js`.  
הגדרה: `js/seatsio/config.js` → `window.TicketsSeatsioConfig`.  
מתאם: `js/seatsio/adapter.js`.  
**אסור** לשים secret key בפרונט. מפתח workspace ציבורי בלבד.  
פירוט: [`docs/SEATSIO-POC-REPORT.md`](SEATSIO-POC-REPORT.md).

### 4.5 Seatmap.pro — אופציונלי (POC מושבים)

```
https://cdn.jsdelivr.net/npm/@seatmap.pro/renderer/+esm
```

הגדרה: `js/seatmap/config.js`. ברירת מחדל `mode: "auto"` — בלי מפתחות נופל לאולם המקומי.  
פירוט: [`docs/SEATMAP-PRO-REPORT.md`](SEATMAP-PRO-REPORT.md).

### 4.6 Google Fonts — Assistant

נטען מתוך `css/styles.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700;800&display=swap');
```

משקלים: 300–800. משקל טיפוסי לכותרות/כפתורים: **800**.

---

## 5. קבצי CSS

**אין Bootstrap, Tailwind, Normalize או Reset חיצוני.** CSS מותאם + `@import` לגופן.

| קובץ | אחריות |
|------|---------|
| `styles.css` | `:root` טוקנים, טיפוגרפיה, האדר/ניווט/מגה־תפריט, כרטיסי מופע, קרוסלות, פוטר, טפסים, מובייל, `.gsap-char` |
| `home2.css` | `.hero.hero-v2` — שכבות סליידים, טקסט, נקודות התקדמות |
| `home3.css` | `.site-header-v3` — שורת לוגו/ניווט + שורת חיפוש כ־overlay מתחת להאדר |
| `seats-hall.css` | מפת האולם, זום, פאנל סיכום, מובייל sticky |

שמות המחלקות `hero-v2` / `site-header-v3` הם שמות הקוד בפועל — זה המימוש היחיד.

כללים גלובליים:

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

פינות: `--radius: 16px` לרכיבים גדולים; כפתורים `11px`; כרטיס מופע `17px`.

---

## 6. טוקני עיצוב

מתוך `:root` ב־`css/styles.css`:

```css
:root {
  --font: 'Assistant', Arial, sans-serif;
  --bg: #03051A;
  --surface: #ffffff;
  --ink: #03051A;
  --page-fg: #f5f2ff;
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
  --brand-gradient: #f00358;  /* מילוי אחיד */
  --radius: 16px;
  --shadow: 0 12px 34px rgba(0,0,0,.08);
  --header-search-h: 0px;
}
```

| שימוש | ערך |
|--------|------|
| מותג / כפתור ראשי / כותרות קטגוריה | `#f00358` |
| קו תחתון בהאדר (שקוף→ורוד→שקוף) | `#f00358` ב־42%–58% |
| לב מועדפים פעיל | `#fc226b` |
| WhatsApp | `#25d366` |
| כרטיס קטגוריה | גבול `1px solid #f00358`, רקע `#0a0d26` |
| כרטיס מופע | גבול `#2b2d3d` על רקע לבן |

`--ink` כהה במכוון: כרטיסי המופע לבנים עם טקסט כהה, על אתר כהה.

---

## 7. כיצד להטמיע את העיצוב

### 7.1 שלד המסמך

```html
<html lang="he" dir="rtl">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" type="image/png" href="assets/images/favicon.png">
<body>
```

במסך מושבים האב־טיפוס מחליף זמנית ל־`maximum-scale=1, user-scalable=no` (`setSeatsPageZoomLock`) כדי שהזום במפה לא יתנגש עם pinch של הדפדפן.

### 7.2 טוקנים

להעתיק את בלוק `:root` כלשונו (או לייצר אותם על `document.documentElement`).

### 7.3 האדר

```
header.site-header.site-header-v3
  .header-top-row          ← גובה 74px בדסקטופ, רקע --header-bg
    .container.header-inner  ← grid: 1fr auto 1fr  (לוגו | ניווט | פעולות)
  .header-search-row       ← position:absolute מתחת לשורה; לא דוחף את ההירו
```

- לוגו: `<img src="assets/images/logo.png" alt="Tickets">`, גובה `40px`, `object-fit: contain`.
- אייקוני האדר (חיפוש/משתמש/עגלה):

```css
.header-actions .header-button img {
  filter: brightness(0) invert(1);
}
```

- קו ורוד דק בתחתית `.header-top-row::after`.
- ב־RTL: לוגו בימין, פעולות בשמאל, ניווט ממורכז.

חיפוש: פאנל נפתח (`#headerSearchRow.is-open`). בדף הבית, אחרי גלילה ≥100px הפאנל מקבל שטיפה שקופה (`color-mix` עם `--search-bg`).

### 7.4 טיפוגרפיה

| רכיב | גודל / משקל |
|------|-------------|
| ניווט ראשי | 21.6px, weight 600 |
| כותרת הירו | `clamp(42px, 6vw, 70px)` |
| כותרת סקשן קרוסלה | 34px, weight 800, צבע `--carousel-heading-*` |
| שם קטגוריה בכרטיס | 35px (בית) / 28px (מגה־תפריט), weight 800, צבע `#f00358` |
| כותרת כרטיס מופע | weight 800 על `--ink` |
| כפתור `.btn` | weight 800, padding `11px 17px`, radius 11px |

קו תחתון לקישורים (ניווט, מגה, פוטר): `background-image: linear-gradient(currentColor, currentColor)` שמתרחב ב־hover מימין לשמאל (RTL).

### 7.5 כפתורים

```css
.btn.primary {
  background: var(--brand-gradient, #f00358);
  color: #fff;
  border-color: var(--brand-border, #f00358);
}
.btn.secondary { background: #fff; color: #1d104a; }
.btn.wide { width: 100%; }
```

מילוי אחיד `#f00358` — לא גרדיאנט דו־צבעי.

### 7.6 רכיבים

להעתיק מחלקות 1:1 מהאב־טיפוס בשלב הראשון. ב־React: HTML + CSS כמו שהם, ורק אחר כך לפצל לקומפוננטות.

### 7.7 RTL

- `dir="rtl"` על `html`.
- חיצים בקרוסלה: ב־RTL `scrollBy({ left: negative })` לדפדוף «הבא».
- Cover Flow: `offset * 172px` על ציר X — לבדוק ויזואלית אחרי מיגרציה.

### 7.8 אימות ויזואלי

1. האדר כהה, לוגו 40px, קו ורוד.
2. הירו עם טקסט ממורכז אנכית ושלוש נקודות התקדמות.
3. חמש קטגוריות עם אייקון Lottie ושם ורוד.
4. סקשן «הכי פופולריים» ב־Cover Flow בדסקטופ.
5. קרוסלות נוספות — כרטיס לבן רגיל.
6. פוטר כהה עם אותו לוגו.

---

## 8. רכיבי UI

### 8.1 כרטיס מופע — `.event-card`

```
article.event-card
  .event-media          ← גובה 220px, img cover
    .favorite-btn
    .presale-ribbon     ← רק אם isFullPresale
  .event-body
    h3
    ul.event-facts
    .event-availability
    .event-footer
      .price
      button.btn.primary
```

בדמו: `id % 2 === 0` → זמינות נמוכה. בייצור: מהשרת.

### 8.2 כרטיס פליפ — `.event-card-flip`

רק בסקשן הפופולרי בדסקטופ.

```
article.event-card.event-card-flip
  .event-card-inner
    .event-card-face.event-card-front
    .event-card-face.event-card-back
```

`perspective: 1200px`. hover → `rotateY(180deg)`. מתחת ל־960px בלי פליפ.

### 8.3 Cover Flow — דסקטופ בלבד

תנאי: `window.matchMedia('(min-width:961px)')`.

מחלקות: `event-carousel popular-coverflow-carousel popular-flip-carousel` על הקרוסלה; `popular-coverflow-section` על הסקשן.

`initCoverflowCarousels` ב־`js/app.js`:

- כרטיס פעיל במרכז; עד 3 כרטיסים לכל צד.
- `translateX(offset * 172px) translateZ(-abs * 90px) rotateY(offset * -10deg) scale(max(0.7, 1 - abs * 0.1))`
- גרירה / חיצים / קליק על כרטיס צדדי.
- מתחת ל־961px: קרוסלה אופקית רגילה, בלי פליפ.

במעבר דרך ה־breakpoint: `renderHome()` + `initCarousels()` מחדש.

### 8.4 קרוסלה רגילה

`.carousel-shell` > `.event-carousel` + `.carousel-side-arrow.prev/.next`.  
חיצים `disabled` בקצוות. גרירת pointer בדסקטופ.

### 8.5 קטגוריות

חמישה כרטיסים: מוזיקה, סטנדאפ, תרבות, ילדים, ספורט.  
`data-category="music|standup|culture|kids|sports"` → סינון קטלוג.

במובייל (≤960px): קרוסלה אינסופית (`category-carousel.js`), פריט אמצעי ממורכז בטעינה (תרבות), autoplay כל 5 שניות (נעצר באינטראקציה / `prefers-reduced-motion`).

### 8.6 הירו בית

`.hero.hero-v2.hero-v3`. מרווח שקופית: `INTERVAL = 5500` ב־`js/home2-hero.js`.  
אחרי החלפה: אירוע `tickets:heroSlide`.

### 8.7 שורות מועדים — `.show-row`

- תאריך גדול (`font-size: 2em`) + יום/שעה + אולם.
- סטטוס: `high-stock-label` / `low-stock-label` / `sold-out-label` / שעון פרה־סייל.
- `data-show-action="seats|queue|waitlist|presale-interest"`.

זמינות נמוכה → אוברליי תור (`#queueOverlay`); לחיצה על רקע ריק מדלגת למושבים.  
אזלו → מודל רשימת המתנה.

### 8.8 מגה־תפריט קטגוריות

`.nav-item.has-mega` נפתח ב־hover/focus-within בדסקטופ. רקע כהה שקוף + blur. חמש עמודות.

---

## 9. הנחיות JavaScript

### 9.1 דפוס

כל מודול הוא IIFE. אין `import`/`export` מלבד Seatmap.pro ESM בטעינה דינמית.

### 9.2 ניתוב

`route(id, fromHash)`:

- מסך = `location.hash` בלי `#`, חלק ראשון לפני `/`.
- כל מסך: `<section class="screen" id="…">`. פעיל = מחלקה `active`.
- `data-route="events"` קורא ל־`route('events')`.
- `tickets` ב־hash ממופה ל־`account` + טאב `tickets`.

1. להסיר `active` מכל `.screen`.
2. להוסיף `active` ל־`#${screen}` או `#home`.
3. `body.seats-flow-active` כש־`screen === 'seats'`.
4. נעילת זום בדף מושבים.
5. סגירת חיפוש בהאדר במסכי `event` / `seats`.
6. סנכרון הירו בזרימת רכישה (`seats|cart|login|details|payment`).
7. `history.pushState` / `replaceState` לפי `fromHash`.
8. ב־`home`: גלילה לראש (`lockHomeScrollTop`). במעבר מסך אחר: גלילה לראש.

האזנה: `hashchange` + `popstate`.

### 9.3 מאפייני data

| מאפיין | פעולה |
|--------|--------|
| `data-route` | ניווט למסך |
| `data-open-event="{id}"` | פתיחת עמוד מופע (`sessionStorage.ticketsActiveEventId`) |
| `data-favorite-id` | מועדפים |
| `data-category` | סינון קטלוג + `#events` |
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

אחרי רינדור מחדש של קרוסלות הבית **חובה** לפלוט אירוע שקול, אחרת הכותרות יישארו שקופות (`.gsap-text-pending`).

### 9.5 אחסון מקומי (דמו)

| מפתח | סוג | תוכן |
|------|-----|------|
| `ticketsFavorites` | localStorage | מערך id־ים |
| `ticketsCartV6` | localStorage | `{ id, eventId, title, image, seat, price }` |
| `ticketsActiveEventId` | sessionStorage | מופע פתוח |
| `ticketsCartHoldEndsV6` | sessionStorage | תום השהיית 10 דקות למושבים |

עמלת שירות בדמו: 5 ₪ לפריט. קופון: כל מחרוזת לא־ריקה = 10% מהסכום (לפני עמלה).

### 9.6 רנדור בית

`renderHome()`:

- סדר סקשנים: פופולריים → קרובים → סטנדאפ → ילדים → ספורט → תרבות.
- סקשנים זוגיים/אי־זוגיים: `.section` / `.section.alt`.
- פופולריים: עד 12 כרטיסים; אם חסרים — השלמה ממופעים אחרים.
- Cover Flow + פליפ רק בפופולריים בדסקטופ.
- כפתור «למופעים בקטגוריה» עם Lordicon לבן.

אחרי הרנדור: `initCarousels()`.

### 9.7 אנימציית טקסט

סלקטורים:

- הירו פעיל: `.hero-v2-text.is-active h1`
- כותרות קרוסלה: `#homeSections .section-header .heading-icon h2`
- כותרת קטגוריות: `.categories-section .section-header h2`

כל תו ב־`<span class="gsap-char">`, רווח עם `.is-space`, `aria-label` על הכותרת.  
אם `prefers-reduced-motion: reduce` — בלי אנימציה.

### 9.8 חיפוש בהאדר

`js/header-search-toggle.js`: מובייל לחיפוש/תפריט ב־`max-width: 1179px`. תפריט המבורגר: `.mobile-nav`. סגירה ב־Escape ובמעבר מסך.

`js/search-dropdowns.js`: ב־`max-width: 900px` הפאנלים מועברים ל־`document.body` (`position: fixed`).

### 9.9 קרוסלת קטגוריות מובייל

`max-width: 960px`. שיבוט ללולאה אינסופית. אחרי שיבוט: לאפס `data-lottie-bound` ולקרוא ל־`refreshCategoryLotties`.

---

## 10. ניתוב ומסכים

| Hash | `id` של `.screen` | תוכן |
|------|-------------------|------|
| `#home` | `home` | הירו, קטגוריות, קרוסלות, ניוזלטר |
| `#events` | `events` | קטלוג + פילטר תאריך |
| `#event` / `#event/dates` / `#event/info` | `event` | מופע: מועדים / מידע |
| `#seats` | `seats` | בחירת אזור ומושבים |
| `#cart` | `cart` | סל + קופון + טיימר 10 דק׳ |
| `#login` | `login` | התחברות/הרשמה לרכישה |
| `#details` | `details` | פרטי מזמין |
| `#payment` | `payment` | תשלום דמו |
| `#success` | `success` | אישור + ניוזלטר |
| `#account` / `#account/tickets` | `account` | אזור אישי |
| `#tickets` | ממופה ל־`account/tickets` | |
| `#contact` | `contact` | צור קשר |
| `#faq` | `faq` | שאלות נפוצות |
| `#regulations` | `regulations` | תקנון |
| `#privacy` | `privacy` | פרטיות |
| `#terms` | `terms` | תנאי שימוש |
| `#accessibility` | `accessibility` | נגישות |

זרימת רכישה:

```
מופע → מועד → [תור / המתנה] → מושבים → סל → התחברות → פרטים → תשלום → הצלחה
```

טאבי אזור אישי: `tickets` | `favorites` | `orders` | `profile`  
פאנלים: `#ticketsPanel`, `#favoritesPanel`, `#ordersPanel`, `#profilePanel`.

---

## 11. מודל נתונים

אובייקט מופע (`js/app.js`, מערך `events`):

```ts
{
  id: number;                 // 1…48, תואם assets/events/{id}.jpg
  title: string;
  category: string;           // "מופעים פופולריים" | "מופעים קרובים" | "סטנדאפ" | "ילדים" | "ספורט" | "תרבות"
  genre: string;
  city: string;
  venue: string;
  date: string;               // "DD.MM.YYYY"
  time: string;               // "HH:MM"
  price: number;              // 0 = כניסה חופשית
  availability: string;
  image?: string;
  isFullPresale?: boolean;
  presaleStartAt?: string;    // ISO
  subtitle?: string;
  dates?: { d: string; m: string; time?: string }[];
}
```

מיפוי `data-category`:

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

בייצור: להחליף את המערך ב־API ולשמור את שמות השדות, או adapter.

---

## 12. זרימת רכישה ובחירת מושבים

1. **אולם מקומי** — `js/seats-hall.js` + SVG. מחירים 199 / 259. סינון נגישות, זום, מסך מלא. כלל: לא להשאיר מושב יחיד ריק (`hasOrphanEmptySeat`).
2. **Seats.io** — אם יש `workspaceKey` + `eventKey`.
3. **Seatmap.pro** — אם יש `publicKey` + `eventId`.

`js/data/venue-seats.js`: אולם דמו, מחלקות מחיר 169–319, עמלה 5 ₪.

טיימר סל: 10 דקות מבחירת מושבים. ב־0: איפוס בחירה + טוסט.

`#login` הוא שלב ברכישה בלבד.

---

## 13. נכסים

| נתיב | שימוש |
|------|--------|
| `assets/images/logo.png` | לוגו האתר |
| `assets/images/favicon.png` | favicon + apple-touch-icon |
| `assets/icons/*.svg` | חיפוש, משתמש, עגלה, לב, מיקום, לוח שנה, שעון, PDF, רשתות |
| `assets/events/{1-48}.jpg` | תמונות כרטיס/פוסטר |
| `assets/hero/slide-1.jpg` (+ סליידים נוספים) | הירו בית |
| `assets/hero/events-bg.mp4` + `.png` | רקע קטלוג / צור קשר |
| `assets/hero/event-bg.mp4` | רקע עמוד מופע וזרימת רכישה |
| `assets/hero/newsletter-bg.jpg` | ניוזלטר / הצלחה |
| `tickets/*.pdf` | כרטיסים דיגיטליים לדוגמה |

---

## 14. נקודות שבירה

להשתמש בערכים האלה, לא ב־768/1024 גנריים.

| רוחב | מה קורה |
|------|---------|
| **≥961px** | Cover Flow לפופולריים; האדר 74px; 4 עמודות קטלוג; 5 כרטיסים בקרוסלה |
| **≤1179px** | האדר 60px; לוגיקת חיפוש/תפריט מובייל ב־`header-search-toggle.js` |
| **≤960px** | תפריט המבורגר; קרוסלת קטגוריות; 2 עמודות קטלוג; Cover Flow/פליפ כבויים; פוטר מוערם |
| **≤900px** | דרופדאוני חיפוש ב־portal ל־`body`; הסתרת חיצי קרוסלה בחלק מהכללים |
| **≤640px / 600px** | עמודה אחת לקטלוג; כיווץ שעונים וטפסים |

גובה האדר: 74px בדסקטופ, 60px ב־≤1179px.

---

## 15. נגישות

חובה לכבד `prefers-reduced-motion`:

- בלי GSAP על כותרות / לוגו מובייל / באדג'.
- בלי autoplay הירו עם אנימציית טבעת.
- בלי autoplay קרוסלת קטגוריות.

עוד באב־טיפוס:

- `aria-label` על לוגו, חיצים, מועדפים, שורות מועדים.
- נקודות זמינות עם `title`.
- פיצול אותיות: `aria-hidden` על הספאנים, `aria-label` על הכותרת.

צבעי סטטוס: ירוק (גבוהה) / כתום (נמוכה) / תווית צהובה מסובבת (`rotate(-6deg)`) לאזלו.

---

## 16. מיפוי לייצור

1. Design Tokens 1:1 מהטבלה בסעיף 6.
2. ארבעת קבצי ה־CSS כבסיס, או פיצול לקומפוננטות תוך שמירת שמות מחלקות בשלב הראשון.
3. Layout: `html[dir=rtl]` + האדר כמו ב־`index.html` + router מקביל ל־hash.
4. GSAP + Lottie + Lordicon באותם פרמטרים.
5. להחליף `events[]` ב־API; לשמור חוזה השדות לכרטיס.
6. סל / מועדפים / רכישה ב־backend; לשמור את סדר המסכים והטיימר.
7. ספק מושבים (מקומי / Seats.io / Seatmap.pro) מאחורי adapter — ה־UI של הסיכום נשאר זהה.

| באב־טיפוס | בייצור |
|-----------|---------|
| GSAP 3.12.7 + ScrollTrigger | `gsap` + `ScrollTrigger` אותה גרסה |
| lottie-web | `lottie-web` / `lottie-react` |
| Lordicon CDN | אותו CDN או JSON מקומי |
| Assistant מ־Google Fonts | אותם משקלים |
| Seats.io / Seatmap.pro | לפי בחירת מוצר, מאחורי אותו adapter |

אין צורך ב־CSS framework. אם מוסיפים Tailwind — להגדיר את הטוקנים ב־`theme.extend` לפי הערכים כאן.

האב־טיפוס משתמש בנתונים מדומים וב־`localStorage` לסל/מועדפים. בייצור אלה מוחלפים בשרת. מפתחות POC של מפות מושבים — ציבוריים בלבד, בלי secret בפרונט.

---

## נספח א׳ — Lordicon

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

## נספח ב׳ — GSAP כותרות

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

להפעיל כשהאלמנט נכנס ל־viewport (`IntersectionObserver`, threshold ≈ 0.35). עד אז: `opacity: 0` על הכותרת.

## נספח ג׳ — מפות מושבים

- [`docs/SEATSIO-POC-REPORT.md`](SEATSIO-POC-REPORT.md)
- [`docs/SEATMAP-PRO-REPORT.md`](SEATMAP-PRO-REPORT.md)
