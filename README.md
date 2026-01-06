# Pete Cohen's Personal Website

A personal website built with Astro and Tailwind CSS, featuring weeknotes, blog posts, and a /now page.

## 🚀 Quick Start

### Development

```bash
npm run dev
```

Visit `http://localhost:4321` to see your site.

### Build

```bash
npm run build
```

The static site will be built to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📝 Writing Weeknotes

Use the helper script to create a new weeknote for the current week:

```bash
./scripts/new-weeknote.sh
```

This will:
- Create a new weeknote file in `src/content/weeknotes/[year]/week-[number].md`
- Pre-fill it with frontmatter and template sections
- Open it in your default editor
- Set `draft: true` by default (change to `false` when ready to publish)

### Weeknote Structure

Weeknotes are stored in `src/content/weeknotes/[year]/week-[number].md` with frontmatter:

```yaml
---
title: "Week 01, 2026"
date: 2026-01-05
weekNumber: 1
year: 2026
summary: "Optional summary for archive page"
draft: false
---
```

## 📚 Writing Blog Posts

Create a new markdown file in `src/content/blog/`:

```yaml
---
title: "Post Title"
date: 2026-01-05
summary: "A brief summary"
externalUrl: "https://example.com/article" # Optional: for posts published elsewhere
draft: false
---
```

## 🎨 Customization

### Update Your Info

1. **Home Page**: Edit `src/pages/index.astro` to add your bio, links, and photo
2. **Social Links**: Update LinkedIn, Bluesky, and email links
3. **Photo**: Add your photo to `public/photo.jpg` and update the placeholder in index.astro

### Update Your /now Page

Edit `src/pages/now.astro` to reflect what you're currently focused on.

### Colors

The color scheme is defined in `src/styles/global.css` using CSS custom properties. Edit the `@theme` block to change:
- `--color-accent`: Main accent color
- `--color-text`: Text color
- `--color-background`: Background color
- etc.

Dark mode colors are automatically applied based on system preference.

## 📁 Project Structure

```
/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable Astro components
│   │   └── Header.astro
│   ├── content/         # Content collections
│   │   ├── weeknotes/   # Weeknotes organized by year
│   │   └── blog/        # Blog posts
│   ├── layouts/         # Page layouts
│   │   └── Layout.astro
│   ├── pages/           # Routes (file-based routing)
│   │   ├── index.astro  # Home page
│   │   ├── now.astro    # /now page
│   │   ├── blog/
│   │   └── weeknotes/
│   └── styles/
│       └── global.css   # Global styles with Tailwind
└── scripts/
    └── new-weeknote.sh  # Helper script for new weeknotes
```

## 🚢 Deployment

### Netlify (from GitHub)

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

Netlify will automatically deploy on every push to your main branch.

### Manual Deploy

You can also drag and drop the `dist/` folder directly into Netlify's web interface.

## 📦 Dependencies

- **Astro**: Static site generator
- **Tailwind CSS**: Utility-first CSS framework

That's it! No other dependencies needed.

## 🌐 RSS Feeds

RSS feeds are generated for:
- Weeknotes: `/weeknotes/feed.xml` (coming soon)
- Blog: `/blog/feed.xml` (coming soon)

## 📄 License

This is a personal website. Feel free to use the code structure for your own site!
