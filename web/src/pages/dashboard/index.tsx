import { useState, useEffect } from "react";
import { apiUrl } from "@/lib/api";

interface UserData {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export default function DashboardIndex() {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(apiUrl("api/auth/me"), {
                    method: "GET",
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        setUser(data.user);
                    }
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <div className="text-muted-foreground">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Kullanıcı bilgileri yüklenemedi</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hoş Geldiniz</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    {user.first_name} {user.last_name}, Edivora sistemine hoş geldiniz.
                </p>
            </div>
        </div>
    );
}
