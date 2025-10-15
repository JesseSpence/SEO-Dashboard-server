# Backend Deployment Setup Guide

## Environment Variables Required

Your hosted server needs these environment variables to connect to Google APIs:

### 1. Google Service Account Credentials
```bash
GOOGLE_PROJECT_ID=aqueous-walker-455614-m3
GOOGLE_PRIVATE_KEY_ID=2ab00feb749f06ae41658b645482996d4ef8c5f1
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDhCMOQAfN94yF8\nRq7fUBddigmm7kYSpNHWHuM8GvRiVXSlUZUwCCYhzUqqb9gU6+m4DKagIB/D45xp\nV96xAVLs0re65R0pJYJvnf/VfKdcK846EYe3lGOAY0Ij2u5NckhKLrr5q+MoZvr3\nBlIEPHBB7hOeA3GHeIhURmcy9D/ymPza+AG0h5QUeolCqJs1quxL9AxIrgX2wqPw\nyE0i3I8Ffopl9Bnra6anscOA3fvTO332yprhkjDnOnwDbuQ3qw/dXMbfg1mjg0bB\neHhNDGB708xAMiRwNoVEUPIiDoRs8SC+8tCkFc6ZWOJkxxMrV7VhtQSAUN7o7HIU\nKlV8EFBPAgMBAAECggEADaFLwxGzL1lOAmp/lgwSVjqRqhg9i0yLXyZAyjexvLED\nXy4JVL7xnFOEZb1ff6joX5r4jrNTaTiElUbauKrlXG3I7huJgCAC/gK6Z7JkqqsG\nkzLTnxVwT2rzqxtMGsnEwiWBcrTsDdrq8YJi/lmwzPWAH66CtlthGoWnI4lyxB1N\n9YWWyYItpw1ZFVvKE8ZlYhOIFaPx44aNY2j78czz5xH2hUKJXD7tELAJ8NxbtJiH\nYauDA+AIApEqZ32qMK7cKXss30pTlC3M6aL9Oo0KhC/wmeWTu3IifzEZgiBxQXuM\nCVvX0w+Wipr5GVIfDsDPHakhguzOoklUp5cGROKsqQKBgQD/fl1Fr0QRyHyLlAnJ\n5dT83zpcOrDrB+mLgOqIFEWs1VHhR8dMcbFGSRQYBINGvCbwXMfEe+32k8tgn+nL\nVwpQzUfBGHk33qC8+jzYG8cXn2VBU/1Kg3WQAbK9z2r1Goiudo+1fElJJAAEuHk2\nwYhXRtlsKzVmFBi4jw0a7Bs5twKBgQDhevHXxykOlXK+mIpH+PeOuJr6sVgqabVn\noqEoKZX3sdgCZG9h8xVB7BJkQtc0VdkPmqmyrQfoQPpg9xrV2RyEGGl75XeEsvbI\nXx4IYFUMauWbqzgyTy0+Tu4AAWHqMhP+RKeFHyFiyBbQLOLxBsqiymNvke9KlbEg\n8AeqVRR+KQKBgBn/tOQbcrTQjwPxG5HlBmh5Gso52rkABB8DDlqsnW56AqwHDtvT\nkfOSCi5rfyRajyfUeSugZNW7sm1xuGvNvqn8Sbn3kJZD3F1+pWRkZz0bJkWgk1za\nxcLSuWqhScQJYDFItVUFgbukoy/XydXtmb8v4X4lY3iwwNc/D1lW/2o/AoGBALXy\nk7zfRU4zYohSZyN0z68nYEfzW4W+D1g1b34NMKrTo88qZIbRtNGhQaYOGcJtk953\nm4BHCB5ucJxWSh1OOSiO2m/T1wIJuAIwXve7ZGXEzMs0+v/9zDB/WKZAd1aYWnHP\nzK4rVLF1bJNH5UlBhbqfPmYFiObSrEA78LOOPB8hAoGARCASZLaumP+wIUqA2nSK\nUEkAQeU69c14D81gZNvOtZzOB1wG7CMCyEDOoelLkfTWLra227bZo65vdYk6fj8g\nTUNuvIYqu5bNnqhlrOoEHENstQdIF7fTmxnaygvOgPyfOhDPzdZSKMIjKTi+9qn9\nIlBEPqGzX01BZe7iVhZ7Ix8=\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=fundingagent-dashboard@aqueous-walker-455614-m3.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=113891539812399555228
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/fundingagent-dashboard%40aqueous-walker-455614-m3.iam.gserviceaccount.com
```

### 2. Site Configuration
```bash
GSC_SITE_URL=https://www.fundingagent.co.uk/
GA4_PROPERTY_ID=487607826
```

### 3. Server Configuration
```bash
PORT=3000
NODE_ENV=production
```

## How to Set Environment Variables

### Option 1: Direct Server Configuration
If you have direct access to your server, create a `.env` file with the above variables.

### Option 2: Hosting Platform Environment Variables
Most hosting platforms (Railway, Vercel, Heroku, etc.) allow you to set environment variables in their dashboard.

### Option 3: Docker/Container Environment
If using Docker, pass environment variables in your docker-compose.yml or Dockerfile.

## Verification

After setting the environment variables, restart your server and check:
1. Visit `https://api.themetastack.com/health`
2. Should show `"mode":"real"` instead of `"mode":"mock"`
3. Test an API endpoint: `https://api.themetastack.com/api/gsc/top?limit=5`

## Troubleshooting

If still showing "mock" mode:
1. Check that all environment variables are set correctly
2. Verify the private key includes proper line breaks (`\n`)
3. Ensure the service account has access to your GSC and GA4 properties
4. Check server logs for authentication errors
