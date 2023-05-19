import { IncomingPayment, OutgoingPayment, Split } from "@prisma/client";
import { Box } from "app/components/Box";

type PaymentHistoryProps = {
  incomingPayments: (IncomingPayment & {
    outgoingPayments: OutgoingPayment[];
  })[];
  splits: Split[];
};

export function PaymentHistory({
  incomingPayments,
  splits,
}: PaymentHistoryProps) {
  return (
    <div className="flex flex-col gap-4 mt-8 w-full max-w-xl">
      <h2 className="font-heading font-bold text-2xl">Payment History</h2>
      {!incomingPayments.length && <p>No payments have been processed yet.</p>}
      {!!incomingPayments.length && <p>{incomingPayments.length} payments</p>}
      {incomingPayments.map((incomingPayment) => (
        <Box key={incomingPayment.id}>
          <p>{incomingPayment.createdDateTime.toDateString()}</p>
          <p className="mono">{incomingPayment.amount} sats received</p>

          {incomingPayment.outgoingPayments.map((outgoingPayment) => (
            <div key={outgoingPayment.id}>
              <p className="mono">{outgoingPayment.amount} sats</p>
              <p>
                To:{" "}
                {splits.find((split) => split.id === outgoingPayment.splitId)
                  ?.recipientLightningAddress || "Unknown"}
              </p>
              <p>Status: {outgoingPayment.status}</p>
            </div>
          ))}
        </Box>
      ))}
    </div>
  );
}
