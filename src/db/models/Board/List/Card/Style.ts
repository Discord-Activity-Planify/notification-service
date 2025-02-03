import { sequelize } from "../../../../database";
import { DataTypes } from "sequelize";

export const Style = sequelize.define(
    "Styles",
    {
        styleId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false
    }
)