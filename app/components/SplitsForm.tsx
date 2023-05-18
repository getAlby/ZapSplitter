"use client";
import React from "react";
import toast from "react-hot-toast";
import { Split } from "@prisma/client";
import { useForm } from "react-hook-form";
import { Box } from "app/components/Box";
import { Button } from "app/components/Button";
import { Loading } from "app/components/Loading";
import { useRouter } from "next/navigation";
import { SplitsFormData } from "types/SplitsFormData";

type SplitsFormProps = {
  userId: string;
  splits: Split[];
};

export function SplitsForm({ userId, splits }: SplitsFormProps) {
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
    setValue,
  } = useForm<SplitsFormData>({
    defaultValues: {
      splits,
    },
  });
  const { refresh } = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    if (await updateSplits(userId, data)) {
      refresh();
    }
  });

  const watchedSplits = watch("splits");

  return (
    <form onSubmit={onSubmit} className="flex flex-col w-full items-center">
      <Box>
        <div className="flex gap-4 items-center">
          <h2 className="font-heading font-bold text-2xl text-primary">
            Manage Splits
          </h2>
          <Button
            type="button"
            className="w-8"
            onClick={() =>
              setValue("splits", [
                ...watchedSplits,
                {
                  percentage: 0,
                  recipientLightningAddress: "",
                },
              ])
            }
          >
            +
          </Button>
        </div>
        {watchedSplits.map((split, index) => (
          <div key={index}>
            <span>Split #{index}</span>
            <div className="flex gap-4">
              <div className="flex flex-col gap-4">
                <label className="zp-label">Percentage</label>
                <input
                  onChange={(e) => {
                    const newSplits = [...watchedSplits];
                    newSplits[index].percentage = parseInt(e.target.value);
                    if (!isNaN(newSplits[index].percentage)) {
                      setValue("splits", newSplits);
                    }
                  }}
                  value={watchedSplits[index].percentage}
                  className="zp-input"
                />
              </div>
              <div className="flex flex-col gap-4">
                <label className="zp-label">Recipient</label>
                <input
                  onChange={(e) => {
                    const newSplits = [...watchedSplits];
                    newSplits[index].recipientLightningAddress = e.target.value;
                    setValue("splits", newSplits);
                  }}
                  value={watchedSplits[index].recipientLightningAddress}
                  className="zp-input"
                />
              </div>
            </div>
          </div>
        ))}
      </Box>
      <div className="mt-8 flex gap-4 flex-wrap items-center justify-center">
        <Button type="reset" onClick={() => reset()} variant="secondary">
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <div className="flex justify-center items-center gap-2">
            <span>Save</span>
            {isSubmitting && <Loading />}
          </div>
        </Button>
      </div>
    </form>
  );
}
async function updateSplits(userId: string, data: SplitsFormData) {
  const res = await fetch(`/api/users/${userId}/splits`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    toast.error(res.status + " " + res.statusText);
    return false;
  } else {
    toast.success("Splits updated");
  }
}
