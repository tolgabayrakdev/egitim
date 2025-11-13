import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/loading";
import { apiUrl } from "@/lib/api";

interface AuthProviderProps {
    children: ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [rateLimited, setRateLimited] = useState(false);

    const verifyAuthToken = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout
            
            const res = await fetch(apiUrl('/api/auth/me'), {
                method: 'GET',
                credentials: 'include',
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);
            
            if (res.status === 200) {
                setLoading(false);
                setRateLimited(false);
            } else if (res.status === 403) {
                // Ban durumu kontrolü
                const errorData = await res.json().catch(() => ({ message: 'Hesabınız kapatılmıştır.' }));
                setLoading(false);
                setAccessDenied(true);
                // Ban mesajını localStorage'a kaydet (sign-in sayfasında gösterilecek)
                if (errorData.message) {
                    localStorage.setItem('ban_message', errorData.message);
                }
            } else if (res.status === 429) {
                setLoading(false);
                setRateLimited(true);
            } else if (res.status === 408) {
                // Timeout error
                setLoading(false);
                setAccessDenied(true);
            } else if (res.status === 401) {
                setLoading(false);
                setAccessDenied(true);
            } else {
                setLoading(false);
                setAccessDenied(true);
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                // Timeout durumu
                setLoading(false);
                setAccessDenied(true);
            } else {
                setLoading(false);
                setAccessDenied(true);
            }
        }
    };

    useEffect(() => {
        void (async () => {
            await verifyAuthToken();
        })();
    }, []);

    const handleRetry = () => {
        setLoading(true);
        setRateLimited(false);
        verifyAuthToken();
    };

    const handleLogout = () => {
        navigate('/sign-in');
    };

    useEffect(() => {
        if (accessDenied) {
            // Directly redirect to sign-in without showing anything
            window.location.href = '/sign-in';
        }
    }, [accessDenied]);

    // If access denied, don't render anything (redirect is happening)
    if (accessDenied) {
        return null;
    }

    if (loading) {
        return <Loading />
    } else if (rateLimited) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-red-600 dark:text-red-400">
                            Çok Fazla İstek
                        </CardTitle>
                        <CardDescription className="text-center">
                            Çok fazla istek gönderdiniz. Lütfen bekleyiniz.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleRetry} 
                                className="flex-1"
                            >
                                Tekrar Dene
                            </Button>
                            <Button 
                                onClick={handleLogout} 
                                variant="outline" 
                                className="flex-1"
                            >
                                Çıkış Yap
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}

export default AuthProvider;
