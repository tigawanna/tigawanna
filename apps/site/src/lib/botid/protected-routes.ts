import { requestAdminOtp, verifyAdminOtp } from "@/modules/admin-auth/admin-auth.functions";
import { sendContactMessage } from "@/routes/-components/landing/sections/contact/contact.functions";

export const botIdProtectedRoutes = [
  { path: requestAdminOtp.url, method: "POST" },
  { path: verifyAdminOtp.url, method: "POST" },
  { path: sendContactMessage.url, method: "POST" },
] as const;
