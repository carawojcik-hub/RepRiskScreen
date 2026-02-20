import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import { ENTITIES as ENTITIES_SEED } from "./data/entities";

function App() {
  const [selectedPage, setSelectedPage] = useState("Overview");
  const [entities, setEntities] = useState(() => ENTITIES_SEED);

  const handleNavigatePipeline = () => {
    console.log("Navigate: Pipeline");
  };

  return (
    <DashboardLayout
      selectedPage={selectedPage}
      setSelectedPage={setSelectedPage}
      onNavigatePipeline={handleNavigatePipeline}
      entities={entities}
      setEntities={setEntities}
    />
  );
}

export default App;
