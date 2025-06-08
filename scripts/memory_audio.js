function checkNetworkLoad(url, dataTransferred) { 
    if (typeof url !== 'string' || !Array.isArray(dataTransferred) || dataTransferred.some(isNaN)) {
        return "Неверные входные данные. Пожалуйста, убедитесь, что URL является строкой, а dataTransferred — массивом чисел.";
    }

    if (dataTransferred.length === 0) {
        return "Массив переданных данных пуст.";
    }

    var threshold = 100000; 
    var totalDataTransferred = dataTransferred.reduce(function(a, b) { return a + b; }, 0);
    var totalMiB = (totalDataTransferred / 1024).toFixed(2); 

    if (totalDataTransferred > threshold) {
        return "Предотвратите чрезмерную нагрузку на сеть. Общий размер достиг " + totalMiB + " МиБ.";
    } else {
        return "Общий объем переданных данных находится в пределах допустимого значения: " + totalMiB + " МиБ.";
    }
}

var dataTransferred = [10000, 20000, 30000]; 
console.log(checkNetworkLoad("https://ileskov.github.io/igorleskov", dataTransferred));

