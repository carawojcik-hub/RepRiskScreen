import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  const [selectedPage, setSelectedPage] = useState("Overview");

  const handleNavigatePipeline = () => {
    console.log("Navigate: Pipeline");
  };

  return (
    <DashboardLayout
      selectedPage={selectedPage}
      setSelectedPage={setSelectedPage}
      onNavigatePipeline={handleNavigatePipeline}
    />
  );
}

export default App;
