export type BirthdayWish = {
    id: string;
    name: string;
    comment: string;
    created_at: string;
};


type BirthdayCarouselProps = {
    wishes: BirthdayWish[];
};


export function BirthdayCarousel({
    wishes,
}: BirthdayCarouselProps) {
    return (
        <div>
            {wishes.map((wish) => (
                <div key={wish.id}>
                    <h2>{wish.name}</h2>

                    <p>{wish.comment}</p>
                </div>
            ))}
        </div>
    );
}