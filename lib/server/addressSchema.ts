import { z } from "zod";

// Wspólny schemat adresu konta (POST tworzy, PATCH aktualizuje przez .partial()).
export const AddressBody = z.object({
  label: z.string().max(60).optional(),
  first_name: z.string().max(80).optional(),
  last_name: z.string().max(80).optional(),
  street: z.string().max(160).optional(),
  building: z.string().max(40).optional(),
  apartment: z.string().max(40).optional(),
  postal_code: z.string().max(12).optional(),
  city: z.string().max(80).optional(),
  phone: z.string().max(20).optional(),
  is_default: z.boolean().optional(),
});
