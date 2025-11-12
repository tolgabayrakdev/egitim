// Request timeout middleware - Backend çökmemesi için
const requestTimeout = (req, res, next) => {
    const timeoutId = setTimeout(() => {
        if (!res.headersSent) {
            console.warn(`Request timeout for ${req.method} ${req.url}`);
            res.status(408).json({
                status: 408,
                message: "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
                timeout: true
            });
        }
    }, 30000); // 30 saniye timeout

    // Cleanup timeout when response is sent
    const originalEnd = res.end;
    res.end = function(...args) {
        clearTimeout(timeoutId);
        originalEnd.apply(this, args);
    };

    // Cleanup timeout when connection is closed
    req.on('close', () => {
        clearTimeout(timeoutId);
    });

    res.on('close', () => {
        clearTimeout(timeoutId);
    });

    next();
};

export default requestTimeout;