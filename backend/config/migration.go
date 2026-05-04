package config

import (
	"housemaintenance/models"
	"log"
)

func Migrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.House{},
		&models.RepairCategory{},
		&models.RepairOrder{},
		&models.RepairRecord{},
		&models.Evaluation{},
		&models.Notice{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration completed successfully")
}
