
import express from "express"
import router from "./app/routes"
import cors from 'cors';
import cookieParser from "cookie-parser";
import { PaymentController } from "./app/modules/payment/payment.controller";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
const app = express()


// middlewares
app.post("/webhook", 
    express.raw({type: "application/json"}),
    PaymentController.handleStripeWebhookEvent
)


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:8080','http://localhost:3000'],
    credentials: true
}));
app.use('/api/v1', router)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(globalErrorHandler);

app.use(notFound);


export default app;