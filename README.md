# Microfinance Unidos — website

**Live at [xpohtetu-jpg.github.io/Microfinance-Unidos](https://xpohtetu-jpg.github.io/Microfinance-Unidos/)**

A static site. No build step, no dependencies, no framework. Open `index.html` in a browser and it works.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home — mission, the lending cycle, why it matters |
| `about.html` | Who we are, principles, how a cycle works, transparency commitments |
| `microfinance.html` | The educational centrepiece: what microfinance is, its history, the evidence, and honest criticisms |
| `auction.html` | How the benefit auction works and where the proceeds go |
| `partner.html` | **The page to link from outreach.** What we ask, what a business gets, contribution form, business FAQ |
| `contact.html` | Contact details and a general enquiry form |

Supporting files: `css/styles.css`, `js/main.js`, `assets/logo.svg`, `assets/favicon.svg`.

---

## Before you publish — things to check

### 1. The email address

The site uses `microfinanceunidos@gmail.com`. To change it, replace every instance:

```bash
grep -rn "microfinanceunidos@gmail.com" .
```

It appears in `partner.html` and `contact.html`, both as visible `mailto:` links and as the
`data-mailto` attribute on the two forms.

### 2. The forms

Both forms post to Formspree (`https://formspree.io/f/mjykplvw`) and submissions arrive at the site's
Gmail. A hidden `_subject` field tells them apart ("Auction contribution offer" vs "Website enquiry").

`js/main.js` posts in the background and shows a confirmation without leaving the page. If a form's
`action` is emptied, it falls back to opening the visitor's email client with the message pre-filled.

### 3. Fill in the marked placeholders

Search the HTML for `<!--` comments — each one marks a spot that needs your input:

- `about.html` — template for adding named team members
- `auction.html` — the "next auction" date/venue, and a contributor name wall once you have one
- `partner.html` — the tax-deductibility answer, to be updated once you have 501(c)(3) determination
- `contact.html` — social links and a mailing address

The site is written so it reads correctly **as-is** if you publish before filling these in. Nothing
says `[TODO]` on a live page.

---

## Deploying

**GitHub Pages is already enabled**, serving `main` from the repository root. Any push to `main`
redeploys automatically — usually live within a minute:

```bash
git add -A
git commit -m "Update copy"
git push
```

**To use your own domain** (e.g. `microfinanceunidos.org`): add it under Settings → Pages → Custom
domain, then point a CNAME record at `xpohtetu-jpg.github.io` with your registrar. Worth doing before
you email businesses — a real domain reads as more established than a github.io address, and it lets
you set up a matching email address.

**Other hosts** — Netlify or Cloudflare Pages both work; drag the folder onto the dashboard, no build
command, publish directory is the root.

To preview locally with a real server (needed only if you want clean URLs):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

---

## Editing notes

**Design tokens** live at the top of `css/styles.css` under `:root`. Changing `--clay` (the terracotta
accent) or `--pine` (the deep green) re-themes the whole site.

**The header and footer are duplicated in each HTML file.** That is deliberate — it keeps the site
dependency-free. If you change a nav link, change it in all six files:

```bash
grep -ln "nav__links" *.html
```

**Adding a stat that counts up on scroll:**

```html
<p class="stat__figure"><span data-count-to="96" data-suffix="%">96%</span></p>
```

The fallback text inside the span is what shows if JavaScript is off, so write the final value there.

**Adding an FAQ entry** — copy an existing `.accordion__item` block and give the button/panel a new
matching `id` and `aria-controls` pair.

---

## A note on the content

Every statistic on the site is attributed to a published source and linked:

- World Bank *Global Findex Database 2025* — financial inclusion and unbanked figures
- Inter-American Development Bank — MSME share of firms and the regional financing gap
- Kiva — platform figures (founding year, $25 minimum, ~96% historical repayment, 90+ countries)
- Banerjee, Karlan & Zinman (2015), *AEJ: Applied Economics* — the six randomised evaluations
- Muhammad Yunus, Nobel Peace Prize lecture, 2006 — the quotation on the home page

There are **no invented impact numbers** anywhere on the site — nothing claims a track record the
organisation does not yet have. That is a feature, not an omission: a business deciding whether to
trust a new nonprofit will check, and finding an honest "we are new, here is what we commit to"
holds up far better than a number that does not survive scrutiny.

The footer disclaimer on every page states that Microfinance Unidos is not affiliated with Kiva and
that loans earn no return. Keep it there — it is the kind of detail that makes a careful reader
decide you are legitimate.
