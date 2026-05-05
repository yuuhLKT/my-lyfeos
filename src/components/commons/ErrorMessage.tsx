import { AlertCircle } from "lucide-react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

interface ErrorMessageProps {
    title: string;
}

export function ErrorMessage({ title }: ErrorMessageProps) {
    return (
        <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
            <Item className="flex-col items-center justify-center text-center">
                <ItemMedia>
                    <AlertCircle className="size-8 text-red-500" />
                </ItemMedia>
                <ItemContent className="items-center">
                    <ItemTitle className="text-red-500">
                        {title ??
                            "Ocorreu um erro inesperado. Tente novamente mais tarde."}
                    </ItemTitle>
                </ItemContent>
            </Item>
        </div>
    );
}
