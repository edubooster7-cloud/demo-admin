"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

// --- Schémas de Validation ---

const step1Schema = z.object({
  email: z.string().email("Veuillez entrer une adresse e-mail valide."),
});

const step2Schema = z
  .object({
    code: z.string().length(6, "Le code doit contenir exactement 6 chiffres."),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSaved, setEmailSaved] = useState("");

  // Formulaire Étape 1
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { email: "" },
  });

  // Formulaire Étape 2
  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });

  // --- Handlers ---

  const onStep1Submit = async (data: Step1Data) => {
    setIsLoading(true);
    try {
      // Simulation appel API (ex: /api/forgot-password)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setEmailSaved(data.email);
      setStep(2);
    } catch (error) {
      console.error("Erreur lors de l'envoi du code");
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2Submit = async (data: Step2Data) => {
    setIsLoading(true);
    try {
      // Simulation appel API (ex: /api/reset-password)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation");
    } finally {
      setIsLoading(false);
    }
  };

  // Si succès final
  if (isSuccess) {
    return (
      <Card className="p-6 text-center shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold">Mot de passe modifié !</h2>
          <p className="text-muted-foreground text-sm">
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez
            maintenant vous connecter.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Se connecter</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Formulaire */}
          <div className="p-6 md:p-8">
            {step === 1 ? (
              <form onSubmit={form1.handleSubmit(onStep1Submit)}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                      Entrez votre e-mail pour recevoir un code.
                    </p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...form1.register("email")}
                      id="email"
                      type="email"
                      placeholder="nom@exemple.com"
                      disabled={isLoading}
                    />
                    {form1.formState.errors.email && (
                      <p className="text-xs font-medium text-destructive mt-1">
                        {form1.formState.errors.email.message}
                      </p>
                    )}
                  </Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Envoyer le code
                  </Button>
                </FieldGroup>
              </form>
            ) : (
              <form onSubmit={form2.handleSubmit(onStep2Submit)}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Réinitialisation</h1>
                    <p className="text-muted-foreground text-sm">
                      Code envoyé à{" "}
                      <span className="font-semibold text-foreground">
                        {emailSaved}
                      </span>
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="code">Code (6 chiffres)</FieldLabel>
                    <Input
                      {...form2.register("code")}
                      id="code"
                      placeholder="123456"
                      className="text-center tracking-widest font-mono text-lg"
                      maxLength={6}
                      disabled={isLoading}
                    />
                    {form2.formState.errors.code && (
                      <p className="text-xs font-medium text-destructive mt-1">
                        {form2.formState.errors.code.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="password">
                      Nouveau mot de passe
                    </FieldLabel>
                    <Input
                      {...form2.register("password")}
                      id="password"
                      type="password"
                      disabled={isLoading}
                    />
                    {form2.formState.errors.password && (
                      <p className="text-xs font-medium text-destructive mt-1">
                        {form2.formState.errors.password.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirmer</FieldLabel>
                    <Input
                      {...form2.register("confirmPassword")}
                      id="confirmPassword"
                      type="password"
                      disabled={isLoading}
                    />
                    {form2.formState.errors.confirmPassword && (
                      <p className="text-xs font-medium text-destructive mt-1">
                        {form2.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </Field>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Mettre à jour
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-muted-foreground hover:underline mx-auto"
                  >
                    Utiliser une autre adresse
                  </button>
                </FieldGroup>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <Link
                href="/"
                className="underline underline-offset-4 hover:text-primary"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/login-image.jpg"
              alt="Réinitialisation"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Besoin d&apos;aide ?{" "}
        <a href="#" className="underline">
          Contactez le support
        </a>
      </FieldDescription>
    </div>
  );
}
