export const allowedArchivement = {
    validationFile(file: File): boolean {
        const allowed = ["jpeg", "png", "webp", "jpg"];

        if (!allowed.includes(file.type)) return false;

        return true;
    }
}