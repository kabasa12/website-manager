const movieDal = require('../dals/movies/movieDal');

exports.getLovData = async () => {
    try {
        let genresData = await movieDal.readFile("genres");
        let genres = genresData.genres;

        let langData = await movieDal.readFile("languages");
        let lang = langData.languages;

        return {genres,lang};
    } catch(err) {
        throw(err);
    }  
}

exports.addMovie = async (newMovie,maxMovieId) => {
    try {
        let moviesData = await movieDal.readFile("newMovies");
        let allMovies = moviesData.movies;

        if(newMovie){
            allMovies.push({...newMovie,id:maxMovieId});
            moviesData = {...moviesData,movies:allMovies}

            let res = await movieDal.writeFile("newMovies.json",moviesData)

            return res;
        }
    } catch(err) {
        throw(err);
    }   
}

exports.getAllMovies = async () => {
    try {
        let moviesData = await movieDal.getMovies();
        let jsonData = await movieDal.readFile("newMovies");
        jsonData = jsonData.movies;
        let cnt = moviesData.maxMovieId;
        jsonData.map(m => cnt += 1);

        return {data:moviesData.data,maxMovieId:cnt}
    } catch (err){
        throw(err);
    }
}

exports.getMovieById = async (id,moviesData) => {
    try {
        let jsonData = await movieDal.readFile("newMovies");
        let movieJson = jsonData.movies;
        let allMovies = [...movieJson,...moviesData]

        let currentMovie = allMovies.filter(movie => movie.id == id);
        currentMovie = currentMovie[0];

        return currentMovie;
    } catch(err) {
        throw(err);
    }
}

exports.findMovies = async (search,moviesData) => {
    try {
        let jsonData = await movieDal.readFile("newMovies");
        let movieJson = jsonData.movies;
        let allMovies = [...movieJson,...moviesData]

        let matchMovies = allMovies
        .filter(movie => movie.name.toLowerCase().includes(search.name ? search.name.toLowerCase() : movie.name.toLowerCase()))
        .filter(movie => movie.language.toLowerCase().indexOf(search.lang ? search.lang.toLowerCase() : movie.language.toLowerCase()) != -1)
        .filter(movie => 
                movie.genres.some(gen => gen.toLowerCase().indexOf(search.genre ? search.genre.toLowerCase() : gen.toLowerCase()) != -1))
        
        
        let searchGengre = matchMovies.map(movie => movie.genres.map(g => g))
        let allGenres = []
        searchGengre.forEach(arr => {
            arr.forEach(gen => {
                if(allGenres.indexOf(gen) == -1)
                    allGenres.push(gen)
            })
        })

        let genresMovies = allMovies
        .filter(movie => movie.genres.some(gen => allGenres.indexOf(gen) != -1));

        return {matchMovies:matchMovies,genresMovies:genresMovies}
    } catch(err) {
        throw(err);
    }  
}