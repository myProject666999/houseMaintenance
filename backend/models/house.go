package models

import (
	"time"

	"gorm.io/gorm"
)

type House struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	OwnerID     uint           `gorm:"not null;index" json:"owner_id"`
	HouseNumber string         `gorm:"size:50;not null" json:"house_number"`
	Building    string         `gorm:"size:50" json:"building"`
	Unit        string         `gorm:"size:20" json:"unit"`
	Floor       int            `json:"floor"`
	Area        float64        `json:"area"`
	Status      int            `gorm:"default:1" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	Owner       *User          `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
}
