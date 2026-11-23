import type { Metadata } from "next";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminUploadsClient } from "@/components/AdminUploadsClient";

export const metadata: Metadata = {
  title: "Admin Uploads — Oludamade & Miracle",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUploadsPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return <AdminLoginForm title="Guest uploads admin" />;
  }
  return <AdminUploadsClient />;
}
