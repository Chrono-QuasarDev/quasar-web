"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { login, register as registerApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(50, "Username must be under 50 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: async (values: RegisterForm) => {
      await registerApi(values);
      // Backend register returns no token — log in immediately.
      return login({ email: values.email, password: values.password });
    },
    onSuccess: (res) => {
      setSession(res.data.user, res.data.accessToken);
      toast.success(`Welcome to Quasar, ${res.data.user.username}`);
      router.replace("/home");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Registration failed. Try again.",
      );
    },
  });

  return (
    <div className="w-full max-w-md">
      <div className="glass rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/50">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Join the orbit
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Free forever. Your first playlist is 30 seconds away.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit((v) => mutation.mutate(v))}
        >
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Username
            </label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="e.g. vinyl_voyager"
              {...register("username")}
            />
            {errors.username && (
              <p className="mt-1.5 text-xs text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                className="pr-11"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already listening?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
      <p className="mt-4 text-center font-mono text-[11px] text-zinc-600">
        API: {process.env.NEXT_PUBLIC_API_URL}
      </p>
    </div>
  );
}
