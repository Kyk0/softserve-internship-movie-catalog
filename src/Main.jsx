import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store.js";

import App from "./App.jsx";
import { AuthProvider } from "./AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <Provider store={store}>
            <App />
        </Provider>
    </AuthProvider>
);