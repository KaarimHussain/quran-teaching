/*
  Warnings:

  - You are about to drop the `store_products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `store_products` DROP FOREIGN KEY `store_products_createdByUserId_fkey`;

-- DropTable
DROP TABLE `store_products`;

-- CreateTable
CREATE TABLE `store_items` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` ENUM('COURSE', 'DOCUMENT', 'VIDEO', 'AUDIO', 'HISTORICAL_STORY') NOT NULL,
    `level` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS') NOT NULL DEFAULT 'ALL_LEVELS',
    `language` ENUM('EN', 'UR', 'AR') NOT NULL DEFAULT 'EN',
    `pricePence` INTEGER NOT NULL,
    `coverImageUrl` TEXT NULL,
    `contentUrl` TEXT NULL,
    `durationMins` INTEGER NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `createdByUserId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `store_modules` (
    `id` VARCHAR(36) NOT NULL,
    `storeItemId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `moduleOrder` INTEGER NOT NULL DEFAULT 0,
    `durationMins` INTEGER NULL,
    `contentUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `store_items` ADD CONSTRAINT `store_items_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `store_modules` ADD CONSTRAINT `store_modules_storeItemId_fkey` FOREIGN KEY (`storeItemId`) REFERENCES `store_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
