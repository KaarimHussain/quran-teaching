-- AlterTable
ALTER TABLE `course_modules` ADD COLUMN `assessment` JSON NULL,
    ADD COLUMN `code` VARCHAR(191) NULL,
    ADD COLUMN `isGated` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `levelId` VARCHAR(36) NULL,
    ADD COLUMN `mandatoryLearning` JSON NULL,
    ADD COLUMN `practice` JSON NULL,
    ADD COLUMN `subjects` JSON NULL;

-- CreateTable
CREATE TABLE `curriculum_levels` (
    `id` VARCHAR(36) NOT NULL,
    `number` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `purpose` TEXT NULL,
    `methodologyNote` TEXT NULL,
    `minAge` INTEGER NULL,
    `courseId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `curriculum_levels_number_key`(`number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_sign_offs` (
    `id` VARCHAR(36) NOT NULL,
    `studentUserId` VARCHAR(36) NOT NULL,
    `moduleId` VARCHAR(36) NOT NULL,
    `signedOffByUserId` VARCHAR(36) NOT NULL,
    `notes` TEXT NULL,
    `signedOffAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `module_sign_offs_studentUserId_moduleId_key`(`studentUserId`, `moduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `course_modules_code_key` ON `course_modules`(`code`);

-- AddForeignKey
ALTER TABLE `course_modules` ADD CONSTRAINT `course_modules_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `curriculum_levels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_levels` ADD CONSTRAINT `curriculum_levels_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_sign_offs` ADD CONSTRAINT `module_sign_offs_studentUserId_fkey` FOREIGN KEY (`studentUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_sign_offs` ADD CONSTRAINT `module_sign_offs_signedOffByUserId_fkey` FOREIGN KEY (`signedOffByUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_sign_offs` ADD CONSTRAINT `module_sign_offs_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `course_modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
