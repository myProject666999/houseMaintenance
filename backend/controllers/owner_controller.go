package controllers

import (
	"fmt"
	"net/http"
	"time"

	"housemaintenance/config"
	"housemaintenance/models"

	"github.com/gin-gonic/gin"
)

func CreateRepairOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var req struct {
		HouseID     uint   `json:"house_id" binding:"required"`
		CategoryID  uint   `json:"category_id" binding:"required"`
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
		ContactName string `json:"contact_name"`
		ContactPhone string `json:"contact_phone"`
		Address     string `json:"address"`
		Urgency     string `json:"urgency"`
		Images      string `json:"images"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var house models.House
	if err := config.DB.Where("id = ? AND owner_id = ?", req.HouseID, userID).First(&house).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "House not found"})
		return
	}
	
	orderNo := fmt.Sprintf("RO%s%s", time.Now().Format("20060102"), fmt.Sprintf("%06d", time.Now().Unix()%1000000))
	
	order := models.RepairOrder{
		OrderNo:      orderNo,
		OwnerID:      userID.(uint),
		HouseID:      req.HouseID,
		CategoryID:   req.CategoryID,
		Title:        req.Title,
		Description:  req.Description,
		ContactName:  req.ContactName,
		ContactPhone: req.ContactPhone,
		Address:      req.Address,
		Urgency:      req.Urgency,
		Images:       req.Images,
		Status:       models.OrderStatusPending,
	}
	
	if order.Urgency == "" {
		order.Urgency = models.UrgencyNormal
	}
	
	if err := config.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create repair order"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Repair order created successfully",
		"order":   order,
	})
}

func GetOwnerRepairOrders(c *gin.Context) {
	userID, _ := c.Get("user_id")
	status := c.Query("status")
	
	var orders []models.RepairOrder
	query := config.DB.Where("owner_id = ?", userID).Preload("Category").Preload("House").Preload("Repairer")
	
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	if err := query.Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repair orders"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func GetRepairOrderDetail(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("role")
	id := c.Param("id")
	
	var order models.RepairOrder
	query := config.DB.Preload("Owner").Preload("House").Preload("Category").Preload("Repairer")
	
	if userRole == models.RoleOwner {
		query = query.Where("owner_id = ?", userID)
	} else if userRole == models.RoleRepairer {
		query = query.Where("repairer_id = ? OR status = ?", userID, models.OrderStatusPending)
	}
	
	if err := query.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair order not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"order": order})
}

func CancelRepairOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")
	
	var order models.RepairOrder
	if err := config.DB.Where("id = ? AND owner_id = ?", id, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair order not found"})
		return
	}
	
	if order.Status != models.OrderStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only pending orders can be cancelled"})
		return
	}
	
	order.Status = models.OrderStatusCancelled
	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel repair order"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Repair order cancelled successfully"})
}

func GetOwnerRepairRecords(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var records []models.RepairRecord
	if err := config.DB.Where("owner_id = ?", userID).Preload("Order").Preload("Repairer").Order("created_at DESC").Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repair records"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"records": records})
}

func GetRepairRecordDetail(c *gin.Context) {
	userID, _ := c.Get("user_id")
	userRole, _ := c.Get("role")
	id := c.Param("id")
	
	var record models.RepairRecord
	query := config.DB.Preload("Order").Preload("Owner").Preload("Repairer")
	
	if userRole == models.RoleOwner {
		query = query.Where("owner_id = ?", userID)
	} else if userRole == models.RoleRepairer {
		query = query.Where("repairer_id = ?", userID)
	}
	
	if err := query.First(&record, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair record not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"record": record})
}

func CreateEvaluation(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var req struct {
		OrderID     uint   `json:"order_id" binding:"required"`
		Rating      int    `json:"rating" binding:"required"`
		Content     string `json:"content"`
		Images      string `json:"images"`
		IsAnonymous int    `json:"is_anonymous"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var order models.RepairOrder
	if err := config.DB.Where("id = ? AND owner_id = ? AND status = ?", req.OrderID, userID, models.OrderStatusCompleted).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Completed repair order not found"})
		return
	}
	
	var existingEvaluation models.Evaluation
	if err := config.DB.Where("order_id = ?", req.OrderID).First(&existingEvaluation).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Evaluation already exists for this order"})
		return
	}
	
	evaluation := models.Evaluation{
		OrderID:     req.OrderID,
		OwnerID:     userID.(uint),
		RepairerID:  *order.RepairerID,
		Rating:      req.Rating,
		Content:     req.Content,
		Images:      req.Images,
		IsAnonymous: req.IsAnonymous,
		Status:      1,
	}
	
	if err := config.DB.Create(&evaluation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create evaluation"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message":    "Evaluation created successfully",
		"evaluation": evaluation,
	})
}

