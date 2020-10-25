const jsonfile = require('jsonfile')

exports.readFile = function()
{
    return new Promise(resolve =>
    {
        jsonfile.readFile(__dirname + "/users.json", function(err,data)
        {
            resolve(data)
        })
    })
}

exports.writeFile = (filePath, fileContent) => 
{
    return new Promise((resolve, reject) => {
        jsonfile.writeFile(__dirname +`/${filePath}`, fileContent, err => {
        if (err) {
            reject(err);
            return;
        }
            resolve("Success");
        });
    });
}