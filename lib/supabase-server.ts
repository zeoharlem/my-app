import "server-only";

import {createClient} from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
    throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
    );
}

if (!supabaseSecretKey) {
    throw new Error(
        "Missing Key Player"
    );
}

export const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });