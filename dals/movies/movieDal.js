const axios = require('axios')
const jsonfile = require('jsonfile')

exports.readFile = function(fileName)
{
    return new Promise(resolve =>
    {
        jsonfile.readFile(__dirname + `/${fileName}.json`, function(err,data)
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


exports.getMovies = async function()
{
    let resp =await  axios.get("https://api.tvmaze.com/shows");
    let data = [];
    let cnt = 1;
    resp.data.map(d => {
        data.push({id:d.id,
                   name:d.name,
                   image:d.image.medium,
                   language:d.language,
                   genres:[...d.genres]})
        cnt += 1;
    });

    return {data:data,maxMovieId:cnt};
}