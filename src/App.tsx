import { UpdaterScreen } from "@/components/screens/UpdaterScreen";
import { useUpdater } from "@/hooks/useUpdater";
import Layout from "@/layout";
import { useAppStore } from "@/stores/appStore";
import { allNavItems } from "@/navigation";
import { useState } from "react";

function App() {
    const updaterState = useUpdater();
    const [showHome, setShowHome] = useState(false);
    const isDevMode = import.meta.env.VITE_MODE === "dev";
    const activeScreen = useAppStore((state) => state.activeScreen);

    const activeItem = allNavItems.find((item) => item.id === activeScreen);
    const ActiveComponent = activeItem?.component ?? (() => null);

    if (!showHome && !isDevMode) {
        return (
            <UpdaterScreen
                state={updaterState}
                onSkip={() => setShowHome(true)}
            />
        );
    }

    return (
        <Layout>
            <ActiveComponent />
        </Layout>
    );
}

export default App;
