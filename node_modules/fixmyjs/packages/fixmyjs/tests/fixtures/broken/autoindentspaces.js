var interpolate = function (str, obj) {
Object.keys(obj).forEach(function (prop) {
if (obj.hasOwnProperty(prop)) {
str = str.replace(new RegExp('#{' + prop + '}', 'g'), typeof obj[prop][1] === 'f' ? obj[prop]() : obj[prop]);
}
});

return str;
};
