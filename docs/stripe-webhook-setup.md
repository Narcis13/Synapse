# Stripe Webhook Setup Guide

## Local Development Setup

1. **Install Stripe CLI**
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Linux
   # Download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook signing secret**
   The CLI will output a webhook signing secret like `whsec_...`. Copy this and add it to your `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
   ```

5. **Test the webhook**
   In another terminal, trigger a test event:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## Production Setup

1. **Go to Stripe Dashboard**
   - Navigate to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)

2. **Add endpoint**
   - Click "Add endpoint"
   - Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Get the signing secret**
   - After creating the webhook, click on it
   - Reveal and copy the "Signing secret"
   - Add it to your production environment variables:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_production_secret
     ```

## Testing Webhook Events

### Test Subscription Creation
```bash
stripe trigger customer.subscription.created
```

### Test Subscription Update
```bash
stripe trigger customer.subscription.updated
```

### Test Subscription Cancellation
```bash
stripe trigger customer.subscription.deleted
```

### Test Successful Payment
```bash
stripe trigger invoice.payment_succeeded
```

### Test Failed Payment
```bash
stripe trigger invoice.payment_failed
```

## Webhook Event Flow

1. **User initiates subscription**
   - User clicks "Subscribe" → Redirected to Stripe Checkout
   - After payment → `checkout.session.completed` event
   - Webhook updates user's subscription status in database

2. **Subscription lifecycle**
   - Created: `customer.subscription.created`
   - Updated: `customer.subscription.updated`
   - Canceled: `customer.subscription.deleted`
   - Each event updates the user's subscription data

3. **Payment events**
   - Success: `invoice.payment_succeeded` → Ensure access
   - Failed: `invoice.payment_failed` → Send notification

## Troubleshooting

### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` matches your endpoint's signing secret
- Check that you're passing the raw request body (not parsed JSON)

### User not found for Stripe customer
- Ensure users are created with Stripe customer IDs
- Check the `by_stripe_customer_id` index in your database

### Webhook events not received
- Verify your endpoint URL is correct
- Check Stripe Dashboard > Webhooks for failed attempts
- Ensure your server is publicly accessible (use ngrok for local testing)

## Security Best Practices

1. **Always verify webhook signatures**
   - Never trust webhook data without verification
   - Use the `verifyWebhookSignature` function

2. **Idempotency**
   - Stripe may send the same event multiple times
   - Handle events idempotently (same result if processed multiple times)

3. **Return 200 quickly**
   - Acknowledge receipt within 20 seconds
   - Process heavy operations asynchronously if needed

4. **Log everything**
   - Log all webhook events for debugging
   - Monitor for failed events in Stripe Dashboard