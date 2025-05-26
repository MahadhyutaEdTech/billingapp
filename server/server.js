import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./src/routes/userRoutes.js";
import morgan from "morgan";
import customerRouter from "./src/routes/customerRoutes.js";
import invoiceRouter from "./src/routes/invoiceRoutes.js";
import taxRouter from "./src/routes/taxesRoutes.js";
import paymentRouter from "./src/routes/paymentRoute.js";
import productRouter from "./src/routes/productRoutes.js";
import dashboardRouter from "./src/routes/dashboard.js";
import organizationRouter from "./src/routes/organizationRoutes.js";
import gstTypeRouter from "./src/routes/checkGstTypeRoutes.js";
import reportsRouter from "./src/routes/reportRoutes.js";
import expensesRouter from "./src/routes/expenseRoutes.js";
import employeeRouter from "./src/routes/employeeRoutes.js";
import projectRouter from "./src/routes/projectRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
dotenv.config();
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on Port :${PORT}`);
});
app.use("/auth",authRouter);
app.use("/customer",customerRouter);
app.use("/invoice",invoiceRouter);
app.use("/taxes",taxRouter);
app.use("/payments",paymentRouter);
app.use("/products",productRouter);
app.use("/dashboard",dashboardRouter);
app.use("/organization",organizationRouter);
app.use('/gst',gstTypeRouter);
app.use('/api',reportsRouter);
app.use('/exp',expensesRouter);
app.use('/emp',employeeRouter);
app.use('/proj',projectRouter);


