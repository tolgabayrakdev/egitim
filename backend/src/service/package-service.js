import pool from "../config/database.js";
import HttpException from "../exceptions/http-exception.js";

export default class PackageService {
    
    async createPackage(professionalId, packageData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Profesyonel kontrolü
            const professionalResult = await client.query(
                "SELECT id, role FROM users WHERE id = $1",
                [professionalId]
            );

            if (professionalResult.rows.length === 0) {
                throw new HttpException(404, "Kullanıcı bulunamadı");
            }

            if (professionalResult.rows[0].role !== 'professional') {
                throw new HttpException(403, "Sadece profesyonel kullanıcılar paket oluşturabilir");
            }

            // Paket oluştur
            const result = await client.query(
                `INSERT INTO packages (
                    professional_id, title, description, duration_days, price, status
                ) VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    professionalId,
                    packageData.title,
                    packageData.description || null,
                    packageData.duration_days || null,
                    packageData.price || null,
                    packageData.status || 'active'
                ]
            );

            await client.query("COMMIT");
            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async getPackages(professionalId) {
        const result = await pool.query(
            `SELECT * FROM packages 
             WHERE professional_id = $1 
             ORDER BY created_at DESC`,
            [professionalId]
        );
        return result.rows;
    }

    async getPackageById(packageId, professionalId) {
        const result = await pool.query(
            `SELECT * FROM packages 
             WHERE id = $1 AND professional_id = $2`,
            [packageId, professionalId]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, "Paket bulunamadı");
        }

        return result.rows[0];
    }

    async updatePackage(packageId, professionalId, packageData) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Paket sahibi kontrolü
            const existingPackage = await client.query(
                "SELECT * FROM packages WHERE id = $1 AND professional_id = $2",
                [packageId, professionalId]
            );

            if (existingPackage.rows.length === 0) {
                throw new HttpException(404, "Paket bulunamadı veya size ait değil");
            }

            // Güncelleme
            const updateFields = [];
            const values = [];
            let paramIndex = 1;

            if (packageData.title !== undefined) {
                updateFields.push(`title = $${paramIndex++}`);
                values.push(packageData.title);
            }
            if (packageData.description !== undefined) {
                updateFields.push(`description = $${paramIndex++}`);
                values.push(packageData.description);
            }
            if (packageData.duration_days !== undefined) {
                updateFields.push(`duration_days = $${paramIndex++}`);
                values.push(packageData.duration_days);
            }
            if (packageData.price !== undefined) {
                updateFields.push(`price = $${paramIndex++}`);
                values.push(packageData.price);
            }
            if (packageData.status !== undefined) {
                updateFields.push(`status = $${paramIndex++}`);
                values.push(packageData.status);
            }

            if (updateFields.length === 0) {
                throw new HttpException(400, "Güncellenecek alan belirtilmedi");
            }

            updateFields.push(`updated_at = NOW()`);
            
            // Add WHERE clause parameters
            values.push(packageId, professionalId);
            const wherePackageIdIndex = paramIndex++;
            const whereProfessionalIdIndex = paramIndex++;

            const result = await client.query(
                `UPDATE packages 
                 SET ${updateFields.join(', ')}
                 WHERE id = $${wherePackageIdIndex} AND professional_id = $${whereProfessionalIdIndex}
                 RETURNING *`,
                values
            );

            await client.query("COMMIT");
            return result.rows[0];
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async deletePackage(packageId, professionalId) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Paket sahibi kontrolü
            const existingPackage = await client.query(
                "SELECT * FROM packages WHERE id = $1 AND professional_id = $2",
                [packageId, professionalId]
            );

            if (existingPackage.rows.length === 0) {
                throw new HttpException(404, "Paket bulunamadı veya size ait değil");
            }

            // Aktif koçluk ilişkisi var mı kontrol et
            const activeRelationships = await client.query(
                `SELECT id FROM coaching_relationships 
                 WHERE package_id = $1 AND status = 'active'`,
                [packageId]
            );

            if (activeRelationships.rows.length > 0) {
                throw new HttpException(400, "Bu pakete ait aktif koçluk ilişkileri var. Önce ilişkileri tamamlayın veya iptal edin.");
            }

            await client.query("DELETE FROM packages WHERE id = $1", [packageId]);
            await client.query("COMMIT");

            return { message: "Paket başarıyla silindi" };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }
}

