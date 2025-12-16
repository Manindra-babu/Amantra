---
description: Merge feature branch to main and deploy to production
---

### 1. Switch to Main Branch
First, make sure you are on the main branch.
```bash
git checkout main
```

### 2. Update Main
Pull the latest changes to ensure you are up to date.
```bash
git pull origin main
```

### 3. Merge the Feature Branch
Merge your feature branch (`feature/auth-integration`) into main.
```bash
git merge feature/auth-integration
```

### 4. Push Changes
Push the updated main branch to GitHub.
```bash
git push origin main
```

### 5. Deploy to Production
Finally, deploy the updated main branch to the live site.
```bash
npm run deploy:prod
```
