import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const resend = new Resend(
  Deno.env.get("RESEND_API_KEY")!
);

const APP_URL =
  Deno.env.get("APP_URL")!;

Deno.serve(async (req) => {

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  const payload = await req.json();

  const user = payload.record;

  if (!user) {
    return Response.json({
      success: false,
      error: "Missing record",
    });
  }

  const confirmUrl =
    `${APP_URL}/api/confirm-email?token=${user.confirmation_token}`;

  const unsubscribeUrl =
    `${APP_URL}/api/unsubscribe?token=${user.unsubscribe_token}`;

  let platformName = "Watch Next";

  switch (user.platform) {

    case "android":
      platformName = "Android";
      break;

    case "windows":
      platformName = "Windows";
      break;

    case "ios":
      platformName = "iOS";
      break;

    case "web":
      platformName = "Web";
      break;

  }

  const html = `
  <h1>Welcome to Watch Next 🎉</h1>

  <p>Thanks for joining our ${platformName} waitlist.</p>

  <p>
      Click below to confirm your email.
  </p>

  <a href="${confirmUrl}">
      Confirm Email
  </a>

  <br><br>

  <small>

      If you no longer wish to receive emails,

      <a href="${unsubscribeUrl}">

          unsubscribe here

      </a>

  </small>
  `;

  const { data, error } =
    await resend.emails.send({

      from:
        "Watch Next <onboarding@resend.dev>",

      to: user.email,

      subject:
        "Confirm your Watch Next registration",

      html,

    });

  if (error) {

    return Response.json({

      success: false,

      error,

    });

  }

  return Response.json({

    success: true,

    resend_id: data?.id,

  });

});