CREATE TABLE `storeOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int,
	`productName` varchar(180) NOT NULL,
	`price` int NOT NULL,
	`quantity` int NOT NULL,
	CONSTRAINT `storeOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storeOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(180) NOT NULL,
	`customerPhone` varchar(50) NOT NULL,
	`customerAddress` text NOT NULL,
	`notes` text,
	`totalAmount` int NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'IQD',
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeOrders_id` PRIMARY KEY(`id`)
);
