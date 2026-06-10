import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const ADMIN_USER_ID = "user_3BeYdNiwHjIpWA8iw63QXV5Yb6Y";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (userId !== ADMIN_USER_ID) redirect("/");
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {children}
    </div>
  );
}
