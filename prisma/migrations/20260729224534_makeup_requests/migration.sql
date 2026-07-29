-- CreateTable
CREATE TABLE `makeup_requests` (
    `id` VARCHAR(36) NOT NULL,
    `studentUserId` VARCHAR(36) NOT NULL,
    `originalSessionId` VARCHAR(36) NOT NULL,
    `reason` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'DENIED') NOT NULL DEFAULT 'PENDING',
    `proposedAt` DATETIME(3) NULL,
    `joinUrl` VARCHAR(500) NULL,
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `makeup_requests_studentUserId_originalSessionId_key`(`studentUserId`, `originalSessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `makeup_requests` ADD CONSTRAINT `makeup_requests_studentUserId_fkey` FOREIGN KEY (`studentUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `makeup_requests` ADD CONSTRAINT `makeup_requests_originalSessionId_fkey` FOREIGN KEY (`originalSessionId`) REFERENCES `class_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
