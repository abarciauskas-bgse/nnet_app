var iter_note_sets = []
var IterNoteSet = function(song, inputs, targets, iter_index) {
    this.song = song;
    this.inputs = inputs;
    this.targets = targets;
    this.iter_index = iter_index;
    iter_note_sets.push(this)
}
