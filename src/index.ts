import { Client, GatewayIntentBits } from 'discord.js';
import cron from 'node-cron';
import dayjs from 'dayjs';
import { Card } from './db/models/Board/List/Card/Card';
import { Style } from './db/models/Board/List/Card/Style';
import { Assign } from './db/models/Board/List/Card/Assign'; // Replace with your DB model
import { Project } from './db/models/Project'; // Replace with your DB model
import { Board } from './db/models/Board/Board'; // Replace with your DB model
import { initDB } from './db/initDB';
import config from "./config";
import { Op } from 'sequelize';
import { createAvatarCollage } from './createAvatarCollage';

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
const sendDM = async (userId: string, message: any) => {
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
                attributes: ["cardId", "name", "startDate", "endDate", "reminderDaysInterval", "lastReminderDate", "projectId", "boardId", "styleId"],
                limit: QUERY_LIMIT,
                offset,
            });

            if (cards.length === 0) {
                hasMoreData = false;
                continue;
            }

            for (const card of cards) {
                const { styleId, cardId, name, startDate, endDate, reminderDaysInterval, lastReminderDate, projectId, boardId } = card.toJSON();
                const lastReminder = dayjs(lastReminderDate || startDate);
                const { projectName, boardName } = await fetchProjectAndBoardDetails(projectId, boardId);

                if (dayjs().diff(lastReminder, 'days') >= reminderDaysInterval) {
                    const assignments = await Assign.findAll({
                        where: { cardId },
                        attributes: ['userId'],
                    });

                    const userIds = assignments.map(assign => assign.toJSON().userId);

                    // Fetch user details (avatar + username)
                    const userDetails = await Promise.all(userIds.map(async (userId) => {
                        try {
                            const user = await client.users.fetch(userId);
                            return {
                                username: user.username,
                                avatar: user.avatar
                                ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
                                : user.defaultAvatarURL};
                        } catch (error) {
                            console.error(`Error fetching user ${userId}:`, error);
                            return null;
                        }
                    }));
            
                    const avatars = userDetails.filter(Boolean).map(user => user?.avatar);
            
                    // Generate the avatar collage
                    const collageBuffer = await createAvatarCollage(avatars);
                    const assignedUsers = userDetails
                    .filter(Boolean)
                    .map(user => `${user?.username}`) // Clickable name linking to avatar
                    .join(', ');

                    const style = await Style.findOne({where: { styleId }})

                    const formattedStartDate = dayjs(startDate).format('ddd DD/MM/YYYY HH:mm'); // Example: Mon 05 02 2025 14:30
                    const formattedEndDate = dayjs(endDate).format('ddd DD/MM/YYYY HH:mm');     // Example: Wed 07 02 2025 18:00
                    const daysLeft = dayjs(endDate).diff(dayjs(), 'days');
                    for (const assign of assignments) {
                        const userId = assign.toJSON().userId;
                        const embed: any = {
                            title: projectName,
                            thumbnail: {
                                url: await client?.user?.displayAvatarURL({ size: 128 }),
                            },         
                            color: parseInt(style?.toJSON().name, 16),
                            fields: [
                                    {
                                        name: "Board",
                                        value: boardName
                                    },
                                    {
                                        name: "Task",
                                        value: name
                                    },
                                    {
                                        name: "Start Date",
                                        value: formattedStartDate,
                                        inline: true
                                    },
                                    {
                                        name: "Due Date",
                                        value: formattedEndDate,
                                        inline: true
                                    },
                                    {
                                        name: "Days Left",
                                        value: `${daysLeft} days`
                                    },
                                    {
                                        name: "Assigned Users",
                                        value: assignedUsers
                                    }
                            ],
                            image: { url: 'attachment://avatars.png'},
                            footer: {
                                text: 'Task Reminder',
                            },
                        }
                        await sendDM(userId, {
                            embeds: [embed],
                            files: [{ attachment: collageBuffer, name: 'avatars.png' }]
                        });
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
cron.schedule('* * * * *', checkNotifications); // Run every minute for testing ** REMOVE THIS IN PRODUCTION**

// Login bot
client.login(botToken);
