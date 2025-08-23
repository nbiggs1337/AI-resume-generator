# Stripe Integration Setup

## Environment Variables

Add these environment variables to your `.env.local` file:

\`\`\`env
# Stripe Keys (get from Stripe Dashboard)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

## Webhook Configuration

1. Go to your Stripe Dashboard > Webhooks
2. Add a new webhook endpoint: `https://yourdomain.com/api/stripe/webhooks`
3. Select these events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.created`

4. Copy the webhook signing secret and add it to `STRIPE_WEBHOOK_SECRET`

## Testing

### Test Cards (Stripe Test Mode)
- Success: `4242424242424242`
- Decline: `4000000000000002`
- Requires Authentication: `4000002500003155`

### Local Testing with Stripe CLI
\`\`\`bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# This will give you a webhook secret starting with whsec_
# Add this to your .env.local as STRIPE_WEBHOOK_SECRET
\`\`\`

## Production Deployment

1. Switch to live Stripe keys in production environment
2. Update webhook endpoint URL to production domain
3. Ensure STRIPE_WEBHOOK_SECRET is set in production environment variables
