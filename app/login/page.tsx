import Link from "next/link";
import prisma from "@/lib/db";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Form } from "@/lib/form";

import type { ActionResult } from "@/lib/form";

export default async function Page() {
	const { user } = await validateRequest();
	if (user) {
		return redirect("/");
	}
	return (
		<main className="h-screen w-screen bg-black flex justify-center items-center">
			<section className="h-[70%] w-[70%] flex flex-row">
				<div className="w-1/2 h-full flex justify-center items-center">
				<h1 className="text-[300px] font-bold cursor-pointer text-white">Z</h1>
				</div>
				<div className="w-1/2 h-full flex justify-center items-center text-white">
					<h1>Sign in</h1>
					<Form action={login}>
						<label htmlFor="username">Username</label>
						<input name="username" id="username" />
						<br />
						<label htmlFor="password">Password</label>
						<input type="password" name="password" id="password" />
						<br />
						<button>Continue</button>
					</Form>
					<Link href="/signup">Create an account</Link>
				</div>
			</section>
		</main>
	);
}

async function login(_: any, formData: FormData): Promise<ActionResult> {
	"use server";
	const username = formData.get("username");
	if (
		typeof username !== "string" ||
		username.length < 3 ||
		username.length > 31 ||
		!/^[a-z0-9_-]+$/.test(username)
	) {
		return {
			error: "Invalid username"
		};
	}
	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return {
			error: "Invalid password"
		};
	}

    const existingUser = await prisma.user.findUnique({
        where: {email : username},
    });

    if (!existingUser ) {
        return {
            error: "Incorrect username"
        };
    }
	if(existingUser){
		console.log("this is the user", existingUser.hashedPassword)
	}
	if (!existingUser.hashedPassword){
		return{
			error : "incorrect password"
		};
	}

	const validPassword = await verify(existingUser.hashedPassword, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	if (!validPassword) {
		// NOTE:
		// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// However, valid usernames can be already be revealed with the signup page among other methods.
		// It will also be much more resource intensive.
		// Since protecting against this is non-trivial,
		// it is crucial your implementation is protected against brute-force attacks with login throttling, 2FA, etc.
		// If usernames are public, you can outright tell the user that the username is invalid.
		return {
			error: "Incorrect username or password"
		};
	}

	const session = await lucia.createSession(existingUser.id, {});
	console.log("this is session : ", session)
	const sessionCookie = lucia.createSessionCookie(session.id);
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	return redirect("/");
}