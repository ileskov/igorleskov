function checkNetworkLoad(url, dataTransferred) { 
    if (typeof url !== 'string' || !Array.isArray(dataTransferred) || dataTransferred.some(isNaN)) {
        return "Неверные входные данные. Убедитесь, что URL — строка, а dataTransferred — массив чисел.";
    }

    if (dataTransferred.length === 0) {
        return "Массив переданных данных пуст.";
    }

    var totalBytes = dataTransferred.reduce((a, b) => a + b, 0);
    var totalMiB = (totalBytes / (1024 * 1024)).toFixed(2); 
    var thresholdMiB = 350; 

    if (totalBytes === 0) {
        return "Данные не передавались.";
    }

    if (totalMiB > thresholdMiB) {
        return `⚠️ Предупреждение: передано ${totalMiB} МиБ, что превышает порог в ${thresholdMiB} МиБ.`;
    } else {
        return `✅ Объем переданных данных: ${totalMiB} МиБ — в пределах нормы.`;
    }
}

var dataTransferred = [80000000, 77286400]; 
console.log(checkNetworkLoad("https://ileskov.github.io/igorleskov", dataTransferred));
