import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // `withAuth` handles redirects/401s for us.
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        const role = (token as any)?.role as string | undefined;

        // Admin area requires admin role.
        if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
          return role === "admin";
        }

        // Customer protected areas require any signed-in user.
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/cancel",
    "/api/admin/:path*",
    "/api/checkout",
    "/api/billing-portal",
    "/api/client/:path*",
  ],
};

