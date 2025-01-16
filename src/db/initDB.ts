import { dbConnect, sequelize } from './database';
import { Assign } from './models/Board/List/Card/Assign';
import { Card } from './models/Board/List/Card/Card';
import { Board } from './models/Board/Board';
import { Project } from './models/Project';

export async function initDB() {
    await dbConnect();
    // await sequelize.drop();
    await Card.sync();
    await Assign.sync();
    await Board.sync();
    await Project.sync();
}