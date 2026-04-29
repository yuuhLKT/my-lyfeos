import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useUpdater } from "@/hooks/useUpdater";
import { UpdaterScreen } from "@/components/screens/UpdaterScreen";

function App() {
    const updaterState = useUpdater();
    const [showHome, setShowHome] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (
            updaterState.type === "no-update" ||
            updaterState.type === "error"
        ) {
            const timer = setTimeout(() => setShowHome(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [updaterState.type]);

    if (!showHome) {
        return (
            <UpdaterScreen
                state={updaterState}
                onSkip={() => setShowHome(true)}
            />
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-foreground">
            <h1 className="text-4xl font-bold">LyfeOS</h1>
            <p className="text-muted-foreground">Seu organizador pessoal</p>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => setCount((c) => c - 1)}
                >
                    -
                </Button>
                <span className="min-w-[3ch] text-center text-lg font-semibold">
                    {count}
                </span>
                <Button onClick={() => setCount((c) => c + 1)}>+</Button>
            </div>
        </main>
    );
}

export default App;
