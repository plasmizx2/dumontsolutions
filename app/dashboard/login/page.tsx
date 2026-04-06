import { redirect } from "next/navigation";

export default function CustomerLoginRedirect() {
  redirect("/login?mode=customer&next=%2Fdashboard");
}

