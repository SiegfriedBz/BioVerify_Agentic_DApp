export const assignmentKeys = {
  all: ["assignments"] as const,
  byUser: (address: string) =>
    [...assignmentKeys.all, "user", address.toLowerCase()] as const,
}