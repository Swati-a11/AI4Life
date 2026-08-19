import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F3EE] dark:bg-[#080B12]">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto shadow-2xl rounded-3xl overflow-hidden",
            card: "bg-white dark:bg-[#111722] border border-slate-200 dark:border-slate-800 shadow-xl",
          },
        }}
        forceRedirectUrl="/student"
        signInUrl="/sign-in"
      />
    </div>
  );
}
