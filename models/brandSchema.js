const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true,
        unique: true,
        maxlength: [50, 'Brand name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    website: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Please enter a valid URL'
        }
    },
    userId: {
        type: String,
        required: [true, 'User ID is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});



module.exports = mongoose.model('Brand', brandSchema);