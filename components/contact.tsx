"use client";
import {Field, FieldDescription, FieldError, FieldLabel,} from "@/components/ui/field";
import {BadgeCheckIcon} from "lucide-react"
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/toast"
import {format, isValid} from "date-fns"

import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,} from "@/components/ui/sheet";

import {Item, ItemContent, ItemDescription, ItemTitle,} from "@/components/ui/item"
import {ContactUsProps} from "@/types/ContactUsProps";

import {Turnstile} from "@marsidev/react-turnstile";

export default function ContactUs({
                                      wishes,
                                      isLoadingWishes,
                                      wishesError,
                                      hasMoreWishes,
                                      fetchBirthdayWishes,
                                      loadMoreBirthdayWishes,
                                      isLoadingMore,
                                      invalidateWishes,
                                  }: ContactUsProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isWishesSheetOpen, setIsWishesSheetOpen] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const formSchema = z.object({
        "name": z.string().min(1, {message: "This field is required"}),
        "comment": z
            .string()
            .min(1, {message: "This field is required"})
            .min(10, {message: "Must be at least 10 characters"})
            .max(1000, {message: "Message cannot exceed 1000 characters"}),
        "website": z.string().optional(),
    });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            "name": "",
            "comment": "",
            "website": "",
        },
    });

    const safeDate = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return isValid(date) ? format(date, "EEEE do MMMM, yyyy - h:mm a") : "Invalid Date";
    };

    /**
     * Helper function to Submit Birthday Wishes
     * @param values
     */
    async function submitBirthdayWish(values: FormValues): Promise<void> {
        if (!turnstileToken) {
            throw new Error("Please complete the verification.");
        }

        const response = await fetch(
            "/api/birthday-tributes",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(
                    {
                        name: values.name,
                        comment: values.comment,
                        turnstileToken,

                        // Honeypot
                        website: "",
                    }
                ),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error ?? "Unable to send your birthday wish.");
        }
    }

    /**
     * Handle and Display Wishes & Comments
     */
    function handleOpenWishes() {
        setIsWishesSheetOpen(true);
        fetchBirthdayWishes();
    }

    /**
     * Submit Birthday Wishes/Comments
     * @param values
     */
    async function onSubmit(values: FormValues) {
        console.log(values);
        try {
            setIsSubmitting(true);

            const commentSubmission = submitBirthdayWish(values);

            await toast.promise(commentSubmission, {
                loading: "Sending your birthday wish...",

                success: () => {
                    form.reset();
                    setTurnstileToken(null);

                    invalidateWishes();
                    setIsWishesSheetOpen(true);
                    return "Birthday wish sent! 🎉";
                },

                error: (error) => {
                    console.error("Error submitting birthday wish:", error);
                    return "Unable to send your message. Please try again.";
                },
            });

        } catch (error) {
            console.error("Error submitting birthday wish:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    function onReset() {
        form.reset();
        form.clearErrors();
    }

    return (
        <>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                onReset={onReset}
                className="space-y-8 @container"
            >
                <div className="grid grid-cols-12 gap-4">
                    <div key="text-0" id="text-0" className=" col-span-12 col-start-auto">
                        <p className="font-heading">I am</p>
                        <h1 className="font-heading text-4xl font-black">Dr. Albert Oduwole</h1>
                        <p className="not-first:mt-6 leading-7">
                            <span
                                className="text-lg font-semibold">My 55th birthday is coming up on November 23rd, 2026</span>

                            <br/>
                            <span className="text-sm text-muted-foreground">
                                Let me know how I&#39;ve impacted you.
                            </span>
                        </p>
                    </div>

                    <Controller
                        control={form.control}
                        name="name"
                        render={({field, fieldState}) => (
                            <Field
                                className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start"
                                data-invalid={fieldState.invalid}
                            >
                                <FieldLabel className="flex w-auto!">Full Name</FieldLabel>

                                <Input
                                    key="name"
                                    placeholder="John Doe"
                                    type="text"
                                    className=""
                                    disabled={isSubmitting}
                                    {...field}
                                />

                                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                            </Field>
                        )}
                    />
                    <Controller
                        control={form.control}
                        name="comment"
                        render={({field, fieldState}) => (
                            <Field
                                className="col-span-12 col-start-auto flex self-end flex-col gap-2 space-y-0 items-start"
                                data-invalid={fieldState.invalid}
                            >
                                <FieldLabel className="flex w-auto!">Birthday Wishes</FieldLabel>

                                <Textarea
                                    key="comment"
                                    id="comment"
                                    placeholder="Let me know how you've been impacted"
                                    rows={60}
                                    maxLength={1000}
                                    className="min-h-50"
                                    disabled={isSubmitting}
                                    {...field}
                                />

                                <div className="flex w-full justify-between">
                                    <FieldDescription>
                                        {field.value?.length ?? 0}/1000
                                    </FieldDescription>
                                </div>

                                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                            </Field>
                        )}
                    />

                    <div className="col-span-12 flex flex-col gap-2">
                        <input
                            type="text"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden="true"
                            className="hidden"
                        />

                        <Turnstile
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                            onSuccess={(token) => {
                                setTurnstileToken(token)
                            }}
                            onExpire={() => {
                                setTurnstileToken(null)
                            }}
                            onError={() => {
                                setTurnstileToken(null)
                            }}
                        />

                        <Button
                            id="submit-button-0"
                            className="w-full"
                            disabled={isSubmitting || !turnstileToken}
                            type="submit"
                            variant="default"
                        >
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>

                        <FieldDescription className="px-6 text-center">
                            Do you want to check birthday wishes?{" "}
                            <button
                                type="button"
                                onClick={handleOpenWishes}
                                className="underline hover:text-primary font-black"
                            >
                                Click Here
                            </button>
                        </FieldDescription>
                    </div>
                </div>
            </form>

            <Sheet
                open={isWishesSheetOpen}
                onOpenChange={setIsWishesSheetOpen}
            >
                <SheetContent side="right"
                              className="w-full sm:w-150 lg:w-175 sm:max-w-none data-[side=bottom]:max-h-[50vh]">
                    <SheetHeader>
                        <SheetTitle>
                            Birthday Wishes 🎉<Button
                            type="button"
                            variant="outline"
                            onClick={() => fetchBirthdayWishes(true)}
                        >
                            Reload
                        </Button>
                        </SheetTitle>

                        <SheetDescription>
                            Messages and birthday wishes for
                            Dr. Albert Oduwole.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="no-scrollbar overflow-y-auto px-4">

                        {isLoadingWishes && (
                            <div className="flex justify-center py-12">
                                <p className="text-sm text-muted-foreground">
                                    Loading birthday wishes...
                                </p>
                            </div>
                        )}

                        {!isLoadingWishes && wishesError && (
                            <div className="space-y-4 py-12 text-center">
                                <p className="text-sm text-destructive">
                                    {wishesError}
                                </p>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fetchBirthdayWishes(true)}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}

                        {!isLoadingWishes &&
                            !wishesError &&
                            wishes.length === 0 && (
                                <div className="py-12 text-center">
                                    <p className="font-medium">
                                        No birthday wishes yet 🎂
                                    </p>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Be the first person to leave a
                                        special message.
                                    </p>
                                </div>
                            )}

                        {!isLoadingWishes &&
                            !wishesError &&
                            wishes.length > 0 && (

                                <div className="flex w-full max-w-md flex-col gap-6">
                                    {wishes.map((wish) => (
                                        <Item key={wish.id} variant="default" size="default" render={<a href="#">
                                            {/* <ItemMedia>
                                            <BadgeCheckIcon className="size-5" />
                                        </ItemMedia> */}
                                            <ItemContent>
                                                <ItemTitle className="font-black capitalize">
                                                    <BadgeCheckIcon className="size-5"/> {wish.name.toLocaleLowerCase()}
                                                </ItemTitle>
                                                <ItemDescription
                                                    className="text-xs">{safeDate(wish.created_at)}</ItemDescription>
                                                <p>
                                                    {wish.comment}
                                                </p>
                                            </ItemContent>
                                        </a>}

                                        />

                                    ))}

                                    {hasMoreWishes && (
                                        <div className="flex justify-center py-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isLoadingMore}
                                                onClick={loadMoreBirthdayWishes}
                                            >
                                                {isLoadingMore ? "Loading..." : "Load More"}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                            )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}