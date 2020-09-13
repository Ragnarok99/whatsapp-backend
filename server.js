import express from 'express';
import mongoose from 'mongoose';
import Pusher from 'pusher';
import cors from 'cors';

import dbMessages from './dbMessages.js';

const app = express();
const PORT = process.env.PORT || 9000;

const pusher = new Pusher({
	appId: '1072185',
	key: 'cb6d04112788a3c2de25',
	secret: 'ee85ce95e9866d666c14',
	cluster: 'us2',
	encrypted: true,
});

app.use(express.json());
app.use(cors());

const CONNECTION_URL =
	'mongodb+srv://admin:0RjDsAmhZIh1MPhA@cluster0.kavmx.mongodb.net/whatsappdb?retryWrites=true&w=majority';

mongoose.connect(CONNECTION_URL, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', () => {
	console.log('DB connected');

	const changeStream = db.collection('messagecontents').watch();

	changeStream.on('change', (change) => {
		const messageDetails = change.fullDocument;

		if (change.operationType === 'insert') {
			pusher.trigger('messages', 'inserted', {
				name: messageDetails.name,
				message: messageDetails.message,
			});
		}
	});
});

app.get('/', (req, res) => {
	res.status(200).send('hello world');
});

app.post('/api/v1/messages/new', async (req, res) => {
	const dbMessage = req.body;

	try {
		const response = await dbMessages.create(dbMessage);
		res.status(201).send(response);
	} catch (error) {
		res.send(500).send(error);
	}
});

app.get('/api/v1/messages/sync', async (req, res) => {
	try {
		const response = await dbMessages.find();
		res.status(200).send(response);
	} catch (error) {
		res.send(500).send(error);
	}
});

app.listen(PORT, () => {
	console.log(`Listening on localhost:${PORT}`);
});
