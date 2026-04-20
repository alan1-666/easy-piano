package handler

import (
	"encoding/base64"
	"io"
	"net/http"
	"strconv"

	"github.com/alan1-666/easy-piano/server/internal/model"
	"github.com/alan1-666/easy-piano/server/pkg/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ─── Song CRUD ──────────────────────────────────────────────

const maxMidiBytes = 2 * 1024 * 1024 // 2 MB — no legit .mid is bigger

type AdminHandler struct {
	db *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

// UploadSongMidi accepts a multipart .mid upload under the "midi" field
// and stores it base64-encoded in songs.midi_data. Frontend's midiDecoder
// auto-detects base64 vs JSON by looking at the first character, so this
// coexists with the hand-authored JSON seeds we already have.
//
//	POST /v1/admin/songs/:id/midi
//	  multipart: midi=@song.mid
func (h *AdminHandler) UploadSongMidi(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid song id"))
		return
	}

	fh, err := c.FormFile("midi")
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "missing or invalid 'midi' file field"))
		return
	}
	if fh.Size > maxMidiBytes {
		c.JSON(http.StatusRequestEntityTooLarge, response.Error(413, "midi file too large (max 2MB)"))
		return
	}

	f, err := fh.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "cannot open upload"))
		return
	}
	defer f.Close()
	raw, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "cannot read upload"))
		return
	}
	// Quick sanity check: MIDI files start with "MThd".
	if len(raw) < 4 || string(raw[:4]) != "MThd" {
		c.JSON(http.StatusBadRequest, response.Error(400, "not a valid .mid file (missing MThd header)"))
		return
	}
	encoded := base64.StdEncoding.EncodeToString(raw)

	var song model.Song
	if err := h.db.First(&song, id).Error; err != nil {
		c.JSON(http.StatusNotFound, response.Error(404, "song not found"))
		return
	}
	song.MidiData = encoded
	if err := h.db.Save(&song).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to save midi"))
		return
	}

	c.JSON(http.StatusOK, response.Success(gin.H{
		"song_id":       song.ID,
		"midi_bytes":    len(raw),
		"encoded_bytes": len(encoded),
	}))
}

// ClearSongMidi blanks a song's midi_data. Useful for rolling back a
// bad upload without touching the DB directly.
//
//	DELETE /v1/admin/songs/:id/midi
func (h *AdminHandler) ClearSongMidi(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid song id"))
		return
	}
	if err := h.db.Model(&model.Song{}).Where("id = ?", id).Update("midi_data", "").Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to clear midi"))
		return
	}
	c.JSON(http.StatusOK, response.Success(gin.H{"cleared": id}))
}

type upsertSongReq struct {
	Title         *string `json:"title"`
	Artist        *string `json:"artist"`
	Difficulty    *int    `json:"difficulty"`
	BPM           *int    `json:"bpm"`
	Duration      *int    `json:"duration"`
	TimeSignature *string `json:"time_signature"`
	KeySignature  *string `json:"key_signature"`
	Tags          *string `json:"tags"`
	CoverURL      *string `json:"cover_url"`
	IsFree        *bool   `json:"is_free"`
	Locale        *string `json:"locale"`
}

// CreateSong inserts a new song row with the supplied metadata. The
// midi payload is uploaded separately via POST /songs/:id/midi — this
// keeps forms manageable and lets admins stage metadata before content.
//
//	POST /v1/admin/songs
func (h *AdminHandler) CreateSong(c *gin.Context) {
	var req upsertSongReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid body: "+err.Error()))
		return
	}
	if req.Title == nil || *req.Title == "" {
		c.JSON(http.StatusBadRequest, response.Error(400, "title is required"))
		return
	}
	song := model.Song{
		Title:      *req.Title,
		Difficulty: 1,
		BPM:        100,
		Duration:   60,
		IsFree:     true,
		Locale:     "zh-CN",
	}
	applySongPatch(&song, &req)
	if err := h.db.Create(&song).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to create song"))
		return
	}
	c.JSON(http.StatusCreated, response.Success(song))
}

// UpdateSong edits only the fields present in the JSON body. Any field
// set to null / omitted is left untouched. midi_data is NOT exposed
// here — use POST /songs/:id/midi or DELETE /songs/:id/midi for that.
//
//	PATCH /v1/admin/songs/:id
func (h *AdminHandler) UpdateSong(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid song id"))
		return
	}
	var req upsertSongReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid body: "+err.Error()))
		return
	}
	var song model.Song
	if err := h.db.First(&song, id).Error; err != nil {
		c.JSON(http.StatusNotFound, response.Error(404, "song not found"))
		return
	}
	applySongPatch(&song, &req)
	if err := h.db.Save(&song).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to update"))
		return
	}
	c.JSON(http.StatusOK, response.Success(song))
}

