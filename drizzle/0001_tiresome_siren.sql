CREATE TABLE `storeCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`title` varchar(120) NOT NULL,
	`detail` text,
	`tone` varchar(32) NOT NULL DEFAULT 'cyan',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storeCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `storeCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `storeProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'IQD',
	`imageUrl` text NOT NULL,
	`isAvailable` tinyint NOT NULL DEFAULT 1,
	`stock` int NOT NULL DEFAULT 10,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeProducts_id` PRIMARY KEY(`id`)
);
