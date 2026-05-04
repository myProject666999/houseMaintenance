package controllers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"housemaintenance/config"
	"housemaintenance/models"

	"github.com/gin-gonic/gin"
)

func GetOwnerUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Where("role = ?", models.RoleOwner).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get owner users"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"users": users})
}

func GetRepairerUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Where("role = ?", models.RoleRepairer).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repairer users"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"users": users})
}

func CreateUser(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		RealName string `json:"real_name"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Role     string `json:"role" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var existingUser models.User
	if err := config.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}
	
	user := models.User{
		Username: req.Username,
		Password: req.Password,
		RealName: req.RealName,
		Phone:    req.Phone,
		Email:    req.Email,
		Role:     req.Role,
		Status:   1,
	}
	
	if err := user.HashPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "User created successfully",
		"user": gin.H{
			"id":        user.ID,
			"username":  user.Username,
			"real_name": user.RealName,
			"phone":     user.Phone,
			"email":     user.Email,
			"role":      user.Role,
		},
	})
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	
	var req struct {
		RealName string `json:"real_name"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		Status   *int   `json:"status"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	if req.RealName != "" {
		user.RealName = req.RealName
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Status != nil {
		user.Status = *req.Status
	}
	
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
		"user":    user,
	})
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	if err := config.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func GetUserDetail(c *gin.Context) {
	id := c.Param("id")
	
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func GetRepairCategories(c *gin.Context) {
	var categories []models.RepairCategory
	if err := config.DB.Order("sort ASC, created_at DESC").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repair categories"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

func GetRepairCategoriesPublic(c *gin.Context) {
	var categories []models.RepairCategory
	if err := config.DB.Where("status = 1").Order("sort ASC, created_at DESC").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repair categories"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

func CreateRepairCategory(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Sort        int    `json:"sort"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	category := models.RepairCategory{
		Name:        req.Name,
		Description: req.Description,
		Sort:        req.Sort,
		Status:      1,
	}
	
	if err := config.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create repair category"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message":  "Repair category created successfully",
		"category": category,
	})
}

func UpdateRepairCategory(c *gin.Context) {
	id := c.Param("id")
	
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Sort        int    `json:"sort"`
		Status      *int   `json:"status"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var category models.RepairCategory
	if err := config.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair category not found"})
		return
	}
	
	if req.Name != "" {
		category.Name = req.Name
	}
	if req.Description != "" {
		category.Description = req.Description
	}
	if req.Sort != 0 {
		category.Sort = req.Sort
	}
	if req.Status != nil {
		category.Status = *req.Status
	}
	
	if err := config.DB.Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update repair category"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message":  "Repair category updated successfully",
		"category": category,
	})
}

func DeleteRepairCategory(c *gin.Context) {
	id := c.Param("id")
	
	var category models.RepairCategory
	if err := config.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair category not found"})
		return
	}
	
	if err := config.DB.Delete(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete repair category"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Repair category deleted successfully"})
}

func GetAllRepairOrders(c *gin.Context) {
	status := c.Query("status")
	
	var orders []models.RepairOrder
	query := config.DB.Preload("Owner").Preload("House").Preload("Category").Preload("Repairer")
	
	if status != "" {
		query = query.Where("status = ?", status)
	}
	
	if err := query.Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repair orders"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

func UpdateRepairOrderStatus(c *gin.Context) {
	id := c.Param("id")
	
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var order models.RepairOrder
	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair order not found"})
		return
	}
	
	order.Status = req.Status
	
	if err := config.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update repair order status"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Repair order status updated successfully",
		"order":   order,
	})
}

func DeleteRepairOrder(c *gin.Context) {
	id := c.Param("id")
	
	var order models.RepairOrder
	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Repair order not found"})
		return
	}
	
	if err := config.DB.Delete(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete repair order"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Repair order deleted successfully"})
}

func GetAllRepairRecords(c *gin.Context) {
	var records []models.RepairRecord
	if err := config.DB.Preload("Order").Preload("Owner").Preload("Repairer").Order("created_at DESC").Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get repair records"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"records": records})
}

func GetAllEvaluations(c *gin.Context) {
	var evaluations []models.Evaluation
	if err := config.DB.Preload("Order").Preload("Owner").Preload("Repairer").Order("created_at DESC").Find(&evaluations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get evaluations"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"evaluations": evaluations})
}

func GetEvaluationDetail(c *gin.Context) {
	id := c.Param("id")
	
	var evaluation models.Evaluation
	if err := config.DB.Preload("Order").Preload("Owner").Preload("Repairer").First(&evaluation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evaluation not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"evaluation": evaluation})
}

