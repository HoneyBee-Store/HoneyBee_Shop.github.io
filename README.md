# Khaled Ehmaide — Portfolio

Static personal portfolio. No build step, no dependencies to install — open `index.html` and it runs.

Live at: https://kihmeidi.github.io/

## Folder structure

```
khaled-portfolio/
├── index.html
├── .nojekyll
├── README.md
└── assets/
    ├── Khaled_Ehmaide_CV.pdf   (already in place)
    ├── css/style.css
    ├── js/main.js
    └── img/
        └── profile.png         <- optional, see below
```

No screenshots are needed. The project cards use designed cover graphics instead, because the
underlying systems are internal.

## Optional polish

- **`assets/img/profile.png`** — your headshot. Without it the hero shows a blue "KE" monogram,
  which looks deliberate rather than broken.
- **Skill chips** — search `Uncomment` in `index.html`. Angular, TypeScript, PostgreSQL, MongoDB,
  Docker, Linux, AWS, Kafka, Git and Postman are commented out because they are not on the CV.
  Re-enable whichever you actually use.
- **CV PDF** — still lists "IT Solutions Now – Present". Update it so it matches the site, which
  says Umniah.

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Add portfolio site"
git branch -M main
git remote add origin https://github.com/Kihmeidi/Kihmeidi.github.io.git
git push -u origin main
```

Then: repo → Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/ (root)` → Save.

Live within a minute or two at `https://kihmeidi.github.io/`.
