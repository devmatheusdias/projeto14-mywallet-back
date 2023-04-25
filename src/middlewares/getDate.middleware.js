export function getDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const currentDate = `${day}/${month}`

    return currentDate;
}
