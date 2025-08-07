// src/components/ProModal.tsx
"use client";
import { PaystackButton } from "react-paystack";
import { FlutterWaveButton, closePaymentModal } from "flutterwave-react-v3";
import { motion } from "framer-motion";

export default function ProModal({ open, onClose, onSuccess }: { open: boolean, onClose: () => void, onSuccess: () => void }) {
  if (!open) return null;

  const paystackKey = "pk_test_123"; // test keys
  const flutterwaveKey = "FLWPUBK_TEST_123";
  const email = "test@example.com";
  const amount = 2000;

  const paystackConfig = {
    email,
    amount,
    publicKey: paystackKey,
    currency: "NGN",
    onSuccess: () => onSuccess(),
    onClose,
  };

  const flutterwaveConfig = {
    public_key: flutterwaveKey,
    tx_ref: Date.now().toString(),
    amount: amount / 100,
    currency: "NGN",
    payment_options: "card,ussd,banktransfer",
    customer: { email, phone_number: "08012345678", name: "Test User" },
    customizations: {
      title: "PitchPal Pro",
      description: "Upgrade to Pro",
      logo: "/next.svg",
    },
    onClose,
    callback: (response: { status: string }) => {
      if (response.status === "successful") {
        onSuccess();
        closePaymentModal();
      }
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center gap-6">
        <h2 className="text-xl font-bold mb-2">Upgrade to PitchPal Pro</h2>
        <p className="text-zinc-700 dark:text-zinc-200 text-center">
          Unlock unlimited exports, premium voices, and more!
        </p>
        <div className="flex flex-col gap-4 w-full">
          <PaystackButton {...paystackConfig} className="w-full rounded-xl bg-green-600 text-white py-3 font-semibold text-lg hover:bg-green-500 transition">
            Pay with Paystack
          </PaystackButton>
          <FlutterWaveButton {...flutterwaveConfig} className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold text-lg hover:bg-blue-500 transition">
            Pay with Flutterwave
          </FlutterWaveButton>
        </div>
        <motion.button
          className="mt-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 px-4 py-2 font-medium text-base hover:bg-zinc-300 dark:hover:bg-zinc-600 transition"
          onClick={onClose}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          type="button"
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
}

