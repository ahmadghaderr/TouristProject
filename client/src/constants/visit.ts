import type { SelectOption } from "../components/Select";
import type { VisitType } from "../types";

export const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "Personal", label: "Personal" },
  { value: "Omar Maroun", label: "Omar Maroun" },
  { value: "Syria Trip", label: "Syria Trip" },
];

export const getVisitTypeVisibility = (type: VisitType | "") => ({
  showFullDaysFields: type === "full-days" || type === "mixed",
  showArrivalDepartureFields: type === "arrival-departure" || type === "mixed",
});
