import { getCurrentUser } from "@/lib/session";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

type SiteShellProps = {
  children: React.ReactNode;
};

export async function SiteShell({ children }: SiteShellProps) {
  const user = await getCurrentUser();
  const signedIn = !!user;
  return (
    <div className="min-h-screen bg-cl-main text-cl-text">
      <Navbar signedIn={signedIn} user={user} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
