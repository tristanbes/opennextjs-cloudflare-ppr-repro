import { Suspense } from "react";
import { cookies } from "next/headers";

export const metadata = {
  title: "PPR Repro - opennextjs-cloudflare #1115",
};

/**
 * Async layout component that reads cookies — this makes the Suspense boundary
 * dynamic, which is the core pattern that triggers PPR.
 *
 * With cacheComponents: true, Next.js will:
 * 1. Cache the static shell (everything outside the Suspense boundary)
 * 2. Stream the dynamic part (this component) on each request
 *
 * Bug: On Cloudflare Workers with @opennextjs/cloudflare, cache HITs serve
 * only the static shell and never stream the dynamic content.
 */
async function DynamicShell({ children }: { children: React.ReactNode }) {
  // Reading cookies makes this component dynamic (cannot be statically cached)
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value ?? "light";

  // Simulate async work (e.g., fetching user session from auth provider)
  await new Promise((resolve) => setTimeout(resolve, 100));

  return (
    <div data-theme={theme}>
      <header style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>
        <h1>PPR Repro App</h1>
        <p>
          Theme from cookie: <strong>{theme}</strong> | Rendered at:{" "}
          <strong>{new Date().toISOString()}</strong>
        </p>
      </header>
      <main style={{ padding: "1rem" }}>{children}</main>
    </div>
  );
}

function ShellLoading() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Loading shell...</p>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<ShellLoading />}>
          <DynamicShell>{children}</DynamicShell>
        </Suspense>
      </body>
    </html>
  );
}
