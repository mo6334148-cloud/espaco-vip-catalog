// Converts the admin username (e.g. "miguellindo") into the login e-mail used by auth.
export function usernameToEmail(input: string) {
  const value = input.trim().toLowerCase();
  if (value.includes("@")) return value;
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9._-]/g, "");
  return `${slug}@espacovip.app`;
}
