import { redirect } from "next/navigation";

export default function CustomerLoginRedirect() {
  redirect("/login?next=%2Fdashboard");
}