func ReplyEvaluation(c *gin.Context) {
	id := c.Param("id")
	
	var req struct {
		Reply string `json:"reply" binding:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var evaluation models.Evaluation
	if err := config.DB.First(&evaluation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evaluation not found"})
		return
	}
	
	now := time.Now()
	evaluation.Reply = req.Reply
	evaluation.ReplyTime = &now
	
	if err := config.DB.Save(&evaluation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reply evaluation"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message":    "Evaluation replied successfully",
		"evaluation": evaluation,
	})
}

func DeleteEvaluation(c *gin.Context) {
	id := c.Param("id")
	
	var evaluation models.Evaluation
	if err := config.DB.First(&evaluation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evaluation not found"})
		return
	}
	
	if err := config.DB.Delete(&evaluation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete evaluation"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Evaluation deleted successfully"})
}

func GetAllNotices(c *gin.Context) {
	var notices []models.Notice
	if err := config.DB.Preload("Author").Order("is_top DESC, created_at DESC").Find(&notices).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get notices"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"notices": notices})
}

func CreateNotice(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
		Target  string `json:"target"`
		IsTop   int    `json:"is_top"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	now := time.Now()
	notice := models.Notice{
		Title:     req.Title,
		Content:   req.Content,
		AuthorID:  userID.(uint),
		Target:    req.Target,
		IsTop:     req.IsTop,
		Status:    1,
		ViewCount: 0,
		PublishAt: &now,
	}
	
	if notice.Target == "" {
		notice.Target = models.NoticeTargetAll
	}
	
	if err := config.DB.Create(&notice).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notice"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Notice created successfully",
		"notice":  notice,
	})
}

