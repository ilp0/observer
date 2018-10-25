-- MySQL Script generated by MySQL Workbench
-- Thu 25 Oct 2018 06:16:52 PM EEST
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

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
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `ip_addr` VARCHAR(64) NULL DEFAULT NULL,
  `mac_addr` VARCHAR(64) NULL DEFAULT NULL,
  `uni_id` VARCHAR(128) NULL DEFAULT NULL,
  `friendlyname` VARCHAR(45) NULL DEFAULT NULL,
  `state` SMALLINT(1) NULL DEFAULT '0',
  `config` VARCHAR(2048) NULL DEFAULT '{}',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uni_id_UNIQUE` (`uni_id` ASC))
ENGINE = InnoDB
AUTO_INCREMENT = 20
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `observerdb`.`log`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `observerdb`.`log` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(32) NULL DEFAULT NULL,
  `value` FLOAT NULL DEFAULT NULL,
  `info` VARCHAR(1024) NULL DEFAULT NULL,
  `slave_id` INT(11) NULL DEFAULT NULL,
  `timestamp` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_log_slave_idx` (`slave_id` ASC),
  CONSTRAINT `fk_log_slave`
    FOREIGN KEY (`slave_id`)
    REFERENCES `observerdb`.`slave` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `observerdb`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `observerdb`.`user` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NULL DEFAULT NULL,
  `password` VARCHAR(128) NULL DEFAULT NULL,
  `global_level` TINYINT(1) NULL DEFAULT NULL,
  `config` VARCHAR(2048) NULL DEFAULT '{}',
  PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


-- -----------------------------------------------------
-- Table `observerdb`.`user_has_slave`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `observerdb`.`user_has_slave` (
  `user_id` INT(11) NOT NULL,
  `slave_id` INT(11) NOT NULL,
  `user_level` TINYINT(1) NULL DEFAULT '0',
  PRIMARY KEY (`user_id`, `slave_id`),
  INDEX `fk_user_has_slave_slave1_idx` (`slave_id` ASC),
  INDEX `fk_user_has_slave_user1_idx` (`user_id` ASC),
  CONSTRAINT `fk_user_has_slave_slave1`
    FOREIGN KEY (`slave_id`)
    REFERENCES `observerdb`.`slave` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_has_slave_user1`
    FOREIGN KEY (`user_id`)
    REFERENCES `observerdb`.`user` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE USER 'observeruser' IDENTIFIED BY 'obspass123';

GRANT ALL ON `observerdb`.* TO 'observeruser';

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;