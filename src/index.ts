import { Client, GatewayIntentBits } from 'discord.js';
import cron from 'node-cron';
import dayjs from 'dayjs';
import { Card } from './db/models/Board/List/Card/Card'; // Replace with your DB model
import { Assign } from './db/models/Board/List/Card/Assign'; // Replace with your DB model
import { Project } from './db/models/Project'; // Replace with your DB model
import { Board } from './db/models/Board/Board'; // Replace with your DB model
import { initDB } from './db/initDB';
import config from "./config";
import { Op } from 'sequelize';

// Initialize the database
initDB();
const QUERY_LIMIT = 100; // Limit for each query

// Initialize the Discord Bot

const botToken = config.discord.botToken;
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
});

// Log bot status
client.once('ready', () => {
    console.log(`Bot is logged in as ${client.user?.tag}`);
});

// Function to send DM to a user
const sendDM = async (userId: string, message: string) => {
    try {
        const user = await client.users.fetch(userId);
        await user.send(message);
        console.log(`DM sent to ${userId}: ${message}`);
    } catch (error) {
        console.error(`Failed to send DM to ${userId}:`, error);
    }
};

// Function to fetch project and board names manually
const fetchProjectAndBoardDetails = async (projectId: number, boardId: number) => {
    try {
        const project = await Project.findOne({
            where: { projectId },
            attributes: ['projectId', 'name'],
        });

        const board = await Board.findOne({
            where: { boardId },
            attributes: ['boardId', 'name'],
        });

        return {
            projectName: project ? project.toJSON().name : 'Unknown Project',
            projectId: project ? project.toJSON().projectId : projectId,
            boardName: board ? board.toJSON().name : 'Unknown Board',
            boardId: board ? board.toJSON().boardId : boardId,
        };
    } catch (error) {
        console.error('Error fetching project or board details:', error);
        return {
            projectName: 'Unknown Project',
            projectId,
            boardName: 'Unknown Board',
            boardId,
        };
    }
};

// Function to check notifications
const checkNotifications = async () => {
    console.log(`[${dayjs().format()}] Checking notifications...`);
    const today = dayjs().startOf('day').toISOString();

    try {
        let offset = 0;
        let hasMoreData = true;

        while (hasMoreData) {
            // Fetch cards in chunks
            const cards = await Card.findAll({
                where: {
                    isActive: true,
                    reminderDaysInterval: { [Op.ne]: null },
                    startDate: { [Op.lte]: today },
                    endDate: { [Op.gte]: today },
                },
                attributes: ["cardId", "name", "startDate", "endDate", "reminderDaysInterval", "lastReminderDate", "projectId", "boardId"],
                limit: QUERY_LIMIT,
                offset,
            });

            if (cards.length === 0) {
                hasMoreData = false;
                continue;
            }

            for (const card of cards) {
                const { cardId, name, startDate, endDate, reminderDaysInterval, lastReminderDate, projectId, boardId } = card.toJSON();
                const lastReminder = dayjs(lastReminderDate || startDate);
                const { projectName, boardName } = await fetchProjectAndBoardDetails(projectId, boardId);

                if (dayjs().diff(lastReminder, 'days') >= reminderDaysInterval) {
                    const assignments = await Assign.findAll({
                        where: { cardId },
                        attributes: ['userId'],
                    });

                    for (const assign of assignments) {
                        const userId = assign.toJSON().userId;
                        const message = `Reminder for card "${name}" (ID: ${cardId}).
Project: "${projectName}" (ID: ${projectId}),
Board: "${boardName}" (ID: ${boardId}).
Start: ${startDate}, End: ${endDate}., LastReminderDate: ${lastReminderDate}`;
                        await sendDM(userId, message);
                    }
                    // Update last reminder date
                    const updateResult = await Card.update(
                        { lastReminderDate: dayjs().toISOString() },
                        { where: { cardId } }
                    );
                }
            }

            // Increment offset for next query
            offset += QUERY_LIMIT;
        }
    } catch (error) {
        console.error('Error during notification check:', error);
    }
};

// Schedule the job to run once a day at midnight
// cron.schedule('0 0 * * *', checkNotifications);
cron.schedule('* * * * *', checkNotifications); // Run every minute for testing

// Login bot
client.login(botToken);
