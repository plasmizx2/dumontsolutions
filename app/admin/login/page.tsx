import { redirect } from "next/navigation";

export default function AdminLoginRedirect() {
  redirect("/login?mode=admin&next=%2Fadmin");
}
