import { BirthdayWish } from "./BirthdayWish";

export type ContactUsProps = {
    wishes: BirthdayWish[];
    isLoadingWishes: boolean;
    wishesError: string | null;
    hasMoreWishes: boolean;
    fetchBirthdayWishes: (forceRefresh?: boolean) => Promise<void>;
    loadMoreBirthdayWishes: () => Promise<void>;
    isLoadingMore: boolean;
    invalidateWishes: () => void;
};