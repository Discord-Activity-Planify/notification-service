import { sequelize } from "../../../../database";
import { DataTypes } from "sequelize";

export const Card = sequelize.define(
    "Cards",
    {
        cardId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        listId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        projectId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        boardId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        versionNumber: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
        },
        styleId: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        startDate: {
            type: DataTypes.DATE,
        },
        endDate: {
            type: DataTypes.DATE,
        },
        reminderDaysInterval: {
            type: DataTypes.INTEGER,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        order: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        lastReminderDate: {
            type: DataTypes.DATE,
        },
    },
    {
        timestamps: false
    }
)