import { createCanvas, loadImage } from 'canvas';

export async function createAvatarCollage(avatars: any) {
    const avatarSize = 32; // Size of each avatar
    const padding = 10;    // Space between avatars
    const columns = Math.min(avatars.length, 5); // Max 5 avatars per row
    const rows = Math.ceil(avatars.length / columns);

    const canvasWidth = (avatarSize + padding) * columns - padding;
    const canvasHeight = (avatarSize + padding) * rows - padding;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    for (let i = 0; i < avatars.length; i++) {
        const avatarUrl = avatars[i];
        const img = await loadImage(avatarUrl);

        const x = (i % columns) * (avatarSize + padding);
        const y = Math.floor(i / columns) * (avatarSize + padding);

        // Save the current context before clipping
        ctx.save();

        // Draw avatars as circles
        ctx.beginPath();
        ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x, y, avatarSize, avatarSize);

        // Restore the context to remove the clipping path for the next avatar
        ctx.restore();
    }

    return canvas.toBuffer();
}
