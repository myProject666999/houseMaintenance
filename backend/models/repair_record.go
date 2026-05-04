package models

import (
	"time"

	"gorm.io/gorm"
)

type RepairRecord struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	OrderID       uint           `gorm:"not null;index" json:"order_id"`
	RepairerID    uint           `gorm:"not null;index" json:"repairer_id"`
	OwnerID       uint           `gorm:"not null;index" json:"owner_id"`
	Content       string         `gorm:"type:text;not null" json:"content"`
	Materials     string         `gorm:"type:text" json:"materials"`
	LaborHours    float64        `gorm:"default:0" json:"labor_hours"`
	MaterialCost  float64        `gorm:"default:0" json:"material_cost"`
	LaborCost     float64        `gorm:"default:0" json:"labor_cost"`
	TotalCost     float64        `gorm:"default:0" json:"total_cost"`
	Images        string         `gorm:"type:text" json:"images"`
	Status        string         `gorm:"size:20;default:'processing'" json:"status"`
	StartTime     *time.Time     `json:"start_time"`
	EndTime       *time.Time     `json:"end_time"`
	Remark        string         `gorm:"type:text" json:"remark"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	
	Order         *RepairOrder   `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	Repairer      *User          `gorm:"foreignKey:RepairerID" json:"repairer,omitempty"`
	Owner         *User          `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
}

const (
	RecordStatusProcessing = "processing"
	RecordStatusCompleted  = "completed"
	RecordStatusReviewed   = "reviewed"
)
