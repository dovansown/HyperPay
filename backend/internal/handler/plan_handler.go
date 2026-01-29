package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"hyperpay-backend/internal/dto"
	appErrors "hyperpay-backend/internal/errors"
	"hyperpay-backend/internal/models"
	"hyperpay-backend/internal/response"
)

type PlanHandler struct {
	db *gorm.DB
}

func NewPlanHandler(db *gorm.DB) *PlanHandler {
	return &PlanHandler{db: db}
}

// POST /api/v1/plans
func (h *PlanHandler) CreatePlan(c *gin.Context) {
	var req dto.PlanCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, appErrors.ErrCodeInvalidRequest)
		return
	}

	// Check trùng tên gói
	var existing models.Plan
	if err := h.db.Where("name = ?", req.Name).First(&existing).Error; err == nil {
		response.Fail(c, http.StatusConflict, appErrors.ErrCodeConflict)
		return
	}

	description := ""
	if req.Description != nil {
		description = *req.Description
	}

	plan := models.Plan{
		Name:            req.Name,
		PriceVND:        req.PriceVND,
		MaxBankAccounts: req.MaxBankAccounts,
		MaxTransactions: req.MaxTransactions,
		DurationDays:    req.DurationDays,
		Description:     description,
	}

	if err := h.db.Create(&plan).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	// Gán các Bank cho Plan (nếu có)
	if len(req.BankIDs) > 0 {
		planBanks := make([]models.PlanBank, 0, len(req.BankIDs))
		for _, bankID := range req.BankIDs {
			planBanks = append(planBanks, models.PlanBank{
				PlanID: plan.ID,
				BankID: bankID,
			})
		}
		if err := h.db.Create(&planBanks).Error; err != nil {
			response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
			return
		}
	}

	resp := dto.PlanResponse{
		ID:              plan.ID,
		Name:            plan.Name,
		PriceVND:        plan.PriceVND,
		MaxBankAccounts: plan.MaxBankAccounts,
		MaxTransactions: plan.MaxTransactions,
		DurationDays:    plan.DurationDays,
	}
	if description != "" {
		resp.Description = &description
	}
	resp.BankIDs = req.BankIDs

	response.Success(c, appErrors.ErrCodeSuccess, resp)
}

// GET /api/v1/plans
func (h *PlanHandler) ListPlans(c *gin.Context) {
	var plans []models.Plan
	if err := h.db.Find(&plans).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	// Lấy bank IDs cho từng plan
	var planBanks []models.PlanBank
	if err := h.db.Find(&planBanks).Error; err != nil {
		response.Fail(c, http.StatusInternalServerError, appErrors.ErrCodeInternalServer)
		return
	}

	banksByPlan := make(map[uint][]uint)
	for _, pb := range planBanks {
		banksByPlan[pb.PlanID] = append(banksByPlan[pb.PlanID], pb.BankID)
	}

	resp := make([]dto.PlanResponse, 0, len(plans))
	for _, p := range plans {
		var descPtr *string
		if p.Description != "" {
			d := p.Description
			descPtr = &d
		}

		resp = append(resp, dto.PlanResponse{
			ID:              p.ID,
			Name:            p.Name,
			PriceVND:        p.PriceVND,
			MaxBankAccounts: p.MaxBankAccounts,
			MaxTransactions: p.MaxTransactions,
			DurationDays:    p.DurationDays,
			Description:     descPtr,
			BankIDs:         banksByPlan[p.ID],
		})
	}

	response.Success(c, appErrors.ErrCodeSuccess, resp)
}
