-- ==============================================================================
-- Kalasalingam Academy of Research and Education (KARE)
-- Centralized Campus Facility Operations & Issue Management System
-- Database Engine: MySQL 8.0+ / MariaDB 10.5+
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci
-- Generated: 2026-10-24
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `kare_facilities_db` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `kare_facilities_db`;

-- ------------------------------------------------------------------------------
-- Table structure for table `campus_blocks`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `campus_blocks`;
CREATE TABLE `campus_blocks` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `short_name` VARCHAR(80) NOT NULL,
  `type` ENUM('academic', 'hostel', 'amenity', 'utility') NOT NULL DEFAULT 'academic',
  `floors` INT UNSIGNED NOT NULL DEFAULT 1,
  `health_score` DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  `description` TEXT NULL,
  `coord_x` INT NOT NULL DEFAULT 0,
  `coord_y` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_block_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for table `technicians`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `technicians`;
CREATE TABLE `technicians` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `trade` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `status` ENUM('active', 'on_leave', 'standby') NOT NULL DEFAULT 'active',
  `active_orders` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for table `reporters`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `reporters`;
CREATE TABLE `reporters` (
  `id` VARCHAR(50) NOT NULL,
  `reg_no` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role` ENUM('Student', 'Faculty', 'Staff', 'Research Scholar') NOT NULL,
  `department` VARCHAR(120) NOT NULL,
  `contact_email` VARCHAR(150) NOT NULL,
  `contact_phone` VARCHAR(30) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_reporter_reg` (`reg_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for table `facility_issues`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `facility_issues`;
CREATE TABLE `facility_issues` (
  `id` VARCHAR(50) NOT NULL, -- e.g., KARE-2026-0842
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` ENUM(
    'electrical',
    'plumbing',
    'hvac',
    'civil',
    'it_smart_class',
    'sanitation',
    'safety'
  ) NOT NULL,
  `block_id` VARCHAR(50) NOT NULL,
  `floor_level` VARCHAR(50) NOT NULL,
  `specific_location` VARCHAR(255) NOT NULL,
  `priority` ENUM('critical', 'high', 'medium', 'low') NOT NULL DEFAULT 'medium',
  `status` ENUM(
    'reported',
    'triaged',
    'in_progress',
    'parts_pending',
    'resolved',
    'closed'
  ) NOT NULL DEFAULT 'reported',
  `reporter_id` VARCHAR(50) NOT NULL,
  `assigned_technician_id` VARCHAR(50) NULL,
  `assigned_at` DATETIME NULL,
  `upvotes_count` INT UNSIGNED NOT NULL DEFAULT 1,
  `target_sla_hours` INT UNSIGNED NOT NULL DEFAULT 24,
  `image_url` VARCHAR(500) NULL,
  `resolution_notes` TEXT NULL,
  `resolution_image_url` VARCHAR(500) NULL,
  `resolved_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_block_id` (`block_id`),
  KEY `idx_assigned_technician_id` (`assigned_technician_id`),
  KEY `idx_reporter_id` (`reporter_id`),
  KEY `idx_priority_status` (`priority`, `status`),
  CONSTRAINT `fk_issues_block` FOREIGN KEY (`block_id`) REFERENCES `campus_blocks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_issues_technician` FOREIGN KEY (`assigned_technician_id`) REFERENCES `technicians` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_issues_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `reporters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for table `issue_activity_logs`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `issue_activity_logs`;
CREATE TABLE `issue_activity_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `issue_id` VARCHAR(50) NOT NULL,
  `author_name` VARCHAR(150) NOT NULL,
  `author_role` VARCHAR(100) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `note` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_issue` (`issue_id`),
  CONSTRAINT `fk_activity_issue` FOREIGN KEY (`issue_id`) REFERENCES `facility_issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for table `issue_feedbacks`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `issue_feedbacks`;
CREATE TABLE `issue_feedbacks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `issue_id` VARCHAR(50) NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NULL,
  `submitted_by_id` VARCHAR(50) NOT NULL,
  `submitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_feedback_issue` (`issue_id`),
  CONSTRAINT `fk_feedback_issue` FOREIGN KEY (`issue_id`) REFERENCES `facility_issues` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for table `emergency_contacts`
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `emergency_contacts`;
CREATE TABLE `emergency_contacts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `role` VARCHAR(150) NOT NULL,
  `phone_extension` VARCHAR(50) NOT NULL,
  `mobile_hotline` VARCHAR(50) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SEED DATA INSERTION
-- ==============================================================================

-- 1. Campus Blocks
INSERT INTO `campus_blocks` (`id`, `code`, `name`, `short_name`, `type`, `floors`, `health_score`, `description`, `coord_x`, `coord_y`) VALUES
('kalam-block', 'BLK-AK', 'Dr. APJ Abdul Kalam Academic Block', 'Kalam Block', 'academic', 5, 92.00, 'School of Computing, Department of CSE & IT, Dean Offices, Smart Lecture Halls', 34, 38),
('raman-block', 'BLK-CVR', 'Sir C.V. Raman Science & Research Block', 'Raman Block', 'academic', 4, 88.00, 'Biotechnology, Physics & Chemistry Research Labs, Nanotechnology Center', 52, 32),
('krishnan-block', 'BLK-KSK', 'Dr. K.S. Krishnan Engineering Block', 'Krishnan Block', 'academic', 4, 95.00, 'Civil & Mechanical Engineering, Robotics Workshop, CAD/CAM Design Studios', 22, 55),
('ramanujan-block', 'BLK-SR', 'Srinivasa Ramanujan Mathematical Block', 'Ramanujan Block', 'academic', 3, 97.00, 'Department of Mathematics, Humanities, First-Year Academic Section', 44, 58),
('central-library', 'BLK-LIB', 'KARE Central Library & Digital Learning Center', 'Central Library', 'academic', 3, 94.00, 'Over 120,000 volumes, IEEE Digital Commons, High-speed Reference Carrels', 68, 46),
('bharathi-hostel', 'HST-BHR', 'Bharathi Men’s Residence Hall (Blocks A-D)', 'Bharathi Hostel', 'hostel', 4, 84.00, 'Undergraduate student residence, dining mess 1 & 2, study halls', 18, 22),
('teresa-hostel', 'HST-MT', 'Mother Teresa Women’s Residence Hall', 'Teresa Hostel', 'hostel', 4, 93.00, 'Women’s residence quarters, dedicated dining mess, 24/7 security reception', 78, 24),
('valluvar-hostel', 'HST-TV', 'Thiruvalluvar PG & Research Scholars Hostel', 'Valluvar Hostel', 'hostel', 3, 96.00, 'Postgraduate scholars & International student residence apartments', 82, 62),
('sports-complex', 'AMN-SPT', 'Indoor Stadium & Aquatic Sports Complex', 'Sports Arena', 'amenity', 2, 91.00, 'Multi-court indoor sports stadium, Olympic pool, conditioning gym', 30, 78),
('central-dining', 'AMN-FDC', 'KARE Central Food Court & Student Activity Centre', 'Dining & Food Court', 'amenity', 2, 89.00, 'Multi-cuisine campus dining, student council hub, post office, ATM center', 56, 72),
('utility-substation', 'UTL-SUB', 'Campus Central HT Substation & 1.2MW Solar Yard', 'Substation & Solar', 'utility', 1, 99.00, '33kV grid distribution substation, backup diesel generators, solar inverters', 88, 82);

-- 2. Technicians Roster
INSERT INTO `technicians` (`id`, `name`, `trade`, `phone`, `status`, `active_orders`) VALUES
('tech-01', 'M. Kumaravel', 'Senior Electrical Technician', '+91 94421 88301', 'active', 3),
('tech-02', 'S. Rajadurai', 'Plumbing & Hydraulic Supervisor', '+91 94421 88302', 'active', 2),
('tech-03', 'V. Murugesan', 'HVAC & Central Air Chiller Specialist', '+91 94421 88303', 'active', 2),
('tech-04', 'A. Selvam', 'Civil & Architectural Carpenter', '+91 94421 88304', 'active', 1),
('tech-05', 'K. Balakrishnan', 'Smart Classroom & AV Hardware Engineer', '+91 94421 88305', 'active', 4),
('tech-06', 'T. Sundaram', 'Campus Sanitation & Waste Water Lead', '+91 94421 88306', 'active', 2);

-- 3. Reporters
INSERT INTO `reporters` (`id`, `reg_no`, `full_name`, `role`, `department`, `contact_email`, `contact_phone`) VALUES
('rep-01', 'FAC-CSE-1049', 'Dr. P. Venkatesh', 'Faculty', 'Computer Science & Engineering', 'p.venkatesh@klu.ac.in', '+91 98401 23456'),
('rep-02', '9922004018', 'Aravind Senthilkumar', 'Student', 'Biotechnology & Bio-Engineering', 'aravind.s9922@klu.ac.in', '+91 97890 12345'),
('rep-03', 'LIB-STF-022', 'S. Meenakshi', 'Staff', 'Central Library Administration', 'library.desk@klu.ac.in', '+91 94433 44556'),
('rep-04', 'FAC-MEC-0891', 'Prof. K. Subramanian', 'Faculty', 'Mechanical & Automation Engineering', 'k.subramanian@klu.ac.in', '+91 94431 99887'),
('rep-05', '9923001890', 'Karthik Raja', 'Student', 'Electronics & Communication', 'karthik.r9923@klu.ac.in', '+91 98940 33221'),
('rep-06', 'RES-CSE-2024-04', 'Priya Dharshini', 'Research Scholar', 'School of Computing', 'priyadharshini.res@klu.ac.in', '+91 98421 77665'),
('rep-07', '9921008432', 'M. Anand', 'Student', 'Department of Mathematics', 'anand.m9921@klu.ac.in', '+91 97910 88776'),
('rep-08', '9923009941', 'Deepak Vignesh', 'Student', 'Management Studies', 'deepak.v9923@klu.ac.in', '+91 96290 55443');

-- 4. Facility Issues Log
INSERT INTO `facility_issues` (
  `id`, `title`, `description`, `category`, `block_id`, `floor_level`, `specific_location`,
  `priority`, `status`, `reporter_id`, `assigned_technician_id`, `assigned_at`,
  `upvotes_count`, `target_sla_hours`, `image_url`, `resolution_notes`, `resolved_at`, `created_at`, `updated_at`
) VALUES
(
  'KARE-2026-0842',
  'Ceiling mounted 4K laser projector repeatedly turns off mid-lecture',
  'During Data Structures & Algorithms lectures, the ceiling projector in Hall 402 shuts down unexpectedly after 15 minutes due to thermal exhaust failure. Filters appear clogged and cooling fan emits grinding noise.',
  'it_smart_class',
  'kalam-block',
  '4th Floor',
  'Smart Lecture Amphitheater 402',
  'high',
  'in_progress',
  'rep-01',
  'tech-05',
  '2026-10-23 09:10:00',
  42,
  8,
  '/src/assets/images/kare_smart_classroom_1792826180999.jpg',
  NULL,
  NULL,
  '2026-10-23 08:30:00',
  '2026-10-23 14:15:00'
),
(
  'KARE-2026-0841',
  'Severe RO water dispenser drip and overflow on corridor tiles',
  'The 100 LPH Commercial RO cold water dispenser on 2nd floor corridor has a broken dispensing solenoid tap and leaking drainage line. Water is pooling across the walkway creating a serious slip hazard for students moving between labs.',
  'plumbing',
  'raman-block',
  '2nd Floor',
  'Corridor opposite Nanotechnology Lab 210',
  'critical',
  'in_progress',
  'rep-02',
  'tech-02',
  '2026-10-23 10:00:00',
  28,
  2,
  NULL,
  NULL,
  NULL,
  '2026-10-23 09:45:00',
  '2026-10-23 11:00:00'
),
(
  'KARE-2026-0839',
  'Central Library 3rd floor HVAC split units tripping main breaker',
  'The quiet reading zone in the upper mezzanine of Central Library has no air circulation. The two 3-Ton Daikin cassette units cause the 32A MCB in distribution board DB-LIB-3 to trip whenever both units start their compressors simultaneously.',
  'hvac',
  'central-library',
  '3rd Floor',
  'Quiet Study Carrel Mezzanine Zone C',
  'high',
  'parts_pending',
  'rep-03',
  'tech-03',
  '2026-10-22 15:00:00',
  35,
  8,
  '/src/assets/images/kare_campus_library_1792826181805.jpg',
  NULL,
  NULL,
  '2026-10-22 14:20:00',
  '2026-10-23 16:00:00'
),
(
  'KARE-2026-0836',
  'Benchtop power distribution strip earthing fault in Robotics Lab',
  'Workbench #4 and #5 in Robotics & Automation Lab have floating voltage on earth pins (approx 34V AC). Oscilloscope chassis gives mild static sensation when grounded. Need immediate neutral/earth bonding audit.',
  'electrical',
  'krishnan-block',
  '1st Floor',
  'Robotics & Advanced Mechatronics Lab 108',
  'critical',
  'triaged',
  'rep-04',
  'tech-01',
  '2026-10-23 11:35:00',
  19,
  2,
  '/src/assets/images/kare_research_lab_1792826181335.jpg',
  NULL,
  NULL,
  '2026-10-23 11:20:00',
  '2026-10-23 11:35:00'
),
(
  'KARE-2026-0830',
  'Hot water solar geyser line pressure drop in Bharathi Hostel Block B',
  'Students on the 3rd and 4th floors of Bharathi Hostel Block B receive zero hot water flow during 06:00 - 08:30 AM morning hours. The rooftop solar circulation booster pump fails to kick in when solar tank temperature reaches 55°C.',
  'plumbing',
  'bharathi-hostel',
  '3rd Floor',
  'Block B Washroom Clusters 301-318',
  'medium',
  'reported',
  'rep-05',
  NULL,
  NULL,
  68,
  24,
  NULL,
  NULL,
  NULL,
  '2026-10-23 12:15:00',
  '2026-10-23 12:15:00'
),
(
  'KARE-2026-0825',
  'Damaged acoustic classroom door latch and broken hinges',
  'The soundproofing double-leaf entry door of Seminar Hall 201 does not latch properly and slams loudly with campus breeze, disrupting guest lectures and PhD viva sessions.',
  'civil',
  'kalam-block',
  '2nd Floor',
  'Deanery Seminar Hall 201',
  'low',
  'in_progress',
  'rep-06',
  'tech-04',
  '2026-10-22 14:00:00',
  11,
  48,
  NULL,
  NULL,
  NULL,
  '2026-10-22 10:15:00',
  '2026-10-23 09:00:00'
),
(
  'KARE-2026-0820',
  'Corridor LED emergency batten lights unlit on North Stairwell',
  'All four LED emergency battens on the north fire escape stairwell between ground and 3rd floor are dead. Extremely dark during evening classes and power changeovers.',
  'safety',
  'ramanujan-block',
  '1st Floor',
  'North Fire Evacuation Staircase',
  'high',
  'resolved',
  'rep-07',
  'tech-01',
  '2026-10-21 19:00:00',
  23,
  8,
  NULL,
  'Replaced 4 dead battery driver units and upgraded wiring to emergency lighting circuit EM-12. Tested under simulated mains failure - illumination verified at 120 Lux.',
  '2026-10-22 11:30:00',
  '2026-10-21 18:00:00',
  '2026-10-22 11:30:00'
),
(
  'KARE-2026-0815',
  'Recycling and wet waste bins overflowing at Student Dining Courtyard',
  'Central cafeteria outer seating perimeter waste receptacles are overflowing since afternoon lunch hours. Attracting campus birds and stray animals; requires immediate sanitization.',
  'sanitation',
  'central-dining',
  'Ground Floor',
  'Courtyard Outdoor Canopy Dining Area',
  'medium',
  'resolved',
  'rep-08',
  'tech-06',
  '2026-10-21 15:35:00',
  14,
  24,
  NULL,
  'Sanitation team cleared all bins, sanitized concrete paving with disinfectant spray, and installed two additional 120-litre mobile wheeled containers.',
  '2026-10-21 16:50:00',
  '2026-10-21 15:20:00',
  '2026-10-21 16:50:00'
);

-- 5. Activity Logs
INSERT INTO `issue_activity_logs` (`issue_id`, `author_name`, `author_role`, `action`, `note`, `created_at`) VALUES
('KARE-2026-0842', 'Dr. P. Venkatesh', 'Faculty', 'Reported issue', 'Lecture delivery for 120 students severely disrupted.', '2026-10-23 08:30:00'),
('KARE-2026-0842', 'Estate Office Dispatch', 'Admin', 'Assigned to K. Balakrishnan (Smart AV Engineer)', 'Prioritized due to ongoing mid-semester exams.', '2026-10-23 09:10:00'),
('KARE-2026-0842', 'K. Balakrishnan', 'Technician', 'Status updated to In Progress', 'Cleaned intake filter; requisitioned replacement 80mm high-CFM exhaust fan from central store.', '2026-10-23 14:15:00'),
('KARE-2026-0841', 'Aravind Senthilkumar', 'Student', 'Reported issue', 'Immediate slip hazard outside wet chemistry laboratory.', '2026-10-23 09:45:00'),
('KARE-2026-0841', 'Estate Office Dispatch', 'Admin', 'Triaged as Critical Hazard & Assigned', 'Direct call made to plumber S. Rajadurai.', '2026-10-23 10:00:00'),
('KARE-2026-0841', 'S. Rajadurai', 'Technician', 'Isolated main inlet valve', 'Water flow stopped, caution stand placed, replacing valve gaskets and drain fitting.', '2026-10-23 10:30:00'),
('KARE-2026-0820', 'M. Anand', 'Student', 'Reported safety hazard', NULL, '2026-10-21 18:00:00'),
('KARE-2026-0820', 'Estate Office', 'Admin', 'Assigned to M. Kumaravel', NULL, '2026-10-21 19:00:00'),
('KARE-2026-0820', 'M. Kumaravel', 'Technician', 'Resolved and tested', NULL, '2026-10-22 11:30:00'),
('KARE-2026-0820', 'M. Anand', 'Student', 'Verified resolution & gave 5-star rating', NULL, '2026-10-22 12:00:00');

-- 6. Issue Feedbacks
INSERT INTO `issue_feedbacks` (`issue_id`, `rating`, `comment`, `submitted_by_id`, `submitted_at`) VALUES
('KARE-2026-0820', 5, 'Super fast turnaround! The stairwell is completely bright and safe now. Thank you Estate team!', 'rep-07', '2026-10-22 12:00:00');

-- 7. Emergency Contacts
INSERT INTO `emergency_contacts` (`title`, `role`, `phone_extension`, `mobile_hotline`, `location`) VALUES
('Estate Maintenance 24/7 Desk', 'Central Campus Breakdown Dispatch', '+91 (04563) 289 040', '+91 94421 88300', 'Estate Office, Ground Floor, Admin Block'),
('High-Voltage Electrical Substation', 'Power Outage & Transformer Trip Control', '+91 (04563) 289 045', '+91 94421 88310', 'Substation Control Room Yard'),
('KARE Health Centre & Ambulance', 'Medical Emergency & First Response', '+91 (04563) 289 099', '+91 94421 88399', 'Health Centre, Opp. Guest House'),
('Campus Fire & Safety Inspector', 'Hazardous Materials & Fire Alarms', '+91 (04563) 289 077', '+91 94421 88377', 'Security Central Command Post'),
('Chief Warden Hostel Hotline', 'Hostel Maintenance & Student Welfare', '+91 (04563) 289 080', '+91 94421 88380', 'Hostel Office, Bharathi Block A');

-- ==============================================================================
-- ANALYTICAL VIEWS FOR ESTATE OFFICERS
-- ==============================================================================

-- View 1: Active Breakdown Dashboard View
CREATE OR REPLACE VIEW `v_active_facility_breakdowns` AS
SELECT 
    i.id AS ticket_id,
    i.title,
    i.category,
    b.short_name AS block_name,
    i.floor_level,
    i.specific_location,
    i.priority,
    i.status,
    i.upvotes_count,
    i.target_sla_hours,
    t.name AS technician_name,
    t.trade AS technician_trade,
    t.phone AS technician_phone,
    r.full_name AS reporter_name,
    r.role AS reporter_role,
    r.department AS reporter_dept,
    i.created_at,
    TIMESTAMPDIFF(HOUR, i.created_at, NOW()) AS elapsed_hours,
    CASE 
        WHEN i.status IN ('resolved', 'closed') THEN 'Closed'
        WHEN TIMESTAMPDIFF(HOUR, i.created_at, NOW()) > i.target_sla_hours THEN 'Breached SLA'
        ELSE 'Within SLA'
    END AS sla_status
FROM facility_issues i
JOIN campus_blocks b ON i.block_id = b.id
JOIN reporters r ON i.reporter_id = r.id
LEFT JOIN technicians t ON i.assigned_technician_id = t.id;

-- View 2: Campus Block Facility Downtime Summary
CREATE OR REPLACE VIEW `v_block_facility_summary` AS
SELECT 
    b.id AS block_id,
    b.name AS block_name,
    b.short_name,
    b.health_score,
    COUNT(i.id) AS total_logged_issues,
    SUM(CASE WHEN i.status NOT IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS active_open_issues,
    SUM(CASE WHEN i.priority = 'critical' AND i.status NOT IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS critical_unresolved,
    AVG(CASE WHEN i.status = 'resolved' THEN TIMESTAMPDIFF(HOUR, i.created_at, i.resolved_at) ELSE NULL END) AS avg_resolution_hours
FROM campus_blocks b
LEFT JOIN facility_issues i ON b.id = i.block_id
GROUP BY b.id, b.name, b.short_name, b.health_score;

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
