import fs from 'fs';

// Функция для парсинга CSV строки с учетом кавычек
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Чтение и обработка CSV файла
fs.readFile('./data.csv', 'utf8', (err, data) => {
    if (err) {
        console.error('Ошибка чтения файла:', err);
        return;
    }

    const lines = data.split('\n');
    const headers = parseCSVLine(lines[0]); // Получаем заголовки
    const objects = [];

    console.log('Заголовки:', headers);
    console.log('=== ОБРАБОТКА ДАННЫХ ===\n');

    // Обрабатываем каждую строку данных (начиная с 1, пропускаем заголовок)
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;

        const cells = parseCSVLine(lines[i]);

        // Создаем объект для каждой строки
        const obj = {
            id: parseInt(cells[0]),
            address: cells[1],
            latitude: parseFloat(cells[2]),
            longitude: parseFloat(cells[3]),
            startWork: cells[4],
            endWork: cells[5],
            startLunch: cells[6],
            endLunch: cells[7],
            level: cells[8]
        };

        objects.push(obj);

        // Примеры работы с данными каждой строки:
        console.log(`📍 Объект №${obj.id}`);
        console.log(`   Адрес: ${obj.address}`);
        console.log(`   Координаты: ${obj.latitude}, ${obj.longitude}`);
        console.log(`   График работы: ${obj.startWork}-${obj.endWork}`);
        console.log(`   Обед: ${obj.startLunch}-${obj.endLunch}`);
        console.log(`   Уровень клиента: ${obj.level}`);
        console.log('---');
    }

    // Дополнительные операции со всеми данными
    console.log('\n=== АНАЛИТИКА ===');

    // Подсчет объектов по уровню клиента
    const levelCount = {};
    objects.forEach(obj => {
        levelCount[obj.level] = (levelCount[obj.level] || 0) + 1;
    });

    console.log('Распределение по уровням клиентов:');
    for (const level in levelCount) {
        console.log(`   ${level}: ${levelCount[level]} объектов`);
    }

    // Поиск VIP клиентов
    const vipObjects = objects.filter(obj => obj.level === 'VIP');
    console.log(`\nVIP клиенты (${vipObjects.length}):`);
    vipObjects.forEach(obj => {
        console.log(`   Объект №${obj.id}: ${obj.address}`);
    });

    // Средние координаты (географический центр)
    const avgLat = objects.reduce((sum, obj) => sum + obj.latitude, 0) / objects.length;
    const avgLng = objects.reduce((sum, obj) => sum + obj.longitude, 0) / objects.length;
    console.log(`\nСредние координаты всех объектов: ${avgLat.toFixed(6)}, ${avgLng.toFixed(6)}`);

    // Общее количество объектов
    console.log(`\nВсего объектов: ${objects.length}`);
});





