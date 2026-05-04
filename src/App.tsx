import { HomeScreen } from "@/components/screens/HomeScree";
import { UpdaterScreen } from "@/components/screens/UpdaterScreen";
import { useUpdater } from "@/hooks/useUpdater";
import Layout from "@/layout";
import { useEffect, useState } from "react";

function App() {
    const updaterState = useUpdater();
    const [showHome, setShowHome] = useState(false);

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
        <Layout>
            <HomeScreen />
        </Layout>
    );
}

export default App;
