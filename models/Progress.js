const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    progress: { type: Number, default: 0 }, // Progress in percentage
    estimatedTime: { type: Number, default: 0 } // Estimated time in seconds
});

module.exports = mongoose.model('Progress', ProgressSchema);
