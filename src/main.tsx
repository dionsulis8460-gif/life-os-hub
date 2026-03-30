import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { migrateStorageKeys } from "./lib/storage-keys";

migrateStorageKeys();

createRoot(document.getElementById("root")!).render(<App />);
