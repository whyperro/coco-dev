// next-auth.d.ts
import "next-auth";

// Extend the default session object
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      branchId: string;
      user_role: string;
      first_name: string;
      last_name: string;
    };
  }
}

// Extend the default JWT object
declare module "next-auth/jwt" {
  interface JWT {
    branchId: string;
    user_role: string;
  }
}