func GetOwnerEvaluations(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var evaluations []models.Evaluation
	if err := config.DB.Where("owner_id = ?", userID).Preload("Order").Preload("Repairer").Order("created_at DESC").Find(&evaluations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get evaluations"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"evaluations": evaluations})
}

func GetOwnerNotices(c *gin.Context) {
	var notices []models.Notice
	if err := config.DB.Where("target IN (?, ?) AND status = 1", models.NoticeTargetAll, models.NoticeTargetOwner).Preload("Author").Order("is_top DESC, created_at DESC").Find(&notices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get notices"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"notices": notices})
}

func GetNoticeDetail(c *gin.Context) {
	id := c.Param("id")
	
	var notice models.Notice
	if err := config.DB.Preload("Author").First(&notice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notice not found"})
		return
	}
	
	notice.ViewCount++
	config.DB.Save(&notice)
	
	c.JSON(http.StatusOK, gin.H{"notice": notice})
}

func GetOwnerAmountStatistics(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var totalAmount float64
	config.DB.Model(&models.RepairRecord{}).Where("owner_id = ? AND status = ?", userID, models.RecordStatusCompleted).Select("SUM(total_cost)").Scan(&totalAmount)
	
	var monthlyStats []struct {
		Month  string  `json:"month"`
		Amount float64 `json:"amount"`
	}
	
	config.DB.Model(&models.RepairRecord{}).
		Where("owner_id = ? AND status = ?", userID, models.RecordStatusCompleted).
		Select("DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_cost) as amount").
		Group("month").
		Order("month DESC").
		Limit(12).
		Scan(&monthlyStats)
	
	c.JSON(http.StatusOK, gin.H{
		"total_amount": totalAmount,
		"monthly_stats": monthlyStats,
	})
}

func GetOwnerHouses(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var houses []models.House
	if err := config.DB.Where("owner_id = ?", userID).Find(&houses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get houses"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"houses": houses})
}

func CreateHouse(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var req struct {
		HouseNumber string  `json:"house_number" binding:"required"`
		Building    string  `json:"building"`
		Unit        string  `json:"unit"`
		Floor       int     `json:"floor"`
		Area        float64 `json:"area"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	house := models.House{
		OwnerID:     userID.(uint),
		HouseNumber: req.HouseNumber,
		Building:    req.Building,
		Unit:        req.Unit,
		Floor:       req.Floor,
		Area:        req.Area,
		Status:      1,
	}
	
	if err := config.DB.Create(&house).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create house"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "House created successfully",
		"house":   house,
	})
}

func UpdateHouse(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")
	
	var req struct {
		HouseNumber string  `json:"house_number"`
		Building    string  `json:"building"`
		Unit        string  `json:"unit"`
		Floor       int     `json:"floor"`
		Area        float64 `json:"area"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var house models.House
	if err := config.DB.Where("id = ? AND owner_id = ?", id, userID).First(&house).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "House not found"})
		return
	}
	
	if req.HouseNumber != "" {
		house.HouseNumber = req.HouseNumber
	}
	if req.Building != "" {
		house.Building = req.Building
	}
	if req.Unit != "" {
		house.Unit = req.Unit
	}
	if req.Floor != 0 {
		house.Floor = req.Floor
	}
	if req.Area != 0 {
		house.Area = req.Area
	}
	
	if err := config.DB.Save(&house).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update house"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "House updated successfully",
		"house":   house,
	})
}

func DeleteHouse(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")
	
	var house models.House
	if err := config.DB.Where("id = ? AND owner_id = ?", id, userID).First(&house).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "House not found"})
		return
	}
	
	if err := config.DB.Delete(&house).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete house"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "House deleted successfully"})
}
