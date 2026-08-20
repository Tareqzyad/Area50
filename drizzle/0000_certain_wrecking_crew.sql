CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room` enum('vip','vvip') NOT NULL,
	`guestName` varchar(120) NOT NULL,
	`bookingDate` varchar(10) NOT NULL,
	`startHour` int NOT NULL,
	`endHour` int NOT NULL,
	`guests` int NOT NULL,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomPrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room` enum('vip','vvip') NOT NULL,
	`pricePerHour` int NOT NULL DEFAULT 0,
	`currency` varchar(8) NOT NULL DEFAULT 'IQD',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roomPrices_id` PRIMARY KEY(`id`),
	CONSTRAINT `roomPrices_room_unique` UNIQUE(`room`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
