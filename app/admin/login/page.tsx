import { redirect } from "next/navigation";

export default function AdminLoginRedirect() {
  redirect("/login?next=%2Fadmin");
}
