/**
 * Paystack payment integration helpers
 * Handles payment link generation, verification, and webhook processing
 */

const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

interface PaystackInitializePaymentInput {
  email: string;
  amount: number; // Amount in cents (e.g., 1000 = 10.00)
  reference: string;
  metadata?: Record<string, unknown>;
}

interface PaystackVerifyPaymentResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    reference: string;
    amount: number;
    paid_at: string;
    status: "success" | "failed" | "pending";
    customer: {
      id: number;
      email: string;
      customer_code: string;
      first_name: string | null;
      last_name: string | null;
    };
    metadata?: Record<string, unknown>;
  };
}

/**
 * Initialize a payment with Paystack
 * Returns authorization URL for user to complete payment
 */
export async function initializePaystackPayment(
  input: PaystackInitializePaymentInput
): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amount,
        reference: input.reference,
        metadata: input.metadata,
      }),
    });

    const data = (await response.json()) as {
      status: boolean;
      message: string;
      data?: {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    };

    if (!data.status || !data.data) {
      throw new Error(`Paystack initialization failed: ${data.message}`);
    }

    return {
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    };
  } catch (error) {
    console.error("[Paystack] Payment initialization failed:", error);
    throw error;
  }
}

/**
 * Verify a payment with Paystack
 * Returns payment details if successful
 */
export async function verifyPaystackPayment(reference: string): Promise<PaystackVerifyPaymentResponse> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = (await response.json()) as PaystackVerifyPaymentResponse;

    if (!data.status) {
      throw new Error(`Payment verification failed: ${data.message}`);
    }

    return data;
  } catch (error) {
    console.error("[Paystack] Payment verification failed:", error);
    throw error;
  }
}

/**
 * Verify webhook signature from Paystack
 * Ensures the webhook is authentic
 */
export function verifyPaystackWebhookSignature(
  body: string,
  signature: string | undefined
): boolean {
  if (!signature) {
    console.warn("[Paystack] Missing webhook signature");
    return false;
  }

  try {
    const crypto = require("crypto");
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(body).digest("hex");

    return hash === signature;
  } catch (error) {
    console.error("[Paystack] Webhook signature verification failed:", error);
    return false;
  }
}

/**
 * Generate a payment reference
 * Combines timestamp and random string for uniqueness
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

/**
 * Format amount for Paystack (convert to cents)
 */
export function formatAmountForPaystack(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format amount from Paystack (convert from cents)
 */
export function formatAmountFromPaystack(amount: number): number {
  return amount / 100;
}

/**
 * Create a payment link for direct sharing
 * Note: This requires Paystack to support payment links
 */
export function createPaystackPaymentLink(
  amount: number,
  currency: string,
  description: string
): string {
  const baseUrl = "https://paystack.com/pay";
  const params = new URLSearchParams({
    amount: formatAmountForPaystack(amount).toString(),
    currency,
    description,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Parse webhook event from Paystack
 */
export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    status: "success" | "failed" | "pending";
    paid_at: string;
    customer: {
      id: number;
      email: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export function parsePaystackWebhook(body: unknown): PaystackWebhookEvent | null {
  try {
    const event = body as PaystackWebhookEvent;

    if (!event.event || !event.data) {
      return null;
    }

    return event;
  } catch (error) {
    console.error("[Paystack] Failed to parse webhook:", error);
    return null;
  }
}
