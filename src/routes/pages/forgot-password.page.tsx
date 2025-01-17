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
import authService, {
  AuthErrorCodes,
  ForgotPasswordErrorResponse,
  SendEmailForgotPasswordErrorResponse,
} from "@/lib/api/services/auth.service";
import { Link } from "@/components/link";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setFormError } from "@/lib/utils";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export function ForgotPasswordPage() {
  const [sendEmailCooldown, setSendEmailCooldown] = useState<number>(0);
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });
  const navigate = useNavigate();

  const sendEmailForgotPasswordMutation = useMutation({
    mutationFn: authService.sendEmailForgotPassword,
    onSuccess(data) {
      const { retryAfter, message } = data.data;
      const cooldown = new Date(retryAfter).getTime() - Date.now();
      setSendEmailCooldown(Math.ceil(cooldown / 1000));
      toast({
        title: "Forgot Password Email Sent",
        description: message,
      });
    },
    onError(error) {
      if (axios.isAxiosError<SendEmailForgotPasswordErrorResponse>(error)) {
        switch (error.response?.data.errorCode) {
          case AuthErrorCodes.ValidationError:
          case AuthErrorCodes.InvalidEmail:
            setFormError(form, error.response.data.errors);
            toast({
              title: "Send Forgot Password Failed",
              description: "Please check the form for errors.",
            });
            break;
          default:
            toast({
              title: "Send Forgot Password Failed",
              description:
                error.response?.data.message || "An unknown error occurred.",
            });
        }
      } else {
        toast({
          title: "Send Forgot Password Failed",
          description: "An unknown error occurred.",
        });
      }
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess(data) {
      const { message, token } = data.data;
      toast({
        title: "Forgot Password Successful",
        description: message,
      });
      navigate({
        pathname: "/reset-password",
        search: new URLSearchParams({
          token,
        }).toString(),
      });
    },
    onError(error) {
      if (axios.isAxiosError<ForgotPasswordErrorResponse>(error)) {
        switch (error.response?.data.errorCode) {
          case AuthErrorCodes.ValidationError:
          case AuthErrorCodes.CodeInvalid:
          case AuthErrorCodes.InvalidEmail:
            setFormError(form, error.response.data.errors);
            toast({
              title: "Forgot Password Failed",
              description: "Please check the form for errors.",
            });
            break;
          default:
            toast({
              title: "Forgot Password Failed",
              description:
                error.response?.data.message || "An unknown error occurred.",
            });
        }
      } else {
        toast({
          title: "Forgot Password Failed",
          description: "An unknown error occurred.",
        });
      }
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    forgotPasswordMutation.mutate(values);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (sendEmailCooldown > 0) {
        setSendEmailCooldown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  const onSendEmail = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const isEmailValid = await form.trigger("email");
    if (!isEmailValid) return;

    sendEmailForgotPasswordMutation.mutate({ email: form.getValues("email") });
  };

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
                      onClick={onSendEmail}
                      disabled={sendEmailCooldown > 0}
                    >
                      {sendEmailCooldown > 0
                        ? `Resend in ${sendEmailCooldown}s`
                        : `Send Reset Email`}
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
                Reset Password
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
