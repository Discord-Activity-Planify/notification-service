import { sequelize } from "../../../../database";
import { DataTypes } from "sequelize";

export const Assign = sequelize.define(
    "Assigns",
    {
        assignId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        cardId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        versionNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false
    }
)