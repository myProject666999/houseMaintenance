package routes

import (
	"housemaintenance/controllers"
	"housemaintenance/middleware"
	"housemaintenance/models"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		api.POST("/login", controllers.Login)
		api.POST("/register", controllers.Register)
	}

	auth := api.Group("")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.GET("/user/me", controllers.GetCurrentUser)
		auth.PUT("/user/password", controllers.ChangePassword)
		auth.PUT("/user/profile", controllers.UpdateProfile)

		owner := auth.Group("")
		owner.Use(middleware.RoleMiddleware(models.RoleOwner))
		{
			owner.POST("/repair-orders", controllers.CreateRepairOrder)
			owner.GET("/repair-orders", controllers.GetOwnerRepairOrders)
			owner.GET("/repair-orders/:id", controllers.GetRepairOrderDetail)
			owner.PUT("/repair-orders/:id/cancel", controllers.CancelRepairOrder)
			
			owner.GET("/repair-records", controllers.GetOwnerRepairRecords)
			owner.GET("/repair-records/:id", controllers.GetRepairRecordDetail)
			
			owner.POST("/evaluations", controllers.CreateEvaluation)
			owner.GET("/evaluations", controllers.GetOwnerEvaluations)
			
			owner.GET("/notices", controllers.GetOwnerNotices)
			owner.GET("/notices/:id", controllers.GetNoticeDetail)
			
			owner.GET("/statistics/amount", controllers.GetOwnerAmountStatistics)
			
			owner.GET("/houses", controllers.GetOwnerHouses)
			owner.POST("/houses", controllers.CreateHouse)
			owner.PUT("/houses/:id", controllers.UpdateHouse)
			owner.DELETE("/houses/:id", controllers.DeleteHouse)
		}

		repairer := auth.Group("")
		repairer.Use(middleware.RoleMiddleware(models.RoleRepairer))
		{
			repairer.GET("/repair-orders/pending", controllers.GetPendingRepairOrders)
			repairer.PUT("/repair-orders/:id/accept", controllers.AcceptRepairOrder)
			repairer.GET("/repair-orders/my", controllers.GetRepairerRepairOrders)
			repairer.GET("/repair-orders/:id", controllers.GetRepairOrderDetail)
			repairer.PUT("/repair-orders/:id/complete", controllers.CompleteRepairOrder)
			
			repairer.POST("/repair-records", controllers.CreateRepairRecord)
			repairer.GET("/repair-records/my", controllers.GetRepairerRepairRecords)
			repairer.GET("/repair-records/:id", controllers.GetRepairRecordDetail)
			
			repairer.GET("/evaluations/my", controllers.GetRepairerEvaluations)
			
			repairer.GET("/notices", controllers.GetRepairerNotices)
			repairer.GET("/notices/:id", controllers.GetNoticeDetail)
		}

		admin := auth.Group("")
		admin.Use(middleware.RoleMiddleware(models.RoleAdmin))
		{
			admin.GET("/users/owners", controllers.GetOwnerUsers)
			admin.GET("/users/repairers", controllers.GetRepairerUsers)
			admin.POST("/users", controllers.CreateUser)
			admin.PUT("/users/:id", controllers.UpdateUser)
			admin.DELETE("/users/:id", controllers.DeleteUser)
			admin.GET("/users/:id", controllers.GetUserDetail)
			
			admin.GET("/repair-categories", controllers.GetRepairCategories)
			admin.POST("/repair-categories", controllers.CreateRepairCategory)
			admin.PUT("/repair-categories/:id", controllers.UpdateRepairCategory)
			admin.DELETE("/repair-categories/:id", controllers.DeleteRepairCategory)
			
			admin.GET("/repair-orders", controllers.GetAllRepairOrders)
			admin.GET("/repair-orders/:id", controllers.GetRepairOrderDetail)
			admin.PUT("/repair-orders/:id/status", controllers.UpdateRepairOrderStatus)
			admin.DELETE("/repair-orders/:id", controllers.DeleteRepairOrder)
			
			admin.GET("/repair-records", controllers.GetAllRepairRecords)
			admin.GET("/repair-records/:id", controllers.GetRepairRecordDetail)
			
			admin.GET("/evaluations", controllers.GetAllEvaluations)
			admin.GET("/evaluations/:id", controllers.GetEvaluationDetail)
			admin.PUT("/evaluations/:id/reply", controllers.ReplyEvaluation)
			admin.DELETE("/evaluations/:id", controllers.DeleteEvaluation)
			
			admin.GET("/notices", controllers.GetAllNotices)
			admin.POST("/notices", controllers.CreateNotice)
			admin.PUT("/notices/:id", controllers.UpdateNotice)
			admin.DELETE("/notices/:id", controllers.DeleteNotice)
			admin.GET("/notices/:id", controllers.GetNoticeDetail)
			
			admin.GET("/statistics/owners", controllers.GetOwnerStatistics)
			admin.GET("/statistics/orders", controllers.GetOrderStatistics)
			admin.GET("/statistics/categories", controllers.GetCategoryStatistics)
			admin.GET("/statistics/performance", controllers.GetPerformanceStatistics)
			admin.GET("/statistics/records", controllers.GetRecordStatistics)
			admin.GET("/statistics/dashboard", controllers.GetDashboardStatistics)
			
			admin.POST("/backup", controllers.CreateBackup)
			admin.GET("/backups", controllers.GetBackups)
			admin.DELETE("/backups/:name", controllers.DeleteBackup)
		}

		auth.GET("/repair-categories", controllers.GetRepairCategoriesPublic)
	}
}
