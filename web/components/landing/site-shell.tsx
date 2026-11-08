import { hasSession } from "@/lib/session";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

type SiteShellProps = {
  children: React.ReactNode;
};

export async function SiteShell({ children }: SiteShellProps) {
  const signedIn = await hasSession();
  return (
    <div className="min-h-screen bg-cl-main text-cl-text">
      <Navbar signedIn={signedIn} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
