// app/super-admin/layout.js
import DashBoardLayoutProvider from "@/provider/dashboard.layout.provider";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/app/dictionaries";
import { menusConfig} from "@/config/menus"; // Import the super-admin menu config

const layout = async ({ children }) => {
  const session = await getServerSession(authOptions);

  // If no session, redirect to login (auth guard)
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  // Get translations
  const trans = await getDictionary();

  return (
    // Pass the super-admin menu config to the layout provider
    <DashBoardLayoutProvider trans={trans} menusConfig={menusConfig}>
      {children}
    </DashBoardLayoutProvider>
  );
};

export default layout;