import { IncomingPayment, OutgoingPayment, Split } from "@prisma/client";
import { Box } from "app/components/Box";
import clsx from "clsx";
import { getSplitAmount, getSplitAmountWithoutFee } from "lib/utils";

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
          <div>
            <p className="mono text-xs">
              {incomingPayment.createdDateTime.toDateString()}
            </p>
            <p className="mono">{incomingPayment.amount} sats received</p>
          </div>

          <div>
            <div className="divider -mt-4" />
            <div className="flex flex-col gap-8">
              {incomingPayment.outgoingPayments.map((outgoingPayment) => {
                const split = splits.find(
                  (split) => split.id === outgoingPayment.splitId
                );

                return (
                  <div key={outgoingPayment.id}>
                    {split && (
                      <div className="flex justify-between items-start">
                        <p className="text-lg">
                          {split.recipientLightningAddress}
                        </p>
                        <p className="text-xs">
                          {getSplitAmount(
                            incomingPayment.amount,
                            split.percentage
                          )}{" "}
                          sats allocated ({split.percentage}%)
                        </p>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between items-start">
                      <div className="flex gap-2 items-center">
                        <div
                          className={clsx(
                            "badge",
                            outgoingPayment.status === "PAID" &&
                              "badge-success",
                            outgoingPayment.status === "FAILED" && "badge-error"
                          )}
                        >
                          {outgoingPayment.status}
                        </div>
                        <p className="mono">{outgoingPayment.amount} sats</p>
                      </div>
                      {outgoingPayment.status === "PAID" && (
                        <>
                          <p className="mono text-xs">
                            routing fee: {outgoingPayment.fee} sats
                            {split && (
                              <>
                                {" ("}
                                {getSplitAmount(
                                  incomingPayment.amount,
                                  split.percentage
                                ) -
                                  getSplitAmountWithoutFee(
                                    incomingPayment.amount,
                                    split.percentage
                                  ) -
                                  (outgoingPayment.fee ?? 0)}{" "}
                                sat unspent{")"}
                              </>
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Box>
      ))}
    </div>
  );
}
