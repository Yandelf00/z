import Image from "next/image";
import {RegisterLink, LoginLink} from "@kinde-oss/kinde-auth-nextjs/components";
export default function Home() {
  return (
    <main>
    <LoginLink>Sign in</LoginLink>
    <RegisterLink>Sign up</RegisterLink>
    </main>
  );
}
