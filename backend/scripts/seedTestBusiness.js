/**
 * seedTestBusiness.js
 * ------------------------------------------------------------------
 * ONE-OFF SCRIPT - not part of the running server.
 *
 * Creates a business record using Meta's free test WhatsApp number
 * (phone_number_id + a permanent access token you generated yourself),
 * bypassing Embedded Signup entirely. This is only meant for YOUR OWN
 * testing before Business Verification is complete - a real customer
 * would never hand you their access token like this.
 *
 * Usage:
 *   node scripts/seedTestBusiness.js
 *
 * Requires in .env:
 *   GEMINI_API_KEY       - to generate the system prompt
 *   DATABASE_URL         - your Postgres connection
 *   META_ACCESS_TOKEN    - your permanent token from Meta's test number page
 *   META_TEST_PHONE_NUMBER_ID - the Phone Number ID from that same page
 * ------------------------------------------------------------------
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env"), override: true });

const { createBusiness, attachWhatsappNumber } = require("../services/businessStore");
const { generateSystemPrompt } = require("../services/openrouterService");

async function main() {
  const phoneNumberId = process.env.META_TEST_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error(
      "Missing META_TEST_PHONE_NUMBER_ID or META_ACCESS_TOKEN in .env - add both before running this script."
    );
    process.exit(1);
  }

  // Duka AI live demo business
  const businessName = "Autopal Duka AI";
  const businessType = "WhatsApp AI Assistant Demo";
  const ownerContact = "esmond@autopal.co.ke";
  const description =
    "Duka AI is an intelligent WhatsApp AI agent for Kenyan businesses. We help shops, boutiques, and sellers automate customer orders, answer product FAQs 24/7, and collect M-Pesa payments. Our plans are Starter (KES 1,999/mo), Growth (KES 4,999/mo), and Pro (KES 9,999/mo). Friendly, professional tone in natural Kenyan English and Swahili. If someone says 'Hi, show me how Duka AI works', warmly introduce Duka AI, explain how we help businesses close sales while they sleep, and invite them to ask any question or test placing a mock order.";

  console.log("Generating AI system prompt via OpenRouter...");
  const { systemPrompt } = await generateSystemPrompt({ businessName, businessType, description });
  console.log("--- Generated system prompt ---\n" + systemPrompt + "\n--------------------------------");

  const business = await createBusiness({ businessName, businessType, ownerContact, description, systemPrompt });
  console.log("Created business:", business.id);

  // No wabaId in this manual flow (that's an Embedded Signup concept) -
  // "manual_test" is just a readable placeholder, not a real Meta ID.
  await attachWhatsappNumber(business.id, {
    phoneNumberId,
    wabaId: "manual_test",
    accessToken,
  });

  console.log("\nDone! Business is ready to receive real WhatsApp messages.");
  console.log("Business ID:", business.id);
  console.log(
    `\nNext step: message your test WhatsApp number from your own phone, then check:\n` +
      `  GET http://localhost:${process.env.PORT || 3000}/api/business/${business.id}/orders`
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
