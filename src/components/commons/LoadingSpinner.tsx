import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

interface LoadingSpinnerProps {
    title: string;
}

export function LoadingSpinner({ title }: LoadingSpinnerProps) {
    return (
        <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
            <Item className="flex-col items-center justify-center text-center">
                <ItemMedia>
                    <Spinner className="size-8" />
                </ItemMedia>
                <ItemContent className="items-center">
                    <ItemTitle>{title ?? "Loading..."}</ItemTitle>
                </ItemContent>
            </Item>
        </div>
    );
}
