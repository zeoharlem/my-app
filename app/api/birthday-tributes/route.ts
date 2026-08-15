import {NextResponse} from "next/server";
import {z} from "zod";

import {supabase} from "@/lib/supabase";

const birthdayWishSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(100, "Name is too long"),

    comment: z
        .string()
        .trim()
        .min(10, "Message must be at least 10 characters")
        .max(1000, "Message is too long"),

    turnstileToken: z
        .string()
        .min(1, "Verification is required"),

    website: z
        .string()
        .optional(),
});


export async function POST(request: Request) {
    try {
        const body = await request.json();

        const result = birthdayWishSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {error: "Invalid submission",},
                {status: 400,}
            );
        }

        const {name, comment, turnstileToken, website,} = result.data;

        /**
         * Honeypot check.
         *
         * Real users should never fill this field.
         */
        if (website) {
            return NextResponse.json(
                {error: "Invalid submission",},
                {status: 400,}
            );
        }

        /**
         * Verify Cloudflare Turnstile.
         */
        const formData = new FormData();

        formData.append("secret", process.env.TURNSTILE_SECRET_KEY!);

        formData.append("response", turnstileToken);

        const verificationResponse = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                body: formData,
            }
        );

        const verification = await verificationResponse.json();

        if (!verification.success) {
            return NextResponse.json(
                {error: "Unable to verify your submission. Please try again.",},
                {status: 403,}
            );
        }

        /**
         * Insert into Supabase.
         *
         * This uses the server-only service role client.
         */
        const {error} = await supabase
            .from("birthday_tributes")
            .insert({name, comment});

        if (error) {
            console.error("Supabase insert error:", error);

            return NextResponse.json(
                {error: "Unable to save your birthday wish.",},
                {status: 500,}
            );
        }

        return NextResponse.json({success: true});
    } catch (error) {
        console.error("Birthday tribute submission error:", error);

        return NextResponse.json(
            {error: "Something went wrong. Please try again.",},
            {status: 500}
        );
    }
}