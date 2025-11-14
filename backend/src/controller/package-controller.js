import PackageService from "../service/package-service.js";

export default class PackageController {
    constructor() {
        this.packageService = new PackageService();
    }

    async createPackage(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { title, description, duration_days, price, status } = req.body;

            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: "Paket başlığı gereklidir"
                });
            }

            const result = await this.packageService.createPackage(professionalId, {
                title,
                description,
                duration_days,
                price,
                status
            });

            res.status(201).json({
                success: true,
                message: "Paket başarıyla oluşturuldu",
                package: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getPackages(req, res, next) {
        try {
            const professionalId = req.user.id;
            const result = await this.packageService.getPackages(professionalId);

            res.status(200).json({
                success: true,
                packages: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getPackageById(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { packageId } = req.params;

            const result = await this.packageService.getPackageById(packageId, professionalId);

            res.status(200).json({
                success: true,
                package: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePackage(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { packageId } = req.params;
            const { title, description, duration_days, price, status } = req.body;

            const result = await this.packageService.updatePackage(packageId, professionalId, {
                title,
                description,
                duration_days,
                price,
                status
            });

            res.status(200).json({
                success: true,
                message: "Paket başarıyla güncellendi",
                package: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePackage(req, res, next) {
        try {
            const professionalId = req.user.id;
            const { packageId } = req.params;

            const result = await this.packageService.deletePackage(packageId, professionalId);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