func applySongPatch(s *model.Song, req *upsertSongReq) {
	if req.Title != nil {
		s.Title = *req.Title
	}
	if req.Artist != nil {
		s.Artist = *req.Artist
	}
	if req.Difficulty != nil {
		s.Difficulty = *req.Difficulty
	}
	if req.BPM != nil {
		s.BPM = *req.BPM
	}
	if req.Duration != nil {
		s.Duration = *req.Duration
	}
	if req.TimeSignature != nil {
		s.TimeSignature = *req.TimeSignature
	}
	if req.KeySignature != nil {
		s.KeySignature = *req.KeySignature
	}
	if req.Tags != nil {
		s.Tags = *req.Tags
	}
	if req.CoverURL != nil {
		s.CoverURL = *req.CoverURL
	}
	if req.IsFree != nil {
		s.IsFree = *req.IsFree
	}
	if req.Locale != nil {
		s.Locale = *req.Locale
	}
}

// DeleteSong hard-deletes a song row. Practice logs referencing it
// stay around (foreign key is not enforced in the DB schema), so
// historical stats keep working even for removed songs.
//
//	DELETE /v1/admin/songs/:id
func (h *AdminHandler) DeleteSong(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid song id"))
		return
	}
	if err := h.db.Delete(&model.Song{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to delete"))
		return
	}
	c.JSON(http.StatusOK, response.Success(gin.H{"deleted": id}))
}

// ─── User management ──────────────────────────────────────────

// ListUsers returns a paginated user list with optional search. The
// JSON already strips password hashes (User.PasswordHash has `json:"-"`).
//
//	GET /v1/admin/users?page=1&page_size=20&q=query
func (h *AdminHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 200 {
		pageSize = 20
	}
	q := c.Query("q")

	tx := h.db.Model(&model.User{})
	if q != "" {
		like := "%" + q + "%"
		tx = tx.Where("username LIKE ? OR email LIKE ?", like, like)
	}

	var total int64
	tx.Count(&total)

	var users []model.User
	if err := tx.Order("id DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to list users"))
		return
	}
	c.JSON(http.StatusOK, response.Paginated(users, total, page, pageSize))
}

// GetUser returns a single user plus their latest subscription and
// some quick practice-log-derived stats (total sessions / seconds,
// songs purchased).
//
//	GET /v1/admin/users/:id
func (h *AdminHandler) GetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid user id"))
		return
	}

	var user model.User
	if err := h.db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, response.Error(404, "user not found"))
		return
	}

	// Most recent subscription (nullable).
	var sub model.Subscription
	hasSub := true
	if err := h.db.Where("user_id = ?", id).Order("id DESC").First(&sub).Error; err != nil {
		hasSub = false
	}

	// Stats: total sessions, total seconds, purchased song count.
	var totalSessions int64
	var totalSeconds int64
	var purchasedCount int64
	h.db.Model(&model.PracticeLog{}).Where("user_id = ?", id).Count(&totalSessions)
	h.db.Model(&model.PracticeLog{}).Where("user_id = ?", id).
		Select("COALESCE(SUM(duration), 0)").Scan(&totalSeconds)
	h.db.Model(&model.SongPurchase{}).Where("user_id = ?", id).Count(&purchasedCount)

	resp := gin.H{
		"user":            user,
		"subscription":    nil,
		"total_sessions":  totalSessions,
		"total_seconds":   totalSeconds,
		"purchased_count": purchasedCount,
	}
	if hasSub {
		resp["subscription"] = sub
	}
	c.JSON(http.StatusOK, response.Success(resp))
}

type updateUserReq struct {
	IsAdmin *bool `json:"is_admin"`
	IsChild *bool `json:"is_child"`
}

// UpdateUser is intentionally narrow — only toggles is_admin and
// is_child. Renaming / password reset should go through normal user
// flows plus their own audit trail; not worth exposing here.
//
//	PATCH /v1/admin/users/:id
func (h *AdminHandler) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid user id"))
		return
	}
	var req updateUserReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, response.Error(400, "invalid body"))
		return
	}
	updates := map[string]interface{}{}
	if req.IsAdmin != nil {
		updates["is_admin"] = *req.IsAdmin
	}
	if req.IsChild != nil {
		updates["is_child"] = *req.IsChild
	}
	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, response.Error(400, "nothing to update"))
		return
	}
	if err := h.db.Model(&model.User{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, response.Error(500, "failed to update"))
		return
	}
	var user model.User
	h.db.First(&user, id)
	c.JSON(http.StatusOK, response.Success(user))
}
