import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_CATEGORIES, DEFAULT_SUBCATEGORIES } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // We'll set them on the response below
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Use admin client to seed data (bypasses RLS)
      const admin = createAdminClient();
      const userId = data.user.id;
      const displayName =
        data.user.user_metadata?.display_name ||
        data.user.user_metadata?.full_name ||
        data.user.email?.split("@")[0] ||
        "User";

      // Check if profile already exists (e.g., returning user)
      const { data: existingProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!existingProfile) {
        // Create profile
        await admin.from("profiles").insert({
          id: userId,
          display_name: displayName,
        });

        // Seed default categories
        const parentIds = new Map<string, string>();

        for (const cat of DEFAULT_CATEGORIES) {
          const { data: inserted } = await admin
            .from("categories")
            .insert({
              user_id: userId,
              name: cat.name,
              icon: cat.icon,
              is_system: true,
              sort_order: cat.sort_order,
            })
            .select("id")
            .single();

          if (inserted) {
            parentIds.set(cat.name, inserted.id);
          }
        }

        // Seed sub-categories
        for (const [parentName, children] of Object.entries(DEFAULT_SUBCATEGORIES)) {
          const parentId = parentIds.get(parentName);
          if (!parentId) continue;

          for (const sub of children) {
            await admin.from("categories").insert({
              user_id: userId,
              parent_id: parentId,
              name: sub.name,
              icon: sub.icon,
              is_system: true,
              sort_order: sub.sort_order,
            });
          }
        }
      }

      // Redirect to home with cookies set
      const response = NextResponse.redirect(`${origin}/`);

      // Set auth cookies on the response
      const cookieStore = request.cookies;
      cookieStore.getAll().forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value);
      });

      return response;
    }
  }

  // Auth code exchange failed — redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login`);
}
