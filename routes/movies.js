var express = require('express');
var router = express.Router();
const userModal = require('../models/userModal');
const movieModal = require('../models/movieModal');
const { body, validationResult } = require('express-validator');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  let appSession = req.session
  if(appSession.isAuth) { 
    let movieData = await movieModal.getMovieById(parseInt(req.query.id),appSession.movies);
    res.render('movieDataPage',{...movieData})
  } else {
    res.redirect('/login');
  }
});

router.get('/results', async function(req,res,next) {
  let appSession = req.session
  if(appSession.isAuth) { 
    let resp = await movieModal.findMovies(appSession.search,appSession.movies);
    res.render('searchResultsPage',{...resp})
  } else {
    res.redirect('/login');
  }
});

router.post('/results', async function(req,res,next) {
  let appSession = req.session
  if(appSession.isAuth) { 
    let resp = await movieModal.findMovies(req.body,appSession.movies);
    appSession.search = req.body;
    
    res.render('searchResultsPage',{...resp})
  } else {
    res.redirect('/login');
  }
});

router.post('/addMovie',[body('name').not().isEmpty(),body('language').not().isEmpty(),
            body('image').not().isEmpty()], async function(req,res,next) {

    let appSession = req.session
    if(appSession.isAuth) { 
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        req.flash('error', "Please fill name and language");
        res.locals.message = req.flash();
        res.render('createMoviePage',{message:res.locals.message})
      }
      else {
        appSession.maxMovieId += 1
        let resp = await movieModal.addMovie(req.body,appSession.maxMovieId)

        if(resp == "Success")
          res.render(`menuPage`,{isAdmin:appSession.isAdmin})
      }
    } else {
      res.redirect('/login');
    }    
});

router.get('/search-movie', async function(req, res, next) {
  let appSession = req.session
  
  if(appSession.isAuth) {
    if(appSession.counter) appSession.counter += 1;

    let isAllow = userModal.validUserCredit(
                                    appSession.counter,
                                    appSession.loginDate,
                                    appSession.numOfTransaction,
                                    appSession.isAdmin);

    if (isAllow == "Success"){
      let lovData = await movieModal.getLovData();
      res.render('searchMoviesPage',{genres:lovData.genres,lang:lovData.lang});
    }
    else {
      appSession = userModal.restartSession(appSession);
      appSession.search = '';
      req.flash('error', "Your Session Had Timeout , Please Login Again");
      res.locals.message = req.flash();
      res.render('loginPage',{message:res.locals.message})
    }
  } else {
    res.redirect('/login');
  } 
});

router.get('/create-movie', async function(req, res, next) {
  let appSession = req.session

  if(appSession.isAuth) {
    if(appSession.counter) {appSession.counter += 1;}
    
    let isAllow = userModal.validUserCredit(
                                    appSession.counter,
                                    appSession.loginDate,
                                    appSession.numOfTransaction,
                                    appSession.isAdmin);

    if (isAllow == "Success"){
      let lovData = await movieModal.getLovData();
      res.render('createMoviePage',{genres:lovData.genres,lang:lovData.lang})
    }  
    else {
      appSession = userModal.restartSession(appSession);

      req.flash('error', "Your Session Had Timeout , Please Login Again");
      res.locals.message = req.flash();
      res.render('loginPage',{message:res.locals.message})
    }
  } else {
    res.redirect('/login');
  }
  
});
module.exports = router;
