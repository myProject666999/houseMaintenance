package controllers

import (
	"net/http"
	"time"

	"housemaintenance/config"
	"housemaintenance/models"

	"github.com/gin-gonic/gin"
)

func GetPendingRepairOrders(c *gin.Context) {
	var orders []models.RepairOrder
	if err := config.DB.Where("status = ?", models.OrderStatusPending).Preload("Owner").Preload("House").Preload("Category").Order("urgency DESC, created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get pending repair orders"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func AcceptRepairOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")
	
	var order models.RepairOrder
	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair order not found"})
		return
	}
	
	if order.Status != models.OrderStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending orders can be accepted"})
		return
	}
	
	now := time.Now()
	repairerID := userID.(uint)
	order.Status = models.OrderStatusAccepted
	order.RepairerID = &repairerID
	order.AcceptTime = &now
	
	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept repair order"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Repair order accepted successfully",
		"order":   order,
	})
}

func GetRepairerRepairOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	status := c.Query("status")
	
	var orders []models.RepairOrder
	query := config.DB.Where("repairer_id = ?", userID).Preload("Owner").Preload("House").Preload("Category")
	
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	if err := query.Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repair orders"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func CompleteRepairOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")
	
	var req struct {
		Amount float64 `json:"amount"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var order models.RepairOrder
	if err := config.DB.Where("id = ? AND repairer_id = ?", id, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair order not found"})
		return
	}
	
	if order.Status != models.OrderStatusProcessing && order.Status != models.OrderStatusAccepted {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only accepted or processing orders can be completed"})
		return
	}
	
	now := time.Now()
	order.Status = models.OrderStatusCompleted
	order.CompleteTime = &now
	order.Amount = req.Amount
	
	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete repair order"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Repair order completed successfully",
		"order":   order,
	})
}

func CreateRepairRecord(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var req struct {
		OrderID      uint    `json:"order_id" binding:"required"`
		Content      string  `json:"content" binding:"required"`
		Materials    string  `json:"materials"`
		LaborHours   float64 `json:"labor_hours"`
		MaterialCost float64 `json:"material_cost"`
		LaborCost    float64 `json:"labor_cost"`
		Images       string  `json:"images"`
		Status       string  `json:"status"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var order models.RepairOrder
	if err := config.DB.Where("id = ? AND repairer_id = ?", req.OrderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair order not found or not assigned to you"})
		return
	}
	
	totalCost := req.MaterialCost + req.LaborCost
	
	record := models.RepairRecord{
		OrderID:      req.OrderID,
		RepairerID:   userID.(uint),
		OwnerID:      order.OwnerID,
		Content:      req.Content,
		Materials:    req.Materials,
		LaborHours:   req.LaborHours,
		MaterialCost: req.MaterialCost,
		LaborCost:    req.LaborCost,
		TotalCost:    totalCost,
		Images:       req.Images,
		Status:       req.Status,
	}
	
	if record.Status == "" {
		record.Status = models.RecordStatusProcessing
	}
	
	if err := config.DB.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create repair record"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Repair record created successfully",
		"record":  record,
	})
}

func GetRepairerRepairRecords(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var records []models.RepairRecord
	if err := config.DB.Where("repairer_id = ?", userID).Preload("Order").Preload("Owner").Order("created_at DESC").Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repair records"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"records": records})
}

func GetRepairerEvaluations(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var evaluations []models.Evaluation
	if err := config.DB.Where("repairer_id = ?", userID).Preload("Order").Preload("Owner").Order("created_at DESC").Find(&evaluations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get evaluations"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"evaluations": evaluations})
}

func GetRepairerNotices(c *gin.Context) {
	var notices []models.Notice
	if err := config.DB.Where("target IN (?, ?) AND status = 1", models.NoticeTargetAll, models.NoticeTargetRepairer).Preload("Author").Order("is_top DESC, created_at DESC").Find(&notices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get notices"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"notices": notices})
}
