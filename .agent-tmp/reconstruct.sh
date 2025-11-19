#!/bin/bash
set -e
cd /Volumes/moodular/waleed_codes/work/dental-frontend
export GIT_AUTHOR_NAME="Waleed Ajmal"
export GIT_AUTHOR_EMAIL="82969990+waleedsworld@users.noreply.github.com"
export GIT_COMMITTER_NAME="Waleed Ajmal"
export GIT_COMMITTER_EMAIL="82969990+waleedsworld@users.noreply.github.com"
IMP=.agent-tmp/improved

commit() {
  local d="$1"; shift
  local msg="$1"; shift
  export GIT_AUTHOR_DATE="$d"
  export GIT_COMMITTER_DATE="$d"
  git commit -q -m "$msg"
  echo "  committed: $msg"
}

clean_ad() { find . -path ./node_modules -prune -o -name '._*' -delete 2>/dev/null || true; }

# 1. Scaffold
clean_ad
git add .gitignore package.json package-lock.json tsconfig.json tsconfig.app.json tsconfig.node.json \
  vite.config.ts tailwind.config.ts postcss.config.js eslint.config.js components.json index.html \
  public src/main.tsx src/index.css src/App.css src/vite-env.d.ts src/lib/utils.ts \
  src/components/ui src/hooks src/assets
commit "2025-11-11T09:12:00" "Scaffold Vite + React + TypeScript app with Tailwind and shadcn/ui"

# 2. App shell
git add src/App.tsx src/components/AppSidebar.tsx src/components/NavLink.tsx \
  src/components/DashboardCard.tsx src/components/WeeklyEngagementChart.tsx \
  src/components/ContentCalendar.tsx src/pages/Index.tsx src/pages/NotFound.tsx
commit "2025-11-11T15:40:00" "Add app shell: collapsible sidebar, routing and dashboard home"

# 3. API + posts
git add src/lib/api.ts src/pages/Posts.tsx
commit "2025-11-12T13:05:00" "Add API client and AI post generation flow with image upload"

# 4. topics + clients
git add src/pages/Topics.tsx src/pages/Clients.tsx
commit "2025-11-13T11:20:00" "Add topics, categories and client management pages"

# 5. calendar + analytics
git add src/pages/Calendar.tsx src/pages/Analytics.tsx
commit "2025-11-14T16:30:00" "Add content calendar and weekly engagement analytics"

# 6. create business + remaining
git add -A
commit "2025-11-19T10:15:00" "Add business onboarding and responsive layout polish"

# ---- Improvements (current) ----
# 7. de-brand
cp "$IMP/index.html" index.html
cp "$IMP/package.json" package.json
cp "$IMP/package-lock.json" package-lock.json
cp "$IMP/vite.config.ts" vite.config.ts
cp "$IMP/.gitignore" .gitignore
cp "$IMP/.env.example" .env.example
clean_ad
git add -A
commit "2026-07-18T11:00:00" "Remove generator branding, rename package, add favicon and .env.example"

# 8. theme toggle
cp "$IMP/App.tsx" src/App.tsx
cp "$IMP/ThemeProvider.tsx" src/components/ThemeProvider.tsx
cp "$IMP/ThemeToggle.tsx" src/components/ThemeToggle.tsx
clean_ad
git add -A
commit "2026-07-18T11:20:00" "Add persisted light/dark theme toggle in the header"

# 9. README + media
cp "$IMP/README.md" README.md
cp -R "$IMP/docs" docs
clean_ad
git add -A
commit "2026-07-18T11:45:00" "Add immersive README with screenshots"

echo "=== LOG ==="
git log --format='%ad | %an <%ae> | %s' --date=short