func UpdateNotice(c *gin.Context) {
	id := c.Param("id")
	
	var req struct {
		Title   string `json:"title"`
		Content string `json:"content"`
		Target  string `json:"target"`
		IsTop   *int   `json:"is_top"`
		Status  *int   `json:"status"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	
	var notice models.Notice
	if err := config.DB.First(&notice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notice not found"})
		return
	}
	
	if req.Title != "" {
		notice.Title = req.Title
	}
	if req.Content != "" {
		notice.Content = req.Content
	}
	if req.Target != "" {
		notice.Target = req.Target
	}
	if req.IsTop != nil {
		notice.IsTop = *req.IsTop
	}
	if req.Status != nil {
		notice.Status = *req.Status
	}
	
	if err := config.DB.Save(&notice).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notice"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Notice updated successfully",
		"notice":  notice,
	})
}

func DeleteNotice(c *gin.Context) {
	id := c.Param("id")
	
	var notice models.Notice
	if err := config.DB.First(&notice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notice not found"})
		return
	}
	
	if err := config.DB.Delete(&notice).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notice"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Notice deleted successfully"})
}

func GetOwnerStatistics(c *gin.Context) {
	var totalOwners int64
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleOwner).Count(&totalOwners)
	
	var activeOwners int64
	config.DB.Model(&models.User{}).Where("role = ? AND status = 1", models.RoleOwner).Count(&activeOwners)
	
	var newOwners int64
	lastMonth := time.Now().AddDate(0, -1, 0)
	config.DB.Model(&models.User{}).Where("role = ? AND created_at >= ?", models.RoleOwner, lastMonth).Count(&newOwners)
	
	c.JSON(http.StatusOK, gin.H{
		"total_owners":  totalOwners,
		"active_owners": activeOwners,
		"new_owners":    newOwners,
	})
}

func GetOrderStatistics(c *gin.Context) {
	var totalOrders int64
	config.DB.Model(&models.RepairOrder{}).Count(&totalOrders)
	
	var pendingOrders int64
	config.DB.Model(&models.RepairOrder{}).Where("status = ?", models.OrderStatusPending).Count(&pendingOrders)
	
	var completedOrders int64
	config.DB.Model(&models.RepairOrder{}).Where("status = ?", models.OrderStatusCompleted).Count(&completedOrders)
	
	var cancelledOrders int64
	config.DB.Model(&models.RepairOrder{}).Where("status = ?", models.OrderStatusCancelled).Count(&cancelledOrders)
	
	var monthlyStats []struct {
		Month string `json:"month"`
		Count int64  `json:"count"`
	}
	
	config.DB.Model(&models.RepairOrder{}).
		Select("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count").
		Group("month").
		Order("month DESC").
		Limit(12).
		Scan(&monthlyStats)
	
	c.JSON(http.StatusOK, gin.H{
		"total_orders":      totalOrders,
		"pending_orders":    pendingOrders,
		"completed_orders":  completedOrders,
		"cancelled_orders":  cancelledOrders,
		"monthly_statistics": monthlyStats,
	})
}

func GetCategoryStatistics(c *gin.Context) {
	var stats []struct {
		CategoryID uint   `json:"category_id"`
		CategoryName string `json:"category_name"`
		Count        int64  `json:"count"`
	}
	
	config.DB.Model(&models.RepairOrder{}).
		Select("repair_orders.category_id, repair_categories.name as category_name, COUNT(*) as count").
		Joins("JOIN repair_categories ON repair_orders.category_id = repair_categories.id").
		Group("repair_orders.category_id, repair_categories.name").
		Scan(&stats)
	
	c.JSON(http.StatusOK, gin.H{"category_statistics": stats})
}

func GetPerformanceStatistics(c *gin.Context) {
	var stats []struct {
		RepairerID   uint    `json:"repairer_id"`
		RepairerName string  `json:"repairer_name"`
		TotalOrders  int64   `json:"total_orders"`
		CompletedOrders int64 `json:"completed_orders"`
		TotalAmount  float64 `json:"total_amount"`
		AvgRating    float64 `json:"avg_rating"`
	}
	
	config.DB.Model(&models.RepairOrder{}).
		Select("repair_orders.repairer_id, users.real_name as repairer_name, COUNT(*) as total_orders, SUM(CASE WHEN repair_orders.status = 'completed' THEN 1 ELSE 0 END) as completed_orders, SUM(repair_orders.amount) as total_amount, AVG(evaluations.rating) as avg_rating").
		Joins("JOIN users ON repair_orders.repairer_id = users.id").
		Joins("LEFT JOIN evaluations ON repair_orders.id = evaluations.order_id").
		Where("repair_orders.repairer_id IS NOT NULL").
		Group("repair_orders.repairer_id, users.real_name").
		Scan(&stats)
	
	c.JSON(http.StatusOK, gin.H{"performance_statistics": stats})
}

func GetRecordStatistics(c *gin.Context) {
	var totalRecords int64
	config.DB.Model(&models.RepairRecord{}).Count(&totalRecords)
	
	var totalAmount float64
	config.DB.Model(&models.RepairRecord{}).Select("SUM(total_cost)").Scan(&totalAmount)
	
	var monthlyStats []struct {
		Month  string  `json:"month"`
		Count  int64   `json:"count"`
		Amount float64 `json:"amount"`
	}
	
	config.DB.Model(&models.RepairRecord{}).
		Select("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count, SUM(total_cost) as amount").
		Group("month").
		Order("month DESC").
		Limit(12).
		Scan(&monthlyStats)
	
	c.JSON(http.StatusOK, gin.H{
		"total_records":      totalRecords,
		"total_amount":       totalAmount,
		"monthly_statistics": monthlyStats,
	})
}

func GetDashboardStatistics(c *gin.Context) {
	var totalOwners, totalRepairers int64
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleOwner).Count(&totalOwners)
	config.DB.Model(&models.User{}).Where("role = ?", models.RoleRepairer).Count(&totalRepairers)
	
	var totalOrders, pendingOrders, completedOrders int64
	config.DB.Model(&models.RepairOrder{}).Count(&totalOrders)
	config.DB.Model(&models.RepairOrder{}).Where("status = ?", models.OrderStatusPending).Count(&pendingOrders)
	config.DB.Model(&models.RepairOrder{}).Where("status = ?", models.OrderStatusCompleted).Count(&completedOrders)
	
	var totalAmount float64
	config.DB.Model(&models.RepairRecord{}).Select("SUM(total_cost)").Scan(&totalAmount)
	
	var recentOrders []models.RepairOrder
	config.DB.Preload("Owner").Preload("Category").Order("created_at DESC").Limit(10).Find(&recentOrders)
	
	var recentEvaluations []models.Evaluation
	config.DB.Preload("Owner").Preload("Repairer").Order("created_at DESC").Limit(5).Find(&recentEvaluations)
	
	c.JSON(http.StatusOK, gin.H{
		"summary": gin.H{
			"total_owners":       totalOwners,
			"total_repairers":    totalRepairers,
			"total_orders":       totalOrders,
			"pending_orders":     pendingOrders,
			"completed_orders":   completedOrders,
			"total_amount":       totalAmount,
		},
		"recent_orders":     recentOrders,
		"recent_evaluations": recentEvaluations,
	})
}

func CreateBackup(c *gin.Context) {
	backupDir := "./backups"
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create backup directory"})
		return
	}
	
	timestamp := time.Now().Format("20060102_150405")
	backupFile := filepath.Join(backupDir, fmt.Sprintf("backup_%s.sql", timestamp))
	
	cmd := exec.Command("mysqldump",
		"-h", config.AppConfig.DBHost,
		"-P", config.AppConfig.DBPort,
		"-u", config.AppConfig.DBUser,
		fmt.Sprintf("-p%s", config.AppConfig.DBPassword),
		config.AppConfig.DBName,
		"-r", backupFile,
	)
	
	if err := cmd.Run(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create backup"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message":    "Backup created successfully",
		"backup_file": backupFile,
	})
}

func GetBackups(c *gin.Context) {
	backupDir := "./backups"
	
	if _, err := os.Stat(backupDir); os.IsNotExist(err) {
		c.JSON(http.StatusOK, gin.H{"backups": []string{}})
		return
	}
	
	files, err := os.ReadDir(backupDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list backups"})
		return
	}
	
	var backups []map[string]interface{}
	for _, file := range files {
		if !file.IsDir() {
			info, err := file.Info()
			if err != nil {
				continue
			}
			backups = append(backups, map[string]interface{}{
				"name":    file.Name(),
				"size":    info.Size(),
				"mod_time": info.ModTime(),
			})
		}
	}
	
	c.JSON(http.StatusOK, gin.H{"backups": backups})
}

func DeleteBackup(c *gin.Context) {
	name := c.Param("name")
	backupPath := filepath.Join("./backups", name)
	
	if _, err := os.Stat(backupPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Backup not found"})
		return
	}
	
	if err := os.Remove(backupPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete backup"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Backup deleted successfully"})
}
