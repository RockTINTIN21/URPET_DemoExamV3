// подключение express
import express from 'express';
import controller from './controller/controller.js';
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use(express.static('../public'));
app.use(controller);
app.listen(port, () => {console.log(`Server started on port ${port}`)})