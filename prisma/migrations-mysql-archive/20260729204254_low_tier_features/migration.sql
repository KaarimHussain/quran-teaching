-- AlterTable
ALTER TABLE `assignments` ADD COLUMN `isWorksheet` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `targetStudentUserId` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `class_sessions` ADD COLUMN `genderRestriction` ENUM('MIXED', 'SISTERS_ONLY', 'BROTHERS_ONLY') NOT NULL DEFAULT 'MIXED',
    ADD COLUMN `makeupForSessionId` VARCHAR(36) NULL,
    ADD COLUMN `maxParticipants` INTEGER NULL,
    MODIFY `type` ENUM('ONE_TO_ONE', 'GROUP', 'SEMI_PRIVATE') NOT NULL;

-- AlterTable
ALTER TABLE `enrollments` ADD COLUMN `isTrial` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `preferredTeacherId` VARCHAR(36) NULL,
    ADD COLUMN `trialEndsAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `specialNeedsNote` TEXT NULL,
    ADD COLUMN `teachingHoursLogged` INTEGER NULL,
    ADD COLUMN `verifiedLanguages` JSON NULL;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `body` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `coverImageUrl` TEXT NULL,
    `language` ENUM('EN', 'UR', 'AR') NOT NULL DEFAULT 'EN',
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `authorUserId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsletter_subscribers` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `language` ENUM('EN', 'UR', 'AR') NOT NULL DEFAULT 'EN',
    `subscribedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `newsletter_subscribers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `public_events` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `language` ENUM('EN', 'UR', 'AR') NOT NULL DEFAULT 'EN',
    `scheduledAt` DATETIME(3) NOT NULL,
    `joinUrl` TEXT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `hostUserId` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_preferredTeacherId_fkey` FOREIGN KEY (`preferredTeacherId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_sessions` ADD CONSTRAINT `class_sessions_makeupForSessionId_fkey` FOREIGN KEY (`makeupForSessionId`) REFERENCES `class_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_targetStudentUserId_fkey` FOREIGN KEY (`targetStudentUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `public_events` ADD CONSTRAINT `public_events_hostUserId_fkey` FOREIGN KEY (`hostUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
