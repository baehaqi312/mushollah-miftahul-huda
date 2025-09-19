# Deploy to Vercel - Panduan Lengkap

## Quick Deploy

### 1. Via Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel
```

### 2. Via Git Integration
```bash
# Push ke GitHub
git add .
git commit -m "Setup hybrid data storage for Vercel"
git push origin main

# Connect repository di Vercel Dashboard
# vercel.com -> Import Project -> Connect GitHub
```

## Build Commands untuk Vercel

### vercel.json (sudah ada)
```json
{
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/"
        }
    ]
}
```

### package.json scripts (sudah ada)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build", 
    "preview": "vite preview"
  }
}
```

## Environment Variables di Vercel

### Via Vercel Dashboard:
1. Go to Project Settings
2. Environment Variables
3. Add variables:

```
VITE_USE_API=false
VITE_JSONBIN_KEY=your_key_here
VITE_JSONBIN_BIN_ID=your_bin_id_here
```

### Via Vercel CLI:
```bash
vercel env add VITE_USE_API
# Enter: false

vercel env add VITE_JSONBIN_KEY  
# Enter: your_jsonbin_key

vercel env add VITE_JSONBIN_BIN_ID
# Enter: your_bin_id
```

## File Structure untuk Deployment

```
public/
  data/
    users.json     ← Data awal users
    items.json     ← Data awal barang
src/
  services/
    storageService.js   ← Hybrid storage
    apiService.js       ← External API integration
    barangService.js    ← Unchanged
    userService.js      ← Unchanged
```

## Data Flow di Production

```
1. User akses app di Vercel
   ↓
2. App load data dari:
   - External API (jika configured) 
   - Static JSON files (/data/*.json)
   - localStorage (fallback)
   ↓
3. User edit data
   ↓  
4. Data disimpan ke:
   - Memory cache (instant)
   - localStorage (browser)
   - External API (persistent, jika configured)
```

## Testing Deployment

### 1. Local Build Test
```bash
npm run build
npm run preview
# Test di http://localhost:4173
```

### 2. Vercel Preview
```bash
vercel --prod=false
# Dapat preview URL untuk testing
```

### 3. Production Deploy
```bash
vercel --prod
# Deploy ke production domain
```

## Troubleshooting

### Static Files tidak load:
- Pastikan files di `/public/data/` ter-commit
- Check Network tab di browser DevTools
- Pastikan path benar: `/data/users.json` (tanpa /public/)

### API Integration issues:
- Check environment variables di Vercel dashboard
- Enable console logs di browser untuk debug
- Test API endpoints dengan Postman/curl dulu

### Build errors:
```bash
# Clear cache dan rebuild
rm -rf node_modules dist
npm install
npm run build
```

## Performance Tips

1. **Enable Gzip** (otomatis di Vercel)
2. **JSON files akan di-cache** oleh CDN Vercel
3. **Use memory cache** untuk data yang sering diakses
4. **Lazy load** data yang tidak critical

## Security Notes

⚠️ **Data di public/ bisa diakses langsung**
- Jangan simpan password real di JSON files
- Gunakan hash/encryption untuk sensitive data
- Pertimbangkan private API untuk production data

## Monitoring

### Vercel Analytics (Built-in)
```javascript
// Add to main.js if needed
import { inject } from '@vercel/analytics';
inject();
```

### Custom Logging
```javascript
// Add to apiService.js
const logDataAccess = (action, data) => {
  if (import.meta.env.PROD) {
    // Send to analytics service
    console.log(`[${action}]`, data);
  }
};
```