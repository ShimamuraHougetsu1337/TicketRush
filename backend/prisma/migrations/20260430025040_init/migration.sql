-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `age` INTEGER NULL,
    `gender` VARCHAR(10) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `status` ENUM('UPCOMING', 'ONGOING', 'ENDED') NOT NULL DEFAULT 'UPCOMING',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `total_rows` INTEGER NOT NULL,
    `seats_per_row` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `event_id` INTEGER NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seats` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `event_id` INTEGER NOT NULL,
    `zone_id` INTEGER NOT NULL,
    `row_name` VARCHAR(10) NOT NULL,
    `seat_number` INTEGER NOT NULL,
    `status` ENUM('AVAILABLE', 'LOCKED', 'SOLD') NOT NULL DEFAULT 'AVAILABLE',
    `order_id` INTEGER NULL,
    `locked_by` INTEGER NULL,
    `locked_at` DATETIME(3) NULL,
    `ticket_code` VARCHAR(255) NULL,

    UNIQUE INDEX `seats_ticket_code_key`(`ticket_code`),
    INDEX `seats_event_id_status_idx`(`event_id`, `status`),
    INDEX `seats_locked_at_idx`(`locked_at`),
    UNIQUE INDEX `seats_event_id_zone_id_row_name_seat_number_key`(`event_id`, `zone_id`, `row_name`, `seat_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `zones` ADD CONSTRAINT `zones_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_zone_id_fkey` FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_locked_by_fkey` FOREIGN KEY (`locked_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
