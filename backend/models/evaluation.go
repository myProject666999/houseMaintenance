package models

import (
	"time"

	"gorm.io/gorm"
)

type Evaluation struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	OrderID      uint           `gorm:"not null;uniqueIndex;index" json:"order_id"`
	OwnerID      uint           `gorm:"not null;index" json:"owner_id"`
	RepairerID   uint           `gorm:"not null;index" json:"repairer_id"`
	Rating       int            `gorm:"not null;default:5" json:"rating"`
	Content      string         `gorm:"type:text" json:"content"`
	Images       string         `gorm:"type:text" json:"images"`
	IsAnonymous  int            `gorm:"default:0" json:"is_anonymous"`
	Status       int            `gorm:"default:1" json:"status"`
	Reply        string         `gorm:"type:text" json:"reply"`
	ReplyTime    *time.Time     `json:"reply_time"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	
	Order        *RepairOrder   `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	Owner        *User          `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Repairer     *User          `gorm:"foreignKey:RepairerID" json:"repairer,omitempty"`
}
