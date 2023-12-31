-- AlterTable
ALTER TABLE `products` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT false;
