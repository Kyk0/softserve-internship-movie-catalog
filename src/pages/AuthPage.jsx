import React, { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate("/");
    }, [user, navigate]);

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="p-6 bg-white rounded shadow-md w-full max-w-sm">
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    theme="default"
                    providers={[]}
                    onlyThirdPartyProviders={false}
                />
            </div>
        </div>
    );
}