# Portfolio Website — Vaibhav Sharma

Personal portfolio showcasing data analytics, business intelligence, and backend
engineering projects. Built with plain HTML, CSS, and JavaScript — no build step,
no dependencies.

## Structure

- `index.html` — single-page site (hero, about, skills, projects, contact)
- `styles.css` — dark modern theme, responsive layout
- `script.js` — scroll progress bar, active-section nav indicator, card
  spotlight, hero text scramble, stat counters, scroll-reveal animations

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy to GitHub Pages

1. Create a repository named `Vaibhav-1614.github.io` on GitHub
   (using this exact name makes the site available at the root URL).
2. Push these files to the `main` branch:

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/Vaibhav-1614/Vaibhav-1614.github.io.git
git push -u origin main
```

3. On GitHub, go to **Settings → Pages** and confirm the source is
   `main` branch, `/ (root)`. The site goes live at
   **https://vaibhav-1614.github.io** within a couple of minutes.

## Custom domain (optional)

The GitHub Student Developer Pack includes a free `.me` domain from Namecheap.
After claiming it, add the domain under **Settings → Pages → Custom domain**
and configure the DNS records Namecheap prompts you for.

## Updating content

- **Email**: the contact link is a `mailto:` in the Contact section of `index.html`.
- **Projects**: each project is an `<article class="project-card">` block in
  `index.html` — copy one to add a new project.
