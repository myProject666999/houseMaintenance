package models

import (
	"time"

	"gorm.io/gorm"
)

type RepairOrder struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	OrderNo         string         `gorm:"uniqueIndex;size:50;not null" json:"order_no"`
	OwnerID         uint           `gorm:"not null;index" json:"owner_id"`
	HouseID         uint           `gorm:"not null;index" json:"house_id"`
	CategoryID      uint           `gorm:"not null;index" json:"category_id"`
	Title           string         `gorm:"size:200;not null" json:"title"`
	Description     string         `gorm:"type:text" json:"description"`
	ContactName     string         `gorm:"size:50" json:"contact_name"`
	ContactPhone    string         `gorm:"size:20" json:"contact_phone"`
	Address         string         `gorm:"size:255" json:"address"`
	Status          string         `gorm:"size:20;default:'pending'" json:"status"`
	Urgency         string         `gorm:"size:20;default:'normal'" json:"urgency"`
	RepairerID      *uint          `gorm:"index" json:"repairer_id"`
	AcceptTime      *time.Time     `json:"accept_time"`
	CompleteTime    *time.Time     `json:"complete_time"`
	Amount          float64        `gorm:"default:0" json:"amount"`
	Images          string         `gorm:"type:text" json:"images"`
	Remark          string         `gorm:"type:text" json:"remark"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
	
	Owner           *User          `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	House           *House         `gorm:"foreignKey:HouseID" json:"house,omitempty"`
	Category        *RepairCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Repairer        *User          `gorm:"foreignKey:RepairerID" json:"repairer,omitempty"`
}

const (
	OrderStatusPending    = "pending"
	OrderStatusAccepted   = "accepted"
	OrderStatusProcessing = "processing"
	OrderStatusCompleted  = "completed"
	OrderStatusCancelled  = "cancelled"
	
	UrgencyLow    = "low"
	UrgencyNormal = "normal"
	UrgencyHigh   = "high"
)
