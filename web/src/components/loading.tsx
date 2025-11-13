export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                    <div 
                        className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                        style={{ animationDelay: '0ms' }}
                    />
                    <div 
                        className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                        style={{ animationDelay: '150ms' }}
                    />
                    <div 
                        className="w-2 h-2 bg-primary rounded-full animate-bounce" 
                        style={{ animationDelay: '300ms' }}
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    Yükleniyor...
                </p>
            </div>
        </div>
    );
}
