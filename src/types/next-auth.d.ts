import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
    interface User {
        role?: string;
        customerId?: number | null;
    }
    interface Session {
        user: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
            customerId?: number | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string;
        customerId?: number | null;
    }
}
