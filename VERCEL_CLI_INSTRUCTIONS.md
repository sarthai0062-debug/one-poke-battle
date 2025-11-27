# How to Deploy and Check Errors with Vercel CLI

## Option 1: Login and Deploy via CLI

1. **Login to Vercel:**
   ```bash
   npx vercel login
   ```

2. **Link your project:**
   ```bash
   npx vercel link
   ```
   - Select your project: `one-poke-battle`
   - Select scope: Your account
   - Link to existing project: Yes

3. **Build and see full output:**
   ```bash
   npx vercel build
   ```
   This will show you the complete build output with any errors.

4. **Deploy to production:**
   ```bash
   npx vercel --prod
   ```

## Option 2: Check Vercel Dashboard

1. Go to: https://vercel.com/sarss-projects/one-poke-battle
2. Click on the latest failed deployment
3. Scroll down to "Build Logs"
4. Look for the complete error message (not just the first few lines)
5. Copy the full error and share it

## Option 3: Use the Test Script

Run the test script to simulate Vercel's build:
```bash
./test-vercel-build.sh
```

This will show if the build works in a clean environment.
