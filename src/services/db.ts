import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type TableName = keyof Database["public"]["Tables"];
export type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type Insert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type Update<T extends TableName> = Database["public"]["Tables"][T]["Update"];

export interface ListOptions {
  search?: { column: string; value: string };
  filters?: Record<string, string | number | boolean | null>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export const db = {
  async list<T extends TableName>(table: T, opts: ListOptions = {}): Promise<Row<T>[]> {
    let q = supabase.from(table).select("*") as any;
    if (opts.filters) {
      for (const [k, v] of Object.entries(opts.filters)) {
        if (v !== undefined && v !== null && v !== "") q = q.eq(k, v);
      }
    }
    if (opts.search?.value) q = q.ilike(opts.search.column, `%${opts.search.value}%`);
    if (opts.orderBy) q = q.order(opts.orderBy.column, { ascending: opts.orderBy.ascending ?? false });
    else q = q.order("created_at", { ascending: false });
    if (opts.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Row<T>[];
  },

  async get<T extends TableName>(table: T, id: string): Promise<Row<T> | null> {
    const { data, error } = await (supabase.from(table) as any).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as Row<T> | null;
  },

  async create<T extends TableName>(table: T, values: Insert<T>): Promise<Row<T>> {
    const { data, error } = await (supabase.from(table) as any).insert(values).select().single();
    if (error) throw error;
    return data as Row<T>;
  },

  async update<T extends TableName>(table: T, id: string, values: Update<T>): Promise<Row<T>> {
    const { data, error } = await (supabase.from(table) as any).update(values).eq("id", id).select().single();
    if (error) throw error;
    return data as Row<T>;
  },

  async remove<T extends TableName>(table: T, id: string): Promise<void> {
    const { error } = await (supabase.from(table) as any).delete().eq("id", id);
    if (error) throw error;
  },
};
