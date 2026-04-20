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
