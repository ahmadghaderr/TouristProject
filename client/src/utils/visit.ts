import type { Visit } from "../types";

const VALID_VISIT_TYPES = ["full-days", "arrival-departure", "mixed"];

export const findVisitIssues = (visit: Visit): string[] => {
  const issues: string[] = [];
  if (!visit.name) issues.push("missing name");
  if (!visit.hotel) issues.push("missing hotel");
  if (!visit.car) issues.push("missing car");
  if (!visit.type || !VALID_VISIT_TYPES.includes(visit.type)) issues.push("Invalid type");
  if (visit.dateFrom && visit.dateTo && new Date(visit.dateFrom) > new Date(visit.dateTo)) {
    issues.push("dateFrom after dateTo");
  }
  if (!visit.totalCost || visit.totalCost <= 0) issues.push("Invalid total cost");
  return issues;
};

export const isVisitUrgent = (visit: Visit): boolean => {
  if (!visit.dateTo) return false;
  const diff = new Date(visit.dateTo).getTime() - Date.now();
  return diff <= 24 * 60 * 60 * 1000 && diff >= 0;
};
