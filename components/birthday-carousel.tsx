"use client";


import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { BirthdayWish } from "@/types/BirthdayWish";
import Autoplay from "embla-carousel-autoplay"

type BirthdayCarouselProps = {
    wishes: BirthdayWish[];
};

export function BirthdayCarousel({
    wishes,
}: BirthdayCarouselProps) {
    if (wishes.length === 0) {
        return null;
    }

    return (
        <Carousel
            opts={{
                align: "start",
                loop: true
            }}
            plugins={[
                Autoplay({
                    delay: 5000,
                }),
            ]}
            orientation="vertical"
            className="w-full max-w-2xl"
        >
            <h1 className="font-heading text-xl font-bold text-white capitalize">Well Wishes</h1>
            <CarouselContent className="-mt-1 h-67.5">
                {wishes.map((wish) => (
                    <CarouselItem
                        key={wish.id}
                        className="basis-1/2 pt-1"
                    >
                        <div className="p-1">
                            <Card className="bg-background/2 backdrop-blur">
                                <CardContent className="p-6">
                                    <h1 className="font-heading text-xl font-black text-white capitalize">
                                        { wish.name.toLocaleLowerCase() }
                                    </h1>

                                    <p className="mt-2 line-clamp-4 text-sm text-muted-foreground text-white">
                                        {wish.comment}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>

            <CarouselPrevious variant="ghost" size="icon-lg" />
            <CarouselNext variant="ghost" size="icon-lg" />
        </Carousel>
    );
}