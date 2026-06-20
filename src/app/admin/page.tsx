import { isAdminAuthed } from "@/lib/auth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const authed = isAdminAuthed();
  return authed ? <AdminDashboard /> : <AdminLogin />;
}
