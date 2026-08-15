"use client";

import { useCallback, useMemo, useState, useEffect } from "react";

import ContactUs from "@/components/contact";

import { supabase } from "@/lib/supabase";
import { BirthdayWish } from "@/types/BirthdayWish";
import { BirthdayCarousel } from "./birthday-carousel";

const PAGE_SIZE = 10;

export default function BirthdayTribute() {
    const [wishes, setWishes] = useState<BirthdayWish[]>([]);
    
    const [isLoadingWishes, setIsLoadingWishes] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [wishesError, setWishesError] = useState<string | null>(null);
    const [hasLoadedWishes, setHasLoadedWishes] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [hasMoreWishes, setHasMoreWishes] = useState(true);

    const fetchBirthdayWishes = useCallback(
        async (forceRefresh = false) => {
            if (hasLoadedWishes && !forceRefresh) {
                return;
            }

            try {
                setIsLoadingWishes(true);
                setWishesError(null);

                const { data, error } = await supabase
                    .from("birthday_tributes")
                    .select("id, name, comment, created_at")
                    .order("created_at", {
                        ascending: false,
                    }).range(0, PAGE_SIZE - 1);

                if (error) {
                    throw error;
                }

                const newWishes = data ?? [];

                setWishes(newWishes);
                setCurrentPage(1);
                setHasMoreWishes(newWishes.length === PAGE_SIZE);
                setHasLoadedWishes(true);
            } catch (error) {
                console.error("Error fetching birthday wishes:", error);
                setWishesError("Unable to load birthday wishes. Please try again.");
            } finally {
                setIsLoadingWishes(false);
            }
        },
        [hasLoadedWishes]
    );

    const loadMoreBirthdayWishes = useCallback(async () => {
        if (isLoadingMore || !hasMoreWishes) {
            return;
        }

        try {
            setIsLoadingMore(true);

            const from = currentPage * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error } = await supabase
                .from("birthday_tributes")
                .select("id, name, comment, created_at")
                .order("created_at", {ascending: false,})
                .range(from, to);

            if (error) {
                throw error;
            }

            const newWishes = data ?? [];

            setWishes((currentWishes) => {
                const existingIds = new Set(currentWishes.map((wish) => wish.id));
                const uniqueNewWishes = newWishes.filter((wish) => !existingIds.has(wish.id));
                return [...currentWishes, ...uniqueNewWishes];
            });

            setCurrentPage((page) => page + 1);

            setHasMoreWishes(newWishes.length === PAGE_SIZE);
        } catch (error) {
            console.error("Error loading more birthday wishes:",error);
            setWishesError("Unable to load more wishes. Please try again.");
        } finally {
            setIsLoadingMore(false);
        }
    }, [
        currentPage,
        hasMoreWishes,
        isLoadingWishes,
    ])

    useEffect(() => {
        fetchBirthdayWishes();
    }, [fetchBirthdayWishes]);

    const carouselWishes = useMemo(() => {
        return wishes.slice(0, 5);
    }, [wishes]);

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex flex-2 items-center justify-center">
                    <div className="w-full max-w-xl">
                        <ContactUs
                            wishes={wishes}
                            isLoadingWishes={isLoadingWishes}
                            wishesError={wishesError}
                            hasMoreWishes={hasLoadedWishes}
                            fetchBirthdayWishes={fetchBirthdayWishes}
                            isLoadingMore={isLoadingMore}
                            loadMoreBirthdayWishes={loadMoreBirthdayWishes}
                            invalidateWishes={ () => setHasLoadedWishes(false) }
                        />
                    </div>
                </div>
            </div>

            <div className="relative hidden overflow-hidden bg-muted lg:block">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/albertoduwole_image.jpg')",}}
                />

                <div className="relative z-10 flex h-full items-center justify-center p-10">
                    <BirthdayCarousel wishes={carouselWishes} />
                </div>
            </div>
        </div>
    );
}