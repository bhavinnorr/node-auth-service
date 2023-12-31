-- AlterTable
ALTER TABLE `products` MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `users` MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;
