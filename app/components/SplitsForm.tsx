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
import clsx from "clsx";

type SplitsFormProps = {
  userId: string;
  splits: Split[];
  isEnabled: boolean;
};

export function SplitsForm({ userId, splits, isEnabled }: SplitsFormProps) {
  const {
    reset,
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isDirty },
    watch,
    setValue,
  } = useForm<SplitsFormData>({
    defaultValues: {
      splits,
      isEnabled,
    },
  });
  const { refresh } = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    if (await updateSplits(userId, data)) {
      refresh();
    }
  });

  const watchedSplits = watch("splits");
  const watchedIsEnabled = watch("isEnabled");

  return (
    <form onSubmit={onSubmit} className="flex flex-col w-full items-center">
      <Box>
        <div className="flex justify-between">
          <h2 className="font-heading font-bold text-2xl text-primary">
            Manage Splits
          </h2>
          <div className="form-control">
            <label className="label cursor-pointer flex gap-2 items-center justify-center">
              <span className="label-text leading-none">Enable Splits</span>
              <input
                {...register("isEnabled")}
                type="checkbox"
                className="toggle toggle-warning"
                checked={watchedIsEnabled}
              />
            </label>
          </div>
        </div>

        {watchedSplits.map((split, index) => (
          <div
            key={index}
            className={clsx(
              "bg-base-200 rounded-lg p-2 relative",
              !watchedIsEnabled && "opacity-50 pointer-events-none"
            )}
          >
            <label
              onClick={() => {
                const newSplits = [...watchedSplits];
                newSplits.splice(index, 1);
                setValue("splits", newSplits);
              }}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </label>
            <h3 className="font-heading font-medium text-xl text-primary">
              Split {index + 1}
            </h3>
            <div className="flex w-full justify-between gap-4">
              <div className="flex flex-col w-full">
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
              <div className="flex flex-col w-full">
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
        <div
          className={clsx(
            "bg-base-200 rounded-lg p-2 cursor-pointer flex justify-center items-center h-24 gap-2 hover:opacity-75",
            !watchedIsEnabled && "opacity-50 pointer-events-none"
          )}
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
          <p className="text-5xl h-14 text-primary opacity-25">+</p>
        </div>
      </Box>
      <div className="mt-8 flex gap-4 flex-wrap items-center justify-center">
        <Button
          type="reset"
          onClick={() => {
            reset();
            setValue("isEnabled", isEnabled);
          }}
          variant="secondary"
          disabled={!isDirty}
        >
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
    toast.error(res.status + " " + res.statusText + "\n" + (await res.text()));
    return false;
  } else {
    toast.success("Splits updated");
  }
}
