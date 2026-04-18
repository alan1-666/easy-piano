package midi

// ParsedSong represents a parsed MIDI file structure.
type ParsedSong struct {
	Title    string
	BPM      int
	Tracks   []ParsedTrack
	Duration int // seconds
}

// ParsedTrack represents a single hand's track.
type ParsedTrack struct {
	Hand  string // "left" or "right"
	Notes []ParsedNote
}

// ParsedNote represents a single note event.
type ParsedNote struct {
	Note     int     // MIDI note number 0-127
	Start    float64 // milliseconds
	Duration float64 // milliseconds
	Velocity int     // 0-127
}

// ParseMIDIFile parses a MIDI file and returns structured song data.
// TODO: implement using gomidi/midi/v2
func ParseMIDIFile(filePath string) (*ParsedSong, error) {
	return &ParsedSong{}, nil
}
