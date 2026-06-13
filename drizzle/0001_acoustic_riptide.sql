CREATE TABLE `participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poolId` int NOT NULL,
	`userId` int,
	`name` varchar(128) NOT NULL,
	`assignedTeamId` int,
	`paymentStatus` enum('pending','paid','free') NOT NULL DEFAULT 'free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`poolId` int NOT NULL,
	`userId` int,
	`amount` decimal(10,2),
	`paystackReference` varchar(128),
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` varchar(128) NOT NULL,
	`organizerId` int NOT NULL,
	`entryFee` decimal(10,2) DEFAULT '0',
	`currency` varchar(3) DEFAULT 'USD',
	`maxParticipants` int DEFAULT 8,
	`plan` enum('free','pro') NOT NULL DEFAULT 'free',
	`status` enum('draft','active','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pools_id` PRIMARY KEY(`id`),
	CONSTRAINT `pools_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`group` varchar(1),
	`flagEmoji` varchar(10),
	`points` int DEFAULT 0,
	`stage` varchar(32) DEFAULT 'Group Stage',
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` enum('free','pro') DEFAULT 'free' NOT NULL;