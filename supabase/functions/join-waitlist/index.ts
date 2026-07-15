import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend";
import { corsHeaders } from "../_shared/cors.ts";

interface WaitlistRequest {
  email: string;
  platform: "android" | "ios" | "windows" | "web" | "newsletter";
  source: "hero" | "newsletter" | "footer";
  locale: string;
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}
const supabase = createClient(
  requireEnv("SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY")
);

const resend = new Resend(
  requireEnv("RESEND_API_KEY")
);

const APP_URL = requireEnv("APP_URL");

const FROM_EMAIL =
  Deno.env.get("FROM_EMAIL") ??
  "Watch Next <noreply@watchnext.app>";

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json(
      {
        success: false,
        message: "Method not allowed",
      },
      {
        status: 405,
      }
    );
  }

  try {

    const body: WaitlistRequest =
      await req.json();

    const email =
      body.email.trim().toLowerCase();

    if (!emailRegex.test(email)) {
      return Response.json(
        {
          success: false,
          message: "Invalid email.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.platform ||
      !body.source ||
      !body.locale
    ) {
      return Response.json(
        {
          success: false,
          message: "Missing required fields.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Verifica duplicidade
     */
    const { data: existing } =
      await supabase
        .from("waitlist_entries")
        .select("id")
        .eq("email", email)
        .eq("platform", body.platform)
        .maybeSingle();

    if (existing) {
      return Response.json(
        {
          success: false,
          message:
            "This email is already registered.",
        },
        {
          status: 409,
        }
      );
    }

    /**
     * Inserção
     */
    const { data: user, error } =
      await supabase
        .from("waitlist_entries")
        .insert({
          email,
          platform: body.platform,
          source: body.source,
          locale: body.locale,
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    /**
     * Links
     */
    const confirmUrl =
      `${APP_URL}/functions/v1/confirm-email?token=${user.confirmation_token}`;

    const unsubscribeUrl =
      `${APP_URL}/functions/v1/unsubscribe?token=${user.unsubscribe_token}`;

    /**
     * Nome da plataforma
     */
    const platformName =
      body.platform.charAt(0).toUpperCase() +
      body.platform.slice(1);

    /**
     * Template
     */
    const html = `
        <h2>Welcome to Watch Next 🎉</h2>

        <p>
            Thank you for joining the
            <strong>${platformName}</strong>
            waitlist.
        </p>

        <p>
            Click the button below to confirm
            your email.
        </p>

        <p>
            <a
                href="${confirmUrl}"
                style="
                    background:#3E8BFF;
                    color:white;
                    padding:12px 24px;
                    text-decoration:none;
                    border-radius:6px;
                "
            >
                Confirm Email
            </a>
        </p>

        <hr>

        <small>
            If you no longer wish to receive emails,
            click
            <a href="${unsubscribeUrl}">
                here
            </a>.
        </small>
    `;

    /**
     * Resend
     */
    const { data: resendData, error: resendError } =
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject:
          "Confirm your Watch Next registration",
        html,
      });

    if (resendError) {
      console.error(resendError);
    }

    return Response.json({
      success: true,
      message:
        "Successfully added to the waitlist.",
      id: user.id,
      resend_id: resendData?.id ?? null,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error.",
      },
      {
        status: 500,
      }
    );
  }
});