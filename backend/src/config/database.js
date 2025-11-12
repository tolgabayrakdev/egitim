import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    idleTimeoutMillis: 10000, // 10 saniye idle timeout
    connectionTimeoutMillis: 30000, // 30 saniye connection timeout
    max: 20, // Maksimum bağlantı sayısını azalt
    min: 2, // Minimum bağlantı sayısı
    acquireTimeoutMillis: 20000, // Bağlantı alma timeout'u
    createTimeoutMillis: 10000, // Bağlantı oluşturma timeout'u
    destroyTimeoutMillis: 5000, // Bağlantı yok etme timeout'u
    reapIntervalMillis: 1000, // Boş bağlantıları temizleme aralığı
    createRetryIntervalMillis: 200, // Bağlantı oluşturma retry aralığı
});

pool.query("SELECT 1")
    .then(() => console.log("✅ Database connected successfully"))
    .catch(err => console.error("❌ Database connection error:", err.stack));

export default pool;