import { sequelize } from "../database";
import { DataTypes } from "sequelize";

export const Project = sequelize.define(
    "Projects",
    {
        projectId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        timestamps: false
    }
)