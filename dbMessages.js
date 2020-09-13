import mongoose from 'mongoose';

const whatsappSchema = mongoose.Schema({
	message: String,
	nanme: String,
	timestamp: String,
	received: Boolean,
});

export default mongoose.model('messagecontent', whatsappSchema);
