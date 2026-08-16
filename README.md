# Next.js template

This is a Next.js template with shadcn/ui.

## Clerk account deletion webhook

When a Clerk user is deleted, `POST /api/webhooks/clerk` removes their `quran_logs` rows. Configure this in the Clerk Dashboard (Webhooks):

1. Endpoint URL: `https://<your-host>/api/webhooks/clerk` (production) or a Clerk CLI tunnel for local testing.
2. Subscribe to **`user.deleted` only**.
3. Set `CLERK_WEBHOOK_SIGNING_SECRET` to the endpoint signing secret locally and in Vercel (Production / Preview).



Local forwarding:

```sh
clerk webhooks listen --token "$(clerk webhooks token)" --forward-to http://localhost:3000/api/webhooks/clerk
```

Register the printed `https://webhooks.clerk.com/in/...` URL as the Dashboard endpoint. Enable account deletion in Clerk if users should delete themselves from `<UserButton />`.


for local testing 

1. have the clerk cli installed 
2. run 
```sh
clerk webhooks listen --forward-to http://localhost:3000/api/webhooks/clerk
```
3. go to clerk dashboard -> configure -> developers -> webhooks and add an endpoint with the url it genreated in step 2 (e.g https://webhooks.clerk.com/in/******)
make sure its without the /api/webhooks/clerk
4. test the local webhook is working by going to clerk dashboard. when you click on the webhook you created there is a testing tab and send a example webhook. you should see it come up on your terminal that webhook came through






## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
