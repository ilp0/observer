-- Observer-server creation script

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema observerdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema observerdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `observerdb` DEFAULT CHARACTER SET utf8 ;
USE `observerdb` ;

-- -----------------------------------------------------
-- Table `observerdb`.`slave`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `observerdb`.`slave` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ip_addr` VARCHAR(64) NULL DEFAULT NULL,
  `mac_addr` VARCHAR(64) NULL,
  `uni_id` VARCHAR(128) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uni_id_UNIQUE` (`uni_id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `observerdb`.`log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `observerdb`.`log` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` TINYINT(1) NULL,
  `data` VARCHAR(8192) NULL,
  `slave_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_log_slave_idx` (`slave_id` ASC),
  CONSTRAINT `fk_log_slave`
    FOREIGN KEY (`slave_id`)
    REFERENCES `observerdb`.`slave` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `observerdb`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `observerdb`.`user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NULL,
  `password` VARCHAR(128) NULL,
  `global_level` TINYINT(1) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `observerdb`.`user_has_slave`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `observerdb`.`user_has_slave` (
  `user_id` INT NOT NULL,
  `slave_id` INT NOT NULL,
  `user_level` TINYINT(1) NULL DEFAULT 0,
  PRIMARY KEY (`user_id`, `slave_id`),
  INDEX `fk_user_has_slave_slave1_idx` (`slave_id` ASC),
  INDEX `fk_user_has_slave_user1_idx` (`user_id` ASC),
  CONSTRAINT `fk_user_has_slave_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `observerdb`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_slave_slave1`
    FOREIGN KEY (`slave_id`)
    REFERENCES `observerdb`.`slave` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE USER 'observeruser' IDENTIFIED BY 'obspass123';

GRANT ALL ON `observerdb`.* TO 'observeruser';
GRANT SELECT ON TABLE `observerdb`.* TO 'observeruser';
GRANT SELECT, INSERT, TRIGGER ON TABLE `observerdb`.* TO 'observeruser';
GRANT SELECT, INSERT, TRIGGER, UPDATE, DELETE ON TABLE `observerdb`.* TO 'observeruser';
GRANT EXECUTE ON ROUTINE `observerdb`.* TO 'observeruser';

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
