import { Split } from "@prisma/client";
import { NewSplit } from "types/NewSplit";

export type SplitsFormData = {
  splits: (Split | NewSplit)[];
};
