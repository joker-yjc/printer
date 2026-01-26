import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import schemasRouter from './routes/schemas';
import templatesRouter from './routes/templates';
import mockDataRouter from './routes/mockData';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/schemas', schemasRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/mock-data', mockDataRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Print service server listening on port ${PORT}`);
});
