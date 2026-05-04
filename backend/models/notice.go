package models

import (
	"time"

	"gorm.io/gorm"
)

type Notice struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     string         `gorm:"size:200;not null" json:"title"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	AuthorID  uint           `gorm:"not null;index" json:"author_id"`
	Target    string         `gorm:"size:20;default:'all'" json:"target"`
	Status    int            `gorm:"default:1" json:"status"`
	IsTop     int            `gorm:"default:0" json:"is_top"`
	ViewCount int            `gorm:"default:0" json:"view_count"`
	PublishAt *time.Time     `json:"publish_at"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	Author    *User          `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}

const (
	NoticeTargetAll      = "all"
	NoticeTargetOwner    = "owner"
	NoticeTargetRepairer = "repairer"
)
