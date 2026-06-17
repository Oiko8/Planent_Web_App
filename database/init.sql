CREATE DATABASE  IF NOT EXISTS `planent` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `planent`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `Booking`
--

DROP TABLE IF EXISTS `Booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Booking` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `attendee_id` int NOT NULL,
  `ticket_type_id` int NOT NULL,
  `booking_time` datetime NOT NULL,
  `number_of_tickets` int NOT NULL,
  `total_cost` decimal(10,2) NOT NULL,
  `booking_status` enum('PENDING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`booking_id`),
  KEY `fk_Booking_User1_idx` (`attendee_id`),
  KEY `fk_Booking_Event_TicketType1_idx` (`ticket_type_id`),
  CONSTRAINT `fk_Booking_Event_TicketType1` FOREIGN KEY (`ticket_type_id`) REFERENCES `Event_Ticket_Type` (`ticket_type_id`),
  CONSTRAINT `fk_Booking_User1` FOREIGN KEY (`attendee_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `chk_booking_tickets` CHECK ((`number_of_tickets` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Booking`
--

LOCK TABLES `Booking` WRITE;
/*!40000 ALTER TABLE `Booking` DISABLE KEYS */;
INSERT INTO `Booking` VALUES (1,9,47,'2026-05-06 13:34:32',1,20.00,'CANCELLED'),(2,9,37,'2026-05-06 13:54:49',2,50.00,'CANCELLED'),(3,9,39,'2026-05-10 08:54:42',1,10.00,'CONFIRMED'),(4,12,39,'2026-06-15 14:17:47',5,50.00,'CANCELLED'),(5,12,63,'2026-06-15 15:17:08',500,277500.00,'CANCELLED'),(6,12,39,'2026-06-15 15:53:20',99,990.00,'CONFIRMED'),(7,12,60,'2026-06-16 16:30:03',3000,30000.00,'CONFIRMED');
/*!40000 ALTER TABLE `Booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Category`
--

DROP TABLE IF EXISTS `Category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name_UNIQUE` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Category`
--

LOCK TABLES `Category` WRITE;
/*!40000 ALTER TABLE `Category` DISABLE KEYS */;
INSERT INTO `Category` VALUES (28,'Cinema'),(29,'Conference'),(24,'Culture'),(10,'Dancing'),(30,'Exhibition'),(23,'Festival'),(9,'Jazz'),(20,'Music'),(31,'Nightlife'),(26,'Other'),(22,'Sports'),(25,'Technology'),(11,'Theater'),(27,'Theatre'),(21,'Workshop');
/*!40000 ALTER TABLE `Category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event`
--

DROP TABLE IF EXISTS `Event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `organizer_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `venue` varchar(100) NOT NULL,
  `country` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `capacity` int NOT NULL,
  `status` enum('CANCELLED','COMPLETED','DRAFT','PUBLISHED') NOT NULL,
  `description` longtext,
  PRIMARY KEY (`event_id`),
  KEY `start_datetime` (`start_datetime`),
  KEY `location` (`country`,`city`),
  KEY `status` (`status`),
  KEY `fk_Event_User` (`organizer_id`),
  FULLTEXT KEY `text` (`title`,`description`),
  CONSTRAINT `fk_Event_User` FOREIGN KEY (`organizer_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `chk_event_capacity` CHECK ((`capacity` > 0)),
  CONSTRAINT `chk_event_dates` CHECK ((`end_datetime` > `start_datetime`))
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event`
--

LOCK TABLES `Event` WRITE;
/*!40000 ALTER TABLE `Event` DISABLE KEYS */;
INSERT INTO `Event` VALUES (28,8,'Logos Timis','Concert','OAKA','Greece','Municipality of Marousi','Central Olympic Stadium',38.03618190,23.78763670,'2026-07-04 07:00:00','2026-07-04 09:30:00',10000,'CANCELLED','HipHop/Rap live concert'),(29,8,'Summer Beats Festival','Festival','Technopolis','Greece','Athens','Pireos 100',37.97945000,23.70760000,'2026-06-05 16:00:00','2026-06-05 20:00:00',1000,'CANCELLED','A full-day music festival with DJs and live bands.'),(30,8,'React Advanced Workshop','Workshop','Tech Center','Greece','Patras','Maizonos 50',38.24670000,21.73440000,'2026-06-22 18:00:00','2026-06-22 21:00:00',100,'PUBLISHED','Deep dive into React hooks, performance, and architecture.'),(31,8,'Street Basketball Tournament','Tournament','Central Court','Greece','Thessaloniki','Tsimiski 10',40.64010000,22.94440000,'2026-05-12 16:00:00','2026-05-12 20:00:00',200,'COMPLETED','Local teams compete in an outdoor 3v3 basketball event.'),(32,8,'Modern Theater Night','Play','National Theater','Greece','Athens','Agiou Konstantinou 22',37.98270000,23.72540000,'2026-04-28 21:00:00','2026-04-28 23:00:00',300,'COMPLETED','A contemporary theater performance by acclaimed actors.'),(33,8,'Jazz & Wine Evening','Concert','Rooftop Lounge','Greece','Athens','Mitropoleos 5',37.97490000,23.73010000,'2026-04-20 20:00:00','2026-04-20 23:00:00',150,'COMPLETED','Smooth jazz music paired with a curated wine selection.'),(34,8,'AI in Everyday Apps','Seminar','Innovation Lab','Greece','Athens','Kifisias 44',37.99880000,23.75970000,'2026-04-19 17:30:00','2026-04-19 20:00:00',80,'COMPLETED','Explore how AI is integrated into modern applications.'),(35,8,'Uni League','Football Tournament','Gipedo D\' Ilioupolis','Greece','Municipal Unit of Argyroupoli','Αλιμούντος 2',37.91869470,23.74625820,'2026-07-10 06:00:00','2026-07-12 19:00:00',64,'PUBLISHED','Football 5x5 Tournament'),(36,8,'Greeks in AI','Conference','Eugenides Foundation','Greece','Municipality of Palaio Faliro','Eugenides Foundation New Digital Planetarium',37.94010950,23.69657720,'2026-07-15 10:00:00','2026-07-17 18:00:00',2000,'PUBLISHED','The Greeks in AI Symposium is an annual gathering that brings together Greek AI scientists and practitioners from around the world to connect, collaborate, and inspire.'),(37,8,'Final Four','Basketball Competition','Telekom Center Athens','Greece','Municipality of Marousi','Telekom Center Athens',38.03794320,23.78480480,'2026-05-22 09:00:00','2026-05-24 21:00:00',20000,'COMPLETED','Euroleague\'s Final Four.'),(46,9,'ComicDom','Open Market','Technopolis','Greece','Athens','Technopolis',37.97793770,23.71363610,'2026-06-26 08:00:00','2026-06-28 19:00:00',3000,'PUBLISHED','Come to meet your favourite comic and manga heroes in Technopolis. Several open stores with comics, mangas and anime merch and live music.'),(47,12,'υοοο','Conference','aaa','Greece','Nea Makri Municipal Unit','Athinas 10',38.06944830,23.98553870,'2026-06-24 17:30:00','2026-06-30 17:00:00',1000,'CANCELLED','eventerrr'),(49,12,'eventttttt','eventtttt','eventttttt','United Kingdom','Stevenage','42 Whomerley Road',51.89811710,-0.19445880,'2026-06-17 20:00:00','2026-06-25 19:45:00',10,'CANCELLED','eventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttteventttttt');
/*!40000 ALTER TABLE `Event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event_Category`
--

DROP TABLE IF EXISTS `Event_Category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event_Category` (
  `event_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`event_id`,`category_id`),
  KEY `fk_Event_has_Category_Category1_idx` (`category_id`),
  KEY `fk_Event_has_Category_Event1_idx` (`event_id`),
  CONSTRAINT `fk_Event_has_Category_Category1` FOREIGN KEY (`category_id`) REFERENCES `Category` (`category_id`),
  CONSTRAINT `fk_Event_has_Category_Event1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event_Category`
--

LOCK TABLES `Event_Category` WRITE;
/*!40000 ALTER TABLE `Event_Category` DISABLE KEYS */;
INSERT INTO `Event_Category` VALUES (28,10),(32,11),(28,20),(29,20),(33,20),(49,20),(30,21),(36,21),(49,21),(31,22),(35,22),(37,22),(49,22),(29,23),(46,23),(47,23),(49,23),(32,24),(30,25),(34,25),(36,25),(46,30);
/*!40000 ALTER TABLE `Event_Category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event_Media`
--

DROP TABLE IF EXISTS `Event_Media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event_Media` (
  `photo_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  PRIMARY KEY (`photo_id`),
  KEY `fk_Event_Media_Event1_idx` (`event_id`),
  CONSTRAINT `fk_Event_Media_Event1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event_Media`
--

LOCK TABLES `Event_Media` WRITE;
/*!40000 ALTER TABLE `Event_Media` DISABLE KEYS */;
INSERT INTO `Event_Media` VALUES (1,46,'/media/46/COMOCDOM.webp'),(6,28,'/media/28/lt.webp'),(7,28,'/media/28/logos-timis.webp'),(17,47,'/media/47/pngquant2.webp'),(33,49,'/media/49/pngquant2_1.webp'),(34,49,'/media/49/pngquant2.webp'),(35,49,'/media/49/pngquant2_2.webp');
/*!40000 ALTER TABLE `Event_Media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event_Recommendation_Vector`
--

DROP TABLE IF EXISTS `Event_Recommendation_Vector`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event_Recommendation_Vector` (
  `event_id` int NOT NULL,
  `bias` double NOT NULL DEFAULT '0',
  `factor1` double NOT NULL,
  `factor2` double NOT NULL,
  `factor3` double NOT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_table1_Event1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event_Recommendation_Vector`
--

LOCK TABLES `Event_Recommendation_Vector` WRITE;
/*!40000 ALTER TABLE `Event_Recommendation_Vector` DISABLE KEYS */;
INSERT INTO `Event_Recommendation_Vector` VALUES (28,-0.281543248663619,-0.000013638595426079524,-0.0007020205863352309,-0.00028295228623339484),(29,-0.2798872284048211,0.009596432338043226,0.05570409381485687,0.05653249480119332),(30,0.25976659257247325,0.0012201412850812554,-0.010301322796189217,-0.012318224828477513),(31,-0.2806760693925727,0.03215090685184037,0.006805695200712204,0.028787571858051086),(33,-0.21614186334718005,0.0834389544834932,0.04831639277521732,0.05933536480311324),(34,0.2099239631250466,0.00008208548576750376,0.0007694747768071494,0.00036753572700393497),(37,-0.2805353874473573,0.00222137906552296,0.056784792216729295,0.028204741152208668),(46,0.3019539165816794,0.06142251287537312,0.027809029869187266,0.0032867898945441714),(47,0.3011768944681553,0.0012931338454014406,-0.0036509067443138655,-0.0034198256944283287);
/*!40000 ALTER TABLE `Event_Recommendation_Vector` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event_Ticket_Type`
--

DROP TABLE IF EXISTS `Event_Ticket_Type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event_Ticket_Type` (
  `ticket_type_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `name` varchar(60) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `available` int NOT NULL,
  PRIMARY KEY (`ticket_type_id`),
  UNIQUE KEY `ticket_name_per_event_UNIQUE` (`event_id`,`name`),
  KEY `fk_Event_TicketType_Event1_idx` (`event_id`),
  KEY `price` (`price`),
  CONSTRAINT `fk_Event_TicketType_Event1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`),
  CONSTRAINT `chk_ticket_available` CHECK (((`available` <= `quantity`) and (`available` >= 0))),
  CONSTRAINT `chk_ticket_price` CHECK ((`price` >= 0)),
  CONSTRAINT `chk_ticket_quantity` CHECK ((`quantity` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event_Ticket_Type`
--

LOCK TABLES `Event_Ticket_Type` WRITE;
/*!40000 ALTER TABLE `Event_Ticket_Type` DISABLE KEYS */;
INSERT INTO `Event_Ticket_Type` VALUES (37,29,'General',25.00,400,400),(38,29,'VIP',60.00,100,100),(39,30,'Standard',10.00,100,0),(40,31,'Entry',5.00,200,200),(41,32,'Standard',20.00,250,250),(42,32,'Premium',35.00,50,50),(43,33,'Standard',18.00,150,150),(44,34,'Entry',8.00,80,80),(45,35,'Team-Entry',50.00,64,64),(46,29,'Last-Call',30.00,500,500),(47,28,'Standard',20.00,10000,10000),(48,36,'Standard',20.00,1500,1500),(49,36,'VIP',60.00,500,500),(50,37,'Standard',50.00,15000,15000),(51,37,'VIP',200.00,5000,5000),(60,46,'Standard',10.00,3000,0),(62,47,'αααα',500000.00,500,500),(63,47,'α222α22α2',555.00,500,500),(66,49,'errrrr',20.00,5,5);
/*!40000 ALTER TABLE `Event_Ticket_Type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Message` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `event_id` int DEFAULT NULL,
  `body` longtext NOT NULL,
  `is_read` tinyint NOT NULL DEFAULT '0',
  `deleted_by_sender` tinyint NOT NULL DEFAULT '0',
  `deleted_by_receiver` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`message_id`),
  KEY `fk_Message_User1_idx` (`sender_id`),
  KEY `fk_Message_User2_idx` (`receiver_id`),
  KEY `fk_Message_Event1_idx` (`event_id`),
  CONSTRAINT `fk_Message_Event1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`),
  CONSTRAINT `fk_Message_User1` FOREIGN KEY (`sender_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `fk_Message_User2` FOREIGN KEY (`receiver_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Message`
--

LOCK TABLES `Message` WRITE;
/*!40000 ALTER TABLE `Message` DISABLE KEYS */;
INSERT INTO `Message` VALUES (1,9,8,28,'Hello, how are you ?',1,0,0),(2,8,9,28,'All good and you ?',1,0,0),(3,8,9,28,'Thank you for your booking',1,0,0),(4,8,9,29,'Thank you for your booking',1,0,0),(5,8,9,28,'Hello there',1,0,0),(6,8,9,29,'NOTICE: The event \'Summer Beats Festival\' has been cancelled by the organizer (Giannis Oiko). Your booking(s) have been automatically cancelled.',1,0,0),(7,8,9,28,'NOTICE: The event \'Logos Timis\' has been cancelled by the organizer (Giannis Oiko). Your booking(s) have been automatically cancelled.',0,0,0),(8,12,8,30,'heyyy',0,0,0),(9,12,12,47,'NOTICE: The event \'υοοο\' has been cancelled by the organizer (reaaa real). Your booking(s) have been automatically cancelled.',1,0,0);
/*!40000 ALTER TABLE `Message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Recommendation_Config`
--

DROP TABLE IF EXISTS `Recommendation_Config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Recommendation_Config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `global_bias` double NOT NULL DEFAULT '0',
  `learning_rate` double NOT NULL,
  `regularization` double NOT NULL,
  `epochs` int NOT NULL,
  `latent_factors` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Recommendation_Config`
--

LOCK TABLES `Recommendation_Config` WRITE;
/*!40000 ALTER TABLE `Recommendation_Config` DISABLE KEYS */;
INSERT INTO `Recommendation_Config` VALUES (1,0.5800000000000001,0.025,0.03,60,3);
/*!40000 ALTER TABLE `Recommendation_Config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_admin` tinyint NOT NULL DEFAULT '0',
  `is_approved` tinyint NOT NULL DEFAULT '0',
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `country` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `zipcode` varchar(20) NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `afm` char(9) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (5,'admin','$2a$10$TfKuZjgaY8DumB6/Ne42p.GfXT7c6fkGX2D.JOmDm3/AlcK.ot1Rm',1,1,'John','Doe','john.doe@example.com','2101234567','Greece','Athens','Athinas 10','10551',37.97750000,23.72650000,'123456789'),(6,'test','$2a$10$caE.9mmH919zDsGvsH6iIumPdeaf2ACLMNXSkwPDgjNgGcfrMLnTS',0,1,'tester','testing','test@example.com','6900000000','Greece','Athens','Ermou 15','10563',NULL,NULL,'123456789'),(7,'user1','$2a$10$JQorYrXTfHdJg2.GkqfrhO4CGoObUOEUpquxdSCeQAYbtl/4UmSsa',0,1,'user','1','user@user.com','6912345678','user','user','user','12345',NULL,NULL,'123456789'),(8,'Oiko8','$2a$10$c1YJMFgb9GeBcLD29eI1euqt6msMVvUNXwQ.J6QVuJcZFuAH69gKC',0,1,'Giannis','Oiko','myemail@gmail.com','0123456789','Greece','Athens','Iroon 4','16555',NULL,NULL,'123456789'),(9,'Sealer','$2a$10$ac0WbtnbxUlmnQ96unZV7eanyhY.sLijIrfegz24CKPI5QitaE70S',0,1,'Bill','Tester','bill@gmail.com','2222222222','Greece','Athens','Archimidous 24','16343',NULL,NULL,'111111111'),(11,'User2','$2a$10$fSQOigbhHjsIZ0ZB4n1yquru5Qhco7xJ0cdSIJsSxjuVEitUPHds.',0,1,'User','Userer','user2@mail.com','6970000000','Greece','Municipal Unit of Patras','Κορίνθου - Πατρών','264 43',38.28298330,21.76995820,'123456789'),(12,'real','$2a$10$A7jjNk4xouhcgZwOn01qiuOkreC/UAL2MFg88jo12Bs9ogvOS2IKG',0,1,'real','real','real@real.com','6912345678','Greece','Nea Makri Municipal Unit','Athinas 10','190 05',38.06944830,23.98553870,'123456789');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User_Event_Interaction`
--

DROP TABLE IF EXISTS `User_Event_Interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User_Event_Interaction` (
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `rating` decimal(2,1) NOT NULL,
  PRIMARY KEY (`user_id`,`event_id`),
  KEY `fk_User_has_Event_Event1_idx` (`event_id`),
  KEY `fk_User_has_Event_User1_idx` (`user_id`) /*!80000 INVISIBLE */,
  CONSTRAINT `fk_User_has_Event_Event1` FOREIGN KEY (`event_id`) REFERENCES `Event` (`event_id`),
  CONSTRAINT `fk_User_has_Event_User1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User_Event_Interaction`
--

LOCK TABLES `User_Event_Interaction` WRITE;
/*!40000 ALTER TABLE `User_Event_Interaction` DISABLE KEYS */;
INSERT INTO `User_Event_Interaction` VALUES (5,30,0.4),(5,34,0.4),(12,28,0.4),(12,29,0.4),(12,30,1.0),(12,31,0.4),(12,33,0.4),(12,37,0.4),(12,46,1.0),(12,47,1.0);
/*!40000 ALTER TABLE `User_Event_Interaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User_Recommendation_Vector`
--

DROP TABLE IF EXISTS `User_Recommendation_Vector`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User_Recommendation_Vector` (
  `user_id` int NOT NULL,
  `bias` double NOT NULL DEFAULT '0',
  `factor1` double NOT NULL,
  `factor2` double NOT NULL,
  `factor3` double NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_User_Recommendation_Vector_User` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User_Recommendation_Vector`
--

LOCK TABLES `User_Recommendation_Vector` WRITE;
/*!40000 ALTER TABLE `User_Recommendation_Vector` DISABLE KEYS */;
INSERT INTO `User_Recommendation_Vector` VALUES (5,-0.4006215576579752,-0.0009185950188505845,0.003228910304981958,0.0038774810114506433),(12,0.10273886578863997,-0.01153437891245868,-0.013453898599246644,-0.017633995790775927);
/*!40000 ALTER TABLE `User_Recommendation_Vector` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-17 11:13:20
