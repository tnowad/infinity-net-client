import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { z } from "zod";
import authService from "@/lib/api/services/auth.service";
import { Link } from "@/components/link";
import { useState } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export function ForgotPasswordPage() {
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  const forgotPasswordMutation = useMutation(
    async (values: z.infer<typeof forgotPasswordSchema>) => {
      // await authService.requestPasswordReset(values.email);
    },
    {
      onSuccess() {
        toast({
          title: "Password Reset Requested",
          description:
            "If an account with that email exists, a reset link has been sent.",
        });
      },
      onError() {
        toast({
          title: "Request Failed",
          description:
            "There was an issue with your request. Please try again.",
        });
      },
    },
  );

  const onSubmit = form.handleSubmit((values) => {
    forgotPasswordMutation.mutate(values);
  });

  return (
    <Card className="mx-auto w-full max-w-md space-y-6">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@infinity.net" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the email address associated with your account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <div className="flex justify-between gap-1.5">
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <Button
                      variant="outline"
                      // onClick={onResendCode}
                      disabled={resendCooldown > 0}
                    >
                      {resendCooldown > 0
                        ? `Resend Code in ${resendCooldown}s`
                        : `Resend Code`}
                    </Button>
                  </div>
                  <FormDescription>
                    Please check your email for the verification code.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-4 mt-4">
              <Button className="w-full" type="submit">
                Send Reset Link
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="!mt-0 gap-2">
        <div className="flex items-center justify-between w-full mt-4">
          <Link href="/sign-in" className="text-sm hover:text-primary">
            Back to Sign In
          </Link>
          <span className="text-sm">
            Don't have an account?{" "}
            <Link href="/sign-up" className="hover:text-primary">
              Sign Up
            </Link>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}