import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  // Role-based gate: allow any user whose profile role is admin/super_admin
  // (plus the founder fallback baked into isAdmin). Replaces the old check
  // that only allowed one hardcoded Clerk ID.
  const allowed = await isAdmin(userId);
  if (!allowed) redirect("/");
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {children}
    </div>
  );
}
