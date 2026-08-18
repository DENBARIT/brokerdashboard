// Row shapes for the tables this app touches, matching
// birr_gebeya/migrations/001_create_profiles.sql, 002_add_is_admin_to_profiles.sql,
// and 004_broker_dashboard.sql. Hand-written the same way
// admin-dashboard/src/lib/supabase/types.ts is — a `type` (not `interface`)
// so it structurally satisfies postgrest-js's `Record<string, unknown>`
// constraint; interfaces don't get the implicit index signature that plain
// object types do, which otherwise silently collapses every query's
// inferred type to `never`.

export type ProfileRow = {
  id: string;
  username: string;
  full_name: string | null;
  telebirr_number: string | null;
  national_id: string | null;
  region: string | null;
  gender: string | null;
  date_of_birth: string | null;
  email: string | null;
  phone_number: string | null;
  is_admin: boolean;
  csd_account_number: string | null;
  csd_account_status: "pending" | "active";
  created_at: string;
};

export type BrokerRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

export type OrderStatus =
  | "pending_verification"
  | "verified"
  | "rejected"
  | "placed";

export type OrderRow = {
  id: string;
  user_id: string;
  pool_id: string;
  asset_name: string;
  amount: number;
  csd_account_number: string;
  user_full_name: string;
  status: OrderStatus;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
};

export type SmsMatchResult = "unmatched" | "matched" | "mismatched";

export type SmsMessageRow = {
  id: string;
  broker_id: string | null;
  raw_text: string;
  parsed_amount: number | null;
  parsed_user_name: string | null;
  parsed_asset_name: string | null;
  matched_order_id: string | null;
  match_result: SmsMatchResult;
  created_at: string;
};

// Minimal hand-written stand-in for a generated `supabase gen types
// typescript` Database type — just enough shape for the tables this app
// touches so `.update()`/`.insert()` on the service-role client type-check
// instead of collapsing to `never`.
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & Pick<ProfileRow, "id" | "username">;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      brokers: {
        Row: BrokerRow;
        Insert: Partial<BrokerRow> & Pick<BrokerRow, "id">;
        Update: Partial<BrokerRow>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Partial<OrderRow> &
          Pick<
            OrderRow,
            | "user_id"
            | "pool_id"
            | "asset_name"
            | "amount"
            | "csd_account_number"
            | "user_full_name"
          >;
        Update: Partial<OrderRow>;
        Relationships: [];
      };
      broker_sms_messages: {
        Row: SmsMessageRow;
        Insert: Partial<SmsMessageRow> & Pick<SmsMessageRow, "raw_text">;
        Update: Partial<SmsMessageRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
