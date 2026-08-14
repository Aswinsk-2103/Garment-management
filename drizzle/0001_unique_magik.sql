CREATE TABLE `deliveryChallanItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deliveryChallanId` int NOT NULL,
	`itemDescription` varchar(240) NOT NULL,
	`deliveryQty` int NOT NULL,
	`uom` varchar(20) NOT NULL DEFAULT 'Pcs',
	CONSTRAINT `deliveryChallanItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliveryChallans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`challanNo` varchar(80) NOT NULL,
	`challanDate` timestamp NOT NULL,
	`recipientName` varchar(180) NOT NULL,
	`recipientAddress` text NOT NULL,
	`recipientGstin` varchar(32),
	`orderNo` varchar(80) NOT NULL,
	`purpose` varchar(160) NOT NULL,
	`challanType` varchar(80) NOT NULL,
	`remarks` text,
	`vehicleNo` varchar(80),
	`receivedBy` varchar(140),
	`preparedBy` varchar(140),
	`checkedBy` varchar(140),
	`approvedBy` varchar(140),
	`status` enum('draft','issued','returned') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveryChallans_id` PRIMARY KEY(`id`),
	CONSTRAINT `deliveryChallans_challanNo_unique` UNIQUE(`challanNo`)
);
--> statement-breakpoint
CREATE TABLE `garments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`style` varchar(160) NOT NULL,
	`size` varchar(48) NOT NULL,
	`color` varchar(96) NOT NULL,
	`quantity` int NOT NULL DEFAULT 0,
	`lowStockThreshold` int NOT NULL DEFAULT 25,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `garments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventoryReceipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`garmentId` int NOT NULL,
	`quantity` int NOT NULL,
	`supplierName` varchar(180) NOT NULL,
	`receivedDate` timestamp NOT NULL,
	`referenceNo` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryReceipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productionBatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`batchNo` varchar(80) NOT NULL,
	`garmentId` int NOT NULL,
	`assignedQuantity` int NOT NULL,
	`progressStatus` enum('planned','cutting','stitching','checking','completed','on_hold') NOT NULL DEFAULT 'planned',
	`startDate` timestamp NOT NULL,
	`completionDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productionBatches_id` PRIMARY KEY(`id`),
	CONSTRAINT `productionBatches_batchNo_unique` UNIQUE(`batchNo`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseOrderId` int NOT NULL,
	`garmentId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitCost` decimal(12,2) NOT NULL DEFAULT '0.00',
	`lineTotal` decimal(12,2) NOT NULL DEFAULT '0.00',
	CONSTRAINT `purchaseOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `purchaseOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`purchaseOrderNo` varchar(80) NOT NULL,
	`supplierName` varchar(180) NOT NULL,
	`supplierAddress` text,
	`supplierGstin` varchar(32),
	`orderDate` timestamp NOT NULL,
	`expectedDate` timestamp,
	`status` enum('draft','sent','received','cancelled') NOT NULL DEFAULT 'draft',
	`totalAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchaseOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `purchaseOrders_purchaseOrderNo_unique` UNIQUE(`purchaseOrderNo`)
);
--> statement-breakpoint
CREATE TABLE `salesOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salesOrderId` int NOT NULL,
	`garmentId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(12,2) NOT NULL DEFAULT '0.00',
	`lineTotal` decimal(12,2) NOT NULL DEFAULT '0.00',
	CONSTRAINT `salesOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`salesOrderNo` varchar(80) NOT NULL,
	`customerName` varchar(180) NOT NULL,
	`customerAddress` text NOT NULL,
	`customerGstin` varchar(32),
	`orderDate` timestamp NOT NULL,
	`deliveryDate` timestamp,
	`status` enum('draft','confirmed','in_production','ready_to_dispatch','delivered','cancelled') NOT NULL DEFAULT 'draft',
	`totalAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `salesOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `salesOrders_salesOrderNo_unique` UNIQUE(`salesOrderNo`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','store_inventory','production','accounts') NOT NULL DEFAULT 'store_inventory';--> statement-breakpoint
ALTER TABLE `deliveryChallanItems` ADD CONSTRAINT `deliveryChallanItems_deliveryChallanId_deliveryChallans_id_fk` FOREIGN KEY (`deliveryChallanId`) REFERENCES `deliveryChallans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inventoryReceipts` ADD CONSTRAINT `inventoryReceipts_garmentId_garments_id_fk` FOREIGN KEY (`garmentId`) REFERENCES `garments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `productionBatches` ADD CONSTRAINT `productionBatches_garmentId_garments_id_fk` FOREIGN KEY (`garmentId`) REFERENCES `garments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseOrderItems` ADD CONSTRAINT `purchaseOrderItems_purchaseOrderId_purchaseOrders_id_fk` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchaseOrders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `purchaseOrderItems` ADD CONSTRAINT `purchaseOrderItems_garmentId_garments_id_fk` FOREIGN KEY (`garmentId`) REFERENCES `garments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesOrderItems` ADD CONSTRAINT `salesOrderItems_salesOrderId_salesOrders_id_fk` FOREIGN KEY (`salesOrderId`) REFERENCES `salesOrders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `salesOrderItems` ADD CONSTRAINT `salesOrderItems_garmentId_garments_id_fk` FOREIGN KEY (`garmentId`) REFERENCES `garments`(`id`) ON DELETE no action ON UPDATE no action;