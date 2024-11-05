import { lucia, validateRequest } from "@/lib/auth";
import { Form } from "@/lib/form";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import type { ActionResult } from "@/lib/form";

export default async function Page() {
    const { user } = await validateRequest();
    if (!user) {
        return redirect("/login");
    }

    return (
        <>
            <h1>Hi, {user.id}!</h1>
            <p>Your user ID is {user.id}.</p>
            <Form action={logout}>
                <button>Sign out</button>
            </Form>
        </>
    );
}

async function logout(): Promise<ActionResult> {
    "use server";
    const { session } = await validateRequest();
    if (!session) {
        return {
            error: "Unauthorized"
        };
    }

    // Invalidate the session
    await lucia.invalidateSession(session.id);

    // Create a blank session cookie to clear the existing session
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    // Redirect the user to the login page after logging out
    return redirect("/login");
}
