# ApplyFlow AI

Chrome extension that fills a Workday application from details you save in the side panel. You still review the page and press submit yourself.

## Load it in Chrome

```bash
cd applyflow-extension
npm install
npm run dev
```

Open `chrome://extensions`, turn on Developer mode, and choose **Load unpacked**. Select `applyflow-extension/build/chrome-mv3-dev`.

Click the ApplyFlow icon to open the side panel. Add your name and email, or upload a PDF, Word (.docx), or text resume. Details stay in Chrome on this computer. Paste the job description, open a Workday application, then choose **Fill this Workday application**.

The first 5 fills are free. PDF and Word files are read locally. Written answers use your resume immediately. They are tailored to the job description after Supabase and `OPENAI_API_KEY` are connected. Stripe checkout uses `STRIPE_SECRET_KEY` and `STRIPE_PRICE_ID` in the edge functions.
