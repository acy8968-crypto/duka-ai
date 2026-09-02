/**
 * billingService.js
 * ------------------------------------------------------------------
 * Runs the automatic billing cycle: finds trials that just ended and
 * active subscriptions due for renewal, then triggers a real STK Push
 * for each. Meant to be called on an interval (see server.js), not
 * directly from a request handler.
 *
 * This is what makes the "free 7-day trial, then billed automatically"
 * promise on the website actually true - without this, trials would
 * silently never convert to paying subscriptions.
 * ------------------------------------------------------------------
 */

const { initiateStkPush } = require("./mpesaService");
const { getExpiredTrials, getDueForRenewal, markChargeAttempted } = require("./subscriptionStore");
const { createPaymentAttempt } = require("./paymentStore");
const { getBusiness } = require("./businessStore");

/**
 * Attempts to charge one subscription (whether it's a trial converting
 * to paid, or a monthly renewal). Logs the attempt either way - success
 * or failure is handled later, when Daraja calls back to /api/mpesa/callback.
 */
async function attemptCharge(subscription, reason) {
  // Mark the attempt FIRST, before calling out to Daraja. This is what
  // stops the next billing cycle (running e.g. every 60s in test mode)
  // from firing another STK Push for this same subscription while this
  // one is still awaiting its callback - this is the fix for the
  // duplicate-charge loop bug found during testing.
  await markChargeAttempted(subscription.id);

  try {
    const business = await getBusiness(subscription.businessId);
    if (!business) {
      console.warn(`Billing: business ${subscription.businessId} not found, skipping subscription ${subscription.id}`);
      return;
    }

    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    if (!callbackUrl) {
      console.error("Billing: MPESA_CALLBACK_URL is not configured - cannot charge subscriptions.");
      return;
    }

    const stkResponse = await initiateStkPush({
      phoneNumber: subscription.phoneNumber,
      amount: subscription.monthlyAmount,
      accountReference: business.businessName,
      transactionDesc: `Duka AI ${subscription.plan} subscription (${reason})`,
      callbackUrl,
    });

    await createPaymentAttempt({
      businessId: subscription.businessId,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      phoneNumber: subscription.phoneNumber,
      amount: subscription.monthlyAmount,
      accountReference: business.businessName,
      subscriptionId: subscription.id,
    });

    console.log(
      `Billing: charge attempt sent for subscription ${subscription.id} (${reason}), CheckoutRequestID ${stkResponse.CheckoutRequestID}`
    );
  } catch (err) {
    // Don't let one failed STK Push (e.g. Daraja temporarily down) crash
    // the whole billing cycle - log it and let the next cycle retry.
    console.error(`Billing: charge attempt failed for subscription ${subscription.id}:`, err.message);
  }
}

/**
 * Runs one full billing cycle: charges every expired trial and every
 * subscription due for renewal. Safe to call repeatedly (e.g. hourly) -
 * a subscription only gets charged once its trial_ends_at or
 * current_period_end has actually passed, and status changes after
 * each attempt prevent immediate re-charging on the next cycle.
 */
async function runBillingCycle() {
  const [expiredTrials, dueRenewals] = await Promise.all([getExpiredTrials(), getDueForRenewal()]);

  console.log(
    `Billing cycle: ${expiredTrials.length} trial(s) ending, ${dueRenewals.length} renewal(s) due.`
  );

  for (const subscription of expiredTrials) {
    await attemptCharge(subscription, "trial ended");
  }

  for (const subscription of dueRenewals) {
    await attemptCharge(subscription, "monthly renewal");
  }
}

module.exports = { runBillingCycle, attemptCharge };
