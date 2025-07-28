import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || "Sneakhead", // Database name
  process.env.DB_USER || "postgres",  // Database user
  process.env.DB_PASSWORD || "root",  // Database password
  {
    host: process.env.DB_HOST || "localhost",
    dialect: 'postgres',// other example mysql,oracle,h2
  }
);

export const db = async () => {
  try {
    await sequelize.authenticate();
    console.log("database connected successfully")
    
    // Sync models with force: false and alter: true for development
    await sequelize.sync({ alter: true, force: false });
    console.log("database tables synced successfully")

  } catch (e) {
    console.error("fail to connect database successfully",e)
  }
}



